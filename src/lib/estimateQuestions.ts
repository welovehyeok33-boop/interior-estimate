export type SpaceStatus = "vacant" | "in_use" | "pre_contract" | "unknown";
export type DemolitionScope = "full" | "partial" | "none" | "unknown";
export type WorkArea = "whole" | "ceiling" | "walls" | "floor" | "unknown";
export type CeilingPlan = "keep" | "refinish" | "new" | "exposed" | "unknown";
export type WallPlan = "keep" | "remove" | "new" | "both" | "unknown";
export type WallFinish = "paint" | "wallpaper" | "film" | "tile" | "unknown";
export type FloorPlan = "keep" | "overlay" | "replace" | "unknown";
export type ExtraWork = "electric" | "hvac" | "windows" | "furniture" | "sign" | "unknown";

export type CommonQuestionAnswers = {
  spaceStatus?: SpaceStatus;
  demolition?: DemolitionScope;
  workAreas: WorkArea[];
  ceiling?: CeilingPlan;
  walls?: WallPlan;
  wallFinish?: WallFinish;
  floor?: FloorPlan;
  extras: ExtraWork[];
};

export const EMPTY_COMMON_ANSWERS: CommonQuestionAnswers = { workAreas: [], extras: [] };

export function deriveSelectedWorks(answers: CommonQuestionAnswers): string[] {
  const works = new Set<string>();
  const includes = (area: WorkArea) => answers.workAreas.includes("whole") || answers.workAreas.includes(area);
  if (answers.demolition === "full" || answers.demolition === "partial") works.add("철거");
  if (includes("ceiling")) {
    if (answers.ceiling === "new") ["경량", "목공", "전기/조명", "도장"].forEach(work => works.add(work));
    else if (answers.ceiling === "refinish" || answers.ceiling === "exposed") ["도장", "전기/조명"].forEach(work => works.add(work));
    else if (answers.ceiling === "unknown") works.add("그외");
  }
  if (includes("walls")) {
    if (answers.walls === "remove" || answers.walls === "both") works.add("철거");
    if (answers.walls === "new" || answers.walls === "both") ["경량", "목공"].forEach(work => works.add(work));
    const finishMap: Partial<Record<WallFinish, string>> = { paint: "도장", wallpaper: "도배", film: "필름", tile: "타일", unknown: "그외" };
    const wallWork = answers.wallFinish ? finishMap[answers.wallFinish] : undefined;
    if (wallWork) works.add(wallWork);
  }
  if (includes("floor")) {
    if (answers.floor === "replace") works.add("철거");
    if (answers.floor === "overlay" || answers.floor === "replace") works.add("바닥");
    if (answers.floor === "unknown") works.add("그외");
  }
  const extraMap: Record<ExtraWork, string> = { electric: "전기/조명", hvac: "냉난방", windows: "창호", furniture: "가구", sign: "간판", unknown: "그외" };
  answers.extras.forEach(extra => works.add(extraMap[extra]));
  if (works.size === 0) works.add("그외");
  return Array.from(works);
}

export function hasCompletedCommonQuestions(answers: CommonQuestionAnswers): boolean {
  if (!answers.spaceStatus || !answers.demolition || answers.workAreas.length === 0) return false;
  const includes = (area: WorkArea) => answers.workAreas.includes("whole") || answers.workAreas.includes(area);
  if (answers.workAreas.includes("unknown")) return true;
  if (includes("ceiling") && !answers.ceiling) return false;
  if (includes("walls") && (!answers.walls || !answers.wallFinish)) return false;
  if (includes("floor") && !answers.floor) return false;
  return true;
}
