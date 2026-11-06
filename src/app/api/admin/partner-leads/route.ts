import { apiJson, isAdmin, sameOrigin } from '@/lib/serverAuth';
import { serverDb } from '@/lib/serverDb';
import { PARTNER_UUID, partnerLead } from '@/lib/partnerPortal';
import { PARTNER_SOURCE_COLUMNS, partnerCutoff, publishedPartnerLeads, partnerLeadEntries } from '@/lib/serverPartnerPortal';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  try {
    if (!await isAdmin()) return apiJson({ error: '관리자 로그인이 필요합니다.' }, 401);
    if (new URL(request.url).searchParams.get('preview') === '1') return apiJson({ items: await publishedPartnerLeads() });
    const db = serverDb();
    const [sources, publications] = await Promise.all([
      db.from('consultations').select(PARTNER_SOURCE_COLUMNS).gte('created_at', partnerCutoff()).order('created_at', { ascending: false }).limit(500),
      db.from('partner_lead_publications').select('consultation_id,published_at').limit(500),
    ]);
    if (sources.error || publications.error) throw new Error('read failed');
    const published = new Map((publications.data || []).map(row => [row.consultation_id, row.published_at]));
    const entries = await partnerLeadEntries((sources.data || []).map(row => row.id));
    return apiJson({ items: (sources.data || []).map(row => ({ id: row.id, published: published.has(row.id),
      bidders: entries.filter(entry => entry.consultation_id === row.id).map(entry => ({ company: entry.company, slot: entry.slot })),
      ...partnerLead(row, published.get(row.id) || row.created_at) })) });
  } catch { return apiJson({ error: '공개 관리 목록을 불러오지 못했어요.' }, 503); }
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return apiJson({ error: '허용되지 않은 요청입니다.' }, 403);
  try {
    if (!await isAdmin()) return apiJson({ error: '관리자 로그인이 필요합니다.' }, 401);
    const raw = await request.text();
    if (raw.length > 300) return apiJson({ error: '입력값이 너무 깁니다.' }, 413);
    let v;
    try { v = JSON.parse(raw); } catch { return apiJson({ error: '입력값을 확인해주세요.' }, 400); }
    if (!v || typeof v.id !== 'string' || !PARTNER_UUID.test(v.id) || typeof v.published !== 'boolean') return apiJson({ error: '견적을 확인해주세요.' }, 400);
    const db = serverDb();
    if (v.published) {
      const source = await db.from('consultations').select('id').eq('id', v.id).gte('created_at', partnerCutoff()).maybeSingle();
      if (source.error) throw source.error;
      if (!source.data) return apiJson({ error: '만료되었거나 삭제된 견적입니다.' }, 404);
      const result = await db.from('partner_lead_publications').upsert({ consultation_id: v.id }, { onConflict: 'consultation_id', ignoreDuplicates: true });
      if (result.error) throw result.error;
    } else {
      const result = await db.from('partner_lead_publications').delete().eq('consultation_id', v.id);
      if (result.error) throw result.error;
    }
    return apiJson({ published: v.published });
  } catch { return apiJson({ error: '공개 상태를 변경하지 못했어요.' }, 503); }
}
