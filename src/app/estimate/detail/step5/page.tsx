"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import {
  IconArrowRight, IconCheck, IconMail, IconDownload,
  IconMapPin, IconRuler, IconTool, IconDiamond, IconChevronDown, IconChevronUp,
  IconRefresh,
} from "@tabler/icons-react";
import { loadEstimate, clearEstimate } from "@/lib/estimateStore";
import { FlightPath, C } from "@/components/EstimateLayout";
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

const REGION_LABEL: Record<string, string> = { seoul: "서울", metro: "수도권", local: "지방" };
const GRADE_LABEL: Record<string, string> = { economy: "실속형", standard: "스탠다드", premium: "하이앤드" };
const TYPE_LABEL: Record<string, string> = { residential: "주거", commercial: "상가" };

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
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = loadEstimate();
    setData(saved);
    setMounted(true);
  }, []);

  const result = calcEstimate(data);

  const handleSendEmail = async () => {
    if (!email.includes("@")) return;
    setSending(true);
    // TODO: Resend API 연동
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    setEmailSent(true);
  };

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
            <IconCheck size={13} strokeWidth={3} /> 견적이 완성됐어요
          </motion.div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.textDark, marginBottom: 6 }}>
            예상 공사 견적
          </div>
          <div style={{ fontSize: 13, color: C.textLight }}>
            선택하신 조건 기반 추정치 · 현장 확인 후 정확한 금액이 산출됩니다
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
                { icon: <IconMapPin size={11} />, text: REGION_LABEL[data.region ?? ""] || "지역" },
                { icon: <IconRuler size={11} />, text: `${data.area ?? "?"}평` },
                { icon: <IconDiamond size={11} />, text: GRADE_LABEL[data.materialGrade ?? ""] || "등급" },
                { icon: <IconTool size={11} />, text: `공종 ${result.breakdown.length}개` },
              ].map((chip, i) => (
                <div key={i} style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  background: "rgba(255,255,255,0.1)", borderRadius: 20,
                  padding: "4px 10px", fontSize: 11, color: "rgba(255,255,255,0.65)",
                  fontWeight: 600,
                }}>
                  {chip.icon} {chip.text}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

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
            📋 이 금액은 <strong>입력 조건 기반 추정치</strong>입니다. 정확한 금액은 현장 실측 후 확정되며,<br />
            ±10~15% 오차 범위가 발생할 수 있습니다.
          </div>
        </motion.div>

        {/* CTA — PDF 받기 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <button
            onClick={() => setShowEmailModal(true)}
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
            <IconDownload size={20} strokeWidth={2.2} />
            PDF 견적서 무료로 받기
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

      {/* 이메일 입력 모달 */}
      <AnimatePresence>
        {showEmailModal && (
          <>
            {/* 오버레이 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !emailSent && setShowEmailModal(false)}
              style={{
                position: "fixed", inset: 0,
                background: "rgba(0,0,0,0.55)",
                zIndex: 100,
              }}
            />

            {/* 모달 */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              style={{
                position: "fixed",
                bottom: 0, left: 0, right: 0,
                background: "#ffffff",
                borderRadius: "24px 24px 0 0",
                padding: "32px 24px 40px",
                zIndex: 101,
                maxWidth: 560, margin: "0 auto",
              }}
            >
              {/* 드래그 핸들 */}
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "#E0E0E0", margin: "0 auto 24px" }} />

              {emailSent ? (
                // 전송 완료
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ textAlign: "center", padding: "16px 0 8px" }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 16 }}
                    style={{
                      width: 64, height: 64, borderRadius: "50%",
                      background: "#F5C200",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 16px",
                    }}
                  >
                    <IconCheck size={30} color="#111" strokeWidth={3} />
                  </motion.div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.textDark, marginBottom: 8 }}>
                    견적서를 발송했어요!
                  </div>
                  <div style={{ fontSize: 14, color: C.textMid, lineHeight: 1.6, marginBottom: 24 }}>
                    <span style={{ color: C.primary, fontWeight: 700 }}>{email}</span> 으로<br />
                    PDF 견적서가 전송됩니다.<br />
                    <span style={{ fontSize: 12, color: C.textLight }}>스팸함도 확인해 주세요</span>
                  </div>
                  <button
                    onClick={() => setShowEmailModal(false)}
                    style={{
                      width: "100%", padding: "14px",
                      borderRadius: 14, border: "none",
                      background: "#111111", color: "#F5C200",
                      fontWeight: 700, fontSize: 15, cursor: "pointer",
                    }}
                  >
                    확인
                  </button>
                </motion.div>
              ) : (
                // 이메일 입력
                <>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: C.textDark, marginBottom: 6 }}>
                      어디로 보내드릴까요?
                    </div>
                    <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6 }}>
                      이메일로 상세 PDF 견적서를 무료로 보내드립니다.<br />
                      <span style={{ fontSize: 12, color: C.textLight }}>스팸 없이, 딱 견적서만 전송해요</span>
                    </div>
                  </div>

                  {/* 견적 요약 */}
                  <div style={{
                    padding: "12px 16px", borderRadius: 12,
                    background: C.selectedBg, border: `1.5px solid ${C.selectedBorder}`,
                    marginBottom: 20,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <div>
                      <div style={{ fontSize: 11, color: C.textLight, marginBottom: 2 }}>예상 견적 총액</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: C.textDark }}>
                        {result.totalMid.toLocaleString()}
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.textMid, marginLeft: 4 }}>만원</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: C.textLight, textAlign: "right" }}>
                      {result.breakdown.length}개 공종<br />
                      {GRADE_LABEL[data.materialGrade ?? ""]} 등급
                    </div>
                  </div>

                  {/* 이메일 입력 */}
                  <div style={{ position: "relative", marginBottom: 14 }}>
                    <IconMail size={18} color={C.textLight} style={{
                      position: "absolute", left: 14, top: "50%",
                      transform: "translateY(-50%)", pointerEvents: "none",
                    }} />
                    <input
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSendEmail()}
                      autoFocus
                      style={{
                        width: "100%", boxSizing: "border-box",
                        padding: "14px 14px 14px 44px",
                        borderRadius: 12,
                        border: `2px solid ${email.includes("@") ? C.selectedBorder : C.border}`,
                        fontSize: 15, color: C.textDark,
                        outline: "none",
                        background: "#fff",
                        transition: "border-color 0.15s",
                      }}
                    />
                  </div>

                  <button
                    onClick={handleSendEmail}
                    disabled={!email.includes("@") || sending}
                    style={{
                      width: "100%", padding: "14px",
                      borderRadius: 14, border: "none",
                      background: email.includes("@") ? `linear-gradient(135deg, #FFD740, #F5C200)` : C.border,
                      color: email.includes("@") ? "#111111" : C.textLight,
                      fontWeight: 800, fontSize: 15,
                      cursor: email.includes("@") ? "pointer" : "not-allowed",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      transition: "all 0.2s",
                    }}
                  >
                    {sending ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                        style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #111", borderTopColor: "transparent" }}
                      />
                    ) : (
                      <>
                        <IconMail size={18} strokeWidth={2.2} />
                        PDF 견적서 받기
                      </>
                    )}
                  </button>

                  <div style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: C.textLight }}>
                    광고 없음 · 스팸 없음 · 언제든 수신 거부 가능
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
