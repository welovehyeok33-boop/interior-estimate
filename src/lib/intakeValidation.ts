export const CONSENT_VERSION = '2026-09-29';
export const INDUSTRIES: Record<string, readonly string[]> = {
  food: ['식당', '카페', '술집'], office: ['일반 오피스', '공유오피스', '1인 오피스'],
  education: ['학원', '스터디카페', '유치원/학교'], medical: ['병원', '동물병원', '약국'],
  accommodation: ['고시원', '호스텔', '모텔/호텔', '에어비앤비'],
  fitness: ['헬스장', '필라테스/요가', 'PT샵', '골프연습장', 'PC방', '노래방'],
  beauty: ['뷰티샵', '미용실'], retail: ['편의점', '의류/잡화점', '무인매장', '그외 (휴대폰·안경·꽃집 등)'],
  etc: [], unknown: [],
};
export const INDUSTRY_LABELS: Record<string, string> = { food: '외식', office: '오피스', education: '교육', medical: '의료', accommodation: '숙박', fitness: '피트니스', beauty: '뷰티', retail: '판매점', etc: '기타', unknown: '아직 미정' };
export function validArea(value: unknown): value is number { return typeof value === 'number' && Number.isFinite(value) && value >= 1 && value <= 9999; }
export function validPhone(value: string) { return /^(?:01[016789]\d{7,8}|02\d{7,8}|0[3-6][1-5]\d{7,8}|070\d{8})$/.test(value.replace(/[\s()-]/g, '')); }
export function validBudget(value: unknown) { return value === 'unknown' || typeof value === 'string' && /^\d+$/.test(value) && Number(value) >= 500 && Number(value) <= 10000 && Number(value) % 500 === 0; }
export function validSpace(value: Record<string, unknown>) {
  if (!['seoul', 'metro', 'local'].includes(String(value.region))) return false;
  if (value.buildingType === 'residential') return ['budget', 'standard', 'highend'].includes(String(value.residentialGrade));
  if (value.buildingType !== 'commercial' || typeof value.commercialType !== 'string' || !Object.hasOwn(INDUSTRIES, value.commercialType)) return false;
  const subs = INDUSTRIES[value.commercialType];
  return subs.length === 0 || subs.includes(String(value.commercialSub));
}
export function consultStage(value: Record<string, unknown>): string | null {
  if (!validSpace(value)) return '/consult';
  if (!validArea(value.area)) return '/consult/step2';
  if (!['1month', '3months', '6months', 'undecided'].includes(String(value.schedule)) || !validBudget(value.budget)) return '/consult/step3';
  return null;
}
export function validateConsult(value: unknown): string | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return '신청 내용을 확인해주세요.';
  const v = value as Record<string, unknown>;
  if (consultStage(v)) return '지역, 공간, 면적, 공사 계획을 먼저 입력해주세요.';
  if (typeof v.name !== 'string' || v.name.trim().length < 2 || v.name.trim().length > 50) return '이름을 2~50자로 입력해주세요.';
  if (typeof v.phone !== 'string' || v.phone.length > 20 || !validPhone(v.phone)) return '연락 가능한 전화번호를 확인해주세요.';
  if (v.agreed !== true || v.consentVersion !== CONSENT_VERSION) return '개인정보 수집·이용 동의를 확인해주세요.';
  if (typeof v.submissionId !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(v.submissionId)) return '신청 페이지를 새로 열어주세요.';
  for (const [key, max] of [['regionDetail', 50], ['spaceDescription', 200], ['memo', 1000]] as const) {
    if (v[key] !== undefined && (typeof v[key] !== 'string' || v[key].length > max)) return '입력 내용의 길이를 확인해주세요.';
  }
  return null;
}
