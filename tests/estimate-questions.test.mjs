import assert from "node:assert/strict";
import { test } from "node:test";
import { deriveSelectedWorks, hasCompletedCommonQuestions } from "../src/lib/estimateQuestions.ts";

const base = { spaceStatus: "vacant", demolition: "none", workAreas: [], extras: [] };

test("전체 철거와 새 천장은 기존 계산용 공종으로 변환된다", () => {
  const works = deriveSelectedWorks({ ...base, demolition: "full", workAreas: ["ceiling"], ceiling: "new" });
  assert.deepEqual(new Set(works), new Set(["철거", "경량", "목공", "전기/조명", "도장"]));
});

test("벽과 바닥 답변은 마감 공종과 철거 공종으로 변환된다", () => {
  const works = deriveSelectedWorks({ ...base, workAreas: ["walls", "floor"], walls: "both", wallFinish: "wallpaper", floor: "replace" });
  assert.deepEqual(new Set(works), new Set(["철거", "경량", "목공", "도배", "바닥"]));
});

test("모르겠어요만 골라도 다음 계산에서 0원이 되지 않는다", () => {
  assert.deepEqual(deriveSelectedWorks({ ...base, workAreas: ["unknown"] }), ["그외"]);
  assert.equal(hasCompletedCommonQuestions({ ...base, workAreas: ["unknown"] }), true);
});

test("선택한 범위에 필요한 후속 답변이 없으면 완료로 보지 않는다", () => {
  assert.equal(hasCompletedCommonQuestions({ ...base, workAreas: ["walls"] }), false);
  assert.equal(hasCompletedCommonQuestions({ ...base, workAreas: ["walls"], walls: "keep", wallFinish: "paint" }), true);
});
