import { serverDb } from '@/lib/serverDb';
import { apiJson, isAdmin, sameOrigin } from '@/lib/serverAuth';
import { PARTNER_STATUSES } from '@/lib/partners';
export const dynamic = 'force-dynamic';
const columns = 'id,created_at,company,contact,phone,regions,specialties,budget,portfolio,intro,status,admin_note,admin_version';
export async function GET(request: Request) {
  if (!await isAdmin()) return apiJson({ error: '로그인이 필요합니다.' }, 401);
  try {
    const db = serverDb();
    const cleanup = await db.from('partner_applications').delete().lt('expires_at', new Date().toISOString());
    if (cleanup.error) throw new Error('cleanup failed');
    const page = Math.max(1, Math.min(10000, Number(new URL(request.url).searchParams.get('page')) || 1));
    const { data, count, error } = await db.from('partner_applications').select(columns, { count: 'exact' }).gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }).range((Math.floor(page) - 1) * 25, Math.floor(page) * 25 - 1);
    if (error) throw new Error('read failed');
    return apiJson({ rows: data, total: count });
  } catch { return apiJson({ error: '파트너 신청을 가져오지 못했습니다.' }, 503); }
}
export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return apiJson({ error: '허용되지 않는 요청입니다.' }, 403);
  if (!await isAdmin()) return apiJson({ error: '로그인이 필요합니다.' }, 401);
  try {
    const raw = await request.text();
    if (raw.length > 20000) return apiJson({ error: '내용이 너무 깁니다.' }, 413);
    let v: Record<string, unknown>;
    try { v = JSON.parse(raw); } catch { return apiJson({ error: '입력을 확인해주세요.' }, 400); }
    if (!v || typeof v !== 'object' || typeof v.id !== 'string' || !/^[a-f0-9-]{36}$/i.test(v.id) || typeof v.status !== 'string' || !Object.hasOwn(PARTNER_STATUSES, v.status) || typeof v.admin_note !== 'string' || v.admin_note.length > 4000 || !Number.isSafeInteger(v.admin_version) || Number(v.admin_version) < 0) return apiJson({ error: '입력을 확인해주세요.' }, 400);
    const { data, error } = await serverDb().from('partner_applications').update({ status: v.status, admin_note: v.admin_note, admin_version: Number(v.admin_version) + 1 }).eq('id', v.id).eq('admin_version', v.admin_version).gt('expires_at', new Date().toISOString()).select(columns).maybeSingle();
    if (error) throw new Error('save failed');
    if (!data) return apiJson({ error: '다른 곳에서 변경했거나 만료된 신청입니다. 작성한 메모를 복사한 후 새로고침해주세요.' }, 409);
    return apiJson({ row: data });
  } catch { return apiJson({ error: '저장하지 못했습니다.' }, 503); }
}
