"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { IconPhone, IconUser, IconCheck } from "@tabler/icons-react";
import { loadConsult, clearConsult, formatConsultBudget, formatConsultSchedule, type ConsultState } from "@/lib/consultStore";
import { CONSENT_VERSION, INDUSTRY_LABELS, consultStage, validPhone } from "@/lib/intakeValidation";
import { C, FlightPath } from "@/components/EstimateLayout";
import { formatEstimateRegion } from "@/lib/estimateRegion";

const CONSULT_STEP_LABELS = ["지역·유형", "면적", "계획", "신청"] as const;
const TYPE_LABEL: Record<string, string> = { residential: "주거", commercial: "상가" };

export default function ConsultStep4() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const submissionId = useRef<string>("");
  const submitting = useRef(false);
  const [summary, setSummary] = useState<Partial<ConsultState>>({});

  useEffect(() => {
    // localStorage is restored after hydration so the server and initial client markup match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    const saved = loadConsult();
    const missing = consultStage(saved);
    if (missing) { router.replace(missing); return; }
    submissionId.current = crypto.randomUUID();
    setSummary(saved);
  }, [router]);

  const phoneClean = phone.replace(/[^0-9]/g, "");
  const canNext = name.trim().length >= 2 && name.trim().length <= 50 && validPhone(phone) && agreed;

  const handleSubmit = async () => {
    if (!canNext || submitting.current) return;
    submitting.current = true;
    setSending(true);
    setSubmitError("");
    try {
      const response = await fetch("/api/consultations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...loadConsult(), name: name.trim(), phone: phoneClean, agreed, consentVersion: CONSENT_VERSION, submissionId: submissionId.current }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      clearConsult();
      setDone(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "신청을 저장하지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      submitting.current = false;
      setSending(false);
    }
  };

  if (done) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: "center", maxWidth: 360 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 16, delay: 0.1 }}
            style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "#F5C200",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <IconCheck size={36} color="#111" strokeWidth={3} />
          </motion.div>
          <div style={{ fontSize: 24, fontWeight: 900, color: C.textDark, marginBottom: 12, letterSpacing: "-0.5px" }}>
            상담 신청 완료!
          </div>
          <div style={{ fontSize: 15, color: C.textMid, lineHeight: 1.7, marginBottom: 8 }}>
            <span style={{ color: "#F5C200", fontWeight: 700 }}>{name}</span>님, 감사합니다.
          </div>
          <div style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, marginBottom: 36 }}>
            접수 내용을 확인한 뒤 담당자가<br />
            <span style={{ fontWeight: 700, color: C.textMid }}>{phone}</span>으로 직접 연락드릴게요.
          </div>
          <Link href="/" style={{
            display: "block", padding: "14px",
            borderRadius: 14, background: "#111",
            color: "#F5C200", fontWeight: 700, fontSize: 15,
            textDecoration: "none",
          }}>
            홈으로 돌아가기
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <div style={{ background: "#111111", padding: "13px 0" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ fontWeight: 900, fontSize: 17, color: "#F5C200", textDecoration: "none" }}>폼잇.</Link>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>무료 상담 · 마지막 단계</span>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 20px 80px" }}>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 16px 12px", marginBottom: 24 }}>
          <FlightPath step={4} totalSteps={4} stepLabels={CONSULT_STEP_LABELS} />
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ padding: "16px 17px", borderRadius: 14, background: C.selectedBg, border: `1.5px solid ${C.selectedBorder}`, marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 10 }}>
              <strong style={{ fontSize: 13, color: C.textDark }}>신청 내용 요약</strong>
              <button type="button" onClick={() => router.push("/consult")} style={{ border: 0, background: "none", color: C.textMid, fontSize: 12, textDecoration: "underline", cursor: "pointer" }}>수정하기</button>
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.75, color: C.textMid, overflowWrap: "anywhere" }}>
              <div>{formatEstimateRegion(summary.region, summary.regionDetail)} · {TYPE_LABEL[summary.buildingType ?? ""] || "공간 미정"} · {summary.area ? `${summary.area}평` : "면적 미정"}</div>
              {summary.buildingType === "commercial" && <div>{INDUSTRY_LABELS[summary.commercialType ?? ""]} {summary.commercialSub}</div>}
              {summary.spaceDescription && <div>공간 설명: {summary.spaceDescription}</div>}
              <div>{formatConsultSchedule(summary.schedule)} · 희망 예산 {formatConsultBudget(summary.budget)}</div>
            </div>
          </div>

          <div style={{ fontSize: 22, fontWeight: 900, color: C.textDark, marginBottom: 6, letterSpacing: "-0.5px" }}>
            거의 다 됐어요!
          </div>
          <div style={{ fontSize: 13, color: C.textLight, marginBottom: 32 }}>연락받으실 정보를 입력해주세요</div>

          {/* 이름 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 8 }}>이름</div>
            <div style={{ position: "relative" }}>
              <IconUser size={18} color={C.textLight} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input
                id="applicant-name"
                aria-label="이름"
                autoComplete="name"
                maxLength={50}
                type="text"
                placeholder="홍길동"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "14px 14px 14px 44px",
                  borderRadius: 12,
                  border: `1.5px solid ${name ? C.selectedBorder : C.border}`,
                  fontSize: 15, color: C.textDark, outline: "none",
                  background: name ? C.selectedBg : C.card,
                  transition: "all 0.15s",
                }}
              />
            </div>
          </div>

          {/* 전화번호 */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 8 }}>전화번호</div>
            <div style={{ position: "relative" }}>
              <IconPhone size={18} color={C.textLight} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input
                id="applicant-phone"
                aria-label="전화번호"
                autoComplete="tel"
                maxLength={20}
                aria-invalid={phone.length > 0 && !validPhone(phone)}
                type="tel"
                placeholder="010-0000-0000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "14px 14px 14px 44px",
                  borderRadius: 12,
                  border: `1.5px solid ${validPhone(phone) ? C.selectedBorder : C.border}`,
                  fontSize: 15, color: C.textDark, outline: "none",
                  background: validPhone(phone) ? C.selectedBg : C.card,
                  transition: "all 0.15s",
                }}
              />
            </div>
          </div>

          {phone && !validPhone(phone) && <p role="status" style={{ color: C.textMid, fontSize: 12 }}>연락 가능한 전화번호를 입력해주세요. 예: 010-1234-5678</p>}
          <label style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderRadius: 12, border: `1.5px solid ${agreed ? C.selectedBorder : C.border}`, background: agreed ? C.selectedBg : C.card, cursor: "pointer", marginBottom: 12 }}>
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ width: 20, height: 20, flexShrink: 0, accentColor: C.primary }} />
            <span style={{ fontSize: 12, color: C.textMid, lineHeight: 1.7 }}>
              <strong style={{ color: C.textDark }}>[필수] 개인정보 수집·이용에 동의합니다</strong><br />
              수집 항목: 이름, 전화번호, 지역·공간·면적·공사 계획 및 작성 내용<br />
              이용 목적: 견적 상담 접수와 연락<br />
              보유 기간: 접수일로부터 최대 90일 보관 후 삭제<br />
              동의를 거부할 수 있으나 상담 신청은 어렵습니다.
            </span>
          </label>
          <p style={{ fontSize: 12, marginBottom: 24 }}><Link href="/privacy" target="_blank" style={{ color: C.textMid }}>개인정보 처리 안내 보기</Link></p>
          {submitError && <p role="alert" style={{ color: C.textDark, fontSize: 13, margin: "0 0 14px" }}>{submitError} 입력 내용은 유지됩니다.</p>}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => router.back()} style={{
              padding: "14px 20px", borderRadius: 30,
              border: `1.5px solid ${C.border}`, background: C.card,
              color: C.textMid, fontWeight: 600, fontSize: 14, cursor: "pointer",
            }}>
              ← 이전
            </button>
            <button
              disabled={!canNext || sending}
              onClick={handleSubmit}
              style={{
                flex: 1, padding: "14px",
                borderRadius: 30, border: "none",
                background: canNext ? `linear-gradient(135deg, #FFD740, #F5C200)` : C.border,
                color: canNext ? "#111" : C.textLight,
                fontWeight: 700, fontSize: 15,
                cursor: canNext ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {sending ? "전송 중..." : "상담 신청 완료 →"}
            </button>
          </div>

          <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: C.textLight }}>
            입력하신 정보는 상담 신청 접수에 사용됩니다
          </div>
        </motion.div>
      </div>
    </div>
  );
}
