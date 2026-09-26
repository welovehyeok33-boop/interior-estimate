import assert from "node:assert/strict";
import { test } from "node:test";
import { ESTIMATE_STEP_LABELS, getEstimateStep } from "../src/lib/estimateProgress.ts";

test("견적의 다섯 경로는 표시 순서와 같은 단계로 연결된다", () => {
  assert.deepEqual(ESTIMATE_STEP_LABELS, ["지역·유형", "면적", "공종", "자재", "완성"]);
  const paths = [
    "/estimate/detail",
    "/estimate/detail/step2",
    "/estimate/detail/step3",
    "/estimate/detail/step4",
    "/estimate/detail/step5",
  ];

  for (const [index, path] of paths.entries()) {
    assert.equal(getEstimateStep(path), index + 1);
    assert.equal(getEstimateStep(`${path}/`), index + 1);
    assert.equal(getEstimateStep(`${path}///`), index + 1);
  }
});

test("직접 진입과 뒤로 이동도 방문 이력 없이 경로의 단계를 반환한다", () => {
  for (const step of [4, 5, 3, 2, 5, 1]) {
    const path = step === 1 ? "/estimate/detail" : `/estimate/detail/step${step}`;
    assert.equal(getEstimateStep(path), step);
    assert.equal(getEstimateStep(path) / ESTIMATE_STEP_LABELS.length, step / 5);
  }
});

test("유입용 무료 견적의 공통 세 단계와 신청 단계도 경로에 맞게 표시한다", () => {
  const paths = ["/consult", "/consult/step2", "/consult/step3", "/consult/step4"];
  for (const [index, path] of paths.entries()) {
    assert.equal(getEstimateStep(path), index + 1);
  }
});

test("경로가 없거나 견적 경로가 아니면 안전하게 첫 단계로 표시한다", () => {
  for (const path of [null, "", "/", "/estimate/scan"]) {
    assert.equal(getEstimateStep(path), 1);
  }
});

test("유사한 경로와 존재하지 않는 단계는 실제 단계로 오인하지 않는다", () => {
  for (const path of [
    "/estimate/detail/step0",
    "/estimate/detail/step6",
    "/estimate/detail/step20",
    "/estimate/detail/step3/extra",
    "/estimate/detail/step3-other",
    "/other/estimate/detail/step4",
  ]) {
    assert.equal(getEstimateStep(path), 1);
  }
});
