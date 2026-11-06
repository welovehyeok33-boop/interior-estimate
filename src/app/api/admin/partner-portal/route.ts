import { randomBytes, randomUUID } from 'node:crypto';
import { apiJson, isAdmin, sameOrigin } from '@/lib/serverAuth';
import { serverDb } from '@/lib/serverDb';
import { accountInput, PARTNER_UUID } from '@/lib/partnerPortal';
export const dynamic = 'force-dynamic';
const columns = 'id,company,email,active,session_version,created_at';
export async function GET() {
  try {
    if (!await isAdmin()) return apiJson({ error: '관리자 로그인이 필요합니다.' }, 401);
    const { data, error } = await serverDb().from('partner_portal_accounts').select(columns).order('created_at', { ascending: false }).limit(500);
    if (error) throw error;
    return apiJson({ accounts: data });
  } catch { return apiJson({ error: '계정 목록을 불러오지 못했어요.' }, 503); }
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return apiJson({ error: '허용되지 않은 요청입니다.' }, 403);
  try {
    if (!await isAdmin()) return apiJson({ error: '관리자 로그인이 필요합니다.' }, 401);
    const raw = await request.text();
    if (raw.length > 2000) return apiJson({ error: '입력값이 너무 깁니다.' }, 413);
    let body: unknown;
    try { body = JSON.parse(raw); } catch { return apiJson({ error: '입력값을 확인해주세요.' }, 400); }
    const input = accountInput(body);
    if (!input) return apiJson({ error: '업체명과 이메일을 확인해주세요.' }, 400);
    const db = serverDb();
    const password = randomBytes(18).toString('base64url') + 'aA1!';
    // Admin-issued account: no email is sent and no public registration is enabled here.
    const { data, error } = await db.auth.admin.createUser({ email: input.email, password, email_confirm: true, app_metadata: { formit_partner: true } });
    if (error || !data.user) return apiJson({ error: '계정을 만들지 못했어요. 이미 등록된 이메일인지 확인해주세요.' }, 409);
    const saved = await db.from('partner_portal_accounts').insert({ id: data.user.id, ...input }).select(columns).single();
    if (saved.error) {
      await db.auth.admin.deleteUser(data.user.id);
      throw new Error('account setup failed');
    }
    return apiJson({ account: saved.data, password }, 201);
  } catch { return apiJson({ error: '계정을 발급하지 못했어요.' }, 503); }
}
export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return apiJson({ error: '허용되지 않은 요청입니다.' }, 403);
  try {
    if (!await isAdmin()) return apiJson({ error: '관리자 로그인이 필요합니다.' }, 401);
    const raw = await request.text();
    if (raw.length > 1000) return apiJson({ error: '입력값이 너무 깁니다.' }, 413);
    let v;
    try { v = JSON.parse(raw); } catch { return apiJson({ error: '입력값을 확인해주세요.' }, 400); }
    if (!v || typeof v.id !== 'string' || !PARTNER_UUID.test(v.id) || typeof v.version !== 'string' || !PARTNER_UUID.test(v.version) || !['status', 'reset'].includes(v.action) || (v.action === 'status' && typeof v.active !== 'boolean')) return apiJson({ error: '계정을 확인해주세요.' }, 400);
    const db = serverDb();
    const result = await db.from('partner_portal_accounts').update({ session_version: randomUUID(), ...(v.action === 'status' ? { active: v.active } : {}) }).eq('id', v.id).eq('session_version', v.version).select(columns).maybeSingle();
    if (result.error) throw result.error;
    if (!result.data) return apiJson({ error: '다른 화면에서 변경됐어요. 새로고침해주세요.' }, 409);
    if (v.action === 'reset') {
      const password = randomBytes(18).toString('base64url') + 'aA1!';
      const reset = await db.auth.admin.updateUserById(v.id, { password });
      if (reset.error) return apiJson({ error: '기존 로그인은 해제했지만 비밀번호 변경에 실패했어요. 새로고침 후 다시 발급해주세요.' }, 503);
      return apiJson({ account: result.data, password });
    }
    return apiJson({ account: result.data });
  } catch { return apiJson({ error: '계정을 변경하지 못했어요.' }, 503); }
}
