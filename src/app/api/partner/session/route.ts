import { cookies } from 'next/headers';
import { apiJson, rateLimit, sameOrigin } from '@/lib/serverAuth';
import { serverDb } from '@/lib/serverDb';
import { currentPartner, partnerSessionSecret } from '@/lib/serverPartnerPortal';
import { PARTNER_PORTAL_COOKIE, PARTNER_SESSION_SECONDS } from '@/lib/partnerPortal';
import { signPartnerSession } from '@/lib/partnerSession';
export const dynamic = 'force-dynamic';
export async function GET() {
  try { const account = await currentPartner(); return apiJson({ authenticated: !!account, company: account?.company || null }); }
  catch { return apiJson({ error: '로그인 상태를 확인하지 못했어요.' }, 503); }
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return apiJson({ error: '허용되지 않은 요청입니다.' }, 403);
  if (Number(request.headers.get('content-length')) > 4096) return apiJson({ error: '입력값이 너무 깁니다.' }, 413);
  try {
    if (!await rateLimit(request, 'partner_login', 10)) return apiJson({ error: '로그인 시도가 많아요. 15분 후 다시 시도해주세요.' }, 429);
    const raw = await request.text();
    if (raw.length > 4096) return apiJson({ error: '입력값이 너무 깁니다.' }, 413);
    let v;
    try { v = JSON.parse(raw); } catch { return apiJson({ error: '로그인 정보를 확인해주세요.' }, 400); }
    if (!v || typeof v.email !== 'string' || v.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim()) || typeof v.password !== 'string' || !v.password.length || v.password.length > 200) return apiJson({ error: '로그인 정보를 확인해주세요.' }, 400);
    const email = v.email.trim().toLowerCase();
    const before = await serverDb().from('partner_portal_accounts').select('id,session_version').eq('email', email).eq('active', true).maybeSingle();
    if (before.error) throw new Error('account unavailable');
    // Password sign-in mutates a client's auth state. Keep DB access on a fresh
    // service-role client; private tables deliberately deny authenticated users.
    const result = await serverDb().auth.signInWithPassword({ email, password: v.password });
    if (result.error || !result.data.user || result.data.user.app_metadata.formit_partner !== true || !before.data || before.data.id !== result.data.user.id) return apiJson({ error: '이메일·비밀번호 또는 계정 이용 상태를 확인해주세요.' }, 401);
    const { data: account, error } = await serverDb().from('partner_portal_accounts').select('id,company,active,session_version').eq('id', result.data.user.id).eq('active', true).eq('session_version', before.data.session_version).maybeSingle();
    if (error) throw new Error('account unavailable');
    if (!account) return apiJson({ error: '이메일·비밀번호 또는 계정 이용 상태를 확인해주세요.' }, 401);
    const token = signPartnerSession(account.id, account.session_version, Date.now() + PARTNER_SESSION_SECONDS * 1000, partnerSessionSecret());
    (await cookies()).set(PARTNER_PORTAL_COOKIE, token, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: PARTNER_SESSION_SECONDS });
    return apiJson({ authenticated: true });
  } catch { return apiJson({ error: '지금 로그인할 수 없어요. 잠시 후 다시 시도해주세요.' }, 503); }
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return apiJson({ error: '허용되지 않은 요청입니다.' }, 403);
  (await cookies()).delete(PARTNER_PORTAL_COOKIE);
  return apiJson({ authenticated: false });
}
