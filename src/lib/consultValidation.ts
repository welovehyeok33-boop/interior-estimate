export const CONSULT_OPTIONS = {
  region: [["seoul", "서울"], ["metro", "경기 · 인천"], ["local", "그 외 지역"], ["undecided", "아직 미정"]],
  buildingType: [["residential", "주거"], ["commercial", "상가 · 사무실"], ["undecided", "아직 미정"]],
  experience: [["yes", "있어요"], ["no", "처음이에요"]],
  schedule: [["1month", "1개월 이내"], ["3months", "3개월 이내"], ["6months", "6개월 이내"], ["undecided", "아직 미정"]],
  workScope: [["full", "전체 공사"], ["partial", "부분 공사"], ["undecided", "상담 후 결정"]],
  budget: [["~1000", "1천만원 미만"], ["1000~3000", "1천 ~ 3천만원"], ["3000~5000", "3천 ~ 5천만원"], ["5000+", "5천만원 이상"], ["unknown", "아직 모르겠어요"]],
} as const;

export type ConsultState = {
  region?: string; buildingType?: string; area?: number | null;
  experience?: string; schedule?: string; workScope?: string; budget?: string; memo?: string;
};
export function validArea(area: unknown): area is number {
  return typeof area === "number" && Number.isFinite(area) && area >= 1 && area <= 9999;
}
export function validPhone(phone: string) {
  return /^(?:02\d{7,8}|0[1-9]\d{8,9})$/.test(phone.replace(/[\s()-]/g, ""));
}
export function sanitizeConsult(value: Record<string, unknown>): ConsultState {
  const result: ConsultState = {};
  for (const key of Object.keys(CONSULT_OPTIONS) as (keyof typeof CONSULT_OPTIONS)[]) {
    const candidate = value[key];
    if (CONSULT_OPTIONS[key].some(option => option[0] === candidate)) result[key] = String(candidate);
  }
  if (value.area === null || validArea(value.area)) result.area = value.area;
  if (typeof value.memo === "string") result.memo = value.memo.slice(0, 1000);
  return result;
}
export function firstMissingConsultStep(data: ConsultState) {
  if (!data.region || !data.buildingType) return 1;
  if (data.area !== null && !validArea(data.area)) return 2;
  if (!data.schedule || !data.workScope || !data.budget) return 3;
  return 4;
}
export function consultationPayload(data: ConsultState, name: string, phone: string) {
  if (firstMissingConsultStep(data) !== 4 || !name.trim() || name.trim().length > 50 || !validPhone(phone)) {
    throw new Error("신청 정보를 다시 확인해주세요.");
  }
  return {
    region: data.region ?? null, building_type: data.buildingType ?? null,
    area: data.area ?? null, experience: data.experience ?? null,
    schedule: data.schedule ?? null, work_scope: data.workScope ?? null,
    budget: data.budget ?? null, memo: data.memo?.trim() || null,
    name: name.trim(), phone: phone.replace(/[^0-9]/g, ""), status: "new",
  };
}
