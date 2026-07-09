"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconArrowRight, IconBuildingSkyscraper, IconTrain, IconMountain } from "@tabler/icons-react";
import { saveEstimate } from "@/lib/estimateStore";
import { FlightPath, C } from "@/components/EstimateLayout";

// ── 데이터 ────────────────────────────────────────────────
const REGIONS = [
  { id: "seoul",  label: "서울",  desc: "서울특별시",     icon: <IconBuildingSkyscraper size={24} strokeWidth={1.5} /> },
  { id: "metro",  label: "수도권", desc: "경기 · 인천",   icon: <IconTrain size={24} strokeWidth={1.5} /> },
  { id: "local",  label: "지방",  desc: "그 외 지역",     icon: <IconMountain size={24} strokeWidth={1.5} /> },
];

const TYPES = [
  { id: "residential", label: "주거", desc: "아파트 · 빌라 · 단독주택" },
  { id: "commercial",  label: "상가", desc: "매장 · 오피스 · 상업공간" },
];

const RESIDENTIAL_GRADES = [
  { id: "budget",   label: "실속형",   desc: "합리적인 기능 중심 마감" },
  { id: "standard", label: "스탠다드", desc: "품질과 비용의 균형",   popular: true },
  { id: "highend",  label: "하이앤드", desc: "프리미엄 자재 · 고급 마감" },
];

const COMMERCIAL_TYPES = [
  { id: "food",          label: "외식",       icon: "🍽",  subs: ["식당", "카페"] },
  { id: "office",        label: "오피스",     icon: "💼",  subs: ["일반 오피스", "공유오피스", "1인 오피스"] },
  { id: "education",     label: "교육",       icon: "📚",  subs: ["학원", "스터디카페", "유치원/학교"] },
  { id: "medical",       label: "의료",       icon: "🏥",  subs: ["병원", "동물병원", "약국"] },
  { id: "accommodation", label: "숙박",       icon: "🛏",  subs: ["고시원", "호스텔", "모텔/호텔", "에어비앤비"] },
  { id: "fitness",       label: "피트니스",   icon: "🎯",  subs: ["헬스장", "필라테스/요가", "골프연습장", "PC방", "노래방"] },
  { id: "beauty",        label: "뷰티",       icon: "💅",  subs: ["뷰티샵"] },
  { id: "retail",        label: "리테일",     icon: "🛍",  subs: ["편의점", "의류/잡화점"] },
  { id: "etc",           label: "기타",       icon: "📋",  subs: [] },
];

export default function DetailEstimatePage() {
  const router = useRouter();
  const [region, setRegion] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [commercialType, setCommercialType] = useState<string | null>(null);
  const [commercialSub, setCommercialSub] = useState<string | null>(null);
  const [residentialGrade, setResidentialGrade] = useState<string | null>(null);

  const selectedCommercial = COMMERCIAL_TYPES.find(c => c.id === commercialType);
  const hasSubs = selectedCommercial && selectedCommercial.subs.length > 0;
  const canNext = type === "residential"
    ? !!region && !!residentialGrade
    : !!region && !!commercialType && (!hasSubs || !!commercialSub);

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>

      {/* 헤더 */}
      <div style={{ background: "#111111", padding: "13px 0" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ fontWeight: 800, fontSize: 17, color: "#F5C200", textDecoration: "none" }}>
            폼잇.
          </Link>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>세부 견적 · 1단계</span>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "28px 20px 80px" }}>

        {/* 진행 경로 */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 16px 12px", marginBottom: 20 }}>
          <FlightPath step={1} totalSteps={5} />
        </div>

        {/* 지역 선택 */}
        <Section label="어느 지역에서 공사하시나요?">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {REGIONS.map(r => {
              const sel = region === r.id;
              return (
                <button key={r.id} onClick={() => setRegion(r.id)} style={{
                  padding: "18px 8px 14px",
                  borderRadius: 12,
                  border: `${sel ? "2px" : "1.5px"} solid ${sel ? C.selectedBorder : C.border}`,
                  background: sel ? C.selectedBg : C.card,
                  cursor: "pointer", textAlign: "center",
                  transition: "all 0.15s ease",
                }}>
                  <div style={{ color: sel ? C.primary : "#c8b8a8", marginBottom: 8, display: "flex", justifyContent: "center" }}>
                    {r.icon}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: sel ? C.textDark : C.textMid }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 3 }}>{r.desc}</div>
                </button>
              );
            })}
          </div>
        </Section>

        {/* 공간 유형 */}
        <Section label="어떤 공간인가요?">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
            {TYPES.map(t => {
              const sel = type === t.id;
              return (
                <button key={t.id} onClick={() => { setType(t.id); setCommercialType(null); setCommercialSub(null); }} style={{
                  padding: "22px 16px",
                  borderRadius: 12,
                  border: `${sel ? "2px" : "1.5px"} solid ${sel ? C.selectedBorder : C.border}`,
                  background: sel ? C.selectedBg : C.card,
                  cursor: "pointer", textAlign: "center",
                  transition: "all 0.15s ease",
                }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: sel ? C.textDark : C.textMid, marginBottom: 4 }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: C.textLight }}>{t.desc}</div>
                </button>
              );
            })}
          </div>
        </Section>

        {/* 주거 등급 */}
        {type === "residential" && (
          <Section label="어느 정도 수준으로 하실 건가요?">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {RESIDENTIAL_GRADES.map(g => {
                const sel = residentialGrade === g.id;
                return (
                  <button key={g.id} onClick={() => setResidentialGrade(g.id)} style={{
                    padding: "16px 18px",
                    borderRadius: 12,
                    border: `${sel ? "2px" : "1.5px"} solid ${sel ? C.selectedBorder : C.border}`,
                    background: sel ? C.selectedBg : C.card,
                    cursor: "pointer", textAlign: "left",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    transition: "all 0.15s ease",
                  }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: sel ? C.textDark : C.textMid }}>{g.label}</span>
                        {g.popular && (
                          <span style={{ fontSize: 10, background: C.primary, color: "white", padding: "1px 7px", borderRadius: 10, fontWeight: 700 }}>인기</span>
                        )}
                      </div>
                      <span style={{ fontSize: 12, color: C.textLight }}>{g.desc}</span>
                    </div>
                    {sel && (
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>✓</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {/* 상가 업종 */}
        {type === "commercial" && (
          <Section label="어떤 업종인가요?">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[0, 1, 2].map(rowIdx => {
                const rowItems = COMMERCIAL_TYPES.slice(rowIdx * 3, rowIdx * 3 + 3);
                const selectedInRow = rowItems.find(ct => ct.id === commercialType);
                return (
                  <div key={rowIdx}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                      {rowItems.map(ct => {
                        const sel = commercialType === ct.id;
                        return (
                          <button key={ct.id} onClick={() => { setCommercialType(ct.id); setCommercialSub(null); }} style={{
                            padding: "14px 8px",
                            borderRadius: 12,
                            border: `${sel ? "2px" : "1.5px"} solid ${sel ? C.selectedBorder : C.border}`,
                            background: sel ? C.selectedBg : C.card,
                            cursor: "pointer", textAlign: "center",
                            transition: "all 0.15s ease",
                          }}>
                            <div style={{ fontSize: 22, marginBottom: 5 }}>{ct.icon}</div>
                            <div style={{ fontSize: 12, fontWeight: sel ? 700 : 500, color: sel ? C.textDark : C.textMid }}>{ct.label}</div>
                          </button>
                        );
                      })}
                    </div>

                    {/* 세부 업종 아코디언 */}
                    {selectedInRow && selectedInRow.subs.length > 0 && (
                      <div style={{ marginTop: 8, padding: "14px 14px", borderRadius: 10, background: "#FFFBE8", border: `1.5px solid ${C.border}` }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, marginBottom: 10, letterSpacing: "0.04em" }}>세부 업종</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                          {selectedInRow.subs.map(sub => {
                            const sel = commercialSub === sub;
                            return (
                              <button key={sub} onClick={() => setCommercialSub(sub)} style={{
                                padding: "7px 14px",
                                borderRadius: 20,
                                border: `${sel ? "2px" : "1.5px"} solid ${sel ? "#F5C200" : C.border}`,
                                background: sel ? "#F5C200" : C.card,
                                cursor: "pointer",
                                fontSize: 13, fontWeight: sel ? 700 : 500,
                                color: sel ? "#111111" : C.textMid,
                                transition: "all 0.15s ease",
                              }}>
                                {sub}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* 하단 버튼 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28 }}>
          <Link href="/" style={{ fontSize: 14, color: C.textLight, textDecoration: "none", fontWeight: 500 }}>
            ← 홈으로
          </Link>
          <button
            disabled={!canNext}
            onClick={() => {
              saveEstimate({ region: region ?? undefined, buildingType: type ?? undefined, residentialGrade: residentialGrade ?? undefined, commercialType: commercialType ?? undefined, commercialSub: commercialSub ?? undefined, area: undefined, selectedWorks: [] });
              router.push("/estimate/detail/step2");
            }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "12px 28px",
              borderRadius: 30,
              border: "none",
              background: canNext ? `linear-gradient(135deg, #FFD740, #F5C200)` : C.border,
              color: canNext ? "#111111" : C.textLight,
              fontWeight: 700, fontSize: 15,
              cursor: canNext ? "pointer" : "not-allowed",
              transition: "all 0.2s ease",
            }}
          >
            다음 <IconArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}

// ── 섹션 래퍼 ──────────────────────────────────────────────
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.textDark, marginBottom: 12 }}>{label}</div>
      {children}
    </div>
  );
}
