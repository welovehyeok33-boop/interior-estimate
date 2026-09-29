"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import {
  IconCheck,
  IconMapPin, IconRuler, IconTool, IconDiamond, IconChevronDown, IconChevronUp,
  IconRefresh,
} from "@tabler/icons-react";
import { loadEstimate, clearEstimate } from "@/lib/estimateStore";
import { formatEstimateRegion } from "@/lib/estimateRegion";
import { getSpaceDescription } from "@/lib/estimateSpace";
import { FlightPath, C } from "@/components/EstimateLayout";
import { validArea, validSpace } from "@/lib/intakeValidation";
import { hasCompletedCommonQuestions } from "@/lib/estimateQuestions";
import type { EstimateState } from "@/lib/estimateStore";

// ── 견적 계산 (엔진 연결 전 임시 로직) ─────────────────────
const REGION_MULTIPLIER: Record<string, number> = {
  seoul: 1.15,
  metro: 1.05,
  local: 0.95,
};

const GRADE_MULTIPLIER: Record<string, number> = {
  economy: 0.78,
  standard: 1.0,
  premium: 1.42,
};

// 공종별 평당 단가 (만원, standard 기준)
const WORK_UNIT_PRICE: Record<string, number> = {
  목공: 28, 경량: 22, 타일: 18, 도장: 12, 필름: 8,
  도배: 10, 바닥: 20, 금속: 16, 창호: 35, 가구: 45, 간판: 14,
  철거: 15, 설비: 25, 방수: 18, "전기/조명": 20, 냉난방: 30,
  소방: 22, 덕트: 28, 가스: 12, 단열: 14, 철물: 6, 그외: 10,
};

const GRADE_LABEL: Record<string, string> = { economy: "실속형", standard: "스탠다드", premium: "하이앤드" };


function calcEstimate(data: Partial<EstimateState>) {
  const area = data.area ?? 30;
  const regionMult = REGION_MULTIPLIER[data.region ?? "metro"];
  const gradeMult = GRADE_MULTIPLIER[data.materialGrade ?? "standard"];
  const works = data.selectedWorks ?? [];

  const breakdown = works.map(work => {
    const base = (WORK_UNIT_PRICE[work] ?? 15) * area * regionMult * gradeMult;
    const low = Math.round(base * 0.88 / 10) * 10;
    const high = Math.round(base * 1.12 / 10) * 10;
    return { work, low, high, mid: Math.round((low + high) / 2) };
  });

  const totalLow = breakdown.reduce((s, b) => s + b.low, 0);
  const totalHigh = breakdown.reduce((s, b) => s + b.high, 0);

  return { breakdown, totalLow, totalHigh, totalMid: Math.round((totalLow + totalHigh) / 2) };
}

// ── 숫자 카운트업 애니메이션 ──────────────────────────────
function CountUp({ to, duration = 1.4 }: { to: number; duration?: number }) {
  const count = useMotionValue(0);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const controls = animate(count, to, {
      duration,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      onUpdate: v => setDisplay(Math.round(v).toLocaleString("ko-KR")),
    });
    return controls.stop;
  }, [to]);

  return <span>{display}</span>;
}

export default function Step5Page() {
  const router = useRouter();
  const [data, setData] = useState<Partial<EstimateState>>({});
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = loadEstimate();
    if (!validSpace(saved)) { router.replace("/estimate/detail"); return; }
    if (!validArea(saved.area)) { router.replace("/estimate/detail/step2"); return; }
    if (!saved.commonAnswers || !hasCompletedCommonQuestions(saved.commonAnswers) || !saved.selectedWorks?.length) { router.replace("/estimate/detail/step3"); return; }
    if (!["economy", "standard", "premium"].includes(saved.materialGrade ?? "")) { router.replace("/estimate/detail/step4"); return; }
    setData(saved);
    setMounted(true);
  }, [router]);

  const result = calcEstimate(data);
  const spaceDescription = getSpaceDescription(data);

  if (!mounted) return null;

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>

      {/* 헤더 */}
      <div style={{ background: "#111111", padding: "13px 0" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ fontWeight: 800, fontSize: 17, color: "#F5C200", textDecoration: "none" }}>
            폼잇.
          </Link>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>세부 견적 · 결과</span>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "28px 20px 80px" }}>

        {/* 진행 경로 — 완료 */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 16px 12px", marginBottom: 24 }}>
          <FlightPath step={5} totalSteps={5} />
        </div>

        {/* 완료 뱃지 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: 24 }}
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.1 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#111111", color: "#F5C200",
              padding: "7px 18px", borderRadius: 30,
              fontSize: 12, fontWeight: 700, letterSpacing: "0.05em",
              marginBottom: 14,
            }}
          >
            <IconCheck size={13} strokeWidth={3} /> 견적 미리보기 · 개발 중
          </motion.div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.textDark, marginBottom: 6 }}>
            공사비 계산 예시
          </div>
          <div style={{ fontSize: 13, color: C.textLight }}>
            임시 단가로 계산한 시연입니다. 실제 견적으로 사용할 수 없어요.
          </div>
        </motion.div>

        {/* 총 금액 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{
            background: "linear-gradient(135deg, #111111 0%, #1A1A1A 100%)",
            borderRadius: 20, padding: "28px 24px",
            marginBottom: 16,
            position: "relative", overflow: "hidden",
          }}
        >
          {/* 배경 장식 */}
          <div style={{
            position: "absolute", top: -30, right: -30,
            width: 160, height: 160, borderRadius: "50%",
            background: "rgba(245,194,0,0.08)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: -20, left: -20,
            width: 100, height: 100, borderRadius: "50%",
            background: "rgba(245,194,0,0.05)",
            pointerEvents: "none",
          }} />

          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 600, marginBottom: 10, letterSpacing: "0.06em" }}>
              ESTIMATED TOTAL
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 38, fontWeight: 900, color: "#F5C200", letterSpacing: "-0.02em" }}>
                <CountUp to={result.totalMid} />
              </span>
              <span style={{ fontSize: 18, fontWeight: 700, color: "rgba(245,194,0,0.7)" }}>만원</span>
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>
              범위: {result.totalLow.toLocaleString("ko-KR")} ~ {result.totalHigh.toLocaleString("ko-KR")} 만원
            </div>

            {/* 선택 요약 칩들 */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {[
                { icon: <IconMapPin size={11} />, text: formatEstimateRegion(data.region, data.regionDetail) },
                { icon: <IconRuler size={11} />, text: `${data.area ?? "?"}평` },
                { icon: <IconDiamond size={11} />, text: GRADE_LABEL[data.materialGrade ?? ""] || "등급" },
                { icon: <IconTool size={11} />, text: `공종 ${result.breakdown.length}개` },
              ].map((chip, i) => (
                <div key={i} style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  background: "rgba(255,255,255,0.1)", borderRadius: 20,
                  padding: "4px 10px", fontSize: 11, color: "rgba(255,255,255,0.65)",
                  fontWeight: 600, maxWidth: "100%", boxSizing: "border-box", minWidth: 0,
                }}>
                  {chip.icon} <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>{chip.text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {spaceDescription && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.textMid, marginBottom: 6 }}>입력하신 공간 설명</div>
            <div style={{ fontSize: 13, color: C.textDark, lineHeight: 1.6, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{spaceDescription}</div>
          </div>
        )}

        {/* 공종별 내역 토글 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 14, marginBottom: 16, overflow: "hidden",
          }}
        >
          <button
            onClick={() => setShowBreakdown(v => !v)}
            style={{
              width: "100%", padding: "16px 18px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: "none", border: "none", cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: C.textDark }}>
              공종별 세부 내역
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, color: C.textLight }}>{result.breakdown.length}개 공종</span>
              {showBreakdown
                ? <IconChevronUp size={16} color={C.textLight} />
                : <IconChevronDown size={16} color={C.textLight} />
              }
            </div>
          </button>

          <AnimatePresence>
            {showBreakdown && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                style={{ overflow: "hidden" }}
              >
                <div style={{ borderTop: `1px solid ${C.border}` }}>
                  {result.breakdown.map((item, i) => (
                    <motion.div
                      key={item.work}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "12px 18px",
                        borderBottom: i < result.breakdown.length - 1 ? `1px solid ${C.border}` : "none",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.textDark }}>{item.work}</div>
                        <div style={{ fontSize: 11, color: C.textLight, marginTop: 1 }}>
                          {item.low.toLocaleString()} ~ {item.high.toLocaleString()} 만원
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.textDark }}>
                          {item.mid.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 10, color: C.textLight }}>만원</div>
                      </div>
                    </motion.div>
                  ))}

                  {/* 합계 행 */}
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "14px 18px",
                    background: C.selectedBg, borderTop: `1.5px solid ${C.selectedBorder}`,
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: C.textDark }}>합계 (추정)</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: C.textDark }}>
                      {result.totalMid.toLocaleString()}
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.textMid, marginLeft: 3 }}>만원</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 안내 카드 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            padding: "14px 16px", borderRadius: 12,
            background: "#FFF8E8", border: `1.5px solid #F5C200`,
            marginBottom: 24,
          }}
        >
          <div style={{ fontSize: 13, color: "#7A5F00", lineHeight: 1.7 }}>
            📋 이 금액은 <strong>개발 중인 계산 예시</strong>로 실제 견적이 아닙니다.<br />
            실제 공사비는 상담과 현장 확인이 필요하며, PDF·이메일 발송은 준비 중입니다.
          </div>
        </motion.div>

        {/* CTA — PDF 받기 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <button
            onClick={() => router.push("/consult")}
            style={{
              width: "100%", padding: "16px",
              borderRadius: 16, border: "none",
              background: `linear-gradient(135deg, #FFD740, #F5C200)`,
              color: "#111111",
              fontWeight: 800, fontSize: 16,
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              marginBottom: 12,
            }}
          >

            무료 견적 상담 신청하기
          </button>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => router.back()}
              style={{
                flex: 1, padding: "12px",
                borderRadius: 12, border: `1.5px solid ${C.border}`,
                background: C.card, color: C.textMid,
                fontWeight: 600, fontSize: 14, cursor: "pointer",
              }}
            >
              ← 수정
            </button>
            <button
              onClick={() => { clearEstimate(); router.push("/"); }}
              style={{
                flex: 1, padding: "12px",
                borderRadius: 12, border: `1.5px solid ${C.border}`,
                background: C.card, color: C.textMid,
                fontWeight: 600, fontSize: 14, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              <IconRefresh size={14} /> 처음부터
            </button>
          </div>
        </motion.div>

      </div>

    </div>
  );
}
