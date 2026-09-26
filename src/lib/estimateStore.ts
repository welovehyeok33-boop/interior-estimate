// 견적 폼 전체 상태를 localStorage에 저장/불러오기

export type EstimateState = {
  // 1단계
  region: string;          // "seoul" | "metro" | "local"
  regionDetail: string;    // 지방 선택 시 시·군·구 (선택 입력, 최대 50자)
  buildingType: string;    // "residential" | "commercial"
  residentialGrade: string;
  commercialType: string;
  commercialSub: string;   // 세부 업종. commercialType="unknown"이면 선택 입력한 공간 설명 (최대 200자)
  // 2단계
  area: number;
  // 3단계
  selectedWorks: string[];
  // 4단계
  materialGrade: string;   // "economy" | "standard" | "premium"
};

const KEY = "interior_estimate";

export function saveEstimate(data: Partial<EstimateState>) {
  if (typeof window === "undefined") return;
  const existing = loadEstimate();
  localStorage.setItem(KEY, JSON.stringify({ ...existing, ...data }));
}

export function loadEstimate(): Partial<EstimateState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function clearEstimate() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
