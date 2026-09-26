"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { C } from "@/components/EstimateLayout";

export default function ScanPage() {
  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>

      {/* 헤더 */}
      <div style={{ background: "#111111", padding: "13px 0" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ fontWeight: 800, fontSize: 17, color: "#F5C200", textDecoration: "none" }}>
            폼잇.
          </Link>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>AI 견적 스캔</span>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>

        {/* 아이콘 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={{
            width: 80, height: 80, borderRadius: 24,
            background: "#111111",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 28px",
            fontSize: 36,
          }}
        >
          📷
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div style={{
            display: "inline-block",
            fontSize: 11, fontWeight: 900, color: "#111",
            background: C.primary, padding: "4px 14px", borderRadius: 20,
            marginBottom: 20, letterSpacing: "0.06em",
          }}>
            COMING SOON
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: C.textDark, margin: "0 0 16px", letterSpacing: "-1px", lineHeight: 1.2 }}>
            AI 견적 스캔<br />준비 중이에요
          </h1>
          <p style={{ fontSize: 15, color: C.textMid, lineHeight: 1.8, margin: "0 0 40px", wordBreak: "keep-all" }}>
            받은 견적서를 사진으로 찍어 올리면<br />
            AI가 항목별로 적정한지 바로 판단해드리는 기능이에요.<br />
            <span style={{ color: C.primary, fontWeight: 700 }}>곧 출시 예정</span>입니다.
          </p>

          {/* 예정 기능 */}
          <div style={{
            background: C.card, border: `1.5px solid ${C.border}`,
            borderRadius: 16, padding: "24px", marginBottom: 32, textAlign: "left",
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, marginBottom: 16, letterSpacing: "0.05em" }}>
              출시 예정 기능
            </div>
            {[
              { icon: "📸", text: "사진 · PDF · 엑셀 — 어떤 형태든 업로드" },
              { icon: "🔍", text: "AI가 공종별 항목 자동 인식 및 분류" },
              { icon: "📊", text: "내부 단가 DB와 1:1 비교 분석" },
              { icon: "🚨", text: "비싼 항목 경고 + 이유 설명 리포트" },
            ].map(f => (
              <div key={f.text} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 18 }}>{f.icon}</span>
                <span style={{ fontSize: 14, color: C.textMid, fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href="/estimate/detail" style={{
              display: "block", padding: "14px",
              borderRadius: 12, background: `linear-gradient(135deg, #FFD740, #F5C200)`,
              color: "#111", fontWeight: 800, fontSize: 15,
              textDecoration: "none",
            }}>
              AI 자동 견적 먼저 해보기 →
            </Link>
            <Link href="/" style={{
              display: "block", padding: "14px",
              borderRadius: 12, background: C.card, border: `1.5px solid ${C.border}`,
              color: C.textMid, fontWeight: 600, fontSize: 14,
              textDecoration: "none",
            }}>
              ← 홈으로
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
