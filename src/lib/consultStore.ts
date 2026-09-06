export type ConsultState = {
  region?: string;
  buildingType?: string;
  area?: number;
  experience?: string;
  schedule?: string;
  workScope?: string;
  budget?: string;
  memo?: string;
  name?: string;
  phone?: string;
};

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
