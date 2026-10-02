import { serverDb } from '@/lib/serverDb';
import { apiJson, isAdmin, rateLimit, sameOrigin } from '@/lib/serverAuth';
import { CONSENT_VERSION, validateConsult } from '@/lib/intakeValidation';
import { serializeLeadRegion } from '@/lib/estimateRegion';
import { visitorIdentity } from '@/lib/serverAnalytics';

export async function POST(request: Request) {
  if (!sameOrigin(request)) return apiJson({ error: '허용되지 않은 요청입니다.' }, 403);
  try {
    if (Number(request.headers.get('content-length')) > 12000) return apiJson({ error: '입력 내용이 너무 깁니다.' }, 413);
    const text = await request.text();
    if (text.length > 12000) return apiJson({ error: '입력 내용이 너무 깁니다.' }, 413);
    let body;
    try { body = JSON.parse(text); } catch { return apiJson({ error: '신청 내용을 확인해주세요.' }, 400); }
    const validation = validateConsult(body);
    if (validation) return apiJson({ error: validation }, 400);
    if (!await rateLimit(request, 'consult', 10)) return apiJson({ error: '신청 시도가 많아요. 15분 후 다시 시도해주세요.' }, 429);
    const commercial = body.buildingType === 'commercial';
    const visitor = request.headers.get('dnt') === '1' || request.headers.get('sec-gpc') === '1' || await isAdmin()
      ? null : await visitorIdentity();
    const { error } = await serverDb().from('consultations').insert({
      submission_id: body.submissionId, name: body.name.trim(), phone: body.phone.replace(/\D/g, ''),
      region: serializeLeadRegion(body.region, body.regionDetail), building_type: body.buildingType,
      residential_grade: commercial ? null : body.residentialGrade,
      commercial_type: commercial ? body.commercialType : null,
      commercial_sub: commercial && !['unknown','etc'].includes(body.commercialType) ? body.commercialSub : null,
      space_description: body.spaceDescription?.trim() || null,
      area: body.area, schedule: body.schedule, budget: body.budget, memo: body.memo?.trim() || null,
      consent_version: CONSENT_VERSION, consent_at: new Date().toISOString(), status: 'new',
      analytics_visitor: visitor?.visitor ?? null,
    });
    // A retry after a lost response must not create another customer record.
    if (error && error.code !== '23505') throw error;
    return apiJson({ ok: true });
  } catch { return apiJson({ error: '신청을 저장하지 못했어요. 입력 내용은 유지되니 잠시 후 다시 시도해주세요.' }, 503); }
}
