"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { IconArrowRight, IconCheck, IconPhone, IconClock, IconShield } from "@tabler/icons-react";

const C = {
  bg: "#F8F8F6",
  card: "#FFFFFF",
  border: "#E8E8E4",
  primary: "#F5C200",
  text: "#111111",
  mid: "#555555",
  light: "#999999",
};

function useIsMobile(bp = 768) {
  const [is, setIs] = useState(false);
  useEffect(() => {
    const check = () => setIs(window.innerWidth < bp);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [bp]);
  return is;
}

export default function LandingPage() {
  const m = useIsMobile();

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif" }}>

      {/* 헤더 */}
      <div style={{ background: "#111111", padding: "13px 0", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ fontWeight: 900, fontSize: 18, color: C.primary, textDecoration: "none" }}>
            폼잇.
          </Link>
          <Link href="/consult" style={{
            fontSize: 13, fontWeight: 700, color: "#111",
            background: C.primary, padding: "7px 16px", borderRadius: 20,
            textDecoration: "none",
          }}>
            무료 상담 신청
          </Link>
        </div>
      </div>

      {/* 히어로 */}
      <div style={{ background: "#111111", padding: m ? "52px 20px 60px" : "72px 20px 80px", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{
            display: "inline-block", fontSize: 11, fontWeight: 800,
            background: "rgba(245,194,0,0.15)", color: C.primary,
            padding: "5px 16px", borderRadius: 20, marginBottom: 24,
            letterSpacing: "0.06em", border: "1px solid rgba(245,194,0,0.3)",
          }}>
            현직 인테리어 전문가 직접 상담
          </div>

          <h1 style={{
            fontSize: m ? 30 : 42, fontWeight: 900, color: "#FFFFFF",
            margin: "0 0 16px", lineHeight: 1.2, letterSpacing: "-1px",
            wordBreak: "keep-all",
          }}>
            공사 전에<br />
            <span style={{ color: C.primary }}>전문가에게</span> 먼저<br />
            물어보세요
          </h1>

          <p style={{
            fontSize: m ? 15 : 17, color: "rgba(255,255,255,0.55)",
            margin: "0 0 36px", lineHeight: 1.8, wordBreak: "keep-all",
          }}>
            견적부터 자재까지, 바가지 없이.<br />
            2분이면 상담 신청 완료됩니다.
          </p>

          <Link href="/consult" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: `linear-gradient(135deg, #FFD740, #F5C200)`,
            color: "#111", fontWeight: 800, fontSize: m ? 16 : 18,
            padding: m ? "14px 32px" : "16px 40px",
            borderRadius: 50, textDecoration: "none",
            boxShadow: "0 8px 32px rgba(245,194,0,0.35)",
          }}>
            무료 상담 신청하기 <IconArrowRight size={20} strokeWidth={2.5} />
          </Link>

          <div style={{ marginTop: 16, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
            비용 없음 · 부담 없음 · 24시간 이내 연락
          </div>
        </motion.div>
      </div>

      {/* 신뢰 지표 */}
      <div style={{ background: C.primary, padding: "20px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", justifyContent: "center", gap: m ? 24 : 48, flexWrap: "wrap" }}>
          {[
            { num: "100+", label: "업체 데이터 기반" },
            { num: "24h", label: "이내 전문가 연락" },
            { num: "무료", label: "상담 비용 없음" },
          ].map(item => (
            <div key={item.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: m ? 20 : 24, fontWeight: 900, color: "#111" }}>{item.num}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(0,0,0,0.55)", marginTop: 2 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 어떻게 진행되나요 */}
      <div style={{ maxWidth: 700, margin: "0 auto", padding: m ? "52px 20px" : "72px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, letterSpacing: "0.08em", marginBottom: 12 }}>HOW IT WORKS</div>
          <h2 style={{ fontSize: m ? 22 : 28, fontWeight: 900, color: C.text, margin: 0, letterSpacing: "-0.5px" }}>
            딱 3단계면 끝이에요
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { step: "01", title: "공간 정보 입력", desc: "지역, 업종(주거/상가), 평수를 알려주세요. 2분이면 충분해요.", icon: "📋" },
            { step: "02", title: "공사 계획 작성", desc: "공사 시기, 예산, 원하는 것들을 자유롭게 작성해주세요.", icon: "✏️" },
            { step: "03", title: "전문가 직접 연락", desc: "24시간 이내에 현직 인테리어 전문가가 직접 전화드립니다.", icon: "📞" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                display: "flex", gap: 20, alignItems: "flex-start",
                background: C.card, border: `1.5px solid ${C.border}`,
                borderRadius: 16, padding: "20px 22px",
              }}
            >
              <div style={{ fontSize: 28, flexShrink: 0, marginTop: 2 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: C.primary, letterSpacing: "0.1em", marginBottom: 6 }}>STEP {item.step}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: C.mid, lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 이런 분들께 */}
      <div style={{ background: "#111", padding: m ? "52px 20px" : "72px 20px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 style={{ fontSize: m ? 22 : 28, fontWeight: 900, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.5px" }}>
              이런 분들께 딱 맞아요
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 1fr", gap: 12 }}>
            {[
              "인테리어 공사가 처음이라 뭘 물어봐야 할지 모르겠어요",
              "견적서 받았는데 금액이 적정한지 모르겠어요",
              "어떤 자재를 써야 할지 감이 안 잡혀요",
              "공사 업체 선정을 어떻게 해야 할지 막막해요",
              "예산은 있는데 어디서 시작해야 할지 모르겠어요",
              "부분 공사만 해도 되는지 전체 공사를 해야 하는지 모르겠어요",
            ].map((text, i) => (
              <div key={i} style={{
                display: "flex", gap: 12, alignItems: "flex-start",
                background: "rgba(255,255,255,0.05)", borderRadius: 12,
                padding: "14px 16px", border: "1px solid rgba(255,255,255,0.08)",
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: C.primary, display: "flex", alignItems: "center",
                  justifyContent: "center", flexShrink: 0, marginTop: 1,
                }}>
                  <IconCheck size={11} color="#111" strokeWidth={3} />
                </div>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, wordBreak: "keep-all" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 전문가 소개 */}
      <div style={{ maxWidth: 700, margin: "0 auto", padding: m ? "52px 20px" : "72px 20px" }}>
        <div style={{
          background: C.card, border: `1.5px solid ${C.border}`,
          borderRadius: 20, padding: m ? "28px 24px" : "36px 40px",
          display: "flex", gap: 28, alignItems: "center",
          flexDirection: m ? "column" : "row", textAlign: m ? "center" : "left",
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "#111", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 36, flexShrink: 0,
          }}>
            👷
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, marginBottom: 8, letterSpacing: "0.05em" }}>EXPERT</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: C.text, marginBottom: 8 }}>현직 인테리어 전문가</div>
            <div style={{ fontSize: 13, color: C.mid, lineHeight: 1.7, wordBreak: "keep-all" }}>
              100여 개 업체와의 협업 데이터를 바탕으로 정확한 견적과 자재 선택을 도와드립니다.
              바가지 없이, 불필요한 공사 없이 딱 필요한 것만 알려드려요.
            </div>
          </div>
        </div>
      </div>

      {/* 하단 CTA */}
      <div style={{ background: "#111", padding: m ? "52px 20px 60px" : "72px 20px 80px", textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 style={{ fontSize: m ? 24 : 32, fontWeight: 900, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.5px", wordBreak: "keep-all" }}>
            지금 바로 시작해보세요
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: "0 0 32px" }}>
            2분이면 신청 완료 · 비용 없음 · 부담 없음
          </p>
          <Link href="/consult" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: `linear-gradient(135deg, #FFD740, #F5C200)`,
            color: "#111", fontWeight: 800, fontSize: 16,
            padding: "15px 36px", borderRadius: 50,
            textDecoration: "none",
            boxShadow: "0 8px 32px rgba(245,194,0,0.35)",
          }}>
            <IconPhone size={18} strokeWidth={2.2} />
            무료 상담 신청하기
          </Link>

          {/* 안심 지표 */}
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 28, flexWrap: "wrap" }}>
            {[
              { icon: <IconShield size={14} />, text: "개인정보 안전 보호" },
              { icon: <IconClock size={14} />, text: "24시간 이내 연락" },
              { icon: <IconPhone size={14} />, text: "전문가 직접 상담" },
            ].map(item => (
              <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
                {item.icon} {item.text}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

    </div>
  );
}
