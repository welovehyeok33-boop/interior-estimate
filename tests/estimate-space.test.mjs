import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getSpaceDescription,
  serializeLeadSpaceDetails,
  SPACE_DESCRIPTION_MAX_LENGTH,
} from "../src/lib/estimateSpace.ts";
import { loadEstimate, saveEstimate } from "../src/lib/estimateStore.ts";

test("식당 설명은 선택한 세부 업종을 덮어쓰지 않고 함께 전달한다", () => {
  const data = Object.freeze({
    buildingType: "commercial",
    commercialType: "food",
    commercialSub: "식당",
    spaceDescription: "오픈 주방이 있는 작은 식당을 생각하고 있어요.",
  });
  assert.equal(getSpaceDescription(data), data.spaceDescription);
  assert.equal(serializeLeadSpaceDetails(data), `식당 · 공간 설명: ${data.spaceDescription}`);
  assert.equal(data.commercialSub, "식당");
});

test("모든 주거 등급에서도 공간 설명을 전달한다", () => {
  for (const residentialGrade of ["budget", "standard", "highend"]) {
    const data = {
      buildingType: "residential",
      residentialGrade,
      spaceDescription: "수납이 많은 아파트로 바꾸고 싶어요.",
    };
    assert.equal(serializeLeadSpaceDetails(data), `공간 설명: ${data.spaceDescription}`);
  }
});

test("상가의 모든 업종과 기타·미정에서도 선택 설명을 전달한다", () => {
  const commercialTypes = [
    "food", "office", "education", "medical", "accommodation",
    "fitness", "beauty", "retail", "etc", "unknown",
  ];
  for (const commercialType of commercialTypes) {
    const data = { buildingType: "commercial", commercialType, spaceDescription: "밝은 공간을 원해요." };
    assert.equal(serializeLeadSpaceDetails(data), "공간 설명: 밝은 공간을 원해요.");
  }
});

test("선택 설명이 없거나 공백이면 기존 세부 업종 저장값을 유지한다", () => {
  for (const spaceDescription of [undefined, "", " \n\t "]) {
    const data = { buildingType: "commercial", commercialType: "food", commercialSub: "식당", spaceDescription };
    assert.equal(getSpaceDescription(data), "");
    assert.equal(serializeLeadSpaceDetails(data), "식당");
    assert.equal(serializeLeadSpaceDetails({ buildingType: "residential", spaceDescription }), null);
    assert.equal(serializeLeadSpaceDetails({ buildingType: "commercial", commercialType: "etc", spaceDescription }), null);
  }
  assert.equal(serializeLeadSpaceDetails({}), null);
});

test("구버전 업종 미정 메모는 새 공간 설명 필드가 없을 때 보존한다", () => {
  const legacy = { buildingType: "commercial", commercialType: "unknown", commercialSub: "  공방 겸 소품샵  " };
  assert.equal(getSpaceDescription(legacy), "공방 겸 소품샵");
  assert.equal(serializeLeadSpaceDetails(legacy), "공간 설명: 공방 겸 소품샵");
  assert.equal(serializeLeadSpaceDetails({ ...legacy, spaceDescription: "새로운 복합 공간" }), "공간 설명: 새로운 복합 공간");
});

test("명시적으로 지운 공간 설명은 구버전 미정 메모로 되살리지 않는다", () => {
  for (const spaceDescription of ["", " \n "]) {
    const data = { buildingType: "commercial", commercialType: "unknown", commercialSub: "이전 메모", spaceDescription };
    assert.equal(getSpaceDescription(data), "");
    assert.equal(serializeLeadSpaceDetails(data), null);
  }
});

test("상가가 아니면 이전 세부 업종과 미정 메모를 제외한다", () => {
  for (const buildingType of ["residential", undefined]) {
    for (const commercialType of ["food", "unknown"]) {
      const stale = { buildingType, commercialType, commercialSub: "이전 상가 선택 또는 메모" };
      assert.equal(getSpaceDescription(stale), "");
      assert.equal(serializeLeadSpaceDetails(stale), null);
      assert.equal(serializeLeadSpaceDetails({ ...stale, spaceDescription: "현재 공간 설명" }), "공간 설명: 현재 공간 설명");
    }
  }
});

test("설명 앞뒤 공백을 제거하고 내부 줄바꿈과 특수문자는 유지한다", () => {
  const description = "첫 줄 · 복합 공간\n둘째 줄: <큰 창>과 수납";
  const data = { buildingType: "commercial", commercialType: "food", commercialSub: "  카페  ", spaceDescription: ` \n${description}\t ` };
  assert.equal(getSpaceDescription(data), description);
  assert.equal(serializeLeadSpaceDetails(data), `카페 · 공간 설명: ${description}`);
});

test("새 설명과 구버전 미정 메모 모두 200자로 제한한다", () => {
  assert.equal(SPACE_DESCRIPTION_MAX_LENGTH, 200);
  const long = "가".repeat(250);
  const expected = "가".repeat(SPACE_DESCRIPTION_MAX_LENGTH);
  for (const data of [
    { buildingType: "residential", spaceDescription: ` ${long} ` },
    { buildingType: "commercial", commercialType: "unknown", commercialSub: ` ${long} ` },
  ]) {
    assert.equal(getSpaceDescription(data), expected);
    assert.equal(serializeLeadSpaceDetails(data), `공간 설명: ${expected}`);
  }
});

test("다음 단계 저장은 공간 설명·세부 업종·지역 설명을 각각 보존한다", () => {
  const values = new Map();
  globalThis.window = {};
  globalThis.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  };
  try {
    saveEstimate({
      region: "local", regionDetail: "부산 해운대구",
      buildingType: "commercial", commercialType: "food", commercialSub: "식당",
      spaceDescription: "오픈 주방을 원해요.",
    });
    saveEstimate({ area: 25 });
    saveEstimate({ selectedWorks: ["목공", "도장"] });
    saveEstimate({ materialGrade: "standard" });
    const result = loadEstimate();
    assert.equal(result.commercialSub, "식당");
    assert.equal(result.spaceDescription, "오픈 주방을 원해요.");
    assert.equal(result.regionDetail, "부산 해운대구");
    assert.equal(result.area, 25);
    assert.deepEqual(result.selectedWorks, ["목공", "도장"]);
    assert.equal(result.materialGrade, "standard");
    assert.equal(serializeLeadSpaceDetails(result), "식당 · 공간 설명: 오픈 주방을 원해요.");

    saveEstimate({
      buildingType: "residential", residentialGrade: "standard",
      commercialType: undefined, commercialSub: undefined, spaceDescription: "주방 수납을 늘리고 싶어요.",
    });
    const residential = loadEstimate();
    assert.equal(residential.commercialType, undefined);
    assert.equal(residential.commercialSub, undefined);
    assert.equal(serializeLeadSpaceDetails(residential), "공간 설명: 주방 수납을 늘리고 싶어요.");

    saveEstimate({ spaceDescription: undefined });
    assert.equal(loadEstimate().spaceDescription, undefined);
    assert.equal(serializeLeadSpaceDetails(loadEstimate()), null);
  } finally {
    delete globalThis.window;
    delete globalThis.localStorage;
  }
});
