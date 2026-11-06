import { notFound } from 'next/navigation';
import { isAdmin } from '@/lib/serverAuth';
import PartnerLeadBoard from '@/components/PartnerLeadBoard';
import type { PartnerLead } from '@/lib/partnerPortal';
import { partnerLeadCard } from '@/lib/partnerPortal';
export const dynamic = 'force-dynamic';
export default async function PartnerPreview() {
  if (process.env.VERCEL_ENV !== 'preview') {
    if (!await isAdmin()) notFound();
    return <PartnerLeadBoard company="관리자 미리보기" mode="admin" />;
  }
  // Preview deployments contain only fictitious samples, never live consultations.
  const examples: PartnerLead[] = [
    { code: 'EX-001', publishedAt: '2026-11-06T01:00:00Z', customer: '김 고객님', phone: '***-****-****', region: '서울', kind: 'residential', space: '주거 인테리어', area: 32, budget: '5,000만원', schedule: '1개월 이내', open: true },
    { code: 'EX-002', publishedAt: '2026-11-05T01:00:00Z', customer: '이 고객님', phone: '***-****-****', region: '경기', kind: 'commercial', space: '카페·음식점', area: 24, budget: '4,000만원', schedule: '3개월 이내', open: true },
    { code: 'EX-003', publishedAt: '2026-11-04T01:00:00Z', customer: '박 고객님', phone: '***-****-****', region: '서울', kind: 'commercial', space: '오피스', area: 56, budget: '8,000만원', schedule: '일정 협의', open: true },
    { code: 'EX-004', publishedAt: '2026-11-03T01:00:00Z', customer: '최 고객님', phone: '***-****-****', region: '인천', kind: 'residential', space: '주거 인테리어', area: 28, budget: '예산 협의', schedule: '3개월 이내', open: true },
    { code: 'EX-005', publishedAt: '2026-11-02T01:00:00Z', customer: '정 고객님', phone: '***-****-****', region: '경기', kind: 'commercial', space: '학원·교육', area: 42, budget: '6,000만원', schedule: '6개월 이내', open: true },
    { code: 'EX-006', publishedAt: '2026-11-01T01:00:00Z', customer: '윤 고객님', phone: '***-****-****', region: '부산', kind: 'commercial', space: '매장·뷰티', area: 18, budget: '3,000만원', schedule: '1개월 이내', open: false },
  ];
  return <PartnerLeadBoard company="폼잇 인테리어 (예시)" mode="demo" examples={examples.map((row, i) => partnerLeadCard(row, `00000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`, i % 3, false, true))} />;
}
