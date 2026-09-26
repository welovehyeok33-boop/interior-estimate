import assert from "node:assert/strict";
import { test } from "node:test";
import { formatEstimateRegion, serializeLeadRegion } from "../src/lib/estimateRegion.ts";
import { loadEstimate, saveEstimate } from "../src/lib/estimateStore.ts";

test("기존 지역과 빈 선택 입력은 기존 저장 형식을 유지한다", () => {
  for (const [code, label] of [["seoul", "서울"], ["metro", "수도권"], ["local", "지방"]]) {
    assert.equal(serializeLeadRegion(code, "   "), code);
    assert.equal(formatEstimateRegion(code), label);
  }
  assert.equal(serializeLeadRegion(undefined, "부산"), null);
  assert.equal(formatEstimateRegion(null), "-");
  assert.equal(formatEstimateRegion("invalid"), "-");
});

test("지방 설명을 저장하고 결과/리드 화면에서 동일하게 표시한다", () => {
  const detail = "  부산 해운대구  ";
  const saved = serializeLeadRegion("local", detail);
  assert.equal(saved, "local:부산 해운대구");
  assert.equal(formatEstimateRegion(saved), "지방 · 부산 해운대구");
  assert.equal(formatEstimateRegion("local", detail), formatEstimateRegion(saved));
  assert.equal(formatEstimateRegion("local:  "), "지방");
  assert.equal(serializeLeadRegion("local", "가".repeat(80)), `local:${"가".repeat(50)}`);
});

test("서울/수도권에는 이전 지방 설명을 붙이지 않는다", () => {
  assert.equal(serializeLeadRegion("seoul", "부산 해운대구"), "seoul");
  assert.equal(formatEstimateRegion("metro", "부산 해운대구"), "수도권");
});

test("다음 단계 저장은 지역 설명과 업종 설명을 보존하고 지역 변경 시 설명을 지운다", () => {
  const values = new Map();
  globalThis.window = {};
  globalThis.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  };
  try {
    saveEstimate({ region: "local", regionDetail: "부산 해운대구", commercialType: "unknown", commercialSub: "공방 겸 소품샵" });
    saveEstimate({ area: 25, selectedWorks: ["도배"], materialGrade: "standard" });
    const result = loadEstimate();
    assert.equal(result.region, "local");
    assert.equal(result.regionDetail, "부산 해운대구");
    assert.equal(result.commercialSub, "공방 겸 소품샵");
    assert.equal(serializeLeadRegion(result.region, result.regionDetail), "local:부산 해운대구");
    saveEstimate({ region: "seoul", regionDetail: undefined });
    assert.equal(loadEstimate().regionDetail, undefined);
  } finally {
    delete globalThis.window;
    delete globalThis.localStorage;
  }
});
