import { apiJson, isAdmin, rateLimit, sameOrigin } from '@/lib/serverAuth';
import { currentPartner } from '@/lib/serverPartnerPortal';
import { serverDb } from '@/lib/serverDb';
import { PARTNER_UUID } from '@/lib/partnerPortal';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  if (!sameOrigin(request)) return apiJson({ error: '허용되지 않은 요청입니다.' }, 403);
  try {
    if (await isAdmin()) return apiJson({ error: '관리자는 참여 자리 차감 없이 견적을 열람할 수 있습니다.' }, 403);
    const account = await currentPartner();
    if (!account) return apiJson({ error: '파트너 로그인이 필요합니다.' }, 401);
    const raw = await request.text();
    if (raw.length > 300) return apiJson({ error: '입력값이 너무 깁니다.' }, 413);
    let body;
    try { body = JSON.parse(raw); } catch { return apiJson({ error: '견적을 확인해주세요.' }, 400); }
    if (!body || typeof body.id !== 'string' || !PARTNER_UUID.test(body.id)) return apiJson({ error: '견적을 확인해주세요.' }, 400);
    if (!await rateLimit(request, 'partner_bid', 30)) return apiJson({ error: '요청이 많아요. 잠시 후 다시 시도해주세요.' }, 429);
    const { data, error } = await serverDb().rpc('claim_partner_lead', { p_partner_id: account.id, p_session_version: account.session_version, p_consultation_id: body.id });
    if (error) throw error;
    if (data?.status === 'joined') return apiJson({ joined: true });
    if (data?.status === 'full') return apiJson({ error: '이미 2개 파트너가 참여한 견적입니다.' }, 409);
    if (data?.status === 'closed') return apiJson({ error: '모집이 마감된 견적입니다.' }, 409);
    if (data?.status === 'unavailable') return apiJson({ error: '공개되지 않았거나 만료된 견적입니다.' }, 404);
    if (data?.status === 'inactive') return apiJson({ error: '로그인 상태를 다시 확인해주세요.' }, 401);
    throw new Error('Invalid participation response');
  } catch { return apiJson({ error: '비딩 참여를 처리하지 못했어요. 새로고침 후 다시 시도해주세요.' }, 503); }
}
