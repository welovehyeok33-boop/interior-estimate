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

// ── 비행 경로 (웜톤) ───────────────────────────────────────
export function FlightPath({ step, totalSteps }: { step: number; totalSteps: number }) {
  const progress = (step / totalSteps) * 100;
  const t = progress / 100;

  const bx = (tt: number) =>
    (1 - tt) * (1 - tt) * 10 + 2 * (1 - tt) * tt * 155 + tt * tt * 300;
  const by = (tt: number) =>
    (1 - tt) * (1 - tt) * 60 + 2 * (1 - tt) * tt * 22 + tt * tt * 60;

  const x = bx(t), y = by(t);
  const dx = 2 * (1 - t) * (155 - 10) + 2 * t * (300 - 155);
  const dy = 2 * (1 - t) * (22 - 60) + 2 * t * (60 - 22);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  const checkpoints = Array.from({ length: totalSteps - 1 }, (_, i) => {
    const ct = (i + 1) / totalSteps;
    return { x: bx(ct), y: by(ct), done: i + 1 <= step };
  });

  const labels = ["지역·유형", "면적", "공종", "자재", "완성"];

  return (
    <div style={{ padding: "0 8px" }}>
      <svg viewBox="0 0 320 95" style={{ width: "100%", height: 110, overflow: "visible" }}>
        {/* 점선 경로 */}
        <path d="M 10 60 Q 155 22 300 60" fill="none" stroke={C.border} strokeWidth="1.5" strokeDasharray="5 4" />
        {/* 완료 경로 */}
        <path
          d="M 10 60 Q 155 22 300 60"
          fill="none" stroke="#F5C200" strokeWidth="2"
          strokeDasharray={`${t * 330} 999`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.5s ease" }}
        />

        {/* 체크포인트 */}
        {checkpoints.map((cp, i) => (
          <g key={i}>
            <circle cx={cp.x} cy={cp.y} r="3.5"
              fill={cp.done ? "#F5C200" : "white"}
              stroke={cp.done ? "#F5C200" : C.border} strokeWidth="1.5"
              style={{ transition: "all 0.3s ease" }} />
            <text x={cp.x} y={82} textAnchor="middle" fontSize="7.5"
              fill={cp.done ? "#111111" : C.textLight} fontWeight={cp.done ? "700" : "400"}>
              {labels[i]}
            </text>
          </g>
        ))}

        {/* 도착점 */}
        <circle cx="300" cy="60" r="4"
          fill={step >= totalSteps ? "#F5C200" : "white"}
          stroke={step >= totalSteps ? "#F5C200" : C.border} strokeWidth="1.5" />
        <text x="300" y="82" textAnchor="middle" fontSize="7.5"
          fill={step >= totalSteps ? "#111111" : C.textLight} fontWeight="700">
          {labels[totalSteps - 1]}
        </text>

        {/* 비행기 (옐로우/블랙) */}
        <g transform={`translate(${x}, ${y}) rotate(${angle})`}
          style={{ transition: "transform 0.5s ease" }}>
          <ellipse cx="0" cy="0" rx="12" ry="3" fill="#F5C200" />
          <ellipse cx="12" cy="0" rx="3.5" ry="1.8" fill="#F5C200" />
          <ellipse cx="-12" cy="0" rx="2.5" ry="1.5" fill="#F5C200" />
          <path d="M 2,0 L -4,-11 L -7,-10 L -3,0 Z" fill="#111111" />
          <path d="M 2,0 L -4,11 L -7,10 L -3,0 Z" fill="#111111" />
          <path d="M -9,0 L -13,-5 L -14,-4.5 L -10,0 Z" fill="#333333" />
          <path d="M -9,0 L -13,5 L -14,4.5 L -10,0 Z" fill="#333333" />
          <circle cx="5" cy="-1" r="0.9" fill="#111111" opacity="0.9" />
          <circle cx="2" cy="-1" r="0.9" fill="#111111" opacity="0.9" />
        </g>

        {/* 진행률 */}
        <text x={x} y={y - 14} textAnchor="middle" fontSize="9"
          fill="#111111" fontWeight="700"
          style={{ transition: "all 0.5s ease" }}>
          {Math.round(progress)}%
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
