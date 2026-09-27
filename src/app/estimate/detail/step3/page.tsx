"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { IconArrowRight, IconCheck, IconChevronDown, IconSparkles } from "@tabler/icons-react";
import { C, FlightPath } from "@/components/EstimateLayout";
import { CommonQuestionAnswers, EMPTY_COMMON_ANSWERS, ExtraWork, WorkArea, deriveSelectedWorks, hasCompletedCommonQuestions } from "@/lib/estimateQuestions";
import { loadEstimate, saveEstimate } from "@/lib/estimateStore";

type Option<T extends string> = { value: T; label: string; desc?: string };

const STATUS_OPTIONS = [
  { value: "vacant", label: "현재 비어 있어요", desc: "공실 상태" }, { value: "in_use", label: "사용 중이에요", desc: "영업·거주 중" },
  { value: "pre_contract", label: "계약 전이에요", desc: "현장 확인 전" }, { value: "unknown", label: "잘 모르겠어요" },
] as const;
const DEMOLITION_OPTIONS = [
  { value: "full", label: "전체 철거가 필요해요" }, { value: "partial", label: "일부만 철거할게요" },
  { value: "none", label: "철거 없이 진행해요" }, { value: "unknown", label: "잘 모르겠어요" },
] as const;
const AREA_OPTIONS: Option<WorkArea>[] = [
  { value: "whole", label: "전체 공간" }, { value: "ceiling", label: "천장" }, { value: "walls", label: "벽" },
  { value: "floor", label: "바닥" }, { value: "unknown", label: "잘 모르겠어요" },
];
const CEILING_OPTIONS = [
  { value: "keep", label: "기존 천장을 유지할게요" }, { value: "refinish", label: "마감만 새로 할게요" },
  { value: "new", label: "천장을 새로 만들게요" }, { value: "exposed", label: "노출 천장으로 할게요" }, { value: "unknown", label: "잘 모르겠어요" },
] as const;
const WALL_OPTIONS = [
  { value: "keep", label: "기존 벽을 유지할게요" }, { value: "remove", label: "일부 벽을 철거할게요" },
  { value: "new", label: "새 벽을 만들게요" }, { value: "both", label: "철거와 신설 모두 필요해요" }, { value: "unknown", label: "잘 모르겠어요" },
] as const;
const WALL_FINISH_OPTIONS = [
  { value: "paint", label: "페인트" }, { value: "wallpaper", label: "도배" }, { value: "film", label: "인테리어 필름" },
  { value: "tile", label: "타일·패널" }, { value: "unknown", label: "잘 모르겠어요" },
] as const;
const FLOOR_OPTIONS = [
  { value: "keep", label: "기존 바닥을 유지할게요" }, { value: "overlay", label: "기존 바닥 위에 시공할게요" },
  { value: "replace", label: "철거 후 새로 시공할게요" }, { value: "unknown", label: "잘 모르겠어요" },
] as const;
const EXTRA_OPTIONS: Option<ExtraWork>[] = [
  { value: "electric", label: "전기·조명" }, { value: "hvac", label: "냉난방" }, { value: "windows", label: "창호·문" },
  { value: "furniture", label: "제작 가구" }, { value: "sign", label: "간판" }, { value: "unknown", label: "잘 모르겠어요" },
];

function QuestionCard({ number, title, hint, children }: { number: string; title: string; hint?: string; children: React.ReactNode }) {
  return <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: "20px 18px", marginBottom: 12 }}>
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}><span style={{ flexShrink: 0, minWidth: 28, height: 28, padding: "0 7px", borderRadius: 14, background: C.selectedBg, border: `1px solid ${C.gold}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: C.textDark }}>{number}</span><div><h2 style={{ margin: 0, fontSize: 17, lineHeight: 1.45, color: C.textDark, letterSpacing: "-0.03em" }}>{title}</h2>{hint && <p style={{ margin: "4px 0 0", fontSize: 12, lineHeight: 1.5, color: C.textLight }}>{hint}</p>}</div></div>{children}
  </motion.section>;
}

function SingleChoice<T extends string>({ options, value, onChange }: { options: readonly Option<T>[]; value?: T; onChange: (value: T) => void }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>{options.map(option => { const selected = value === option.value; return <motion.button key={option.value} type="button" whileTap={{ scale: 0.97 }} onClick={() => onChange(option.value)} style={{ minHeight: 54, padding: "11px 12px", borderRadius: 12, border: selected ? `2px solid ${C.selectedBorder}` : `1px solid ${C.border}`, background: selected ? C.selectedBg : C.card, textAlign: "left", cursor: "pointer", color: C.textDark }}><span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, fontSize: 13, fontWeight: selected ? 750 : 600 }}><span>{option.label}</span>{selected && <IconCheck size={16} stroke={3} />}</span>{option.desc && <span style={{ display: "block", marginTop: 3, fontSize: 11, color: C.textLight }}>{option.desc}</span>}</motion.button>; })}</div>;
}

function MultiChoice<T extends string>({ options, values, onChange }: { options: readonly Option<T>[]; values: T[]; onChange: (values: T[]) => void }) {
  const toggle = (next: T) => {
    if (next === "whole" || next === "unknown") return onChange(values.includes(next) ? [] : [next]);
    const remaining = values.filter(value => value !== "whole" && value !== "unknown");
    onChange(remaining.includes(next) ? remaining.filter(value => value !== next) : [...remaining, next]);
  };
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{options.map(option => { const selected = values.includes(option.value); return <motion.button key={option.value} type="button" whileTap={{ scale: 0.95 }} onClick={() => toggle(option.value)} style={{ padding: "11px 14px", borderRadius: 24, border: selected ? `2px solid ${C.selectedBorder}` : `1px solid ${C.border}`, background: selected ? C.selectedBg : C.card, color: C.textDark, fontSize: 13, fontWeight: selected ? 750 : 550, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>{selected && <IconCheck size={14} stroke={3} />}{option.label}</motion.button>; })}</div>;
}

export default function Step3Page() {
  const router = useRouter();
  const [answers, setAnswers] = useState<CommonQuestionAnswers>(EMPTY_COMMON_ANSWERS);
  const [showExtras, setShowExtras] = useState(false);
  useEffect(() => { const saved = loadEstimate().commonAnswers; if (saved) { // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnswers({ ...EMPTY_COMMON_ANSWERS, ...saved }); } }, []);
  const update = <K extends keyof CommonQuestionAnswers>(key: K, value: CommonQuestionAnswers[K]) => setAnswers(previous => ({ ...previous, [key]: value }));
  const includes = (area: WorkArea) => answers.workAreas.includes("whole") || answers.workAreas.includes(area);
  const canNext = hasCompletedCommonQuestions(answers);
  const selectedWorks = useMemo(() => deriveSelectedWorks(answers), [answers]);

  return <div style={{ minHeight: "100vh", background: C.bg }}>
    <div style={{ background: C.headerFrom, padding: "13px 0" }}><div style={{ maxWidth: 600, margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}><Link href="/" style={{ fontWeight: 800, fontSize: 17, color: C.primary, textDecoration: "none" }}>폼잇.</Link><span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>세부 견적 · 3단계</span></div></div>
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "28px 20px 80px" }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 16px 12px", marginBottom: 24 }}><FlightPath step={3} totalSteps={5} /></div>
      <div style={{ marginBottom: 20 }}><div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: C.textMid, fontSize: 12, fontWeight: 700, marginBottom: 8 }}><IconSparkles size={15} color={C.primary} /> 전문 용어 없이 약 1분</div><h1 style={{ margin: "0 0 8px", fontSize: 25, lineHeight: 1.35, letterSpacing: "-0.045em", color: C.textDark }}>공간의 현재 상태만 알려주세요</h1><p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: C.textMid }}>답변에 따라 필요한 질문만 보여드릴게요.<br />모르는 항목은 편하게 ‘잘 모르겠어요’를 선택해도 됩니다.</p></div>
      <QuestionCard number="01" title="현재 공간은 어떤 상태인가요?"><SingleChoice options={STATUS_OPTIONS} value={answers.spaceStatus} onChange={value => update("spaceStatus", value)} /></QuestionCard>
      <QuestionCard number="02" title="기존 인테리어 철거가 필요한가요?"><SingleChoice options={DEMOLITION_OPTIONS} value={answers.demolition} onChange={value => update("demolition", value)} /></QuestionCard>
      <QuestionCard number="03" title="어느 부분을 바꾸고 싶으세요?" hint="여러 개를 선택할 수 있어요."><MultiChoice options={AREA_OPTIONS} values={answers.workAreas} onChange={value => update("workAreas", value)} /></QuestionCard>
      <AnimatePresence>
        {includes("ceiling") && <QuestionCard key="ceiling" number="04" title="천장은 어떻게 바꾸고 싶으세요?"><SingleChoice options={CEILING_OPTIONS} value={answers.ceiling} onChange={value => update("ceiling", value)} /></QuestionCard>}
        {includes("walls") && <QuestionCard key="walls" number={includes("ceiling") ? "05" : "04"} title="기존 벽은 어떻게 할까요?"><SingleChoice options={WALL_OPTIONS} value={answers.walls} onChange={value => update("walls", value)} /></QuestionCard>}
        {includes("walls") && <QuestionCard key="wall-finish" number={includes("ceiling") ? "06" : "05"} title="벽 마감은 무엇을 생각하고 계세요?"><SingleChoice options={WALL_FINISH_OPTIONS} value={answers.wallFinish} onChange={value => update("wallFinish", value)} /></QuestionCard>}
        {includes("floor") && <QuestionCard key="floor" number="+" title="바닥은 어떻게 바꾸고 싶으세요?"><SingleChoice options={FLOOR_OPTIONS} value={answers.floor} onChange={value => update("floor", value)} /></QuestionCard>}
      </AnimatePresence>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden", marginTop: 12 }}><button type="button" onClick={() => setShowExtras(value => !value)} aria-expanded={showExtras} style={{ width: "100%", padding: "16px 18px", border: 0, background: C.card, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", color: C.textDark, fontSize: 13, fontWeight: 700 }}><span>추가로 생각 중인 공사가 있나요? <span style={{ color: C.textLight, fontWeight: 500 }}>(선택)</span></span><motion.span animate={{ rotate: showExtras ? 180 : 0 }}><IconChevronDown size={18} /></motion.span></button><AnimatePresence>{showExtras && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}><div style={{ padding: "0 18px 18px" }}><MultiChoice options={EXTRA_OPTIONS} values={answers.extras} onChange={value => update("extras", value)} /></div></motion.div>}</AnimatePresence></div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28 }}><button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: C.textLight, fontWeight: 500 }}>← 이전</button><button disabled={!canNext} onClick={() => { saveEstimate({ commonAnswers: answers, selectedWorks }); router.push("/estimate/detail/step4"); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 30, border: "none", background: canNext ? `linear-gradient(135deg, ${C.primaryLight}, ${C.primary})` : C.border, color: canNext ? C.textDark : C.textLight, fontWeight: 750, fontSize: 15, cursor: canNext ? "pointer" : "not-allowed" }}>다음 <IconArrowRight size={17} /></button></div>
      {!canNext && <p style={{ textAlign: "right", margin: "9px 4px 0", fontSize: 11, color: C.textLight }}>보이는 필수 질문에 답하면 다음으로 갈 수 있어요.</p>}
    </main>
  </div>;
}
