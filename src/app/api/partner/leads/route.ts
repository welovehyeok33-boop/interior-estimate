import { apiJson } from '@/lib/serverAuth';
import { currentPartner, publishedPartnerLeads } from '@/lib/serverPartnerPortal';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    if (!await currentPartner()) return apiJson({ error: '파트너 로그인이 필요합니다.' }, 401);
    return apiJson({ items: await publishedPartnerLeads() });
  } catch { return apiJson({ error: '견적 목록을 불러오지 못했어요.' }, 503); }
}
