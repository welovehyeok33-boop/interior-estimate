// 견적 폼 전체 상태를 localStorage에 저장/불러오기

export type EstimateState = {
  // 1단계
  region: string;          // "seoul" | "metro" | "local"
  buildingType: string;    // "residential" | "commercial"
  residentialGrade: string;
  commercialType: string;
  commercialSub: string;
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
