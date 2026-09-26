export type EstimateState = {
  region: string; buildingType: string; residentialGrade: string;
  commercialType: string; commercialSub: string; area: number;
  selectedWorks: string[]; materialGrade: string;
};
export const COMMERCIAL_SUBS: Record<string, readonly string[]> = {
  food: ["식당", "카페", "술집"], office: ["일반 오피스", "공유오피스", "1인 오피스"],
  education: ["학원", "스터디카페", "유치원/학교"], medical: ["병원", "동물병원", "약국"],
  accommodation: ["고시원", "호스텔", "모텔/호텔", "에어비앤비"],
  fitness: ["헬스장", "필라테스/요가", "PT샵", "골프연습장", "PC방", "노래방"],
  beauty: ["뷰티샵", "미용실"], retail: ["편의점", "의류/잡화점", "무인매장", "그외 (휴대폰·안경·꽃집 등)"],
  etc: [], unknown: [],
};
export const WORKS = ["목공", "경량", "타일", "도장", "필름", "도배", "바닥", "금속", "창호", "가구", "간판", "철거", "설비", "방수", "전기/조명", "냉난방", "소방", "덕트", "가스", "단열", "철물", "그외"];
export function sanitizeEstimate(value: Record<string, unknown>): Partial<EstimateState> {
  const result: Partial<EstimateState> = {};
  const options = {
    region: ["seoul", "metro", "local"], buildingType: ["residential", "commercial"],
    residentialGrade: ["budget", "standard", "highend", "unknown"],
    commercialType: Object.keys(COMMERCIAL_SUBS), materialGrade: ["economy", "standard", "premium"],
  };
  for (const key of Object.keys(options) as (keyof typeof options)[]) {
    if (typeof value[key] === "string" && options[key].includes(value[key])) result[key] = value[key];
  }
  if (typeof value.commercialSub === "string" && (COMMERCIAL_SUBS[result.commercialType ?? ""] ?? []).includes(value.commercialSub)) result.commercialSub = value.commercialSub;
  if (typeof value.area === "number" && Number.isFinite(value.area) && value.area >= 1 && value.area <= 9999) result.area = value.area;
  if (Array.isArray(value.selectedWorks)) result.selectedWorks = [...new Set(value.selectedWorks.filter((work): work is string => typeof work === "string" && WORKS.includes(work)))];
  return result;
}
export function firstMissingEstimateStep(data: Partial<EstimateState>) {
  if (!data.region || !data.buildingType) return 1;
  if (data.buildingType === "residential" && !data.residentialGrade) return 1;
  if (data.buildingType === "commercial") {
    if (!data.commercialType) return 1;
    const subs = COMMERCIAL_SUBS[data.commercialType];
    if (!subs || (subs.length > 0 && !subs.includes(data.commercialSub ?? ""))) return 1;
  }
  if (!data.area || !Number.isFinite(data.area) || data.area < 1 || data.area > 9999) return 2;
  if (!data.selectedWorks?.length) return 3;
  if (!data.materialGrade) return 4;
  return 5;
}
