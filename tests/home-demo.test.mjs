import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEMO_SCENES,
  DEMO_SCAN_ITEMS,
  DEMO_TOTAL,
  DEMO_WORKS,
  getDemoScene,
  getDemoSelectedCount,
} from "../src/lib/homeDemo.ts";

test("홈 데모의 공종별 예시 금액과 합계가 일치한다", () => {
  assert.deepEqual(DEMO_WORKS.map(work => work.id), ["demolition", "wallpaper", "floor", "tile"]);
  assert.equal(new Set(DEMO_WORKS.map(work => work.id)).size, DEMO_WORKS.length);
  for (const work of DEMO_WORKS) {
    assert.ok(work.name.length > 0 && work.detail.length > 0);
    assert.ok(Number.isFinite(work.amount) && work.amount > 0);
  }
  assert.equal(DEMO_TOTAL, DEMO_WORKS.reduce((sum, work) => sum + work.amount, 0));
  assert.equal(DEMO_TOTAL, 1170);
});

test("스캔 데모는 같은 네 공종과 유효한 예시 범위를 사용한다", () => {
  assert.deepEqual(DEMO_SCAN_ITEMS.map(item => item.id), DEMO_WORKS.map(work => work.id));
  for (const item of DEMO_SCAN_ITEMS) {
    assert.ok(item.min > 0 && item.min < item.max);
    assert.ok(Number.isFinite(item.quoted) && item.quoted > 0);
  }
  assert.deepEqual(
    DEMO_SCAN_ITEMS.filter(item => item.quoted > item.max).map(item => item.id),
    ["demolition", "tile"],
  );
  assert.equal(DEMO_SCAN_ITEMS.filter(item => item.quoted >= item.min && item.quoted <= item.max).length, 2);
});

for (const mode of ["estimate", "scan"]) {
  test(`${mode}: 각 장면의 경계에서 다음 장면이 정확히 시작한다`, () => {
    let start = 0;
    const scenes = DEMO_SCENES[mode];
    const total = scenes.reduce((sum, scene) => sum + scene.duration, 0);
    for (const [index, scene] of scenes.entries()) {
      assert.deepEqual(getDemoScene(mode, start), {
        index, scene, elapsed: 0, progress: 0, cycleProgress: start / total,
      });
      const middle = getDemoScene(mode, start + scene.duration / 2);
      assert.equal(middle.index, index);
      assert.equal(middle.elapsed, scene.duration / 2);
      assert.equal(middle.progress, 0.5);
      const beforeEnd = getDemoScene(mode, start + scene.duration - 0.25);
      assert.equal(beforeEnd.index, index);
      assert.equal(beforeEnd.elapsed, scene.duration - 0.25);
      assert.ok(beforeEnd.progress < 1 && beforeEnd.progress > 0);
      start += scene.duration;
    }
  });

  test(`${mode}: 마지막 장면 다음에는 같은 주기로 처음부터 반복한다`, () => {
    const total = DEMO_SCENES[mode].reduce((sum, scene) => sum + scene.duration, 0);
    assert.deepEqual(getDemoScene(mode, total), getDemoScene(mode, 0));
    assert.deepEqual(getDemoScene(mode, total * 100), getDemoScene(mode, 0));
    for (const offset of [0.5, 701, 3800, total - 1]) {
      assert.deepEqual(getDemoScene(mode, total * 3 + offset), getDemoScene(mode, offset));
    }
  });

  test(`${mode}: 음수·무한대·NaN 입력은 첫 장면으로 안전하게 보정한다`, () => {
    const initial = getDemoScene(mode, 0);
    for (const invalid of [-1, -10000, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      assert.deepEqual(getDemoScene(mode, invalid), initial);
    }
    const huge = getDemoScene(mode, Number.MAX_VALUE);
    assert.ok(huge.index >= 0 && huge.index < DEMO_SCENES[mode].length);
    assert.ok(huge.progress >= 0 && huge.progress < 1);
    assert.ok(huge.cycleProgress >= 0 && huge.cycleProgress < 1);
  });
}

test("공종 선택은 700ms마다 하나씩 증가하고 네 개에서 멈춘다", () => {
  for (const [elapsed, expected] of [
    [0, 0], [699.99, 0], [700, 1], [1399.99, 1], [1400, 2],
    [2099.99, 2], [2100, 3], [2799.99, 3], [2800, 4],
    [4200, 4], [1000000, 4], [Number.MAX_VALUE, 4],
  ]) {
    assert.equal(getDemoSelectedCount(elapsed), expected);
  }
});

test("공종 선택 시계의 유효하지 않은 값은 선택 전 상태로 보정한다", () => {
  for (const invalid of [-1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
    assert.equal(getDemoSelectedCount(invalid), 0);
  }
});
