"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

function FadeUp({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

function FadeStagger({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  return (
    <div style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif", color: "#111", background: "#fff" }}>

      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid #eee",
      }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <Image src="/logo.png" alt="폼잇." width={26} height={26} style={{ borderRadius: 6 }} />
            <span style={{ fontWeight: 800, fontSize: 16, color: "#111", letterSpacing: "-0.5px" }}>폼잇.</span>
          </Link>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <Link href="/blog" style={{ padding: "7px 16px", color: "#666", textDecoration: "none", fontSize: 14, fontWeight: 500, borderRadius: 8 }}>가이드</Link>
            <Link href="/estimate/detail" style={{
              padding: "9px 20px", borderRadius: 8,
              background: "#111", color: "#fff",
              textDecoration: "none", fontSize: 14, fontWeight: 600,
              letterSpacing: "-0.2px",
            }}>무료 견적 →</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: "#FAFAF8", padding: "88px 32px 72px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", textAlign: "center" }}>
          <FadeUp>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#888", letterSpacing: "0.5px", marginBottom: 20, textTransform: "uppercase" }}>
              AI 인테리어 견적 플랫폼
            </p>
            <h1 style={{
              fontSize: "clamp(44px, 6.5vw, 76px)",
              fontWeight: 900, lineHeight: 1.1,
              letterSpacing: "-2.5px", margin: "0 0 24px",
              color: "#111", wordBreak: "keep-all",
            }}>
              인테리어 견적,<br />이제 직접 알아보세요
            </h1>
          </FadeUp>
          <FadeUp delay={0.1}>
            <p style={{ fontSize: 18, color: "#666", lineHeight: 1.75, margin: "0 auto 40px", maxWidth: 480, letterSpacing: "-0.3px", wordBreak: "keep-all" }}>
              업체 부르기 전에 먼저 확인하세요.<br />100개 업체 단가 기반, 30초면 됩니다.
            </p>
          </FadeUp>
          <FadeUp delay={0.2}>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
              <Link href="/estimate/detail" style={{
                padding: "16px 36px", borderRadius: 12,
                background: "#111", color: "#fff",
                textDecoration: "none", fontSize: 16, fontWeight: 700, letterSpacing: "-0.3px",
              }}>세부 견적 받기</Link>
              <Link href="/estimate/simple" style={{
                padding: "16px 30px", borderRadius: 12,
                background: "#fff", color: "#111", border: "1.5px solid #ddd",
                textDecoration: "none", fontSize: 16, fontWeight: 600, letterSpacing: "-0.3px",
              }}>간단 견적 (1분)</Link>
            </div>
          </FadeUp>
          <FadeStagger style={{ display: "flex", gap: 32, justifyContent: "center", flexWrap: "wrap" }}>
            {[["22가지", "공종 데이터"], ["100곳+", "업체 단가"], ["30초", "견적 계산"], ["무료", "PDF 발급"]].map(([n, d]) => (
              <motion.div key={n} variants={fadeUp} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#111", letterSpacing: "-0.5px" }}>{n}</div>
                <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>{d}</div>
              </motion.div>
            ))}
          </FadeStagger>
        </div>
      </section>

      {/* 견적 미리보기 */}
      <section style={{ background: "#fff", padding: "80px 32px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <FadeUp>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#aaa", letterSpacing: "1px", textAlign: "center", marginBottom: 12, textTransform: "uppercase" }}>견적 예시</p>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 800, color: "#111", textAlign: "center", margin: "0 0 40px", letterSpacing: "-1px", lineHeight: 1.2 }}>
              이렇게 항목마다 보여드려요
            </h2>
          </FadeUp>
          <FadeUp delay={0.1}>
            <div style={{ border: "1px solid #e8e8e8", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ background: "#111", padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>서울 강남구 · 33평 · 중급 자재</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>세부 견적서</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>총 예상 금액</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-1px" }}>1,720만원</div>
                </div>
              </div>
              <FadeStagger>
                {[
                  { name: "철거 및 폐기물 처리", price: "180만원", bar: 10 },
                  { name: "도배 (합지 기준)", price: "210만원", bar: 12 },
                  { name: "강마루 바닥재", price: "360만원", bar: 21 },
                  { name: "욕실 타일 (2칸)", price: "420만원", bar: 24 },
                  { name: "주방 싱크대", price: "380만원", bar: 22 },
                  { name: "전기 및 조명", price: "170만원", bar: 10 },
                ].map((row, i, arr) => (
                  <motion.div key={i} variants={fadeUp} style={{
                    display: "flex", alignItems: "center", gap: 16,
                    padding: "16px 28px",
                    borderBottom: i < arr.length - 1 ? "1px solid #f5f5f5" : "none",
                    background: i % 2 === 0 ? "#fff" : "#fafafa",
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: "#333", marginBottom: 6 }}>{row.name}</div>
                      <div style={{ height: 4, background: "#f0f0f0", borderRadius: 2 }}>
                        <div style={{ height: 4, width: `${row.bar * 4}%`, background: "#111", borderRadius: 2 }} />
                      </div>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#111", minWidth: 70, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{row.price}</div>
                  </motion.div>
                ))}
              </FadeStagger>
              <div style={{ padding: "16px 28px", background: "#FAFAF8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#bbb" }}>자재 등급·공종 선택에 따라 ±15% 차이</span>
                <Link href="/estimate/detail" style={{
                  padding: "8px 16px", borderRadius: 8, background: "#111", color: "#fff",
                  textDecoration: "none", fontSize: 13, fontWeight: 700,
                }}>내 견적 받기 →</Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* 두 가지 방법 */}
      <section style={{ background: "#FAFAF8", padding: "80px 32px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 800, color: "#111", margin: "0 0 40px", letterSpacing: "-1px" }}>
            두 가지 방법이 있어요
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            <div style={{ background: "#111", borderRadius: 16, padding: "36px 32px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 260 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "1.5px", marginBottom: 14 }}>DETAIL · 정확하게</p>
                <h3 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 14px", letterSpacing: "-0.8px" }}>세부 견적</h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: 0, wordBreak: "keep-all" }}>
                  22개 공종 중 원하는 것만 골라서 항목별 금액을 확인해요. PDF로 저장해서 업체 미팅 때 활용하세요.
                </p>
              </div>
              <Link href="/estimate/detail" style={{
                marginTop: 32, display: "inline-block",
                padding: "12px 24px", borderRadius: 9,
                background: "#fff", color: "#111",
                textDecoration: "none", fontWeight: 700, fontSize: 14,
                letterSpacing: "-0.2px", alignSelf: "flex-start",
              }}>시작하기 →</Link>
            </div>
            <div style={{ background: "#fff", border: "1.5px solid #e8e8e8", borderRadius: 16, padding: "36px 32px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 260 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#bbb", letterSpacing: "1.5px", marginBottom: 14 }}>SIMPLE · 빠르게</p>
                <h3 style={{ fontSize: 24, fontWeight: 800, color: "#111", margin: "0 0 14px", letterSpacing: "-0.8px" }}>간단 견적</h3>
                <p style={{ fontSize: 14, color: "#888", lineHeight: 1.7, margin: 0, wordBreak: "keep-all" }}>
                  평수와 지역만 입력하면 1분 안에 전체 예상 금액을 바로 확인할 수 있어요.
                </p>
              </div>
              <Link href="/estimate/simple" style={{
                marginTop: 32, display: "inline-block",
                padding: "12px 24px", borderRadius: 9,
                background: "#111", color: "#fff",
                textDecoration: "none", fontWeight: 700, fontSize: 14,
                letterSpacing: "-0.2px", alignSelf: "flex-start",
              }}>시작하기 →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: "#fff", padding: "80px 32px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <FadeUp>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 800, color: "#111", margin: "0 0 40px", letterSpacing: "-1px" }}>
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
                padding: "28px 0",
                borderBottom: i < arr.length - 1 ? "1px solid #f0f0f0" : "none",
              }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#111", margin: 0, lineHeight: 1.5, letterSpacing: "-0.3px", wordBreak: "keep-all" }}>{item.q}</p>
                <p style={{ fontSize: 15, color: "#666", margin: 0, lineHeight: 1.8, wordBreak: "keep-all" }}>{item.a}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "#111", padding: "88px 32px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 32 }}>
          <FadeUp>
            <h2 style={{ fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 900, color: "#fff", margin: "0 0 12px", letterSpacing: "-1.5px", lineHeight: 1.15, wordBreak: "keep-all" }}>
              지금 바로 확인해보세요
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", margin: 0 }}>가입 없이 · 30초 · 완전 무료</p>
          </FadeUp>
          <FadeUp delay={0.15}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/estimate/detail" style={{
                padding: "15px 32px", borderRadius: 10,
                background: "#fff", color: "#111",
                textDecoration: "none", fontSize: 15, fontWeight: 700, letterSpacing: "-0.3px",
              }}>세부 견적 받기</Link>
              <Link href="/estimate/simple" style={{
                padding: "15px 28px", borderRadius: 10,
                background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(255,255,255,0.12)",
                textDecoration: "none", fontSize: 15, fontWeight: 600, letterSpacing: "-0.3px",
              }}>간단 견적</Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* 블로그 */}
      <section style={{ background: "#FAFAF8", padding: "80px 32px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <FadeUp>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: "#111", margin: 0, letterSpacing: "-0.5px" }}>인테리어 가이드</h3>
              <Link href="/blog" style={{ fontSize: 14, color: "#666", textDecoration: "none", fontWeight: 600 }}>전체 보기 →</Link>
            </div>
          </FadeUp>
          <FadeStagger style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
            {[
              { title: "32평 인테리어, 현실적인 비용은?", tag: "견적 상식", desc: "풀옵션 기준 1,400~2,800만원 — 자재 등급에 따라 이렇게 달라져요." },
              { title: "도배 합지 vs 실크, 뭐가 나을까요?", tag: "자재 가이드", desc: "가격 차이는 크고, 내구성은 생각보다 비슷해요." },
              { title: "욕실 타일 업체 고르는 요령", tag: "업체 선택", desc: "면적 단가가 비슷해도 시공 방식이 달라서 결과가 많이 달라요." },
            ].map(post => (
              <motion.div key={post.title} variants={fadeUp}>
                <Link href="/blog" style={{ textDecoration: "none", display: "block", background: "#fff", borderRadius: 12, border: "1px solid #ebebeb", padding: "24px 22px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#bbb", letterSpacing: "0.5px", display: "block", marginBottom: 10, textTransform: "uppercase" }}>{post.tag}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#111", lineHeight: 1.5, display: "block", marginBottom: 8, letterSpacing: "-0.3px" }}>{post.title}</span>
                  <span style={{ fontSize: 13, color: "#999", lineHeight: 1.6, display: "block" }}>{post.desc}</span>
                </Link>
              </motion.div>
            ))}
          </FadeStagger>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#fff", borderTop: "1px solid #ebebeb", padding: "32px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Image src="/logo.png" alt="폼잇." width={20} height={20} style={{ borderRadius: 5 }} />
            <span style={{ fontWeight: 800, color: "#111", fontSize: 14, letterSpacing: "-0.3px" }}>폼잇.</span>
          </div>
          <span style={{ fontSize: 12, color: "#ddd" }}>© 2026 폼잇. AI 기반 자동 견적 플랫폼</span>
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
