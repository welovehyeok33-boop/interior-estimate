"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { IconArrowRight, IconCheck, IconStar } from "@tabler/icons-react";
import { saveEstimate, loadEstimate } from "@/lib/estimateStore";
import { FlightPath, C } from "@/components/EstimateLayout";

// ── 자재 등급 데이터 ──────────────────────────────────────
const GRADES = [
  {
    id: "economy",
    label: "실속형",
    priceTag: "₩",
    tagColor: "#6B7280",
    tagBg: "#F3F4F6",
    badge: null,
    summary: "기능 중심의 합리적 마감",
    desc: "비용 효율을 최우선으로, 검증된 자재로 깔끔하게 마무리합니다.",
    items: [
      { cat: "바닥", mat: "강화마루 (7mm), LVT 타일" },
      { cat: "벽지", mat: "합지 도배, 기본 실크" },
      { cat: "타일", mat: "국산 300×600 세라믹" },
      { cat: "도장", mat: "수성페인트 (롤러)" },
      { cat: "창호", mat: "PVC 시스템창" },
    ],
  },
  {
    id: "standard",
    label: "스탠다드",
    priceTag: "₩₩",
    tagColor: "#111111",
    tagBg: "#F5C200",
    badge: "가장 많이 선택",
    summary: "품질과 비용의 균형",
    desc: "대부분의 공사에서 검증된 선택. 내구성과 미감을 동시에 잡습니다.",
    items: [
      { cat: "바닥", mat: "강마루 (12mm), 포세린 타일" },
      { cat: "벽지", mat: "합지 고급형, 친환경 실크" },
      { cat: "타일", mat: "국산/수입 600×600 세라믹" },
      { cat: "도장", mat: "수성페인트 (롤러+붓 마감)" },
      { cat: "창호", mat: "알루미늄 복층유리 시스템창" },
    ],
    popular: true,
  },
  {
    id: "premium",
    label: "하이앤드",
    priceTag: "₩₩₩",
    tagColor: "#92400E",
    tagBg: "#FEF3C7",
    badge: null,
    summary: "프리미엄 자재 · 고급 마감",
    desc: "최상급 수입 자재와 섬세한 마감으로 공간의 격을 높입니다.",
    items: [
      { cat: "바닥", mat: "원목마루, 이탈리아산 대리석 타일" },
      { cat: "벽지", mat: "수입 벽지, 천연소재 패브릭 마감" },
      { cat: "타일", mat: "수입 600×1200 포세린 슬랩" },
      { cat: "도장", mat: "벤자민무어·파로앤볼 고급 도장" },
      { cat: "창호", mat: "독일제 삼중유리 시스템창" },
    ],
  },
];

export default function Step4Page() {
  const router = useRouter();
  const [grade, setGrade] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadEstimate();
    if (saved.materialGrade) setGrade(saved.materialGrade);
  }, []);

  const canNext = !!grade;

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>

      {/* 헤더 */}
      <div style={{ background: "#111111", padding: "13px 0" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ fontWeight: 800, fontSize: 17, color: "#F5C200", textDecoration: "none" }}>
            폼잇.
          </Link>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>세부 견적 · 4단계</span>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "28px 20px 80px" }}>

        {/* 진행 경로 */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 16px 12px", marginBottom: 24 }}>
          <FlightPath step={4} totalSteps={5} />
        </div>

        {/* 질문 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.textDark, marginBottom: 4 }}>
            자재 등급을 선택해주세요
          </div>
          <div style={{ fontSize: 13, color: C.textLight }}>
            등급에 따라 사용하는 자재가 달라지고, 견적 금액이 크게 바뀝니다
          </div>
        </div>

        {/* 등급 카드들 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {GRADES.map((g, idx) => {
            const sel = grade === g.id;
            return (
              <motion.button
                key={g.id}
                onClick={() => setGrade(g.id)}
                whileTap={{ scale: 0.98 }}
                animate={{
                  scale: sel ? 1.01 : 1,
                  y: sel ? -2 : 0,
                  boxShadow: sel
                    ? "0 8px 24px rgba(245,194,0,0.28)"
                    : "0 0px 0px rgba(245,194,0,0)",
                }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
                style={{
                  position: "relative",
                  padding: "20px 20px 18px",
                  borderRadius: 16,
                  border: sel ? `2px solid ${C.selectedBorder}` : `1.5px solid ${C.border}`,
                  background: sel ? C.selectedBg : C.card,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                {/* 뱃지 */}
                {g.badge && (
                  <div style={{
                    position: "absolute", top: -1, right: 16,
                    fontSize: 10, fontWeight: 700,
                    background: "#111111", color: "#F5C200",
                    padding: "3px 10px", borderRadius: "0 0 8px 8px",
                    letterSpacing: "0.03em",
                  }}>
                    <IconStar size={9} style={{ marginRight: 3, verticalAlign: "middle" }} />
                    {g.badge}
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 17, fontWeight: 800, color: sel ? C.textDark : C.textMid }}>
                        {g.label}
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        color: sel ? g.tagColor : "#999",
                        background: sel ? g.tagBg : "#F3F4F6",
                        padding: "2px 8px", borderRadius: 8,
                        letterSpacing: "0.05em",
                        transition: "all 0.2s",
                      }}>
                        {g.priceTag}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: C.textMid, fontWeight: 600, marginBottom: 3 }}>{g.summary}</div>
                    <div style={{ fontSize: 12, color: C.textLight, lineHeight: 1.5 }}>{g.desc}</div>
                  </div>

                  {/* 체크 */}
                  <AnimatePresence>
                    {sel && (
                      <motion.div
                        key="check"
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 18 }}
                        style={{
                          flexShrink: 0, marginLeft: 12,
                          width: 24, height: 24, borderRadius: "50%",
                          background: C.primary,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <IconCheck size={12} color="#111" strokeWidth={3.5} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 자재 목록 */}
                <motion.div
                  animate={{ opacity: sel ? 1 : 0.55 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: sel ? "rgba(245,194,0,0.06)" : "#F9F9F9",
                    borderRadius: 10, padding: "12px 14px",
                    border: sel ? `1px solid rgba(245,194,0,0.2)` : `1px solid ${C.border}`,
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 700, color: sel ? C.primary : C.textLight, marginBottom: 8, letterSpacing: "0.06em" }}>
                    주요 자재 예시
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {g.items.map(item => (
                      <div key={item.cat} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700,
                          color: sel ? C.textMid : "#AAAAAA",
                          minWidth: 32,
                        }}>{item.cat}</span>
                        <span style={{ fontSize: 11, color: sel ? C.textLight : "#BBBBBB", lineHeight: 1.4 }}>{item.mat}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.button>
            );
          })}
        </div>

        {/* 안내 문구 */}
        <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 12, background: C.card, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 12, color: C.textLight, lineHeight: 1.6 }}>
            💡 자재 등급은 이후에도 변경할 수 있어요. 잘 모르겠으면 <span style={{ color: C.primary, fontWeight: 600 }}>스탠다드</span>를 추천드립니다.
          </div>
        </div>

        {/* 하단 버튼 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28 }}>
          <button onClick={() => router.back()} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 14, color: C.textLight, fontWeight: 500,
          }}>
            ← 이전
          </button>
          <motion.button
            disabled={!canNext}
            onClick={() => {
              saveEstimate({ materialGrade: grade ?? undefined });
              router.push("/estimate/detail/step5");
            }}
            whileTap={canNext ? { scale: 0.95 } : {}}
            animate={canNext ? { opacity: 1 } : { opacity: 0.5 }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "12px 28px", borderRadius: 30, border: "none",
              background: canNext ? `linear-gradient(135deg, #FFD740, #F5C200)` : C.border,
              color: canNext ? "#111111" : C.textLight,
              fontWeight: 700, fontSize: 15,
              cursor: canNext ? "pointer" : "not-allowed",
            }}
          >
            견적 확인 <IconArrowRight size={16} />
          </motion.button>
        </div>

      </div>
    </div>
  );
}
