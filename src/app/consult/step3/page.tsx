"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { IconArrowRight, IconCheck } from "@tabler/icons-react";
import { saveConsult } from "@/lib/consultStore";
import { C } from "@/components/EstimateLayout";

const EXPERIENCES = [
  { id: "yes", label: "있어요", desc: "경험자는 더 디테일한 상담이 가능해요 😊" },
  { id: "no",  label: "없어요", desc: "처음이어도 괜찮아요. 처음부터 도와드릴게요" },
];

const SCHEDULES = [
  { id: "1month",    label: "1개월 이내" },
  { id: "3months",   label: "3개월 이내" },
  { id: "6months",   label: "6개월 이내" },
  { id: "undecided", label: "아직 미정" },
];

const SCOPES = [
  { id: "full",    label: "전체 공사", desc: "처음부터 끝까지 전부" },
  { id: "partial", label: "부분 공사", desc: "일부 공간 또는 특정 공종만" },
];

const BUDGETS = [
  { id: "~1000",    label: "1천만원 미만" },
  { id: "1000~3000", label: "1천 ~ 3천만원" },
  { id: "3000~5000", label: "3천 ~ 5천만원" },
  { id: "5000+",    label: "5천만원 이상" },
  { id: "unknown",  label: "아직 모르겠어요" },
];

function SelectCard({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      animate={{ scale: selected ? 1.02 : 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
      style={{
        padding: "14px 16px", borderRadius: 12, textAlign: "left",
        border: `${selected ? "2px" : "1.5px"} solid ${selected ? C.selectedBorder : C.border}`,
        background: selected ? C.selectedBg : C.card,
        cursor: "pointer", width: "100%",
        boxShadow: selected ? `0 4px 16px rgba(245,194,0,0.2)` : "none",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}
    >
      {children}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            style={{ width: 20, height: 20, borderRadius: "50%", background: C.selectedBorder, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 10 }}>
            <IconCheck size={10} color="#111" strokeWidth={3.5} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export default function ConsultStep3() {
  const router = useRouter();
  const [experience, setExperience] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<string | null>(null);
  const [workScope, setWorkScope] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  const [memo, setMemo] = useState("");

  const canNext = !!experience && !!schedule && !!workScope && !!budget;

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <div style={{ background: "#111111", padding: "13px 0" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/landing" style={{ fontWeight: 900, fontSize: 17, color: "#F5C200", textDecoration: "none" }}>폼잇.</Link>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>무료 상담 · 3단계</span>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 20px 80px" }}>

        {/* 진행바 */}
        <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= 3 ? "#F5C200" : C.border }} />
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.textDark, marginBottom: 6, letterSpacing: "-0.5px" }}>
            공사 계획을 알려주세요
          </div>
          <div style={{ fontSize: 13, color: C.textLight, marginBottom: 32 }}>더 정확한 상담을 위해 필요해요</div>

          {/* 인테리어 경험 */}
          <Section label="이전에 인테리어 공사 경험이 있으신가요?">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {EXPERIENCES.map(e => (
                <SelectCard key={e.id} selected={experience === e.id} onClick={() => setExperience(e.id)}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: experience === e.id ? C.textDark : C.textMid, marginBottom: 3 }}>{e.label}</div>
                    <div style={{ fontSize: 12, color: C.textLight }}>{e.desc}</div>
                  </div>
                </SelectCard>
              ))}
            </div>
          </Section>

          {/* 공사 예정 시기 */}
          <Section label="공사 예정 시기가 언제예요?">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
              {SCHEDULES.map(s => (
                <SelectCard key={s.id} selected={schedule === s.id} onClick={() => setSchedule(s.id)}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: schedule === s.id ? C.textDark : C.textMid }}>{s.label}</span>
                </SelectCard>
              ))}
            </div>
          </Section>

          {/* 공사 종류 */}
          <Section label="어떤 공사를 원하시나요?">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SCOPES.map(s => (
                <SelectCard key={s.id} selected={workScope === s.id} onClick={() => setWorkScope(s.id)}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: workScope === s.id ? C.textDark : C.textMid, marginBottom: 3 }}>{s.label}</div>
                    <div style={{ fontSize: 12, color: C.textLight }}>{s.desc}</div>
                  </div>
                </SelectCard>
              ))}
            </div>
          </Section>

          {/* 희망 예산 */}
          <Section label="희망 예산 범위가 어떻게 되세요?">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {BUDGETS.map(b => (
                <SelectCard key={b.id} selected={budget === b.id} onClick={() => setBudget(b.id)}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: budget === b.id ? C.textDark : C.textMid }}>{b.label}</span>
                </SelectCard>
              ))}
            </div>
          </Section>

          {/* 자유 서술 */}
          <Section label="추가로 전하고 싶은 말이 있나요? (선택)">
            <textarea
              placeholder="원하는 스타일, 특별히 신경 써주셨으면 하는 부분, 궁금한 점 등 자유롭게 적어주세요"
              value={memo}
              onChange={e => setMemo(e.target.value)}
              rows={4}
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "14px 16px", borderRadius: 12,
                border: `1.5px solid ${C.border}`,
                fontSize: 14, color: C.textDark,
                outline: "none", resize: "none",
                lineHeight: 1.6, background: C.card,
                fontFamily: "inherit",
              }}
            />
          </Section>

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={() => router.back()} style={{
              padding: "14px 20px", borderRadius: 30,
              border: `1.5px solid ${C.border}`, background: C.card,
              color: C.textMid, fontWeight: 600, fontSize: 14, cursor: "pointer",
            }}>
              ← 이전
            </button>
            <button
              disabled={!canNext}
              onClick={() => {
                saveConsult({ experience: experience ?? undefined, schedule: schedule ?? undefined, workScope: workScope ?? undefined, budget: budget ?? undefined, memo: memo || undefined });
                router.push("/consult/step4");
              }}
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
              다음 <IconArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.textDark, marginBottom: 12 }}>{label}</div>
      {children}
    </div>
  );
}
