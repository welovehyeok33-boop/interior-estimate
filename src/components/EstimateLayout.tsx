"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

// ── 컬러 토큰 ──────────────────────────────────────────────
export const C = {
  bg: "#f5fafd",
  card: "#ffffff",
  border: "#deeef7",
  headerFrom: "#0c4f7a",
  headerTo: "#0f5f8a",
  primary: "#0e7ab5",
  primaryLight: "#29abe2",
  gold: "#a8dff0",
  textDark: "#0d2233",
  textMid: "#2a5470",
  textLight: "#89b4c8",
  selectedBg: "#e6f6fd",
  selectedBorder: "#29abe2",
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
          fill="none" stroke="#29abe2" strokeWidth="2"
          strokeDasharray={`${t * 330} 999`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.5s ease" }}
        />

        {/* 체크포인트 */}
        {checkpoints.map((cp, i) => (
          <g key={i}>
            <circle cx={cp.x} cy={cp.y} r="3.5"
              fill={cp.done ? C.primary : "white"}
              stroke={cp.done ? C.primary : C.border} strokeWidth="1.5"
              style={{ transition: "all 0.3s ease" }} />
            <text x={cp.x} y={82} textAnchor="middle" fontSize="7.5"
              fill={cp.done ? C.primary : C.textLight} fontWeight={cp.done ? "700" : "400"}>
              {labels[i]}
            </text>
          </g>
        ))}

        {/* 도착점 */}
        <circle cx="300" cy="60" r="4"
          fill={step >= totalSteps ? C.primary : "white"}
          stroke={step >= totalSteps ? C.primary : C.border} strokeWidth="1.5" />
        <text x="300" y="82" textAnchor="middle" fontSize="7.5"
          fill={step >= totalSteps ? C.primary : C.textLight} fontWeight="700">
          {labels[totalSteps - 1]}
        </text>

        {/* 비행기 (하늘색) */}
        <g transform={`translate(${x}, ${y}) rotate(${angle})`}
          style={{ transition: "transform 0.5s ease" }}>
          <ellipse cx="0" cy="0" rx="12" ry="3" fill="#29abe2" />
          <ellipse cx="12" cy="0" rx="3.5" ry="1.8" fill="#4dc3f0" />
          <ellipse cx="-12" cy="0" rx="2.5" ry="1.5" fill="#0e7ab5" />
          <path d="M 2,0 L -4,-11 L -7,-10 L -3,0 Z" fill="#0e7ab5" />
          <path d="M 2,0 L -4,11 L -7,10 L -3,0 Z" fill="#0e7ab5" />
          <path d="M -9,0 L -13,-5 L -14,-4.5 L -10,0 Z" fill="#0c4f7a" />
          <path d="M -9,0 L -13,5 L -14,4.5 L -10,0 Z" fill="#0c4f7a" />
          <circle cx="5" cy="-1" r="0.9" fill="white" opacity="0.9" />
          <circle cx="2" cy="-1" r="0.9" fill="white" opacity="0.9" />
        </g>

        {/* 진행률 */}
        <text x={x} y={y - 14} textAnchor="middle" fontSize="9"
          fill={C.primary} fontWeight="700"
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
      background: `linear-gradient(135deg, ${C.headerFrom}, ${C.headerTo})`,
      padding: "13px 0",
    }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: 17, color: "#f5ede0", textDecoration: "none", letterSpacing: "-0.02em" }}>
          폼잇.
        </Link>
        <span style={{ fontSize: 12, color: "rgba(245,237,224,0.55)", fontWeight: 500 }}>
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
