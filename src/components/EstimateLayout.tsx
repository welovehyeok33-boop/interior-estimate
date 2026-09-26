"use client";

import Link from "next/link";
import { useId } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { IconCheck } from "@tabler/icons-react";
import { ESTIMATE_STEP_LABELS } from "@/lib/estimateProgress";
import { useEstimateProgress } from "@/components/EstimateProgressProvider";

// ── 컬러 토큰 ──────────────────────────────────────────────
export const C = {
  bg: "#FFFDF0",
  card: "#ffffff",
  border: "#E8E8E8",
  headerFrom: "#111111",
  headerTo: "#1A1A1A",
  primary: "#F5C200",
  primaryLight: "#FFD740",
  gold: "#FFF3B0",
  textDark: "#111111",
  textMid: "#444444",
  textLight: "#999999",
  selectedBg: "#FFFBE8",
  selectedBorder: "#F5C200",
  phone: {
    frame: "#20221F",
    frameEdge: "#55574E",
    frameHighlight: "#888B80",
    screen: "#FAF9F5",
    green: "#42624D",
    greenBg: "#EAF0E9",
    amber: "#90643E",
    amberBg: "#F7EEE2",
    grid: "rgba(132,103,63,0.09)",
    scan: "rgba(245,194,0,0.16)",
    clear: "rgba(255,255,255,0)",
    glass: "rgba(255,255,255,0.14)",
  },
  ruler: {
    housingTop: "#383A36",
    housingBottom: "#141612",
    housingEdge: "#51534B",
    housingInset: "#242620",
    housingLabel: "#D3D4C8",
    tapeTop: "#FFE779",
    tapeBottom: "#EFBF21",
    tapeEdge: "#C79D25",
    track: "#F3F2EB",
    trackEdge: "#E4E2D8",
    trackTick: "#CBC9BD",
    tick: "#685817",
    metalTop: "#F1F1EB",
    metalMid: "#BDBFB4",
    metalBottom: "#81867A",
    metalEdge: "#70776A",
    label: "#77776C",
    shadow: "rgba(27,29,21,0.12)",
    highlight: "rgba(255,255,255,0.55)",
  },
  // 홈 전용 마감. 기존 견적/상담 화면의 컬러 토큰은 변경하지 않는다.
  home: {
    paper: "#FCFAF5",
    ivory: "#F8F4EA",
    stone: "#F2EEE6",
    ink: "#24231F",
    muted: "#70695E",
    bronze: "#84673F",
    line: "#DED6C7",
    accentLine: "#B59A69",
    service: "#F1CB50",
    darkCard: "#2D2B25",
    darkLine: "#494338",
    onDark: "#F7F2E8",
    mutedOnDark: "#BDB5A7",
    nav: "rgba(252,250,245,0.96)",
    shadow: "rgba(36,35,31,0.08)",
    phoneShadow: "rgba(36,35,31,0.16)",
  },
};

// ── 줄자 진행 표시기 ──────────────────────────────────────
export function FlightPath({ step, totalSteps, stepLabels }: { step: number; totalSteps: number; stepLabels?: readonly string[] }) {
  const TAPE_START = 66;
  const TAPE_LENGTH = 350;
  const VIEW_WIDTH = 440;
  const count = Math.max(1, Math.min(ESTIMATE_STEP_LABELS.length, Math.trunc(totalSteps) || 1));
  const current = Math.max(1, Math.min(count, Math.trunc(step) || 1));
  const labels = (stepLabels ?? ESTIMATE_STEP_LABELS).slice(0, count);
  const id = useId().replace(/:/g, "");
  const sharedProgress = useEstimateProgress();
  const localProgress = useMotionValue(current / count);
  const progress = sharedProgress ?? localProgress;
  const fillWidth = useTransform(progress, [0, 1], [0, TAPE_LENGTH]);
  const hookX = useTransform(progress, [0, 1], [TAPE_START, TAPE_START + TAPE_LENGTH]);
  const ticks = Array.from({ length: 50 }, (_, index) => {
    const mark = index + 1;
    return {
      x: TAPE_START + (mark / 50) * TAPE_LENGTH,
      height: mark % 10 === 0 ? 13 : mark % 5 === 0 ? 9 : 5,
      major: mark % 10 === 0,
    };
  });

  return (
    <div style={{ padding: "0 2px 2px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
        <span style={{ color: C.textMid, fontSize: 12, fontWeight: 600, letterSpacing: "-0.02em" }}>견적 만들기</span>
        <span style={{ background: C.selectedBg, border: `1px solid ${C.gold}`, borderRadius: 20, padding: "4px 10px", fontSize: 11, color: C.textMid, fontVariantNumeric: "tabular-nums" }}>
          <strong style={{ color: C.textDark, fontSize: 13 }}>{String(current).padStart(2, "0")}</strong>
          <span style={{ margin: "0 5px", color: C.ruler.label }}>/</span>
          {String(count).padStart(2, "0")} 단계
        </span>
      </div>

      <div role="progressbar" aria-label="견적 입력 단계" aria-valuemin={1} aria-valuemax={count} aria-valuenow={current} aria-valuetext={`${count}단계 중 ${current}단계, ${labels[current - 1]}`}>
        <svg aria-hidden="true" focusable="false" viewBox={`0 0 ${VIEW_WIDTH} 84`} style={{ display: "block", width: "100%", height: "auto" }}>
          <defs>
            <linearGradient id={`${id}-housing`} x1="0" y1="0" x2="0.85" y2="1">
              <stop stopColor={C.ruler.housingTop} />
              <stop offset="1" stopColor={C.ruler.housingBottom} />
            </linearGradient>
            <linearGradient id={`${id}-tape`} x1="0" y1="0" x2="0" y2="1">
              <stop stopColor={C.ruler.tapeTop} />
              <stop offset="0.5" stopColor={C.primaryLight} />
              <stop offset="1" stopColor={C.ruler.tapeBottom} />
            </linearGradient>
            <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="0">
              <stop stopColor={C.ruler.metalTop} />
              <stop offset="0.45" stopColor={C.ruler.metalMid} />
              <stop offset="0.7" stopColor={C.ruler.metalTop} />
              <stop offset="1" stopColor={C.ruler.metalBottom} />
            </linearGradient>
            <clipPath id={`${id}-fill`}>
              <motion.rect x={TAPE_START} y="29" width={fillWidth} height="29" rx="2" />
            </clipPath>
          </defs>

          {/* The same moving clip reveals the tape and its markings; the hook shares its position. */}
          <rect x={TAPE_START} y="31" width={TAPE_LENGTH} height="29" rx="3" fill={C.ruler.shadow} />
          <rect x={TAPE_START} y="29" width={TAPE_LENGTH} height="29" rx="3" fill={C.ruler.track} stroke={C.ruler.trackEdge} />
          <g stroke={C.ruler.trackTick}>
            {ticks.map(tick => (
              <line key={tick.x} x1={tick.x} x2={tick.x} y1="30" y2={30 + tick.height} strokeWidth={tick.major ? 1.2 : 0.8} />
            ))}
          </g>
          <g clipPath={`url(#${id}-fill)`}>
            <rect x={TAPE_START} y="29" width={TAPE_LENGTH} height="29" fill={`url(#${id}-tape)`} />
            <line x1={TAPE_START} x2={TAPE_START + TAPE_LENGTH} y1="30" y2="30" stroke={C.ruler.highlight} />
            <line x1={TAPE_START} x2={TAPE_START + TAPE_LENGTH} y1="57" y2="57" stroke={C.ruler.tapeEdge} />
            {ticks.map(tick => (
              <g key={tick.x} stroke={C.ruler.tick} strokeWidth={tick.major ? 1.2 : 0.8}>
                <line x1={tick.x} x2={tick.x} y1="30" y2={30 + tick.height} />
                <line x1={tick.x} x2={tick.x} y1="57" y2={tick.major ? 53 : 55} opacity="0.5" />
              </g>
            ))}
          </g>
          {labels.map((_, index) => (
            <text key={index} x={TAPE_START + ((index + 1) / count) * TAPE_LENGTH - 5} y="53" textAnchor="end" fontSize="7" fontWeight="600" fill={C.ruler.label}>
              {String(index + 1).padStart(2, "0")}
            </text>
          ))}

          <motion.g style={{ x: hookX }}>
            <rect x="-3" y="24" width="8" height="40" rx="2" fill={C.ruler.shadow} />
            <path d="M-4 24 H3 V61 H-4 V57 H-1 V28 H-4 Z" fill={`url(#${id}-metal)`} stroke={C.ruler.metalEdge} strokeWidth="0.8" />
            <rect x="-11" y="36" width="11" height="15" rx="1.5" fill={`url(#${id}-metal)`} stroke={C.ruler.metalEdge} strokeWidth="0.6" />
            <circle cx="-7" cy="40" r="1.1" fill={C.ruler.metalEdge} />
            <circle cx="-7" cy="47" r="1.1" fill={C.ruler.metalEdge} />
            <line x1="1" x2="1" y1="27" y2="58" stroke={C.ruler.highlight} />
          </motion.g>

          {/* Layered casing, recessed grip, and a brass dial keep the original black/yellow identity. */}
          <ellipse cx="37" cy="76" rx="31" ry="3" fill={C.ruler.shadow} />
          <rect x="25" y="8" width="24" height="8" rx="3" fill={C.ruler.housingInset} />
          <rect x="30" y="9" width="14" height="2" rx="1" fill={C.ruler.housingEdge} />
          <rect x="6" y="13" width="63" height="61" rx="17" fill={`url(#${id}-housing)`} stroke={C.ruler.housingBottom} />
          <path d="M11 35 V30 Q11 18 24 18 H49 Q60 18 63 28" fill="none" stroke={C.ruler.housingEdge} strokeWidth="1.2" />
          <rect x="61" y="29" width="8" height="30" rx="2" fill={C.ruler.housingInset} />
          <rect x="64" y="32" width="4" height="24" rx="1" fill={C.ruler.metalEdge} />
          <circle cx="34" cy="45" r="21" fill={C.ruler.housingBottom} stroke={C.ruler.housingEdge} />
          <circle cx="34" cy="45" r="18" fill={`url(#${id}-tape)`} stroke={C.ruler.tapeEdge} strokeWidth="0.6" />
          <circle cx="34" cy="45" r="14.5" fill="none" stroke={C.ruler.highlight} strokeWidth="0.7" />
          <circle cx="34" cy="45" r="5.5" fill={C.ruler.housingInset} />
          <line x1="32" x2="36" y1="45" y2="45" stroke={C.ruler.housingEdge} strokeWidth="1.2" />
          <text x="34" y="23" textAnchor="middle" fontSize="5" letterSpacing="1.2" fill={C.ruler.housingLabel} fontWeight="700">FORMIT</text>
          {[59, 63, 67].map(y => <line key={y} x1="55" x2="61" y1={y} y2={y} stroke={C.ruler.housingEdge} strokeWidth="1.5" strokeLinecap="round" />)}
        </svg>
      </div>

      {/* HTML labels stay legible when the decorative SVG scales down on mobile. */}
      <ol aria-label="견적 단계" style={{ position: "relative", height: 43, listStyle: "none", margin: "2px 0 0", padding: 0 }}>
        {labels.map((label, index) => {
          const number = index + 1;
          const active = number === current;
          const completed = number < current || current === count;
          return (
            <li key={label} aria-current={active ? "step" : undefined} aria-label={`${number}단계 ${label}, ${active ? "현재 단계" : completed ? "완료" : "대기"}`} style={{ position: "absolute", left: `${((TAPE_START + (number / count) * TAPE_LENGTH) / VIEW_WIDTH) * 100}%`, transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
              <span aria-hidden="true" style={{ width: 19, height: 19, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: active ? C.primaryLight : completed ? C.ruler.housingInset : C.card, border: `1px solid ${active ? C.primary : completed ? C.ruler.housingInset : C.ruler.trackEdge}`, boxShadow: active ? `0 0 0 3px ${C.selectedBg}` : "none", color: active ? C.textDark : completed ? C.primaryLight : C.ruler.label, fontSize: 10, fontWeight: 700 }}>
                {completed ? <IconCheck size={12} stroke={2.5} /> : number}
              </span>
              <span style={{ fontSize: 11, lineHeight: "15px", fontWeight: active ? 750 : completed ? 600 : 400, color: active || completed ? C.textDark : C.ruler.label }}>{label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ── 공통 헤더 ──────────────────────────────────────────────
export function EstimateHeader({ step }: { step: number }) {
  return (
    <div style={{
      background: "#111111",
      padding: "13px 0",
    }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: 17, color: "#F5C200", textDecoration: "none", letterSpacing: "-0.02em" }}>
          폼잇.
        </Link>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
          세부 견적 · {step}단계
        </span>
      </div>
    </div>
  );
}

// ── 공통 래퍼 ──────────────────────────────────────────────
export function EstimateShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      {children}
    </div>
  );
}
