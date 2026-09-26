"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { IconArrowLeft, IconArrowRight, IconCalculator, IconMessageCircle } from "@tabler/icons-react";
import { C } from "@/components/EstimateLayout";

const OPTIONS = [
  {
    id: "consult",
    href: "/consult",
    phase: "1차 · 유입용",
    tag: "4단계 신청",
    title: "무료 견적 신청",
    description: "공사 계획과 연락처를 남기고, 상담을 통해 견적을 안내받는 방식이에요.",
    note: "정확한 공사 내용이 정해지지 않아도 괜찮아요.",
    action: "무료 견적 신청하기",
    icon: IconMessageCircle,
  },
  {
    id: "engine",
    href: "/estimate/detail",
    phase: "2차 · 견적엔진용",
    tag: "5단계 · 개발 중",
    title: "상세 견적 미리보기",
    description: "공종과 자재를 직접 선택하는 기존 5단계 견적 흐름을 살펴보세요.",
    note: "현재 금액은 임시 계산값이며, 최종 견적엔진과 상세 PDF는 준비 중이에요.",
    action: "견적엔진용 살펴보기",
    icon: IconCalculator,
  },
] as const;

export default function EstimateChoicePage() {
  const reducedMotion = useReducedMotion();

  return (
    <div style={{ minHeight: "100vh", background: C.home.ivory, color: C.home.ink }}>
      <header style={{ background: C.headerFrom }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <Link href="/" aria-label="폼잇 홈" style={{ color: C.primary, fontSize: 18, fontWeight: 800, textDecoration: "none" }}>폼잇.</Link>
          <span style={{ color: C.home.mutedOnDark, fontSize: 12 }}>AI 자동 견적 · 방식 선택</span>
        </div>
      </header>

      <main style={{ maxWidth: 880, margin: "0 auto", padding: "32px 20px 56px" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 32, color: C.home.muted, fontSize: 13, textDecoration: "none", marginBottom: 22 }}>
          <IconArrowLeft size={15} aria-hidden="true" />홈으로
        </Link>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: "clamp(27px, 5vw, 36px)", fontWeight: 800, lineHeight: 1.35, letterSpacing: "-1px", margin: "0 0 10px", wordBreak: "keep-all" }}>어떤 방식으로 알아볼까요?</h1>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8, color: C.home.muted, wordBreak: "keep-all" }}>간단한 견적 신청과 상세 견적 미리보기 중 선택해주세요.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 16 }}>
          {OPTIONS.map(option => {
            const primary = option.id === "consult";
            const Icon = option.icon;
            return (
              <motion.div key={option.id} whileHover={reducedMotion ? undefined : { y: -3 }} transition={{ duration: 0.2 }} style={{ minWidth: 0 }}>
                <Link href={option.href} aria-labelledby={`${option.id}-title`} aria-describedby={`${option.id}-description ${option.id}-note`} style={{ display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box", padding: 20, borderRadius: 18, textDecoration: "none", color: C.home.ink, background: C.card, border: `1.5px solid ${primary ? C.primary : C.home.line}`, boxShadow: `0 8px 24px ${C.home.shadow}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <span style={{ fontSize: 12, fontWeight: 750, color: C.home.bronze }}>{option.phase}</span>
                    <span style={{ padding: "4px 9px", borderRadius: 20, background: primary ? C.selectedBg : C.home.stone, color: primary ? C.home.bronze : C.home.muted, fontSize: 11, fontWeight: 650, whiteSpace: "nowrap" }}>{option.tag}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 10, background: primary ? C.primaryLight : C.home.stone, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={22} stroke={1.6} aria-hidden="true" /></span>
                    <h2 id={`${option.id}-title`} style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.7px", margin: 0, wordBreak: "keep-all" }}>{option.title}</h2>
                  </div>
                  <p id={`${option.id}-description`} style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.75, color: C.home.muted, wordBreak: "keep-all" }}>{option.description}</p>
                  <p id={`${option.id}-note`} style={{ margin: "auto 0 18px", paddingTop: 15, borderTop: `1px solid ${C.home.line}`, fontSize: 11, lineHeight: 1.7, color: C.home.muted, wordBreak: "keep-all" }}>{option.note}</p>
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "13px 14px", minHeight: 46, boxSizing: "border-box", borderRadius: 10, background: primary ? C.primaryLight : C.home.ink, color: primary ? C.home.ink : C.home.onDark, fontSize: 13, fontWeight: 750 }}>{option.action}<IconArrowRight size={17} aria-hidden="true" style={{ flexShrink: 0 }} /></span>
                </Link>
              </motion.div>
            );
          })}
        </div>
        <p style={{ textAlign: "center", margin: "22px 0 0", fontSize: 12, lineHeight: 1.7, color: C.home.muted, wordBreak: "keep-all" }}>어떤 방식이 맞을지 고민된다면, 무료 견적 신청부터 시작해보세요.</p>
      </main>
    </div>
  );
}
