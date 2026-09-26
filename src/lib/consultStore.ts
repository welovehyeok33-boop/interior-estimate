export type ConsultState = {
  region?: string;
  buildingType?: string;
  regionDetail?: string;
  residentialGrade?: string;
  commercialType?: string;
  commercialSub?: string;
  spaceDescription?: string;
  area?: number;
  selectedWorks?: string[];
  experience?: string;
  schedule?: string;
  workScope?: string;
  budget?: string;
  memo?: string;
  name?: string;
  phone?: string;
};

export const CONSULT_SCHEDULES = [
  { id: "1month", label: "1개월 이내", description: "가능한 빠르게 시작하고 싶어요" },
  { id: "3months", label: "3개월 이내", description: "일정을 조율하고 있어요" },
  { id: "6months", label: "6개월 이내", description: "여유 있게 준비 중이에요" },
  { id: "undecided", label: "아직 미정", description: "상담 후 결정하고 싶어요" },
] as const;

export function formatConsultSchedule(value?: string): string {
  return CONSULT_SCHEDULES.find(item => item.id === value)?.label ?? "미정";
}

export function formatConsultBudget(value?: string): string {
  if (!value || value === "unknown") return "아직 모르겠어요";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return value;
  return amount >= 10000 ? "1억원 이상" : `${amount.toLocaleString("ko-KR")}만원`;
}

const KEY = "pomit_consult";

export function saveConsult(data: Partial<ConsultState>) {
  if (typeof window === "undefined") return;
  const prev = loadConsult();
  localStorage.setItem(KEY, JSON.stringify({ ...prev, ...data }));
}

export function loadConsult(): Partial<ConsultState> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

export function clearConsult() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
