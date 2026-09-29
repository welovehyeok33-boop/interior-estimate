import { createHmac, timingSafeEqual } from 'node:crypto';

export function signSession(expires: number, secret: string): string {
  const payload = String(expires);
  return `${payload}.${createHmac('sha256', secret).update(payload).digest('hex')}`;
}

export function validSession(token: string, secret: string, now = Date.now()): boolean {
  if (!/^\d{13}\.[a-f0-9]{64}$/.test(token)) return false;
  const expires = Number(token.split('.')[0]);
  if (expires <= now || expires > now + 8 * 60 * 60 * 1000) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(signSession(expires, secret)));
}
