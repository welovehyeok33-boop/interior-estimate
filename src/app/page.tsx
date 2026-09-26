"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { C } from "@/components/EstimateLayout";
import HomePhoneDemo from "@/components/HomePhoneDemo";

// ── 컬러 팔레트 ────────────────────────────────────────────
const Y  = C.primary;
const YL = C.selectedBg;
const K  = C.home.ink;
const GY = C.home.stone;
// 외부 폰트 요청 없이 제목 일부에만 기기 기본 명조체를 사용한다.
const EDITORIAL_FONT = "'Iowan Old Style', 'AppleMyungjo', 'Batang', 'Noto Serif CJK KR', serif";

// ── 반응형 훅 ──────────────────────────────────────────────
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

// ── 애니메이션 ──────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.11 } } };

function FadeUp({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} transition={{ delay }} style={style}>
      {children}
    </motion.div>
  );
}
function FadeStagger({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} style={style}>
      {children}
    </motion.div>
  );
}

export default function Home() {
  const m = useIsMobile();   // m = isMobile

  return (
    <div style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif", color: K, background: C.home.paper }}>

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: C.home.nav,
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        borderBottom: `1px solid ${C.home.line}`,
      }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: m ? "0 20px" : "0 32px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <Image src="/logo.png" alt="폼잇." width={32} height={28} style={{ objectFit: "contain" }} />
          </Link>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {!m && <Link href="/estimate/scan" style={{ padding: "7px 14px", color: "#555", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>견적 스캔</Link>}
            {!m && <Link href="/blog" style={{ padding: "7px 14px", color: "#888", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>가이드</Link>}
            <Link href="/estimate" style={{
              padding: m ? "8px 16px" : "9px 20px", borderRadius: 8,
              background: Y, color: K,
              textDecoration: "none", fontSize: m ? 13 : 14, fontWeight: 800,
            }}>무료 견적 →</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ background: C.home.ivory, padding: m ? "56px 20px 60px" : "88px 32px 80px", borderBottom: `1px solid ${C.home.accentLine}`, overflow: "hidden" }}>
        <div style={{
          maxWidth: 1080, margin: "0 auto",
          display: "grid",
          gridTemplateColumns: m ? "1fr" : "1fr 1fr",
          gap: m ? 0 : 60,
          alignItems: "center",
        }}>
          {/* 텍스트 */}
          <div style={{ textAlign: m ? "center" : "left" }}>
            <FadeUp>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 12, fontWeight: 600, color: C.home.bronze, letterSpacing: "0.04em",
                background: C.home.paper, border: `1px solid ${C.home.line}`, padding: "6px 14px", borderRadius: 20, marginBottom: m ? 22 : 28,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: Y, display: "inline-block" }} />
                AI 인테리어 견적 플랫폼
              </span>
              <h1 style={{
                fontSize: m ? "clamp(34px, 9vw, 48px)" : "clamp(36px, 4.2vw, 58px)",
                fontWeight: 800, lineHeight: 1.22,
                letterSpacing: "-1.8px", margin: m ? "0 0 22px" : "0 0 28px",
                color: K, wordBreak: "keep-all",
              }}>
                <span style={{ fontFamily: EDITORIAL_FONT, fontSize: "0.94em", fontWeight: 500, letterSpacing: "-0.04em" }}>견적, 이제</span><br />직접 알아보고<br />직접 판단하세요
              </h1>
            </FadeUp>
            <FadeUp delay={0.1}>
              <p style={{ fontSize: m ? 15 : 16, color: C.home.muted, lineHeight: 1.9, margin: m ? "0 0 28px" : "0 0 36px", letterSpacing: "-0.2px", wordBreak: "keep-all" }}>
                AI가 자동으로 계산해드리고,<br />받은 견적서가 적정한지도 바로 분석해드려요.
              </p>
            </FadeUp>
            <FadeUp delay={0.18}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: m ? 36 : 48, alignItems: "center", justifyContent: m ? "center" : "flex-start" }}>
                <Link href="/estimate" style={{
                  padding: m ? "14px 28px" : "16px 38px", borderRadius: 9,
                  background: Y, color: K,
                  textDecoration: "none", fontSize: m ? 15 : 17, fontWeight: 800, letterSpacing: "-0.3px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  height: m ? 50 : 56, boxSizing: "border-box",
                  boxShadow: `0 4px 12px ${C.home.shadow}`,
                }}>AI 자동 견적 →</Link>
                <Link href="/estimate/scan" style={{
                  padding: m ? "14px 18px" : "16px 24px", borderRadius: 9,
                  background: C.home.paper, color: C.home.muted,
                  border: `1px solid ${C.home.line}`,
                  textDecoration: "none", fontSize: m ? 13 : 14, fontWeight: 600,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  height: m ? 50 : 56, boxSizing: "border-box",
                }}>
                  📷 견적 스캔
                  <span style={{ fontSize: 9, background: "#E0E0E0", color: "#888", padding: "2px 7px", borderRadius: 20, fontWeight: 700 }}>출시예정</span>
                </Link>
              </div>
            </FadeUp>
            <FadeStagger style={{ display: "flex", gap: m ? 20 : 32, flexWrap: "wrap", justifyContent: m ? "center" : "flex-start", borderTop: `1px solid ${C.home.line}`, paddingTop: 22 }}>
              {[["22가지", "공종 데이터"], ["100곳+", "업체 단가"], ["30초", "견적 계산"], ["무료", "PDF 발급"]].map(([n, d]) => (
                <motion.div key={n} variants={fadeUp}>
                  <div style={{ fontSize: m ? 18 : 22, fontWeight: 800, color: K, letterSpacing: "-0.4px" }}>{n}</div>
                  <div style={{ fontSize: 11, color: C.home.muted, marginTop: 5 }}>{d}</div>
                </motion.div>
              ))}
            </FadeStagger>
          </div>

          {/* 폰 목업 — 독립된 시연으로 실제 견적 입력 상태와 분리한다. */}
          <FadeUp delay={0.25} style={{ display: "flex", justifyContent: "center", minWidth: 0, marginTop: m ? 40 : 0 }}>
            <HomePhoneDemo />
          </FadeUp>
        </div>
      </section>

      {/* ── 두 가지 서비스 ── */}
      <section style={{ background: K, padding: m ? "64px 20px" : "96px 32px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <FadeUp>
            <div style={{ marginBottom: m ? 32 : 48 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.home.mutedOnDark, letterSpacing: "1.5px", display: "block", marginBottom: 16, textTransform: "uppercase" }}>
                두 가지 핵심 서비스
              </span>
              <h2 style={{ fontSize: m ? "clamp(24px,7vw,36px)" : "clamp(28px,3.5vw,44px)", fontWeight: 800, color: C.home.onDark, margin: 0, letterSpacing: "-1.1px", lineHeight: 1.3, wordBreak: "keep-all" }}>
                AI가 견적 문제를<br />처음부터 끝까지 해결합니다
              </h2>
            </div>
          </FadeUp>

          <FadeStagger style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "3fr 2fr", gap: 16 }}>

            {/* 서비스 1: AI 자동 견적 */}
            <motion.div variants={fadeUp} style={{
              background: C.home.service, border: `1px solid ${C.home.accentLine}`, borderRadius: 14, padding: m ? "36px 28px" : "48px 44px",
              display: "flex", flexDirection: "column", justifyContent: "space-between",
              minHeight: m ? "auto" : 460, position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: -50, right: -50, width: 220, height: 220, borderRadius: "50%", background: "rgba(0,0,0,0.05)", pointerEvents: "none" }} />
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.textMid, letterSpacing: "1.5px", display: "block", marginBottom: 20 }}>01 · AI 자동 견적</span>
                <h3 style={{ fontSize: m ? 24 : 34, fontWeight: 800, color: K, margin: m ? "0 0 16px" : "0 0 20px", letterSpacing: "-0.8px", lineHeight: 1.3 }}>
                  공사 전에<br />먼저 알아보세요
                </h3>
                <p style={{ fontSize: m ? 14 : 15, color: "rgba(0,0,0,0.6)", lineHeight: 1.85, margin: m ? "0 0 24px" : "0 0 32px", wordBreak: "keep-all" }}>
                  공종 선택 → 면적 입력 → 자재 등급 선택.<br />
                  30초면 항목별 예상 금액이 나오고<br />PDF로 받아 업체 미팅 때 활용하세요.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {["22개 공종 중 필요한 것만 선택", "지역 · 자재 등급별 단가 자동 반영", "항목별 견적 PDF 무료 발급"].map(t => (
                    <div key={t} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: K, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 9, color: Y, fontWeight: 900 }}>✓</span>
                      </div>
                      <span style={{ fontSize: m ? 13 : 14, color: K, fontWeight: 600 }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Link href="/estimate" style={{
                marginTop: m ? 28 : 40,
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: m ? "13px 24px" : "15px 32px", borderRadius: 12,
                background: K, color: "#fff",
                textDecoration: "none", fontWeight: 800, fontSize: m ? 14 : 15,
                alignSelf: "flex-start",
              }}>
                지금 견적 받기 →
              </Link>
            </motion.div>

            {/* 서비스 2: AI 견적 스캔 — 출시 예정 */}
            <motion.div variants={fadeUp} style={{
              background: C.home.darkCard, border: `1px solid ${C.home.darkLine}`,
              borderRadius: 14, padding: m ? "32px 28px" : "40px 32px",
              display: "flex", flexDirection: "column", justifyContent: "space-between",
              minHeight: m ? "auto" : 460, position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(245,194,0,0.05)", pointerEvents: "none" }} />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.home.mutedOnDark, letterSpacing: "1.5px" }}>02 · AI 견적 스캔</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#888", background: "#2A2A2A", padding: "2px 8px", borderRadius: 20 }}>출시 예정</span>
                </div>
                <h3 style={{ fontSize: m ? 22 : 26, fontWeight: 800, color: C.home.onDark, margin: m ? "0 0 14px" : "0 0 18px", letterSpacing: "-0.8px", lineHeight: 1.3 }}>
                  받은 견적서,<br />적정한지 확인하세요
                </h3>
                <p style={{ fontSize: 13, color: C.home.mutedOnDark, lineHeight: 1.85, margin: m ? "0 0 20px" : "0 0 28px", wordBreak: "keep-all" }}>
                  사진 한 장으로 AI가 항목별로 적정한지 판단해요. 엑셀, PDF, 손사진 모두 가능.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {["사진 · PDF · 엑셀 어떤 형태든", "공종별 시세와 비교 분석", "비싼 항목 이유 설명"].map(t => (
                    <div key={t} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#2E2E2E", border: "1px solid #3A3A3A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 8, color: "#555", fontWeight: 900 }}>✓</span>
                      </div>
                      <span style={{ fontSize: 12, color: C.home.mutedOnDark, fontWeight: 500 }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{
                marginTop: m ? 24 : 36,
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 22px", borderRadius: 10,
                background: "#252525", border: "1px solid #333",
                color: "#555", fontWeight: 700, fontSize: 13,
                alignSelf: "flex-start", cursor: "default",
              }}>🔒 준비 중</div>
            </motion.div>

          </FadeStagger>
        </div>
      </section>

      {/* ── 견적 미리보기 ── */}
      <section style={{ background: C.home.paper, padding: m ? "68px 20px" : "96px 32px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <FadeUp>
            <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.home.bronze, letterSpacing: "1.5px", textAlign: "center", marginBottom: 14, textTransform: "uppercase" }}>견적 예시</span>
            <h2 style={{ fontSize: m ? "clamp(22px,7vw,32px)" : "clamp(26px,3.5vw,40px)", fontWeight: 800, color: K, textAlign: "center", margin: "0 0 36px", letterSpacing: "-0.9px", lineHeight: 1.3 }}>
              이렇게 항목마다 보여드려요
            </h2>
          </FadeUp>
          <FadeUp delay={0.1}>
            <div style={{ border: `1px solid ${C.home.line}`, borderRadius: 14, overflow: "hidden", boxShadow: `0 8px 28px ${C.home.shadow}` }}>
              <div style={{ background: K, padding: m ? "18px 20px" : "22px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>서울 강남구 · 33평 · 중급 자재</div>
                  <div style={{ fontSize: m ? 13 : 15, fontWeight: 700, color: "#fff" }}>세부 견적서</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>총 예상 금액</div>
                  <div style={{ fontSize: m ? 22 : 28, fontWeight: 900, color: Y, letterSpacing: "-1px" }}>1,720만원</div>
                </div>
              </div>
              <FadeStagger>
                {[
                  { name: "철거 및 폐기물 처리", price: "180만원", bar: 10 },
                  { name: "도배 (합지 기준)",     price: "210만원", bar: 12 },
                  { name: "강마루 바닥재",        price: "360만원", bar: 21 },
                  { name: "욕실 타일 (2칸)",      price: "420만원", bar: 24 },
                  { name: "주방 싱크대",          price: "380만원", bar: 22 },
                  { name: "전기 및 조명",         price: "170만원", bar: 10 },
                ].map((row, i, arr) => (
                  <motion.div key={i} variants={fadeUp} style={{
                    display: "flex", alignItems: "center", gap: m ? 10 : 16,
                    padding: m ? "14px 20px" : "17px 28px",
                    borderBottom: i < arr.length - 1 ? "1px solid #F0F0F0" : "none",
                    background: i % 2 === 0 ? "#fff" : GY,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: m ? 13 : 14, color: "#333", marginBottom: 6 }}>{row.name}</div>
                      <div style={{ height: 4, background: "#EBEBEB", borderRadius: 3 }}>
                        <div style={{ height: 4, width: `${row.bar * 4}%`, background: Y, borderRadius: 3 }} />
                      </div>
                    </div>
                    <div style={{ fontSize: m ? 13 : 15, fontWeight: 800, color: K, minWidth: 60, textAlign: "right" }}>{row.price}</div>
                  </motion.div>
                ))}
              </FadeStagger>
              <div style={{ padding: m ? "14px 20px" : "16px 28px", background: YL, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <span style={{ fontSize: 12, color: C.home.muted }}>자재 등급·공종 선택에 따라 ±15% 차이</span>
                <Link href="/estimate" style={{
                  padding: "8px 16px", borderRadius: 8, background: Y, color: K,
                  textDecoration: "none", fontSize: 13, fontWeight: 800,
                }}>내 견적 받기 →</Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── 견적 스캔 프리뷰 ── */}
      <section style={{ background: GY, padding: m ? "64px 20px" : "88px 32px" }}>
        <div style={{
          maxWidth: 1080, margin: "0 auto",
          display: "grid",
          gridTemplateColumns: m ? "1fr" : "1fr 1fr",
          gap: m ? 40 : 60,
          alignItems: "center",
        }}>
          <FadeUp>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.home.bronze, letterSpacing: "1.5px", display: "block", marginBottom: 16, textTransform: "uppercase" }}>AI 견적 스캔</span>
            <h2 style={{ fontSize: m ? "clamp(22px,7vw,32px)" : "clamp(26px,3.2vw,42px)", fontWeight: 800, color: K, margin: "0 0 22px", letterSpacing: "-1px", lineHeight: 1.3, wordBreak: "keep-all" }}>
              &quot;이 견적서,<br />바가지 아닌가요?&quot;
            </h2>
            <p style={{ fontSize: m ? 14 : 15, color: "#555", lineHeight: 1.85, margin: "0 0 28px", wordBreak: "keep-all" }}>
              업체에서 받은 견적서를 사진 한 장으로 올리면<br />
              AI가 공종별 시세와 비교해 항목마다 판단해줘요.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
              {[
                { step: "1", text: "업체에서 받은 견적서 사진을 올려요" },
                { step: "2", text: "AI가 항목을 읽고 공종을 파악해요" },
                { step: "3", text: "내부 단가 DB와 비교해 적정성 판단" },
              ].map(s => (
                <div key={s.step} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: Y, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 900, fontSize: 12, color: K }}>
                    {s.step}
                  </div>
                  <span style={{ fontSize: 14, color: "#444", lineHeight: 1.6, fontWeight: 500, paddingTop: 3 }}>{s.text}</span>
                </div>
              ))}
            </div>
            <Link href="/estimate/scan" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "13px 26px", borderRadius: 10,
              background: K, color: "#fff",
              textDecoration: "none", fontWeight: 800, fontSize: 14,
            }}>
              📷 견적서 분석하기 →
            </Link>
          </FadeUp>
          <FadeUp delay={m ? 0 : 0.15}>
            <ScanPreviewCard />
          </FadeUp>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ background: C.home.paper, padding: m ? "68px 20px" : "96px 32px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <FadeUp>
            <h2 style={{ fontSize: m ? "clamp(22px,7vw,32px)" : "clamp(26px,3.5vw,40px)", fontWeight: 800, color: K, margin: "0 0 36px", letterSpacing: "-0.9px" }}>
              자주 묻는 질문
            </h2>
          </FadeUp>
          {[
            { q: "AI 자동 견적은 얼마나 정확한가요?", a: "100개 이상 실제 업체 시공 단가 기반으로 계산하며 ±15% 오차 범위를 가져요. 계약 전 적정가 판단 기준으로 쓰기에 충분합니다." },
            { q: "견적 스캔은 어떤 형태도 가능한가요?", a: "사진, PDF, 엑셀 파일 등 어떤 형태든 AI가 텍스트를 추출해 분석해요. 손으로 쓴 견적서도 인식 가능합니다." },
            { q: "지역에 따라 얼마나 차이 나요?", a: "서울 강남권은 기준 단가보다 약 20% 높고, 경기권은 비슷하거나 5~10% 낮아요. 지역 선택 시 자동 반영됩니다." },
            { q: "비용은 얼마인가요?", a: "AI 자동 견적과 견적 스캔 모두 무료로 제공됩니다. PDF 발급까지 무료예요." },
          ].map((item, i, arr) => (
            <FadeUp key={i} delay={i * 0.06}>
              <div style={{
                display: "grid",
                gridTemplateColumns: m ? "1fr" : "2fr 3fr",
                gap: m ? 10 : 40,
                padding: m ? "24px 0" : "30px 0",
                borderBottom: i < arr.length - 1 ? `1px solid ${C.home.line}` : "none",
              }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{
                    fontSize: 12, fontWeight: 900, color: K,
                    background: Y, width: 24, height: 24, borderRadius: 6,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1,
                  }}>Q</span>
                  <p style={{ fontSize: m ? 15 : 16, fontWeight: 700, color: K, margin: 0, lineHeight: 1.55, letterSpacing: "-0.3px", wordBreak: "keep-all" }}>{item.q}</p>
                </div>
                <p style={{ fontSize: m ? 14 : 15, color: "#666", margin: m ? "0 0 0 36px" : 0, lineHeight: 1.9, wordBreak: "keep-all" }}>{item.a}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: K, padding: m ? "64px 20px" : "96px 32px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <FadeUp style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: m ? "clamp(28px,8vw,44px)" : "clamp(32px,4.5vw,56px)", fontWeight: 800, color: C.home.onDark, margin: "0 0 16px", letterSpacing: "-1.3px", lineHeight: 1.25, wordBreak: "keep-all" }}>
              지금 바로 시작하세요
            </h2>
            <p style={{ fontSize: m ? 14 : 16, color: C.home.mutedOnDark, margin: "0 0 36px" }}>가입 없이 · 30초 · 완전 무료</p>
          </FadeUp>
          <FadeUp delay={0.1}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: m ? "100%" : 460 }}>
              <Link href="/estimate" style={{
                padding: m ? "18px 24px" : "22px 36px", borderRadius: 10,
                background: Y, color: K,
                textDecoration: "none", fontWeight: 900, fontSize: m ? 16 : 18,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                letterSpacing: "-0.5px",
                boxShadow: `0 6px 20px ${C.home.shadow}`,
              }}>
                <div>
                  <div>AI 자동 견적 받기</div>
                  <div style={{ fontSize: m ? 11 : 12, fontWeight: 500, color: "rgba(0,0,0,0.5)", marginTop: 4 }}>공종별 금액 산출 · 항목 분류 · PDF 무료 발급</div>
                </div>
                <span style={{ fontSize: m ? 18 : 22, marginLeft: 12 }}>→</span>
              </Link>
              <Link href="/estimate/scan" style={{
                padding: m ? "13px 20px" : "14px 24px", borderRadius: 12,
                background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)",
                border: "1px solid rgba(255,255,255,0.08)",
                textDecoration: "none", fontWeight: 600, fontSize: m ? 13 : 14,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span>📷 AI 견적 스캔 <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>— 출시 예정</span></span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>→</span>
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── 블로그 ── */}
      <section style={{ background: GY, padding: m ? "64px 20px" : "88px 32px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <FadeUp>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
              <h3 style={{ fontSize: m ? 20 : 24, fontWeight: 800, color: K, margin: 0, letterSpacing: "-0.6px" }}>인테리어 가이드</h3>
              <Link href="/blog" style={{ fontSize: 14, color: "#666", textDecoration: "none", fontWeight: 600 }}>전체 보기 →</Link>
            </div>
          </FadeUp>
          <FadeStagger style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
            {[
              { title: "32평 인테리어, 현실적인 비용은?",  tag: "견적 상식",  desc: "풀옵션 기준 1,400~2,800만원 — 자재 등급에 따라 이렇게 달라져요." },
              { title: "도배 합지 vs 실크, 뭐가 나을까요?", tag: "자재 가이드", desc: "가격 차이는 크고, 내구성은 생각보다 비슷해요." },
              { title: "욕실 타일 업체 고르는 요령",       tag: "업체 선택",  desc: "면적 단가가 비슷해도 시공 방식이 달라서 결과가 많이 달라요." },
            ].map(post => (
              <motion.div key={post.title} variants={fadeUp}>
                <Link href="/blog" style={{ textDecoration: "none", display: "block", background: C.home.paper, borderRadius: 10, border: `1px solid ${C.home.line}`, padding: "26px 24px" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: K, background: Y, padding: "3px 10px", borderRadius: 6, display: "inline-block", marginBottom: 12 }}>{post.tag}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: K, lineHeight: 1.55, display: "block", marginBottom: 8, letterSpacing: "-0.3px" }}>{post.title}</span>
                  <span style={{ fontSize: 13, color: C.home.muted, lineHeight: 1.8, display: "block" }}>{post.desc}</span>
                </Link>
              </motion.div>
            ))}
          </FadeStagger>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: C.home.paper, borderTop: `1px solid ${C.home.line}`, padding: m ? "28px 20px" : "32px" }}>
        <div style={{
          maxWidth: 1080, margin: "0 auto",
          display: "flex",
          flexDirection: m ? "column" : "row",
          justifyContent: "space-between", alignItems: m ? "flex-start" : "center",
          gap: m ? 16 : 12,
        }}>
          <Image src="/logo.png" alt="폼잇." width={28} height={24} style={{ objectFit: "contain" }} />
          <span style={{ fontSize: 12, color: C.home.muted, order: m ? 3 : 0 }}>© 2026 폼잇. AI 기반 견적 플랫폼</span>
          <div style={{ display: "flex", gap: 20 }}>
            {[{ label: "AI 자동 견적", href: "/estimate" }, { label: "AI 견적 스캔", href: "/estimate/scan" }, { label: "가이드", href: "/blog" }].map(l => (
              <Link key={l.href} href={l.href} style={{ fontSize: 13, color: C.home.muted, textDecoration: "none" }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}

const STATUS_CONFIG = {
  high: { label: "비싸요",   color: "#EF4444", bg: "#FEF2F2" },
  ok:   { label: "적정",     color: "#10B981", bg: "#F0FDF4" },
  low:  { label: "저렴해요", color: "#3B82F6", bg: "#EFF6FF" },
};

// ── 견적 스캔 프리뷰 카드 ──────────────────────────────────
function ScanPreviewCard() {
  const items = [
    { name: "철거 · 폐기물 처리", given: "250만원", range: "170~210만원", status: "high" as const },
    { name: "도배 (합지 기준)",   given: "205만원", range: "190~220만원", status: "ok"   as const },
    { name: "강마루 바닥재",      given: "290만원", range: "320~390만원", status: "low"  as const },
    { name: "욕실 타일 (2칸)",    given: "480만원", range: "380~430만원", status: "high" as const },
    { name: "전기 및 조명",       given: "170만원", range: "155~195만원", status: "ok"   as const },
  ];

  return (
    <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${C.home.line}`, boxShadow: `0 8px 28px ${C.home.shadow}` }}>
      <div style={{ background: K, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>AI 견적 스캔 결과</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>업로드한 견적서 분석</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>주의 항목</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#EF4444" }}>2개</div>
        </div>
      </div>
      {items.map((item, i) => {
        const cfg = STATUS_CONFIG[item.status];
        return (
          <FadeUp key={i} delay={i * 0.07}>
            <div style={{
              padding: "16px 24px",
              borderBottom: i < items.length - 1 ? "1px solid #F0F0F0" : "none",
              background: i % 2 === 0 ? "#fff" : GY,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: K }}>{item.name}</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: cfg.color, background: cfg.bg, padding: "3px 10px", borderRadius: 20, flexShrink: 0 }}>{cfg.label}</span>
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: 12, flexWrap: "wrap" }}>
                <span style={{ color: "#888" }}>업체 제시: <b style={{ color: K }}>{item.given}</b></span>
                <span style={{ color: "#888" }}>시세 범위: <b style={{ color: "#555" }}>{item.range}</b></span>
              </div>
            </div>
          </FadeUp>
        );
      })}
      <div style={{ padding: "16px 24px", background: YL, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <span style={{ fontSize: 12, color: "#aaa" }}>결과 기반 상세 리포트 제공</span>
        <Link href="/estimate/scan" style={{ padding: "8px 18px", borderRadius: 8, background: K, color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 800 }}>
          내 견적 분석하기 →
        </Link>
      </div>
    </div>
  );
}
