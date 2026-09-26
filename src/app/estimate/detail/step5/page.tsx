"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconArrowRight, IconRefresh } from "@tabler/icons-react";
import { clearEstimate, useEstimateDraft } from "@/lib/estimateStore";
import { loadConsult, saveConsult } from "@/lib/consultStore";
import { FlightPath, C } from "@/components/EstimateLayout";

const REGION_MULTIPLIER: Record<string, number> = { seoul: 1.15, metro: 1.05, local: 0.95 };
const GRADE_MULTIPLIER: Record<string, number> = { economy: 0.78, standard: 1, premium: 1.42 };
// Prototype prices only. Replace these with the validated engine in phase 2.
const WORK_UNIT_PRICE: Record<string, number> = {
  목공: 28, 경량: 22, 타일: 18, 도장: 12, 필름: 8, 도배: 10, 바닥: 20,
  금속: 16, 창호: 35, 가구: 45, 간판: 14, 철거: 15, 설비: 25, 방수: 18,
  "전기/조명": 20, 냉난방: 30, 소방: 22, 덕트: 28, 가스: 12, 단열: 14, 철물: 6, 그외: 10,
};
const REGION_LABEL: Record<string, string> = { seoul: "서울", metro: "경기·인천", local: "그 외 지역" };
const GRADE_LABEL: Record<string, string> = { economy: "실속형", standard: "스탠다드", premium: "하이앤드" };

export default function Step5Page() {
  const data = useEstimateDraft();
  const router = useRouter();
  const [restart, setRestart] = useState(false);
  const breakdown = (data.selectedWorks ?? []).map(work => {
    const base = (WORK_UNIT_PRICE[work] ?? 15) * (data.area ?? 0)
      * (REGION_MULTIPLIER[data.region ?? ""] ?? 1) * (GRADE_MULTIPLIER[data.materialGrade ?? ""] ?? 1);
    const low = Math.round(base * 0.88 / 10) * 10;
    const high = Math.round(base * 1.12 / 10) * 10;
    return { work, mid: Math.round((low + high) / 2) };
  });
  const total = breakdown.reduce((sum, item) => sum + item.mid, 0);
  return <div style={{ minHeight: "100vh", background: C.bg, color: C.textDark }}>
    <header style={{ background: C.headerFrom, padding: "16px 20px" }}>
      <div style={{ maxWidth: 560, margin: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ color: C.primary, textDecoration: "none", fontWeight: 900, fontSize: 20 }}>폼잇.</Link>
        <span style={{ fontSize: 13, color: C.card }}>예상 비용 · 결과</span>
      </div>
    </header>
    <main style={{ maxWidth: 560, margin: "auto", padding: "28px 20px 60px", boxSizing: "border-box" }}>
      <FlightPath step={5} totalSteps={5} />
      <h1 style={{ fontSize: 25, marginTop: 24 }}>입력 조건으로 계산한 참고 금액</h1>
      <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.8 }}>
        시험 운영 중인 간편 계산 결과예요. 실제 시공 견적이나 계약 금액이 아니며,
        공사 범위·자재 수량·현장 조건에 따라 크게 달라질 수 있어요.
      </p>
      <section aria-label="계산 결과" style={{ background: C.headerFrom, color: C.card, borderRadius: 20, padding: 24, margin: "24px 0" }}>
        <p style={{ marginTop: 0, fontSize: 13 }}>참고용 예상 비용</p>
        <strong style={{ display: "block", fontSize: "clamp(26px, 7vw, 38px)", color: C.primary, overflowWrap: "anywhere" }}>{total.toLocaleString("ko-KR")}만원</strong>
        <p style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 0 }}>
          {REGION_LABEL[data.region ?? ""]} · {data.area}평 · {GRADE_LABEL[data.materialGrade ?? ""]} · {breakdown.length}개 공사
        </p>
      </section>
      <details style={{ border: `1px solid ${C.border}`, borderRadius: 14, background: C.card, padding: 18 }}>
        <summary style={{ fontWeight: 700, cursor: "pointer", minHeight: 28 }}>공사별 참고 금액 보기</summary>
        <dl style={{ marginBottom: 0 }}>{breakdown.map(item => <div key={item.work} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "12px 0", borderTop: `1px solid ${C.border}`, fontSize: 14 }}>
          <dt>{item.work}</dt><dd style={{ margin: 0 }}>{item.mid.toLocaleString("ko-KR")}만원</dd>
        </div>)}</dl>
      </details>
      <section style={{ margin: "28px 0", padding: 20, background: C.selectedBg, border: `1px solid ${C.primary}`, borderRadius: 16 }}>
        <h2 style={{ fontSize: 19, margin: "0 0 10px" }}>내 공간에 맞는 견적이 필요하세요?</h2>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: C.textMid }}>무료 상담으로 공사 범위와 실제 조건을 확인해주세요. 상세 PDF 발송은 아직 준비 중이에요.</p>
        <Link href="/consult" onClick={() => saveConsult({
          region: data.region, buildingType: data.buildingType, area: data.area,
          memo: loadConsult().memo || `계산에서 선택한 공사: ${(data.selectedWorks ?? []).join(", ")}. 자재: ${GRADE_LABEL[data.materialGrade ?? ""] ?? "미정"}`,
        })} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 52, background: C.primary, borderRadius: 12, color: C.textDark, textDecoration: "none", fontWeight: 800 }}>
          무료 견적 상담 신청하기 <IconArrowRight size={18} />
        </Link>
      </section>
      <div style={{ display: "flex", gap: 12 }}>
        <Link href="/estimate/detail" style={{ flex: 1, color: C.textMid, padding: "14px 0", textAlign: "center" }}>입력 조건 수정</Link>
        <button type="button" onClick={() => setRestart(true)} style={{ flex: 1, padding: 14, border: `1px solid ${C.border}`, borderRadius: 12, background: C.card, color: C.textMid, cursor: "pointer", font: "inherit" }}><IconRefresh size={15} /> 새로 계산</button>
      </div>
      {restart && <div role="group" aria-label="새로 계산 확인" style={{ padding: 16, marginTop: 12, border: `1px solid ${C.border}`, borderRadius: 12, background: C.card }}>
        <p>기존 계산 조건을 지우고 다시 시작할까요?</p>
        <button type="button" onClick={() => { clearEstimate(); router.push("/estimate/detail"); }} style={{ padding: 12, background: C.primary, border: 0, borderRadius: 8, cursor: "pointer" }}>새로 시작</button>
        <button type="button" onClick={() => setRestart(false)} style={{ padding: 12, marginLeft: 8, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, cursor: "pointer" }}>취소</button>
      </div>}
    </main>
  </div>;
}
