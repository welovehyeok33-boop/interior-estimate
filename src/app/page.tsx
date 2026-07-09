"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

// ── 컬러 팔레트 ────────────────────────────────────────────
const Y  = "#F5C200";   // 디월트 옐로우 (포인트)
const YL = "#FFFBE8";   // 연한 옐로우 (배경)
const YM = "#FFF3B0";   // 중간 옐로우 (배지, 태그)
const K  = "#111111";   // 블랙 (텍스트, CTA)
const GY = "#F7F7F5";   // 밝은 회색 배경

// ── 애니메이션 ──────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
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
            <Image src="/logo.png" alt="폼잇." width={26} height={26} style={{ borderRadius: 6 }} />
            <span style={{ fontWeight: 900, fontSize: 16, color: K, letterSpacing: "-0.5px" }}>폼잇.</span>
          </Link>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
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
                fontSize: "clamp(38px, 4.5vw, 62px)",
                fontWeight: 900, lineHeight: 1.1,
                letterSpacing: "-2.5px", margin: "0 0 24px",
                color: K, wordBreak: "keep-all",
              }}>
                인테리어 견적,<br />이제 직접<br />알아보세요
              </h1>
            </FadeUp>
            <FadeUp delay={0.1}>
              <p style={{ fontSize: 16, color: "#555", lineHeight: 1.8, margin: "0 0 36px", letterSpacing: "-0.3px", wordBreak: "keep-all" }}>
                업체 부르기 전에 먼저 확인하세요.<br />100개 업체 단가 기반, 30초면 됩니다.
              </p>
            </FadeUp>
            <FadeUp delay={0.18}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 48 }}>
                <Link href="/estimate/detail" style={{
                  padding: "14px 30px", borderRadius: 10,
                  background: K, color: "#fff",
                  textDecoration: "none", fontSize: 15, fontWeight: 800, letterSpacing: "-0.3px",
                }}>세부 견적 받기</Link>
                <Link href="/estimate/simple" style={{
                  padding: "14px 26px", borderRadius: 10,
                  background: "#fff", color: K, border: "1.5px solid #DDD",
                  textDecoration: "none", fontSize: 15, fontWeight: 600, letterSpacing: "-0.3px",
                }}>간단 견적 (1분)</Link>
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
              {/* 노치 */}
              <div style={{ width: 80, height: 22, background: "#1A1A1A", borderRadius: 12, margin: "0 auto 10px", border: "2px solid #2A2A2A", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2A2A2A" }} />
                <div style={{ width: 30, height: 5, borderRadius: 3, background: "#2A2A2A" }} />
              </div>

              {/* 화면 */}
              <div style={{ background: "#fff", borderRadius: 28, overflow: "hidden", minHeight: 500, position: "relative" }}>
                <PhoneDemo />
              </div>
            </motion.div>
          </FadeUp>

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

      {/* 두 가지 방법 */}
      <section style={{ background: GY, padding: "88px 32px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <FadeUp>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 900, color: K, margin: "0 0 40px", letterSpacing: "-1.2px" }}>
              두 가지 방법이 있어요
            </h2>
          </FadeUp>
          <FadeStagger style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            <motion.div variants={fadeUp} style={{
              background: "#fff", border: `2px solid ${Y}`,
              borderRadius: 20, padding: "40px 36px",
              display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 300,
            }}>
              <div>
                <div style={{ display: "inline-block", background: Y, color: K, fontSize: 10, fontWeight: 900, letterSpacing: "1px", padding: "4px 10px", borderRadius: 6, marginBottom: 20 }}>DETAIL · 정확하게</div>
                <h3 style={{ fontSize: 26, fontWeight: 900, color: K, margin: "0 0 14px", letterSpacing: "-1px" }}>세부 견적</h3>
                <p style={{ fontSize: 14, color: "#666", lineHeight: 1.8, margin: 0, wordBreak: "keep-all" }}>
                  22개 공종 중 원하는 것만 골라서 항목별 금액을 확인해요. PDF로 저장해서 업체 미팅 때 활용하세요.
                </p>
              </div>
              <Link href="/estimate/detail" style={{
                marginTop: 36, display: "inline-block",
                padding: "13px 26px", borderRadius: 10,
                background: Y, color: K,
                textDecoration: "none", fontWeight: 800, fontSize: 14,
                alignSelf: "flex-start",
              }}>시작하기 →</Link>
            </motion.div>

            <motion.div variants={fadeUp} style={{
              background: "#fff", border: "2px solid #E8E8E8",
              borderRadius: 20, padding: "40px 36px",
              display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 300,
            }}>
              <div>
                <div style={{ display: "inline-block", background: GY, color: "#888", fontSize: 10, fontWeight: 900, letterSpacing: "1px", padding: "4px 10px", borderRadius: 6, marginBottom: 20 }}>SIMPLE · 빠르게</div>
                <h3 style={{ fontSize: 26, fontWeight: 900, color: K, margin: "0 0 14px", letterSpacing: "-1px" }}>간단 견적</h3>
                <p style={{ fontSize: 14, color: "#666", lineHeight: 1.8, margin: 0, wordBreak: "keep-all" }}>
                  평수와 지역만 입력하면 1분 안에 전체 예상 금액을 바로 확인할 수 있어요.
                </p>
              </div>
              <Link href="/estimate/simple" style={{
                marginTop: 36, display: "inline-block",
                padding: "13px 26px", borderRadius: 10,
                background: K, color: "#fff",
                textDecoration: "none", fontWeight: 800, fontSize: 14,
                alignSelf: "flex-start",
              }}>시작하기 →</Link>
            </motion.div>
          </FadeStagger>
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
            { q: "업체마다 견적이 왜 다 달라요?", a: "단가 기준이 업체마다 달라서예요. 폼잇.은 100개 이상 업체 단가 평균으로 계산해서 적정 시장가를 확인하는 기준으로 쓰기 좋아요." },
            { q: "32평 풀옵션이면 대략 얼마예요?", a: "중급 자재 기준 1,400~2,800만원 사이예요. 공종과 자재 등급에 따라 달라지니 세부 견적으로 직접 확인해보세요." },
            { q: "정확하지 않아도 괜찮나요?", a: "±15% 오차 범위가 있어요. 업체 계약 전 '이 금액이 적정한가' 판단하는 용도로 쓰기에 충분해요." },
            { q: "지역에 따라 얼마나 차이 나요?", a: "서울 강남권은 기준 단가보다 약 20% 높고, 경기권은 비슷하거나 5~10% 낮아요. 지역 선택 시 자동 반영돼요." },
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
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 32 }}>
          <FadeUp>
            <h2 style={{ fontSize: "clamp(32px, 4.5vw, 56px)", fontWeight: 900, color: "#fff", margin: "0 0 10px", letterSpacing: "-2px", lineHeight: 1.1, wordBreak: "keep-all" }}>
              지금 바로<br />확인해보세요
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.35)", margin: 0 }}>가입 없이 · 30초 · 완전 무료</p>
          </FadeUp>
          <FadeUp delay={0.15}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/estimate/detail" style={{
                padding: "16px 36px", borderRadius: 10,
                background: Y, color: K,
                textDecoration: "none", fontSize: 15, fontWeight: 800, letterSpacing: "-0.3px",
              }}>세부 견적 받기</Link>
              <Link href="/estimate/simple" style={{
                padding: "16px 28px", borderRadius: 10,
                background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(255,255,255,0.12)",
                textDecoration: "none", fontSize: 15, fontWeight: 600, letterSpacing: "-0.3px",
              }}>간단 견적</Link>
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
            <Image src="/logo.png" alt="폼잇." width={20} height={20} style={{ borderRadius: 5 }} />
            <span style={{ fontWeight: 900, color: K, fontSize: 14 }}>폼잇.</span>
          </div>
          <span style={{ fontSize: 12, color: "#DDD" }}>© 2026 폼잇. AI 기반 자동 견적 플랫폼</span>
          <div style={{ display: "flex", gap: 20 }}>
            {[{ label: "세부견적", href: "/estimate/detail" }, { label: "간단견적", href: "/estimate/simple" }, { label: "가이드", href: "/blog" }].map(l => (
              <Link key={l.href} href={l.href} style={{ fontSize: 13, color: "#aaa", textDecoration: "none" }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}

// ── 폰 목업 내부 데모 ─────────────────────────────────────
const WORKS = [
  { name: "철거 · 폐기물",  price: "180만원" },
  { name: "도배",           price: "210만원" },
  { name: "강마루 바닥재",  price: "360만원" },
  { name: "욕실 타일",      price: "420만원" },
  { name: "주방 싱크대",    price: "380만원" },
  { name: "전기 · 조명",   price: "170만원" },
];

function PhoneDemo() {
  // screen: "select" → "result"
  const [screen, setScreen] = useState<"select" | "result">("select");
  // 체크된 항목 수 (0→6 순서대로 하나씩)
  const [checked, setChecked] = useState(0);

  useEffect(() => {
    if (screen === "select") {
      if (checked < WORKS.length) {
        const t = setTimeout(() => setChecked(c => c + 1), 600);
        return () => clearTimeout(t);
      } else {
        // 전부 체크 후 1.2초 뒤 결과 화면으로
        const t = setTimeout(() => setScreen("result"), 1200);
        return () => clearTimeout(t);
      }
    } else {
      // 결과 화면 3초 후 처음으로 리셋
      const t = setTimeout(() => { setScreen("select"); setChecked(0); }, 4000);
      return () => clearTimeout(t);
    }
  }, [screen, checked]);

  return (
    <>
      {/* 앱 헤더 */}
      <div style={{ background: K, padding: "14px 16px 12px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 20, height: 20, borderRadius: 5, background: Y, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 10, fontWeight: 900, color: K }}>폼</span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>폼잇. 세부 견적</span>
        <div style={{ marginLeft: "auto", fontSize: 9, color: "rgba(255,255,255,0.35)" }}>강남 · 33평</div>
      </div>

      <AnimatePresence mode="wait">

        {/* ── 공종 선택 화면 ── */}
        {screen === "select" && (
          <motion.div
            key="select"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
          >
            <div style={{ padding: "12px 16px 6px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 2 }}>공종을 선택하세요</div>
              <div style={{ fontSize: 9, color: "#bbb" }}>원하는 항목만 골라 견적을 받을 수 있어요</div>
            </div>
            <div style={{ padding: "6px 0" }}>
              {WORKS.map((w, i) => {
                const isChecked = i < checked;
                return (
                  <motion.div
                    key={w.name}
                    initial={false}
                    animate={{ background: isChecked ? YL : "#fff" }}
                    transition={{ duration: 0.25 }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 16px",
                      borderBottom: "1px solid #F5F5F5",
                    }}
                  >
                    {/* 체크박스 */}
                    <motion.div
                      animate={{
                        background: isChecked ? Y : "#fff",
                        borderColor: isChecked ? Y : "#DDD",
                        scale: isChecked ? [1, 1.2, 1] : 1,
                      }}
                      transition={{ duration: 0.25 }}
                      style={{
                        width: 16, height: 16, borderRadius: 4, border: "1.5px solid #DDD",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}
                    >
                      {isChecked && <span style={{ fontSize: 9, color: K, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                    </motion.div>
                    <span style={{ fontSize: 12, color: isChecked ? K : "#888", fontWeight: isChecked ? 700 : 400 }}>{w.name}</span>
                    {isChecked && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ marginLeft: "auto", fontSize: 11, fontWeight: 800, color: K }}
                      >
                        {w.price}
                      </motion.span>
                    )}
                  </motion.div>
                );
              })}
            </div>
            {/* 견적 받기 버튼 */}
            <div style={{ padding: "10px 16px" }}>
              <motion.div
                animate={{ background: checked === WORKS.length ? Y : "#E8E8E8" }}
                transition={{ duration: 0.3 }}
                style={{ borderRadius: 10, padding: "11px", textAlign: "center", fontSize: 12, fontWeight: 800, color: K }}
              >
                {checked === WORKS.length ? "견적 결과 보기 →" : `${checked}개 선택됨`}
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ── 결과 화면 ── */}
        {screen === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
          >
            {/* 총금액 */}
            <div style={{ background: YL, padding: "14px 16px", borderBottom: `2px solid ${Y}` }}>
              <div style={{ fontSize: 10, color: "#888", marginBottom: 3 }}>총 예상 금액</div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                style={{ fontSize: 22, fontWeight: 900, color: K, letterSpacing: "-1px" }}
              >
                1,720만원
              </motion.div>
            </div>
            {/* 항목별 바 */}
            <div style={{ padding: "8px 0" }}>
              {[
                { name: "철거·폐기물", price: "180만", bar: 10 },
                { name: "도배",        price: "210만", bar: 12 },
                { name: "강마루",      price: "360만", bar: 21 },
                { name: "욕실 타일",   price: "420만", bar: 24 },
                { name: "주방 싱크대", price: "380만", bar: 22 },
                { name: "전기·조명",  price: "170만", bar: 10 },
              ].map((row, i) => (
                <motion.div
                  key={row.name}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  style={{ padding: "8px 16px", borderBottom: "1px solid #F5F5F5" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: "#444" }}>{row.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, color: K }}>{row.price}</span>
                  </div>
                  <div style={{ height: 3, background: "#EEE", borderRadius: 2 }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${row.bar * 4}%` }}
                      transition={{ delay: 0.2 + i * 0.07, duration: 0.5, ease: "easeOut" }}
                      style={{ height: 3, background: Y, borderRadius: 2 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
            {/* PDF 버튼 */}
            <div style={{ padding: "10px 16px" }}>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                style={{ background: Y, borderRadius: 10, padding: "11px", textAlign: "center", fontSize: 12, fontWeight: 800, color: K }}
              >
                PDF로 저장하기
              </motion.div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </>
  );
}
