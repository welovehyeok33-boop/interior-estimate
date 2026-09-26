import { test } from "node:test";
import assert from "node:assert/strict";
import { createDraftStore } from "../.test-build/lib/draftStore.js";
import { sanitizeConsult, validArea, validPhone, firstMissingConsultStep, consultationPayload } from "../.test-build/lib/consultValidation.js";
import { sanitizeEstimate, firstMissingEstimateStep } from "../.test-build/lib/estimateValidation.js";
import { getPostBySlug } from "../.test-build/data/posts.js";
test("Korean blog links resolve from encoded and normalized route parameters", () => {
  const slug = "도배-비용-완전-정리";
  assert.equal(getPostBySlug(slug)?.slug, slug);
  assert.equal(getPostBySlug(encodeURIComponent(slug))?.slug, slug);
  assert.equal(getPostBySlug(slug.normalize("NFD"))?.slug, slug);
  assert.equal(getPostBySlug("%invalid"), undefined);
  assert.equal(getPostBySlug("not-a-post"), undefined);
});
test("rejects nonfinite and out-of-range area values", () => {
  for (const value of [0, -1, 10000, Infinity, NaN, "20"]) assert.equal(validArea(value), false);
  for (const value of [1, 25.4, 9999]) assert.equal(validArea(value), true);
});
test("accepts formatted Korean phone numbers and rejects malformed ones", () => {
  for (const value of ["010-1234-5678", "02-1234-5678", "02-123-4567", "0311234567"]) assert.equal(validPhone(value), true);
  for (const value of ["", "0000000000", "1234567890", "010123456789012", "010123", "abc01012345678"]) assert.equal(validPhone(value), false);
});
test("undecided choices and null area can finish without invented measurements", () => {
  const data = sanitizeConsult({ region: "undecided", buildingType: "undecided", area: null, schedule: "undecided", workScope: "undecided", budget: "unknown" });
  assert.equal(firstMissingConsultStep(data), 4);
  const payload = consultationPayload(data, " 테스트 ", "010-1234-5678");
  assert.equal(payload.area, null);
  assert.equal(payload.phone, "01012345678");
  assert.equal(payload.name, "테스트");
  assert.equal(payload.experience, null);
});
test("incomplete or invalid requests do not produce an insert payload", () => {
  assert.equal(firstMissingConsultStep({}), 1);
  assert.equal(firstMissingConsultStep({ region: "seoul", buildingType: "commercial" }), 2);
  assert.throws(() => consultationPayload({}, "테스트", "01012345678"));
  assert.deepEqual(sanitizeConsult({ region: "bogus", area: -1, memo: 32, name: "private" }), {});
});
test("unknown industry skips sub-industry but known industries require it", () => {
  const data = sanitizeEstimate({ region: "seoul", buildingType: "commercial", commercialType: "unknown", area: 20, selectedWorks: ["도배"], materialGrade: "standard" });
  assert.equal(firstMissingEstimateStep(data), 5);
  assert.equal(firstMissingEstimateStep({ ...data, commercialType: "food" }), 1);
  assert.equal(firstMissingEstimateStep({ ...data, commercialType: "food", commercialSub: "카페" }), 5);
  assert.equal(firstMissingEstimateStep({ ...data, commercialType: "food", commercialSub: "헬스장" }), 1);
});
test("corrupted estimate data cannot become NaN or an empty successful estimate", () => {
  const data = sanitizeEstimate({ region: "bogus", selectedWorks: ["도배", 42, "bogus", "도배"], area: Infinity });
  assert.deepEqual(data, { selectedWorks: ["도배"] });
  assert.equal(firstMissingEstimateStep(data), 1);
});
function fakeWindow({ writeBlocked = false, readBlocked = false } = {}) {
  const map = new Map();
  const storage = {
    getItem(key) { if (readBlocked) throw new Error("storage blocked"); return map.get(key) ?? null; },
    setItem(key, value) { if (writeBlocked) throw new Error("quota"); map.set(key, value); },
    removeItem(key) { if (writeBlocked) throw new Error("quota"); map.delete(key); },
  };
  global.window = { localStorage: storage, sessionStorage: storage, addEventListener() {}, removeEventListener() {} };
  return map;
}
test("draft persists back navigation and accepts explicit clearing of an answer", () => {
  fakeWindow();
  const draft = createDraftStore("test", sanitizeConsult);
  draft.save({ region: "seoul", area: 25 });
  draft.save({ buildingType: "commercial" });
  assert.equal(draft.load().area, 25);
  const restored = createDraftStore("test", sanitizeConsult);
  assert.equal(restored.load().buildingType, "commercial");
  restored.save({ area: undefined });
  assert.equal(restored.load().area, undefined);
});
test("storage write failure retains new answers in memory", () => {
  fakeWindow({ writeBlocked: true });
  const draft = createDraftStore("test", sanitizeConsult);
  draft.save({ region: "seoul" });
  draft.save({ area: 30 });
  assert.deepEqual(draft.load(), { region: "seoul", area: 30 });
  draft.clear();
  assert.deepEqual(draft.load(), {});
});
test("blocked browser storage does not prevent completing the form in the tab", () => {
  fakeWindow({ readBlocked: true, writeBlocked: true });
  const draft = createDraftStore("test", sanitizeConsult);
  draft.save({ region: "metro", area: null });
  assert.deepEqual(draft.load(), { region: "metro", area: null });
});
test("null, arrays and malformed JSON restore as a safe empty draft", () => {
  for (const value of ["null", "[]", "broken"]) {
    const map = fakeWindow();
    map.set("test", value);
    assert.deepEqual(createDraftStore("test", sanitizeConsult).load(), {});
  }
});
test("listeners receive edits and successful completion clears the draft", () => {
  fakeWindow();
  const draft = createDraftStore("test", sanitizeConsult);
  let notified = 0;
  const unsubscribe = draft.subscribe(() => notified++);
  draft.save({ region: "seoul" });
  draft.clear();
  assert.equal(notified, 2);
  assert.deepEqual(draft.load(), {});
  unsubscribe();
  draft.save({ region: "metro" });
  assert.equal(notified, 2);
});
