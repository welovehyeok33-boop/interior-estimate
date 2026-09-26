import type { EstimateState } from "./estimateStore";

export const SPACE_DESCRIPTION_MAX_LENGTH = 200;

export function getSpaceDescription(data: Partial<EstimateState>): string {
  // 기존 미정 업종 입력으로 진행 중이던 견적도 보존한다.
  const description = data.spaceDescription ?? (
    data.buildingType === "commercial" && data.commercialType === "unknown" ? data.commercialSub : ""
  );
  return description?.trim().slice(0, SPACE_DESCRIPTION_MAX_LENGTH).trim() || "";
}

// DB 스키마 변경 전 호환 경로: 기존 commercial_sub에 업종명과 설명을 함께 담는다.
// 폼 상태의 commercialSub는 그대로 유지하며 설명으로 덮어쓰지 않는다.
export function serializeLeadSpaceDetails(data: Partial<EstimateState>): string | null {
  const sub = data.buildingType === "commercial" && data.commercialType !== "unknown"
    ? data.commercialSub?.trim() || ""
    : "";
  const description = getSpaceDescription(data);
  return [sub, description ? `공간 설명: ${description}` : ""].filter(Boolean).join(" · ") || null;
}
