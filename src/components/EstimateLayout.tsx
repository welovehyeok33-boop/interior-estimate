"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

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
};

// ── 줄자 진행 표시기 ──────────────────────────────────────
export function FlightPath({ step, totalSteps }: { step: number; totalSteps: number }) {
  const TAPE_START = 44;   // 테이프 시작 X (하우징 오른쪽)
  const TAPE_END   = 308;  // 테이프 끝 X
  const TAPE_LEN   = TAPE_END - TAPE_START;
  const CY         = 32;   // 중심 Y
  const TH         = 20;   // 테이프 높이
  const HS         = 38;   // 하우징 크기

  const progress    = step / totalSteps;
  const filledW     = progress * TAPE_LEN;

  const labels = ["지역·유형", "면적", "공종", "자재", "완성"];

  // 체크포인트 위치
  const cps = Array.from({ length: totalSteps }, (_, i) => ({
    x: TAPE_START + ((i + 1) / totalSteps) * TAPE_LEN,
    label: labels[i],
    done: i + 1 <= step,
  }));

  // 눈금선 생성 (작은·중간·큰)
  const ticks: { x: number; h: number; bold: boolean }[] = [];
  const COUNT = 52;
  for (let i = 1; i < COUNT; i++) {
    const x = TAPE_START + (i / COUNT) * TAPE_LEN;
    const isBig    = i % 13 === 0;
    const isMedium = i % 4 === 0 && !isBig;
    const h = isBig ? TH * 0.75 : isMedium ? TH * 0.5 : TH * 0.28;
    ticks.push({ x, h, bold: isBig });
  }

  // 현재 끝 위치 (줄자 끝 탭)
  const endX = TAPE_START + filledW;

  return (
    <div style={{ padding: "0 4px" }}>
      <svg viewBox="0 0 320 76" style={{ width: "100%", height: 88, overflow: "visible" }}>

        {/* ── 빈 트랙 (회색) ── */}
        <rect x={TAPE_START} y={CY - TH / 2} width={TAPE_LEN} height={TH} rx="3" fill="#E8E8E8" />

        {/* ── 채워진 테이프 (노란) ── */}
        <rect
          x={TAPE_START} y={CY - TH / 2}
          width={filledW} height={TH}
          rx="3" fill="#F5C200"
          style={{ transition: "width 0.5s cubic-bezier(0.22,1,0.36,1)" }}
        />

        {/* ── 눈금선 ── */}
        {ticks.map((t, i) => {
          const filled = t.x <= endX;
          return (
            <line key={i}
              x1={t.x} y1={CY - t.h / 2}
              x2={t.x} y2={CY + t.h / 2}
              stroke={filled ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.1)"}
              strokeWidth={t.bold ? 1.2 : 0.7}
            />
          );
        })}

        {/* ── 줄자 끝 탭 (현재 위치) ── */}
        {step < totalSteps && (
          <g style={{ transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)" }}
             transform={`translate(${endX}, 0)`}>
            {/* 탭 몸체 */}
            <rect x={-1} y={CY - TH / 2 - 4} width={8} height={TH + 8} rx="2" fill="#111111" />
            {/* 탭 고리 */}
            <rect x={2} y={CY - TH / 2 - 7} width={2} height={5} rx="1" fill="#555" />
            {/* 진행률 말풍선 */}
            <rect x={-18} y={CY - TH / 2 - 22} width={30} height={15} rx="4" fill="#111111" />
            <polygon points={`${-2},${CY - TH / 2 - 7} 3,${CY - TH / 2 - 7} 0,${CY - TH / 2 - 3}`} fill="#111111" />
            <text x={-3} y={CY - TH / 2 - 11} textAnchor="middle" fontSize="8" fill="#F5C200" fontWeight="800"
              style={{ transition: "all 0.5s ease" }}>
              {Math.round(progress * 100)}%
            </text>
          </g>
        )}

        {/* ── 체크포인트 ── */}
        {cps.map((cp, i) => (
          <g key={i}>
            {/* 완료 표시 원 */}
            <circle cx={cp.x} cy={CY} r="7"
              fill={cp.done ? "#111111" : "white"}
              stroke={cp.done ? "#111111" : "#CCCCCC"}
              strokeWidth="1.5"
              style={{ transition: "all 0.3s ease" }}
            />
            {cp.done && (
              <text x={cp.x} y={CY + 3.5} textAnchor="middle" fontSize="8" fill="#F5C200" fontWeight="900">✓</text>
            )}
            {/* 라벨 */}
            <text x={cp.x} y={CY + TH / 2 + 14} textAnchor="middle" fontSize="7.5"
              fill={cp.done ? "#111111" : "#BBBBBB"}
              fontWeight={cp.done ? "700" : "400"}
              style={{ transition: "fill 0.3s ease" }}>
              {cp.label}
            </text>
          </g>
        ))}

        {/* ── 하우징 (줄자 본체) ── */}
        <rect x="0" y={CY - HS / 2} width={HS} height={HS} rx="10" fill="#111111" />
        {/* 노란 다이얼 */}
        <circle cx={HS / 2} cy={CY} r={HS * 0.32} fill="#F5C200" />
        {/* 중심 나사 */}
        <circle cx={HS / 2} cy={CY} r={HS * 0.1} fill="#111111" />
        {/* 테이프 슬롯 */}
        <rect x={HS - 5} y={CY - TH / 2} width={7} height={TH} rx="1" fill="#F5C200" />
        {/* 하우징 상단 텍스트 */}
        <text x={HS / 2} y={CY - HS * 0.32 - 3} textAnchor="middle" fontSize="5.5" fill="rgba(255,255,255,0.4)" fontWeight="600">
          FORMA
        </text>

      </svg>
    </div>
  );
}

// ── 공통 헤더 ──────────────────────────────────────────────
export function EstimateHeader({ step }: { step: number }) {
  const router = useRouter();
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
