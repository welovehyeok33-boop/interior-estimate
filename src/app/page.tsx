"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

// ── 컬러 팔레트 ────────────────────────────────────────────
const Y  = "#F5C200";
const YL = "#FFFBE8";
const YM = "#FFF3B0";
const K  = "#111111";
const GY = "#F7F7F5";

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
  return (
    <div style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif", color: K, background: "#fff" }}>

      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid #EBEBEB",
      }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <Image src="/logo.png" alt="폼잇." width={36} height={31} style={{ objectFit: "contain" }} />
          </Link>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <Link href="/estimate/scan" style={{ padding: "7px 16px", color: "#555", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>견적 스캔</Link>
            <Link href="/blog" style={{ padding: "7px 16px", color: "#888", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>가이드</Link>
            <Link href="/estimate/detail" style={{
              padding: "9px 20px", borderRadius: 8,
              background: Y, color: K,
              textDecoration: "none", fontSize: 14, fontWeight: 800,
            }}>무료 견적 →</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: YL, padding: "80px 32px 72px", borderBottom: `3px solid ${Y}`, overflow: "hidden" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>

          {/* 왼쪽 텍스트 */}
          <div>
            <FadeUp>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 12, fontWeight: 700, color: "#7A6400",
                background: YM, padding: "5px 14px", borderRadius: 20, marginBottom: 28,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: Y, display: "inline-block" }} />
                AI 인테리어 견적 플랫폼
              </span>
              <h1 style={{
                fontSize: "clamp(36px, 4.2vw, 58px)",
                fontWeight: 900, lineHeight: 1.1,
                letterSpacing: "-2.5px", margin: "0 0 24px",
                color: K, wordBreak: "keep-all",
              }}>
                견적, 이제<br />직접 알아보고<br />직접 판단하세요
              </h1>
            </FadeUp>
            <FadeUp delay={0.1}>
              <p style={{ fontSize: 16, color: "#555", lineHeight: 1.8, margin: "0 0 36px", letterSpacing: "-0.3px", wordBreak: "keep-all" }}>
                AI가 자동으로 계산해드리고,<br />받은 견적서가 적정한지도 바로 분석해드려요.
              </p>
            </FadeUp>
            <FadeUp delay={0.18}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 48, alignItems: "center" }}>
                <Link href="/estimate/detail" style={{
                  padding: "16px 38px", borderRadius: 12,
                  background: Y, color: K,
                  textDecoration: "none", fontSize: 17, fontWeight: 800, letterSpacing: "-0.3px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  height: 56, boxSizing: "border-box",
                  boxShadow: `0 4px 20px rgba(245,194,0,0.45)`,
                }}>AI 자동 견적 →</Link>
                <Link href="/estimate/scan" style={{
                  padding: "16px 24px", borderRadius: 12,
                  background: "rgba(0,0,0,0.06)", color: "#555",
                  border: "1.5px solid #DDD",
                  textDecoration: "none", fontSize: 14, fontWeight: 600, letterSpacing: "-0.3px",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  height: 56, boxSizing: "border-box",
                }}>
                  📷 견적 스캔
                  <span style={{ fontSize: 9, background: "#E0E0E0", color: "#888", padding: "2px 7px", borderRadius: 20, fontWeight: 700, lineHeight: 1 }}>출시예정</span>
                </Link>
              </div>
            </FadeUp>
            <FadeStagger style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
              {[["22가지", "공종 데이터"], ["100곳+", "업체 단가"], ["30초", "견적 계산"], ["무료", "PDF 발급"]].map(([n, d]) => (
                <motion.div key={n} variants={fadeUp}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: K, letterSpacing: "-0.5px" }}>{n}</div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 3 }}>{d}</div>
                </motion.div>
              ))}
            </FadeStagger>
          </div>

          {/* 오른쪽 폰 목업 */}
          <FadeUp delay={0.25} style={{ display: "flex", justifyContent: "center" }}>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: 260,
                background: "#1A1A1A",
                borderRadius: 40,
                padding: "14px 10px",
                boxShadow: "0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.06)",
              }}
            >
              <div style={{ width: 80, height: 22, background: "#1A1A1A", borderRadius: 12, margin: "0 auto 10px", border: "2px solid #2A2A2A", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2A2A2A" }} />
                <div style={{ width: 30, height: 5, borderRadius: 3, background: "#2A2A2A" }} />
              </div>
              <div style={{ background: "#fff", borderRadius: 28, overflow: "hidden", minHeight: 500, position: "relative" }}>
                <PhoneDemo />
              </div>
            </motion.div>
          </FadeUp>

        </div>
      </section>

      {/* ── 두 가지 서비스 (핵심) ── */}
      <section style={{ background: K, padding: "96px 32px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <FadeUp>
            <div style={{ marginBottom: 48 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "1.5px", display: "block", marginBottom: 12, textTransform: "uppercase" }}>
                두 가지 핵심 서비스
              </span>
              <h2 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-1.5px", lineHeight: 1.15, wordBreak: "keep-all" }}>
                AI가 견적 문제를<br />처음부터 끝까지 해결합니다
              </h2>
            </div>
          </FadeUp>

          <FadeStagger style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16 }}>

            {/* 서비스 1: AI 자동 견적 — 메인 */}
            <motion.div variants={fadeUp} style={{
              background: Y, borderRadius: 24, padding: "48px 44px",
              display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 460,
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: -50, right: -50, width: 220, height: 220, borderRadius: "50%", background: "rgba(0,0,0,0.05)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: -30, left: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(0,0,0,0.04)", pointerEvents: "none" }} />
              <div>
                <span style={{ fontSize: 11, fontWeight: 900, color: "rgba(0,0,0,0.3)", letterSpacing: "1.5px", display: "block", marginBottom: 22 }}>
                  01 · AI 자동 견적
                </span>
                <h3 style={{ fontSize: 34, fontWeight: 900, color: K, margin: "0 0 18px", letterSpacing: "-1.5px", lineHeight: 1.12 }}>
                  공사 전에<br />먼저 알아보세요
                </h3>
                <p style={{ fontSize: 15, color: "rgba(0,0,0,0.6)", lineHeight: 1.85, margin: "0 0 32px", wordBreak: "keep-all" }}>
                  공종 선택 → 면적 입력 → 자재 등급 선택.<br />
                  30초면 항목별 예상 금액이 나오고<br />PDF로 받아 업체 미팅 때 활용하세요.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                  {[
                    "22개 공종 중 필요한 것만 선택",
                    "지역 · 자재 등급별 단가 자동 반영",
                    "항목별 견적 PDF 무료 발급",
                  ].map(t => (
                    <div key={t} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: K, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 10, color: Y, fontWeight: 900 }}>✓</span>
                      </div>
                      <span style={{ fontSize: 14, color: K, fontWeight: 600 }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Link href="/estimate/detail" style={{
                marginTop: 40, display: "inline-flex", alignItems: "center", gap: 8,
                padding: "15px 32px", borderRadius: 12,
                background: K, color: "#fff",
                textDecoration: "none", fontWeight: 800, fontSize: 15,
                alignSelf: "flex-start",
              }}>
                지금 견적 받기 →
              </Link>
            </motion.div>

            {/* 서비스 2: AI 견적 스캔 — 출시 예정 */}
            <motion.div variants={fadeUp} style={{
              background: "#1C1C1C", border: `1px solid #2A2A2A`,
              borderRadius: 24, padding: "40px 32px",
              display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 460,
              position: "relative", overflow: "hidden",
              opacity: 0.85,
            }}>
              <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(245,194,0,0.05)", pointerEvents: "none" }} />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: "rgba(255,255,255,0.25)", letterSpacing: "1.5px" }}>
                    02 · AI 견적 스캔
                  </span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#888", background: "#2A2A2A", padding: "2px 8px", borderRadius: 20, letterSpacing: "0.3px" }}>
                    출시 예정
                  </span>
                </div>
                <h3 style={{ fontSize: 26, fontWeight: 900, color: "rgba(255,255,255,0.75)", margin: "0 0 14px", letterSpacing: "-1px", lineHeight: 1.2 }}>
                  받은 견적서,<br />적정한지 확인하세요
                </h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.85, margin: "0 0 28px", wordBreak: "keep-all" }}>
                  사진 한 장으로 AI가 항목별로 적정한지 판단해요. 엑셀, PDF, 손사진 모두 가능.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    "사진 · PDF · 엑셀 어떤 형태든",
                    "공종별 시세와 비교 분석",
                    "비싼 항목 이유 설명",
                  ].map(t => (
                    <div key={t} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#2E2E2E", border: "1px solid #3A3A3A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 8, color: "#555", fontWeight: 900 }}>✓</span>
                      </div>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{
                marginTop: 36, display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 22px", borderRadius: 10,
                background: "#252525", border: "1px solid #333",
                color: "#555", fontWeight: 700, fontSize: 13,
                alignSelf: "flex-start", cursor: "default",
              }}>
                🔒 준비 중
              </div>
            </motion.div>

          </FadeStagger>
        </div>
      </section>

      {/* 견적 미리보기 */}
      <section style={{ background: "#fff", padding: "88px 32px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <FadeUp>
            <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#aaa", letterSpacing: "1px", textAlign: "center", marginBottom: 10, textTransform: "uppercase" }}>견적 예시</span>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 900, color: K, textAlign: "center", margin: "0 0 40px", letterSpacing: "-1.2px", lineHeight: 1.15 }}>
              이렇게 항목마다 보여드려요
            </h2>
          </FadeUp>
          <FadeUp delay={0.1}>
            <div style={{ border: `2px solid ${Y}`, borderRadius: 20, overflow: "hidden", boxShadow: `0 8px 40px ${Y}30` }}>
              <div style={{ background: K, padding: "22px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 5 }}>서울 강남구 · 33평 · 중급 자재</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>세부 견적서</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 5 }}>총 예상 금액</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: Y, letterSpacing: "-1px" }}>1,720만원</div>
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
                    display: "flex", alignItems: "center", gap: 16,
                    padding: "17px 28px",
                    borderBottom: i < arr.length - 1 ? "1px solid #F0F0F0" : "none",
                    background: i % 2 === 0 ? "#fff" : GY,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: "#333", marginBottom: 7 }}>{row.name}</div>
                      <div style={{ height: 5, background: "#EBEBEB", borderRadius: 3 }}>
                        <div style={{ height: 5, width: `${row.bar * 4}%`, background: Y, borderRadius: 3 }} />
                      </div>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: K, minWidth: 70, textAlign: "right" }}>{row.price}</div>
                  </motion.div>
                ))}
              </FadeStagger>
              <div style={{ padding: "16px 28px", background: YL, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#aaa" }}>자재 등급·공종 선택에 따라 ±15% 차이</span>
                <Link href="/estimate/detail" style={{
                  padding: "8px 18px", borderRadius: 8, background: Y, color: K,
                  textDecoration: "none", fontSize: 13, fontWeight: 800,
                }}>내 견적 받기 →</Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* 견적 스캔 프리뷰 */}
      <section style={{ background: GY, padding: "88px 32px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <FadeUp>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#aaa", letterSpacing: "1.5px", display: "block", marginBottom: 14, textTransform: "uppercase" }}>AI 견적 스캔</span>
            <h2 style={{ fontSize: "clamp(26px, 3.2vw, 42px)", fontWeight: 900, color: K, margin: "0 0 20px", letterSpacing: "-1.5px", lineHeight: 1.15, wordBreak: "keep-all" }}>
              "이 견적서,<br />바가지 아닌가요?"
            </h2>
            <p style={{ fontSize: 15, color: "#555", lineHeight: 1.85, margin: "0 0 32px", wordBreak: "keep-all" }}>
              업체에서 받은 견적서를 사진 한 장으로 올리면<br />
              AI가 공종별 시세와 비교해 항목마다 판단해줘요.<br />
              어느 항목이 비싸고, 왜 그런지까지 알 수 있어요.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 36 }}>
              {[
                { step: "1", text: "업체에서 받은 견적서 사진을 올려요" },
                { step: "2", text: "AI가 항목을 읽고 공종을 파악해요" },
                { step: "3", text: "내부 단가 DB와 비교해 적정성 판단" },
              ].map(s => (
                <div key={s.step} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: Y, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 900, fontSize: 13, color: K }}>
                    {s.step}
                  </div>
                  <span style={{ fontSize: 14, color: "#444", lineHeight: 1.6, fontWeight: 500, paddingTop: 4 }}>{s.text}</span>
                </div>
              ))}
            </div>
            <Link href="/estimate/scan" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 30px", borderRadius: 10,
              background: K, color: "#fff",
              textDecoration: "none", fontWeight: 800, fontSize: 15,
            }}>
              📷 견적서 분석하기 →
            </Link>
          </FadeUp>

          {/* 스캔 결과 프리뷰 카드 */}
          <FadeUp delay={0.15}>
            <ScanPreviewCard />
          </FadeUp>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: "#fff", padding: "88px 32px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <FadeUp>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 900, color: K, margin: "0 0 40px", letterSpacing: "-1.2px" }}>
              자주 묻는 질문
            </h2>
          </FadeUp>
          {[
            { q: "AI 자동 견적은 얼마나 정확한가요?", a: "100개 이상 실제 업체 시공 단가 기반으로 계산하며 ±15% 오차 범위를 가져요. 계약 전 적정가 판단 기준으로 쓰기에 충분합니다." },
            { q: "견적 스캔은 어떤 형태도 가능한가요?", a: "사진, PDF, 엑셀 파일 등 어떤 형태든 AI가 텍스트를 추출해 분석해요. 손으로 쓴 견적서도 인식 가능합니다." },
            { q: "지역에 따라 얼마나 차이 나요?", a: "서울 강남권은 기준 단가보다 약 20% 높고, 경기권은 비슷하거나 5~10% 낮아요. 지역 선택 시 자동 반영됩니다." },
            { q: "비용은 얼마인가요?", a: "AI 자동 견적과 견적 스캔 모두 무료로 제공됩니다. PDF 발급까지 무료예요." },
          ].map((item, i, arr) => (
            <FadeUp key={i} delay={i * 0.08}>
              <div style={{
                display: "grid", gridTemplateColumns: "2fr 3fr", gap: 40,
                padding: "30px 0",
                borderBottom: i < arr.length - 1 ? "1px solid #F0F0F0" : "none",
              }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{
                    fontSize: 12, fontWeight: 900, color: K,
                    background: Y, width: 24, height: 24, borderRadius: 6,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2,
                  }}>Q</span>
                  <p style={{ fontSize: 16, fontWeight: 700, color: K, margin: 0, lineHeight: 1.55, letterSpacing: "-0.3px", wordBreak: "keep-all" }}>{item.q}</p>
                </div>
                <p style={{ fontSize: 15, color: "#666", margin: 0, lineHeight: 1.9, wordBreak: "keep-all" }}>{item.a}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: K, padding: "96px 32px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <FadeUp style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: "clamp(32px, 4.5vw, 56px)", fontWeight: 900, color: "#fff", margin: "0 0 10px", letterSpacing: "-2px", lineHeight: 1.1, wordBreak: "keep-all" }}>
              지금 바로 시작하세요
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.35)", margin: "0 0 40px" }}>가입 없이 · 30초 · 완전 무료</p>
          </FadeUp>
          <FadeUp delay={0.1}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 460 }}>
              <Link href="/estimate/detail" style={{
                padding: "22px 36px", borderRadius: 16,
                background: Y, color: K,
                textDecoration: "none", fontWeight: 900, fontSize: 18,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                letterSpacing: "-0.5px",
                boxShadow: "0 6px 28px rgba(245,194,0,0.5)",
              }}>
                <div>
                  <div>AI 자동 견적 받기</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(0,0,0,0.5)", marginTop: 4 }}>공종별 금액 산출 · 항목 분류 · PDF 무료 발급</div>
                </div>
                <span style={{ fontSize: 22, marginLeft: 16 }}>→</span>
              </Link>
              <Link href="/estimate/scan" style={{
                padding: "14px 24px", borderRadius: 12,
                background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)",
                border: "1px solid rgba(255,255,255,0.08)",
                textDecoration: "none", fontWeight: 600, fontSize: 14,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                letterSpacing: "-0.2px",
              }}>
                <span>📷 AI 견적 스캔 <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>— 출시 예정</span></span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>→</span>
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* 블로그 */}
      <section style={{ background: GY, padding: "88px 32px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <FadeUp>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
              <h3 style={{ fontSize: 24, fontWeight: 900, color: K, margin: 0, letterSpacing: "-0.8px" }}>인테리어 가이드</h3>
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
                <Link href="/blog" style={{ textDecoration: "none", display: "block", background: "#fff", borderRadius: 16, border: "1px solid #E8E8E8", padding: "26px 24px" }}>
                  <span style={{
                    fontSize: 11, fontWeight: 800, color: K,
                    background: Y, padding: "3px 10px", borderRadius: 6,
                    display: "inline-block", marginBottom: 14,
                  }}>{post.tag}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: K, lineHeight: 1.55, display: "block", marginBottom: 8, letterSpacing: "-0.3px" }}>{post.title}</span>
                  <span style={{ fontSize: 13, color: "#999", lineHeight: 1.7, display: "block" }}>{post.desc}</span>
                </Link>
              </motion.div>
            ))}
          </FadeStagger>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#fff", borderTop: "1px solid #EBEBEB", padding: "32px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Image src="/logo.png" alt="폼잇." width={28} height={24} style={{ objectFit: "contain" }} />
          </div>
          <span style={{ fontSize: 12, color: "#DDD" }}>© 2026 폼잇. AI 기반 견적 플랫폼</span>
          <div style={{ display: "flex", gap: 20 }}>
            {[
              { label: "AI 자동 견적", href: "/estimate/detail" },
              { label: "AI 견적 스캔", href: "/estimate/scan" },
              { label: "가이드", href: "/blog" },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ fontSize: 13, color: "#aaa", textDecoration: "none" }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}

// ── 폰 목업 데모 (자동견적 ↔ 견적스캔 번갈아) ───────────────
type DemoScreen = "auto_select" | "auto_result" | "scan_upload" | "scan_analyze" | "scan_result";

const AUTO_WORKS = [
  { name: "철거 · 폐기물",  price: "180만원" },
  { name: "도배",           price: "210만원" },
  { name: "강마루 바닥재",  price: "360만원" },
  { name: "욕실 타일",      price: "420만원" },
  { name: "주방 싱크대",    price: "380만원" },
];

const SCAN_ITEMS = [
  { name: "철거 · 폐기물", given: "250만", range: "170~210만", status: "high" as const },
  { name: "도배",          given: "205만", range: "190~220만", status: "ok" as const },
  { name: "강마루",        given: "290만", range: "320~390만", status: "low" as const },
  { name: "욕실 타일",     given: "480만", range: "380~430만", status: "high" as const },
  { name: "전기 · 조명",  given: "170만", range: "155~195만", status: "ok" as const },
];

const STATUS_CONFIG = {
  high: { label: "비싸요", color: "#EF4444", bg: "#FEF2F2" },
  ok:   { label: "적정",   color: "#10B981", bg: "#F0FDF4" },
  low:  { label: "저렴해요", color: "#3B82F6", bg: "#EFF6FF" },
};

function PhoneDemo() {
  const [screen, setScreen] = useState<DemoScreen>("auto_select");
  const [checked, setChecked] = useState(0);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;

    if (screen === "auto_select") {
      if (checked < AUTO_WORKS.length) {
        t = setTimeout(() => setChecked(c => c + 1), 620);
      } else {
        t = setTimeout(() => setScreen("auto_result"), 1000);
      }
    } else if (screen === "auto_result") {
      t = setTimeout(() => { setScreen("scan_upload"); setChecked(0); }, 3500);
    } else if (screen === "scan_upload") {
      t = setTimeout(() => { setScreen("scan_analyze"); setAnalyzeProgress(0); }, 1400);
    } else if (screen === "scan_analyze") {
      if (analyzeProgress < 100) {
        t = setTimeout(() => setAnalyzeProgress(p => Math.min(100, p + 8)), 60);
      } else {
        t = setTimeout(() => setScreen("scan_result"), 400);
      }
    } else if (screen === "scan_result") {
      t = setTimeout(() => { setScreen("auto_select"); setChecked(0); setAnalyzeProgress(0); }, 4500);
    }

    return () => clearTimeout(t);
  }, [screen, checked, analyzeProgress]);

  const modeLabel = screen.startsWith("auto") ? "AI 자동 견적" : "AI 견적 스캔";
  const modeDot = screen.startsWith("auto") ? Y : "#60A5FA";

  return (
    <>
      {/* 앱 헤더 */}
      <div style={{ background: K, padding: "14px 16px 12px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 20, height: 20, borderRadius: 5, background: Y, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 10, fontWeight: 900, color: K }}>폼</span>
        </div>
        <motion.span
          key={modeLabel}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}
        >
          {modeLabel}
        </motion.span>
        <motion.div
          animate={{ background: modeDot }}
          style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%" }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <AnimatePresence mode="wait">

        {/* ── 자동 견적: 선택 화면 ── */}
        {screen === "auto_select" && (
          <motion.div key="auto_select"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ padding: "12px 16px 6px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 2 }}>공종을 선택하세요</div>
              <div style={{ fontSize: 9, color: "#bbb" }}>원하는 항목만 골라 견적을 받아요</div>
            </div>
            <div style={{ padding: "4px 0" }}>
              {AUTO_WORKS.map((w, i) => {
                const isChecked = i < checked;
                return (
                  <motion.div key={w.name}
                    animate={{ background: isChecked ? YL : "#fff" }}
                    transition={{ duration: 0.25 }}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: "1px solid #F5F5F5" }}
                  >
                    <motion.div
                      animate={{ background: isChecked ? Y : "#fff", borderColor: isChecked ? Y : "#DDD", scale: isChecked ? [1, 1.2, 1] : 1 }}
                      transition={{ duration: 0.25 }}
                      style={{ width: 16, height: 16, borderRadius: 4, border: "1.5px solid #DDD", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                    >
                      {isChecked && <span style={{ fontSize: 9, color: K, fontWeight: 900 }}>✓</span>}
                    </motion.div>
                    <span style={{ fontSize: 12, color: isChecked ? K : "#888", fontWeight: isChecked ? 700 : 400 }}>{w.name}</span>
                    {isChecked && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginLeft: "auto", fontSize: 11, fontWeight: 800, color: K }}>
                        {w.price}
                      </motion.span>
                    )}
                  </motion.div>
                );
              })}
            </div>
            <div style={{ padding: "10px 16px" }}>
              <motion.div
                animate={{ background: checked === AUTO_WORKS.length ? Y : "#E8E8E8" }}
                style={{ borderRadius: 10, padding: "11px", textAlign: "center", fontSize: 12, fontWeight: 800, color: K }}
              >
                {checked === AUTO_WORKS.length ? "견적 결과 보기 →" : `${checked}개 선택됨`}
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ── 자동 견적: 결과 화면 ── */}
        {screen === "auto_result" && (
          <motion.div key="auto_result"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ background: YL, padding: "14px 16px", borderBottom: `2px solid ${Y}` }}>
              <div style={{ fontSize: 10, color: "#888", marginBottom: 3 }}>총 예상 금액</div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                style={{ fontSize: 22, fontWeight: 900, color: K, letterSpacing: "-1px" }}
              >
                1,550만원
              </motion.div>
            </div>
            <div style={{ padding: "6px 0" }}>
              {AUTO_WORKS.map((w, i) => (
                <motion.div key={w.name}
                  initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  style={{ padding: "9px 16px", borderBottom: "1px solid #F5F5F5", display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ fontSize: 11, color: "#444" }}>{w.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: K }}>{w.price}</span>
                </motion.div>
              ))}
            </div>
            <div style={{ padding: "10px 16px" }}>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                style={{ background: Y, borderRadius: 10, padding: "11px", textAlign: "center", fontSize: 12, fontWeight: 800, color: K }}>
                PDF로 저장하기
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ── 견적 스캔: 업로드 화면 ── */}
        {screen === "scan_upload" && (
          <motion.div key="scan_upload"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ padding: "16px 16px 8px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 2 }}>견적서를 올려주세요</div>
              <div style={{ fontSize: 9, color: "#bbb" }}>사진 · PDF · 엑셀 모두 가능해요</div>
            </div>
            <div style={{ padding: "12px 16px" }}>
              <motion.div
                animate={{ borderColor: [Y, "#DDD", Y] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                style={{ border: "2px dashed #DDD", borderRadius: 14, padding: "32px 16px", textAlign: "center" }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>📷</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#555" }}>견적서 사진 업로드</div>
                <div style={{ fontSize: 9, color: "#aaa", marginTop: 4 }}>터치해서 선택하거나 카메라로 찍어요</div>
              </motion.div>
            </div>
            <div style={{ padding: "4px 16px" }}>
              <div style={{ background: "#F5F5F5", borderRadius: 10, padding: "11px", textAlign: "center", fontSize: 11, color: "#aaa", fontWeight: 600 }}>
                업로드 후 자동 분석
              </div>
            </div>
          </motion.div>
        )}

        {/* ── 견적 스캔: 분석 중 ── */}
        {screen === "scan_analyze" && (
          <motion.div key="scan_analyze"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ padding: "40px 16px", textAlign: "center" }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${Y}`, borderTopColor: "transparent", margin: "0 auto 16px" }}
            />
            <div style={{ fontSize: 12, fontWeight: 700, color: K, marginBottom: 6 }}>AI 분석 중...</div>
            <div style={{ fontSize: 9, color: "#aaa", marginBottom: 20 }}>공종 인식 · 단가 비교 중</div>
            <div style={{ background: "#F0F0F0", borderRadius: 4, height: 6, overflow: "hidden", margin: "0 16px" }}>
              <motion.div
                style={{ height: 6, background: Y, borderRadius: 4 }}
                animate={{ width: `${analyzeProgress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <div style={{ fontSize: 9, color: "#bbb", marginTop: 6 }}>{analyzeProgress}%</div>
          </motion.div>
        )}

        {/* ── 견적 스캔: 결과 ── */}
        {screen === "scan_result" && (
          <motion.div key="scan_result"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ padding: "10px 16px 6px", borderBottom: "1px solid #F0F0F0" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#888" }}>분석 결과</div>
              <div style={{ fontSize: 9, color: "#EF4444", fontWeight: 600, marginTop: 2 }}>2개 항목 주의 필요</div>
            </div>
            <div style={{ padding: "4px 0" }}>
              {SCAN_ITEMS.map((item, i) => {
                const cfg = STATUS_CONFIG[item.status];
                return (
                  <motion.div key={item.name}
                    initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 * i }}
                    style={{ padding: "9px 14px", borderBottom: "1px solid #F5F5F5" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: K }}>{item.name}</span>
                      <span style={{ fontSize: 9, fontWeight: 800, color: cfg.color, background: cfg.bg, padding: "1px 7px", borderRadius: 10 }}>
                        {cfg.label}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#aaa" }}>
                      <span>업체: <b style={{ color: "#555" }}>{item.given}</b></span>
                      <span>시세: {item.range}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </>
  );
}

// ── 견적 스캔 프리뷰 카드 ──────────────────────────────────
function ScanPreviewCard() {
  const items = [
    { name: "철거 · 폐기물 처리", given: "250만원", range: "170~210만원", status: "high" as const },
    { name: "도배 (합지 기준)",   given: "205만원", range: "190~220만원", status: "ok" as const },
    { name: "강마루 바닥재",      given: "290만원", range: "320~390만원", status: "low" as const },
    { name: "욕실 타일 (2칸)",   given: "480만원", range: "380~430만원", status: "high" as const },
    { name: "전기 및 조명",       given: "170만원", range: "155~195만원", status: "ok" as const },
  ];

  return (
    <div style={{ borderRadius: 20, overflow: "hidden", border: "1.5px solid #E8E8E8", boxShadow: "0 12px 40px rgba(0,0,0,0.09)" }}>
      {/* 헤더 */}
      <div style={{ background: K, padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>AI 견적 스캔 결과</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>업로드한 견적서 분석</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>주의 항목</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#EF4444" }}>2개</div>
          </div>
        </div>
      </div>

      {/* 항목별 결과 */}
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
                <span style={{ fontSize: 11, fontWeight: 800, color: cfg.color, background: cfg.bg, padding: "3px 10px", borderRadius: 20, flexShrink: 0 }}>
                  {cfg.label}
                </span>
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
                <span style={{ color: "#888" }}>업체 제시: <b style={{ color: K }}>{item.given}</b></span>
                <span style={{ color: "#888" }}>시세 범위: <b style={{ color: "#555" }}>{item.range}</b></span>
              </div>
            </div>
          </FadeUp>
        );
      })}

      {/* 하단 CTA */}
      <div style={{ padding: "16px 24px", background: YL, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#aaa" }}>결과 기반 상세 리포트 제공</span>
        <Link href="/estimate/scan" style={{
          padding: "8px 18px", borderRadius: 8, background: K, color: "#fff",
          textDecoration: "none", fontSize: 13, fontWeight: 800,
        }}>내 견적 분석하기 →</Link>
      </div>
    </div>
  );
}
