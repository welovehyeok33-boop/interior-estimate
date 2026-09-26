"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { IconArrowRight, IconCalendarEvent, IconCheck, IconCoin } from "@tabler/icons-react";
import { C, FlightPath } from "@/components/EstimateLayout";
import { CONSULT_SCHEDULES, formatConsultBudget, loadConsult, saveConsult } from "@/lib/consultStore";

const CONSULT_STEP_LABELS = ["지역·유형", "면적", "계획", "신청"] as const;
const BUDGET_MIN = 500;
const BUDGET_MAX = 10000;
const BUDGET_STEP = 500;

export default function ConsultStep3Page() {
  const router = useRouter();
  const [schedule, setSchedule] = useState("");
  const [budget, setBudget] = useState(3000);
  const [budgetUnknown, setBudgetUnknown] = useState(false);

  useEffect(() => {
    const saved = loadConsult();
    const amount = Number(saved.budget);
    // Restore local progress after hydration to avoid server/client markup differences.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSchedule(saved.schedule ?? "");
    setBudget(Number.isFinite(amount) && amount >= BUDGET_MIN ? Math.min(amount, BUDGET_MAX) : 3000);
    setBudgetUnknown(saved.budget === "unknown");
  }, []);
  const canNext = Boolean(schedule) && (budgetUnknown || budget >= BUDGET_MIN);
  const progress = ((budget - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100;

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <header style={{ background: C.headerFrom, padding: "13px 0" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ fontWeight: 800, fontSize: 17, color: C.primary, textDecoration: "none" }}>폼잇.</Link>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>무료 견적 신청 · 3단계</span>
        </div>
      </header>

      <main style={{ maxWidth: 560, margin: "0 auto", padding: "28px 20px 80px" }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 16px 12px", marginBottom: 24 }}>
          <FlightPath step={3} totalSteps={4} stepLabels={CONSULT_STEP_LABELS} />
        </div>

        <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 30 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <IconCalendarEvent size={19} color={C.primary} />
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.textDark }}>공사는 언제쯤 생각하고 계세요?</h1>
          </div>
          <p style={{ margin: "0 0 16px 27px", fontSize: 12, color: C.textLight }}>정확하지 않아도 괜찮아요.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 9 }}>
            {CONSULT_SCHEDULES.map(item => {
              const selected = schedule === item.id;
              return (
                <motion.button key={item.id} type="button" onClick={() => setSchedule(item.id)} whileTap={{ scale: 0.96 }} aria-pressed={selected}
                  style={{ position: "relative", minHeight: 86, padding: "14px 13px", borderRadius: 13, border: `${selected ? 2 : 1.5}px solid ${selected ? C.selectedBorder : C.border}`, background: selected ? C.selectedBg : C.card, color: C.textDark, textAlign: "left", cursor: "pointer" }}>
                  {selected && <span style={{ position: "absolute", top: 9, right: 9, width: 18, height: 18, borderRadius: "50%", background: C.primary, display: "flex", alignItems: "center", justifyContent: "center" }}><IconCheck size={11} stroke={3} /></span>}
                  <strong style={{ display: "block", paddingRight: 20, fontSize: 14, marginBottom: 5 }}>{item.label}</strong>
                  <span style={{ display: "block", fontSize: 11, lineHeight: 1.45, color: C.textLight, wordBreak: "keep-all" }}>{item.description}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} style={{ marginBottom: 30 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <IconCoin size={19} color={C.primary} />
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.textDark }}>희망 예산은 어느 정도인가요?</h2>
          </div>
          <p style={{ margin: "0 0 18px 27px", fontSize: 12, color: C.textLight }}>드래그해서 대략적인 범위를 알려주세요.</p>

          <div style={{ padding: "24px 18px 18px", borderRadius: 16, background: budgetUnknown ? C.card : C.selectedBg, border: `1.5px solid ${budgetUnknown ? C.border : C.selectedBorder}` }}>
            <motion.div key={budgetUnknown ? "unknown" : budget} initial={{ scale: 0.96, opacity: 0.6 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: "center", marginBottom: 18 }}>
              <span style={{ display: "inline-block", padding: "8px 15px", borderRadius: 22, background: C.headerFrom, color: C.primary, fontSize: 18, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>
                {formatConsultBudget(budgetUnknown ? "unknown" : String(budget))}
              </span>
            </motion.div>
            <div style={{ position: "relative", padding: "4px 0 0" }}>
              <div aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, top: 13, height: 8, borderRadius: 8, background: `linear-gradient(90deg, ${C.primary} 0%, ${C.primary} ${progress}%, ${C.border} ${progress}%, ${C.border} 100%)` }} />
              <input aria-label="희망 예산" type="range" min={BUDGET_MIN} max={BUDGET_MAX} step={BUDGET_STEP} value={budget} disabled={budgetUnknown}
                onInput={event => setBudget(Number(event.currentTarget.value))}
                style={{ position: "relative", zIndex: 1, width: "100%", height: 26, margin: 0, accentColor: C.primary, cursor: budgetUnknown ? "not-allowed" : "grab", opacity: budgetUnknown ? 0.35 : 1 }} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10, color: C.textLight }}><span>500만원</span><span>5,000만원</span><span>1억원+</span></div>
            </div>
          </div>

          <button type="button" onClick={() => setBudgetUnknown(value => !value)} aria-pressed={budgetUnknown}
            style={{ width: "100%", marginTop: 10, padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${budgetUnknown ? C.selectedBorder : C.border}`, background: budgetUnknown ? C.selectedBg : C.card, color: C.textMid, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            {budgetUnknown ? "✓ " : ""}아직 예산을 잘 모르겠어요
          </button>
        </motion.section>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <button type="button" onClick={() => router.back()} style={{ background: "none", border: 0, color: C.textLight, fontSize: 14, cursor: "pointer" }}>← 이전</button>
          <button type="button" disabled={!canNext} onClick={() => { saveConsult({ schedule, budget: budgetUnknown ? "unknown" : String(budget), selectedWorks: [] }); router.push("/consult/step4"); }}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 26px", borderRadius: 30, border: 0, background: canNext ? `linear-gradient(135deg, ${C.primaryLight}, ${C.primary})` : C.border, color: canNext ? C.textDark : C.textLight, fontSize: 15, fontWeight: 750, cursor: canNext ? "pointer" : "not-allowed" }}>
            다음 <IconArrowRight size={16} />
          </button>
        </div>
      </main>
    </div>
  );
}
