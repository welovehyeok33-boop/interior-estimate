"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { IconArrowRight, IconBuildingSkyscraper, IconTrain, IconMountain, IconCheck, IconHelpCircle } from "@tabler/icons-react";
import { saveEstimate } from "@/lib/estimateStore";
import { saveConsult } from "@/lib/consultStore";
import { REGION_DETAIL_MAX_LENGTH } from "@/lib/estimateRegion";
import { FlightPath, C } from "@/components/EstimateLayout";
import { SpaceDescriptionInput } from "@/components/SpaceDescriptionInput";

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
  { id: "food",          label: "외식",       icon: "🍽",  subs: ["식당", "카페", "술집"] },
  { id: "office",        label: "오피스",     icon: "💼",  subs: ["일반 오피스", "공유오피스", "1인 오피스"] },
  { id: "education",     label: "교육",       icon: "📚",  subs: ["학원", "스터디카페", "유치원/학교"] },
  { id: "medical",       label: "의료",       icon: "🏥",  subs: ["병원", "동물병원", "약국"] },
  { id: "accommodation", label: "숙박",       icon: "🛏",  subs: ["고시원", "호스텔", "모텔/호텔", "에어비앤비"] },
  { id: "fitness",       label: "피트니스",   icon: "🎯",  subs: ["헬스장", "필라테스/요가", "PT샵", "골프연습장", "PC방", "노래방"] },
  { id: "beauty",        label: "뷰티",       icon: "💅",  subs: ["뷰티샵", "미용실"] },
  { id: "retail",        label: "판매점",     icon: "🛍",  subs: ["편의점", "의류/잡화점", "무인매장", "그외 (휴대폰·안경·꽃집 등)"] },
  { id: "etc",           label: "기타",       icon: "📋",  subs: [] },
];

const CONSULT_STEP_LABELS = ["지역·유형", "면적", "계획", "신청"] as const;

export function SharedEstimateStep1({ mode = "engine" }: { mode?: "consult" | "engine" }) {
  const router = useRouter();
  const [region, setRegion] = useState<string | null>(null);
  const [regionDetail, setRegionDetail] = useState("");
  const [type, setType] = useState<string | null>(null);
  const [commercialType, setCommercialType] = useState<string | null>(null);
  const [commercialSub, setCommercialSub] = useState<string | null>(null);
  const [residentialGrade, setResidentialGrade] = useState<string | null>(null);
  const [spaceDescription, setSpaceDescription] = useState("");

  const selectedCommercial = COMMERCIAL_TYPES.find(c => c.id === commercialType);
  const hasSubs = selectedCommercial && selectedCommercial.subs.length > 0;
  const canNext = type === "residential"
    ? !!region && !!residentialGrade
    : !!region && !!commercialType && (!hasSubs || !!commercialSub);
  const descriptionInput = (
    <SpaceDescriptionInput
      value={spaceDescription}
      onChange={setSpaceDescription}
      placeholder={type === "residential"
        ? "예: 거주 중인 아파트이고, 주방과 욕실을 밝게 바꾸고 싶어요."
        : commercialType === "unknown"
          ? "예: 공방 겸 소품샵, 반려동물 동반 카페처럼 복합적인 공간이에요."
          : `${commercialSub ?? selectedCommercial?.label ?? "상가"}의 용도나 원하는 분위기, 필요한 공사를 간단히 적어주세요.`}
    />
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>

      {/* 헤더 */}
      <div style={{ background: "#111111", padding: "13px 0" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ fontWeight: 800, fontSize: 17, color: "#F5C200", textDecoration: "none" }}>
            폼잇.
          </Link>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{mode === "consult" ? "무료 견적 신청" : "세부 견적"} · 1단계</span>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "28px 20px 80px" }}>

        <Link href="/estimate" style={{ display: "inline-flex", alignItems: "center", minHeight: 36, marginBottom: 12, fontSize: 13, color: C.textMid, textDecoration: "none" }}>
          ← 견적 방식 다시 선택
        </Link>

        {/* 진행 경로 */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 16px 12px", marginBottom: 20 }}>
          <FlightPath step={1} totalSteps={mode === "consult" ? 4 : 5} stepLabels={mode === "consult" ? CONSULT_STEP_LABELS : undefined} />
        </div>

        {/* 지역 선택 */}
        <Section label="어느 지역에서 공사하시나요?">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {REGIONS.map(r => {
              const sel = region === r.id;
              return (
                <motion.button key={r.id} onClick={() => setRegion(r.id)}
                  aria-pressed={sel}
                  aria-expanded={r.id === "local" ? sel : undefined}
                  aria-controls={r.id === "local" && sel ? "local-region-details" : undefined}
                  whileTap={{ scale: 0.92 }}
                  animate={{ scale: sel ? 1.04 : 1, y: sel ? -2 : 0 }}
                  transition={{ type: "spring", stiffness: 420, damping: 22 }}
                  style={{
                    padding: "18px 8px 14px", borderRadius: 12,
                    border: `${sel ? "2px" : "1.5px"} solid ${sel ? C.selectedBorder : C.border}`,
                    background: sel ? C.selectedBg : C.card,
                    cursor: "pointer", textAlign: "center",
                    boxShadow: sel ? `0 4px 16px rgba(245,194,0,0.25)` : "none",
                    
                  }}>
                  <motion.div animate={{ color: sel ? C.primary : "#CCCCCC", scale: sel ? 1.1 : 1 }} transition={{ duration: 0.2 }}
                    style={{ marginBottom: 8, display: "flex", justifyContent: "center" }}>
                    {r.icon}
                  </motion.div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: sel ? C.textDark : C.textMid, transition: "color 0.15s" }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 3 }}>{r.desc}</div>
                </motion.button>
              );
            })}
          </div>
          {region === "local" && (
            <div id="local-region-details" style={{ marginTop: 12, padding: 16, borderRadius: 12, background: C.selectedBg, border: `1px solid ${C.border}` }}>
              <label htmlFor="local-region-name" style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.textDark, marginBottom: 8 }}>
                어느 지역인가요? (선택)
              </label>
              <input
                id="local-region-name"
                type="text"
                value={regionDetail}
                onChange={event => setRegionDetail(event.target.value)}
                placeholder="예: 부산 해운대구, 대전 유성구, 전남 순천시"
                maxLength={REGION_DETAIL_MAX_LENGTH}
                aria-describedby="local-region-help"
                style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.card, color: C.textDark, fontFamily: "inherit", fontSize: 16, lineHeight: 1.6 }}
              />
              <p id="local-region-help" style={{ margin: "8px 0 0", fontSize: 11, color: C.textMid, lineHeight: 1.5 }}>
                상세 주소 없이 시·군·구까지만 적어주세요. 아직 미정이면 비워둬도 괜찮아요.
              </p>
            </div>
          )}
        </Section>

        {/* 공간 유형 */}
        <Section label="어떤 공간인가요?">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
            {TYPES.map(t => {
              const sel = type === t.id;
              return (
                <motion.button key={t.id}
                  onClick={() => { if (!sel) { setType(t.id); setCommercialType(null); setCommercialSub(null); } }}
                  whileTap={{ scale: 0.93 }}
                  animate={{ scale: sel ? 1.03 : 1, y: sel ? -2 : 0 }}
                  transition={{ type: "spring", stiffness: 420, damping: 22 }}
                  style={{
                    padding: "22px 16px", borderRadius: 12,
                    border: `${sel ? "2px" : "1.5px"} solid ${sel ? C.selectedBorder : C.border}`,
                    background: sel ? C.selectedBg : C.card,
                    cursor: "pointer", textAlign: "center",
                    boxShadow: sel ? `0 4px 16px rgba(245,194,0,0.25)` : "none",
                    
                  }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: sel ? C.textDark : C.textMid, marginBottom: 4, transition: "color 0.15s" }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: C.textLight }}>{t.desc}</div>
                </motion.button>
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
                  <motion.button key={g.id} onClick={() => setResidentialGrade(g.id)}
                    whileTap={{ scale: 0.97 }}
                    animate={{ x: sel ? 4 : 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    style={{
                      padding: "16px 18px", borderRadius: 12,
                      border: `${sel ? "2px" : "1.5px"} solid ${sel ? C.selectedBorder : C.border}`,
                      background: sel ? C.selectedBg : C.card,
                      cursor: "pointer", textAlign: "left",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      boxShadow: sel ? `0 4px 16px rgba(245,194,0,0.2)` : "none",
                      
                    }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: sel ? C.textDark : C.textMid }}>{g.label}</span>
                        {g.popular && (
                          <span style={{ fontSize: 10, background: C.primary, color: "#111", padding: "1px 7px", borderRadius: 10, fontWeight: 700 }}>인기</span>
                        )}
                      </div>
                      <span style={{ fontSize: 12, color: C.textLight }}>{g.desc}</span>
                    </div>
                    <AnimatePresence>
                      {sel && (
                        <motion.div
                          initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 18 }}
                          style={{ width: 22, height: 22, borderRadius: "50%", background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <IconCheck size={11} color="#111" strokeWidth={3.5} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}

            </div>
            {descriptionInput}
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
                          <motion.button key={ct.id}
                            onClick={() => { if (!sel) { setCommercialType(ct.id); setCommercialSub(null); } }}
                            whileTap={{ scale: 0.91 }}
                            animate={{ scale: sel ? 1.04 : 1, y: sel ? -2 : 0 }}
                            transition={{ type: "spring", stiffness: 420, damping: 22 }}
                            style={{
                              padding: "14px 8px", borderRadius: 12,
                              border: `${sel ? "2px" : "1.5px"} solid ${sel ? C.selectedBorder : C.border}`,
                              background: sel ? C.selectedBg : C.card,
                              cursor: "pointer", textAlign: "center",
                              boxShadow: sel ? `0 4px 16px rgba(245,194,0,0.25)` : "none",
                              
                            }}>
                            <motion.div animate={{ scale: sel ? 1.15 : 1 }} transition={{ duration: 0.2 }}
                              style={{ fontSize: 22, marginBottom: 5 }}>{ct.icon}</motion.div>
                            <div style={{ fontSize: 12, fontWeight: sel ? 700 : 500, color: sel ? C.textDark : C.textMid, transition: "color 0.15s" }}>{ct.label}</div>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* 세부 업종 아코디언 */}
                    {selectedInRow && selectedInRow.subs.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ marginTop: 8, padding: "14px 14px", borderRadius: 10, background: "#FFFBE8", border: `1.5px solid ${C.border}` }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, marginBottom: 10, letterSpacing: "0.04em" }}>세부 업종</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                          {selectedInRow.subs.map(sub => {
                            const sel = commercialSub === sub;
                            return (
                              <motion.button key={sub} onClick={() => setCommercialSub(sub)}
                                whileTap={{ scale: 0.93 }}
                                animate={{ scale: sel ? 1.05 : 1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                                style={{
                                  padding: "7px 14px", borderRadius: 20,
                                  border: `${sel ? "2px" : "1.5px"} solid ${sel ? "#F5C200" : C.border}`,
                                  background: sel ? "#F5C200" : C.card,
                                  cursor: "pointer", fontSize: 13, fontWeight: sel ? 700 : 500,
                                  color: sel ? "#111111" : C.textMid,
                                  
                                }}>
                                {sub}
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                    {selectedInRow && descriptionInput}
                  </div>
                );
              })}

              {(() => {
                const sel = commercialType === "unknown";
                return (
                  <motion.button
                    onClick={() => { if (!sel) { setCommercialType("unknown"); setCommercialSub(null); } }}
                    whileTap={{ scale: 0.97 }}
                    animate={{ x: sel ? 4 : 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    aria-pressed={sel}
                    aria-expanded={sel}
                    aria-controls={sel ? "space-description-details" : undefined}
                    style={{
                      marginTop: 2,
                      padding: "14px 16px",
                      borderRadius: 12,
                      border: `${sel ? "2px" : "1.5px"} solid ${sel ? C.selectedBorder : C.border}`,
                      background: sel ? C.selectedBg : C.card,
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      boxShadow: sel ? `0 4px 16px rgba(245,194,0,0.2)` : "none",
                    }}
                  >
                    <div style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: sel ? C.primary : C.bg,
                      color: sel ? C.textDark : C.textLight,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <IconHelpCircle size={20} strokeWidth={1.8} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: sel ? C.textDark : C.textMid, marginBottom: 3 }}>
                        아직 잘 모르겠어요
                      </div>
                      <div style={{ fontSize: 11, lineHeight: 1.45, color: C.textLight }}>
                        가장 가까운 업종이 없어도 괜찮아요. 생각 중인 공간을 자유롭게 적어주세요.
                      </div>
                    </div>
                    <AnimatePresence>
                      {sel && (
                        <motion.div
                          initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                          style={{ width: 22, height: 22, borderRadius: "50%", background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: "auto" }}>
                          <IconCheck size={11} color="#111" strokeWidth={3.5} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })()}
              {(!commercialType || commercialType === "unknown") && descriptionInput}
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
              const commonData = {
                region: region ?? undefined,
                regionDetail: region === "local" ? regionDetail.trim() || undefined : undefined,
                buildingType: type ?? undefined,
                residentialGrade: type === "residential" ? residentialGrade ?? undefined : undefined,
                commercialType: type === "commercial" ? commercialType ?? undefined : undefined,
                commercialSub: type === "commercial" ? commercialSub ?? undefined : undefined,
                spaceDescription: spaceDescription.trim(),
                area: undefined,
                selectedWorks: [],
              };
              saveEstimate(commonData);
              if (mode === "consult") saveConsult(commonData);
              router.push(mode === "consult" ? "/consult/step2" : "/estimate/detail/step2");
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

export default function DetailEstimatePage() {
  return <SharedEstimateStep1 />;
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
