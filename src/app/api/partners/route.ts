import { serverDb } from '@/lib/serverDb';
import { apiJson, sameOrigin, rateLimit } from '@/lib/serverAuth';
import { validatePartner, type PartnerInput } from '@/lib/partners';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  if (!sameOrigin(request)) return apiJson({ error: '허용되지 않는 요청입니다.' }, 403);
  try {
    const raw = await request.text();
    if (raw.length > 12000) return apiJson({ error: '입력 내용이 너무 깁니다.' }, 413);
    let value: unknown;
    try { value = JSON.parse(raw); } catch { return apiJson({ error: '입력 내용을 확인해주세요.' }, 400); }
    const invalid = validatePartner(value);
    if (invalid) return apiJson({ error: invalid }, 400);
    if (!await rateLimit(request, 'partner', 5)) return apiJson({ error: '잠시 후 다시 신청해주세요.' }, 429);
    const v = value as PartnerInput;
    const db = serverDb();
    const cleanup = await db.from('partner_applications').delete().lt('expires_at', new Date().toISOString());
    if (cleanup.error) throw new Error('cleanup failed');
    const { error } = await db.from('partner_applications').insert({ submission_id: v.submissionId, company: v.company.trim(), contact: v.contact.trim(), phone: v.phone.replace(/[\s()-]/g, ''), regions: v.regions, specialties: v.specialties, budget: v.budget, portfolio: v.portfolio.trim(), intro: v.intro.trim(), consent_version: v.consentVersion });
    if (error && error.code !== '23505') throw new Error('insert failed');
    return apiJson({ ok: true });
  } catch { return apiJson({ error: '접수하지 못했습니다. 잠시 후 다시 시도해주세요.' }, 503); }
}
