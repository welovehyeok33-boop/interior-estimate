import 'server-only';
import { cookies } from 'next/headers';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { serverDb } from './serverDb';
import { signSession, validSession } from './sessionToken';

export const ADMIN_COOKIE = 'formit_admin_session';
export const SESSION_SECONDS = 8 * 60 * 60;

function secret() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const password = process.env.ADMIN_PASSWORD;
  if (!key || !password?.trim() || password.length > 200) throw new Error('Admin authentication is not configured');
  return createHmac('sha256', key).update(`formit-admin-v1:${password}`).digest('hex');
}
export function passwordMatches(value: string) {
  secret();
  return timingSafeEqual(createHash('sha256').update(value).digest(), createHash('sha256').update(process.env.ADMIN_PASSWORD!).digest());
}
export function issueSession() { return signSession(Date.now() + SESSION_SECONDS * 1000, secret()); }
export async function isAdmin() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return !!token && validSession(token, secret());
}
export function sameOrigin(request: Request) {
  return request.headers.get('origin') === new URL(request.url).origin;
}
export async function rateLimit(request: Request, kind: 'login' | 'consult', limit: number) {
  const ip = request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for') || 'unknown';
  const bucket = createHmac('sha256', secret()).update(`${kind}:${ip.split(',')[0].trim()}`).digest('hex');
  const { data, error } = await serverDb().rpc('consume_request_limit', { bucket, max_hits: limit, window_seconds: 900 });
  if (error) throw new Error('Rate limit unavailable');
  return data === true;
}
export function apiJson(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}
