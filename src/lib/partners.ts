export const PARTNER_CONSENT_VERSION = '2026-11-05';
export const PARTNER_REGIONS = ['서울', '경기', '인천', '강원', '충북', '충남', '대전', '세종', '전북', '전남', '광주', '경북', '경남', '대구', '울산', '부산', '제주'] as const;
export const PARTNER_SPECIALTIES = ['아파트·빌라', '단독주택', '오피스', '카페·음식점', '학원', '매장·뷰티', '병원', '기타 상업공간'] as const;
export const PARTNER_BUDGETS = ['3천만원 미만', '3천~5천만원', '5천만원~1억원', '1억원 이상', '상담 후 결정'] as const;
export const PARTNER_STATUSES = { new: '신규', reviewing: '검토 중', discussing: '조건 협의', approved: '승인', on_hold: '보류', rejected: '미선정' } as const;
export type PartnerStatus = keyof typeof PARTNER_STATUSES;
export type PartnerInput = { company: string; contact: string; phone: string; regions: string[]; specialties: string[]; budget: string; portfolio: string; intro: string; agreed: boolean; consentVersion: string; submissionId: string };
export type PartnerRecord = Omit<PartnerInput, 'agreed' | 'consentVersion' | 'submissionId'> & { id: string; created_at: string; status: PartnerStatus; admin_note: string; admin_version: number };
export function safePortfolio(value: string) {
  if (!value) return true;
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password && !!url.hostname; } catch { return false; }
}
export function validatePartner(value: unknown): string | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return '신청 내용을 확인해주세요.';
  const v = value as Record<string, unknown>;
  for (const [key, min, max] of [['company', 2, 100], ['contact', 2, 50], ['intro', 10, 2000]] as const) {
    if (typeof v[key] !== 'string' || v[key].trim().length < min || v[key].length > max) return `${key === 'company' ? '업체명' : key === 'contact' ? '담당자명' : '업체 소개'}을 ${min}~${max}자로 입력해주세요.`;
  }
  if (typeof v.phone !== 'string' || v.phone.length > 20 || !/^(?:01[016789]\d{7,8}|02\d{7,8}|0[3-6][1-5]\d{7,8}|070\d{8})$/.test(v.phone.replace(/[\s()-]/g, ''))) return '전화번호를 확인해주세요.';
  for (const [key, options] of [['regions', PARTNER_REGIONS], ['specialties', PARTNER_SPECIALTIES]] as const) {
    const selected = v[key];
    if (!Array.isArray(selected) || !selected.length || selected.length > options.length || new Set(selected).size !== selected.length || selected.some(item => typeof item !== 'string' || !(options as readonly string[]).includes(item))) return '활동 지역과 전문 분야를 선택해주세요.';
  }
  if (!(PARTNER_BUDGETS as readonly unknown[]).includes(v.budget)) return '주로 진행하는 공사 금액을 선택해주세요.';
  if (typeof v.portfolio !== 'string' || v.portfolio.length > 500 || !safePortfolio(v.portfolio.trim())) return '포트폴리오는 http 또는 https 링크로 입력해주세요.';
  if (v.agreed !== true || v.consentVersion !== PARTNER_CONSENT_VERSION) return '개인정보 수집·이용에 동의해주세요.';
  if (typeof v.submissionId !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(v.submissionId)) return '페이지를 새로 열어주세요.';
  return null;
}
