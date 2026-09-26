const REGION_LABEL: Record<string, string> = { seoul: "서울", metro: "수도권", local: "지방" };

export const REGION_DETAIL_MAX_LENGTH = 50;

// 견적 계산/폼 상태는 기존 지역 코드를 유지한다.
// 리드 저장 시에만 기존 region 컬럼에 선택 입력을 함께 담는다.
export function serializeLeadRegion(region?: string | null, detail?: string | null): string | null {
  if (!region || !Object.hasOwn(REGION_LABEL, region)) return null;
  const normalizedDetail = detail?.trim().slice(0, REGION_DETAIL_MAX_LENGTH).trim();
  return region === "local" && normalizedDetail ? `local:${normalizedDetail}` : region;
}

// 기존 리드(seoul/metro/local)와 지역 설명이 있는 새 리드를 모두 표시한다.
export function formatEstimateRegion(region?: string | null, detail?: string | null): string {
  if (region?.startsWith("local:")) {
    detail = region.slice("local:".length);
    region = "local";
  }
  const serialized = serializeLeadRegion(region, detail);
  if (!serialized) return "-";
  return serialized.startsWith("local:") ? `지방 · ${serialized.slice("local:".length)}` : REGION_LABEL[serialized];
}
