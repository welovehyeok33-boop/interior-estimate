export const PARTNER_PORTAL_COOKIE = 'formit_partner_session';
export const PARTNER_SESSION_SECONDS = 8 * 3600;
export const PARTNER_UUID = /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i;
export type PartnerAccount = { id: string; company: string; email: string; active: boolean; session_version: string; created_at: string };
export type PartnerLead = { code: string; publishedAt: string; customer: string; phone: string; region: string; space: string; kind: 'residential' | 'commercial'; area: number | null; budget: string; schedule: string; open: boolean };
const REGIONS = ['서울', '경기', '인천', '강원', '충북', '충남', '대전', '세종', '전북', '전남', '광주', '경북', '경남', '대구', '울산', '부산', '제주'];
const SCHEDULES: Record<string, string> = { '1month': '1개월 이내', '3months': '3개월 이내', '6months': '6개월 이내', undecided: '일정 협의' };
const SPACES: Record<string, string> = { food: '카페·음식점', office: '오피스', education: '학원·교육', medical: '의료공간', accommodation: '숙박공간', fitness: '운동·여가', beauty: '매장·뷰티', retail: '판매시설', etc: '기타 상업공간', unknown: '상가' };
export function maskedSurname(value: unknown) {
  if (typeof value !== 'string' || !/^[가-힣]{2,10}$/.test(value.trim())) return '비공개 고객님';
  const name = value.trim();
  const compound = ['남궁', '황보', '제갈', '선우', '독고', '사공', '서문', '동방'];
  return `${name.length >= 3 && compound.includes(name.slice(0, 2)) ? name.slice(0, 2) : name[0]} 고객님`;
}
export function coarseRegion(value: unknown) {
  if (typeof value !== 'string') return '지역 협의';
  if (value === 'seoul') return '서울';
  if (value === 'metro') return '수도권';
  const region = REGIONS.find(r => value.startsWith(r));
  return region || '지역 협의';
}
// Explicit projection: even compromised free-text fields cannot leak through the API.
// Phone is not selected from the database. No memo/description/address/contact link.
export function partnerLead(row: Record<string, unknown>, publishedAt: string): PartnerLead {
  const residential = row.building_type === 'residential';
  const budget = typeof row.budget === 'string' && /^\d{3,5}$/.test(row.budget) ? Number(row.budget) : NaN;
  const date = typeof row.created_at === 'string' && Number.isFinite(Date.parse(row.created_at)) ? row.created_at.slice(2, 10).replaceAll('-', '') : '000000';
  const id = typeof row.id === 'string' && PARTNER_UUID.test(row.id) ? row.id.replaceAll('-', '').slice(0, 10).toUpperCase() : '----------';
  return {
    code: `FT-${date}-${id}`, publishedAt,
    customer: maskedSurname(row.name), phone: '***-****-****',
    region: coarseRegion(row.region), kind: residential ? 'residential' : 'commercial',
    space: residential ? '주거 인테리어' : Object.hasOwn(SPACES, String(row.commercial_type)) ? SPACES[String(row.commercial_type)] : '상가 인테리어',
    area: typeof row.area === 'number' && Number.isFinite(row.area) && row.area >= 1 && row.area <= 9999 ? row.area : null,
    budget: budget >= 500 && budget <= 10000 && budget % 500 === 0 ? `${budget.toLocaleString('ko-KR')}만원` : '예산 협의',
    schedule: Object.hasOwn(SCHEDULES, String(row.schedule)) ? SCHEDULES[String(row.schedule)] : '일정 협의',
    open: ['new', 'contact_attempted', 'contacted', 'consulting', 'quoted'].includes(String(row.status)),
  };
}
export function accountInput(value: unknown) {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  if (typeof v.company !== 'string' || v.company.trim().length < 2 || v.company.length > 100 || typeof v.email !== 'string' || v.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) return null;
  return { company: v.company.trim(), email: v.email.trim().toLowerCase() };
}
