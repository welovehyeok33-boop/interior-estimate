import assert from "node:assert/strict";
import { test } from "node:test";
import { formatConsultBudget, formatConsultSchedule } from "../src/lib/consultStore.ts";

test("유입용 공사 예정 시기를 소비자 문구로 표시한다", () => {
  assert.equal(formatConsultSchedule("1month"), "1개월 이내");
  assert.equal(formatConsultSchedule("undecided"), "아직 미정");
  assert.equal(formatConsultSchedule(undefined), "미정");
});

test("희망 예산 숫자와 미정 선택을 요약 문구로 표시한다", () => {
  assert.equal(formatConsultBudget("3000"), "3,000만원");
  assert.equal(formatConsultBudget("10000"), "1억원 이상");
  assert.equal(formatConsultBudget("unknown"), "아직 모르겠어요");
});
