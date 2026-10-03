import { apiJson, isAdmin, sameOrigin } from '@/lib/serverAuth';
import { serverDb } from '@/lib/serverDb';
import { CONSULT_STATUSES, crmPatch } from '@/lib/adminCrm';

export async function GET(request: Request) {
  try {
    if (!await isAdmin()) return apiJson({ error: '로그인이 필요합니다.' }, 401);
    const params = new URL(request.url).searchParams;
    const page = Number(params.get('page') || 1), status = params.get('status') || 'all';
    const raw = params.get('q') || '';
    if (!Number.isSafeInteger(page) || page < 1 || page > 100000 || raw.length > 80 ||
      (status !== 'all' && !Object.hasOwn(CONSULT_STATUSES, status))) return apiJson({ error: '검색 조건을 확인해주세요.' }, 400);
    const q = raw.replace(/[^\p{L}\p{N}\s-]/gu, '').trim();
    let query = serverDb().from('consultations').select('*', { count: 'exact' });
    if (status !== 'all') query = query.eq('status', status);
    if (params.get('due') === '1') query = query.lte('next_contact_at', new Date().toISOString()).not('status', 'in', '(closed,contracted)');
    if (q) query = /^[\d\s-]+$/.test(q) ? query.ilike('phone', `%${q.replace(/\D/g, '')}%`) : query.ilike('name', `%${q}%`);
    const result = await query.order('created_at', { ascending: false }).order('id').range((page - 1) * 25, page * 25 - 1);
    if (result.error) throw result.error;
    return apiJson({ items: result.data, total: result.count, page, pageSize: 25 });
  } catch { return apiJson({ error: '상담 목록을 불러오지 못했어요.' }, 503); }
}
export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return apiJson({ error: '허용되지 않은 요청입니다.' }, 403);
  try {
    if (!await isAdmin()) return apiJson({ error: '로그인이 필요합니다.' }, 401);
    const raw = await request.text();
    if (raw.length > 10000) return apiJson({ error: '입력이 너무 깁니다.' }, 400);
    let body;
    try { body = JSON.parse(raw); } catch { return apiJson({ error: '입력을 확인해주세요.' }, 400); }
    if (!body || typeof body !== 'object' || !/^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/i.test(body.id || '')) return apiJson({ error: '신청을 확인해주세요.' }, 400);
    const patch = crmPatch(body);
    if (!patch) return apiJson({ error: '상태·메모·연락 일시를 확인해주세요.' }, 400);
    const { data, error } = await serverDb().from('consultations').update(patch).eq('id', body.id).eq('admin_version', body.admin_version).select('*').maybeSingle();
    if (error) throw error;
    if (!data) return apiJson({ error: '다른 화면에서 변경되었거나 삭제됐어요. 작성 내용을 복사한 뒤 목록을 새로고침해주세요.' }, 409);
    return apiJson({ item: data });
  } catch { return apiJson({ error: '저장하지 못했어요. 작성 내용은 유지됩니다.' }, 503); }
}
