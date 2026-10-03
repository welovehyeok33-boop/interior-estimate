import { apiJson, isAdmin, sameOrigin } from '@/lib/serverAuth';
import { serverDb } from '@/lib/serverDb';

export async function GET() {
  try {
    if (!await isAdmin()) return apiJson({ error: '로그인이 필요합니다.' }, 401);
    const db = serverDb();
    const [leads, consultations] = await Promise.all([
      db.from('leads').select('*').order('created_at', { ascending: false }).limit(500),
      db.from('consultations').select('id', { count: 'exact', head: true }),
    ]);
    if (leads.error || consultations.error) throw new Error('Read failed');
    return apiJson({ leads: leads.data, consultationCount: consultations.count });
  } catch { return apiJson({ error: '신청 내역을 불러오지 못했어요.' }, 503); }
}
async function mutate(request: Request, remove: boolean) {
  if (!sameOrigin(request)) return apiJson({ error: '허용되지 않은 요청입니다.' }, 403);
  try {
    if (!await isAdmin()) return apiJson({ error: '로그인이 필요합니다.' }, 401);
    const body = await request.json();
    if (!/^[a-f0-9-]{36}$/i.test(body?.id ?? '') || !['leads', 'consultations'].includes(body?.table)) return apiJson({ error: '잘못된 요청입니다.' }, 400);
    const statuses = body.table === 'leads' ? ['new', 'qualified', 'contracted'] : ['new', 'contacted', 'contracted'];
    if (!remove && body.table === 'consultations') return apiJson({ error: '관리자 화면을 새로고침해주세요.' }, 400);
    if (!remove && !statuses.includes(body.status)) return apiJson({ error: '상태를 확인해주세요.' }, 400);
    const query = serverDb().from(body.table);
    const { data, error } = await (remove ? query.delete() : query.update({ status: body.status })).eq('id', body.id).select('id');
    if (error) throw error;
    if (!data?.length) return apiJson({ error: '신청을 찾지 못했어요.' }, 404);
    return apiJson({ ok: true });
  } catch { return apiJson({ error: '변경을 저장하지 못했어요.' }, 503); }
}
export async function PATCH(request: Request) { return mutate(request, false); }
export async function DELETE(request: Request) { return mutate(request, true); }
