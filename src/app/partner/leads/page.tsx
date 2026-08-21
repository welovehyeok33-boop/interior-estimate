"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  IconMapPin, IconRuler, IconTool, IconLock, IconStar,
  IconBuildingStore, IconHome, IconEye, IconArrowRight,
  IconCheck,
} from "@tabler/icons-react";

// ── 색상 ────────────────────────────────────────────────────
const P = {
  bg:           "#F8F8F6",
  card:         "#FFFFFF",
  border:       "#E8E8E4",
  primary:      "#111111",
  gold:         "#F5C200",
  goldLight:    "#FFFBE8",
  goldBorder:   "#F5C200",
  text:         "#111111",
  mid:          "#555555",
  light:        "#999999",
  selectedBg:   "rgba(245,194,0,0.08)",
};

// ── 타입 ────────────────────────────────────────────────────
type Lead = {
  id: string;
  created_at: string;
  region: string | null;
  building_type: string | null;
  commercial_type: string | null;
  commercial_sub: string | null;
  area: number | null;
  works: string[] | null;
  material_grade: string | null;
  estimated_total: number | null;
};

// ── 레이블 맵 ───────────────────────────────────────────────
const REGION_LABEL: Record<string, string> = { seoul: "서울", metro: "수도권", local: "지방" };
const TYPE_LABEL: Record<string, string> = { residential: "주거", commercial: "상가" };
const GRADE_LABEL: Record<string, string> = { economy: "실속형", standard: "스탠다드", premium: "하이앤드", budget: "실속형", highend: "하이앤드" };
const GRADE_COLOR: Record<string, string> = { economy: "#6B7280", budget: "#6B7280", standard: "#111111", highend: "#92400E", premium: "#92400E" };
const GRADE_BG: Record<string, string>    = { economy: "#F3F4F6", budget: "#F3F4F6", standard: "#F5C200", highend: "#FEF3C7", premium: "#FEF3C7" };

// 날짜 → "X일 전" 포맷
function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600)  return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default function PartnerLeadsPage() {
  const [leads, setLeads]           = useState<Lead[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal]   = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("leads")
      .select("id, created_at, region, building_type, commercial_type, commercial_sub, area, works, material_grade, estimated_total")
      .eq("status", "qualified")
      .order("created_at", { ascending: false });
    if (data) setLeads(data as Lead[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const selected = leads.find(l => l.id === selectedId);

  return (
    <div style={{ minHeight: "100vh", background: P.bg }}>

      {/* 헤더 */}
      <div style={{ background: "#111111", padding: "0" }}>
        {/* 상단 바 */}
        <div style={{ borderBottom: "1px solid #222", padding: "12px 0" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Link href="/" style={{ fontWeight: 900, fontSize: 17, color: P.gold, textDecoration: "none" }}>
              폼잇.
            </Link>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: "0.05em" }}>
              PARTNER
            </span>
          </div>
        </div>

        {/* 히어로 */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "36px 20px 40px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(245,194,0,0.15)", borderRadius: 20, padding: "4px 14px", marginBottom: 16 }}>
            <IconStar size={12} color={P.gold} />
            <span style={{ fontSize: 11, fontWeight: 700, color: P.gold, letterSpacing: "0.05em" }}>검증된 견적 의뢰 리드</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#FFFFFF", margin: "0 0 10px", lineHeight: 1.25, letterSpacing: "-0.5px" }}>
            공사 준비된 고객,<br />지금 열람하세요
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.7 }}>
            AI 견적을 완료하고 연락처를 남긴 고객 리드입니다.<br />
            기본 정보를 확인 후 열람권을 구매하면 이메일 · 연락처를 공개해드립니다.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px 80px" }}>

        {/* 안내 배너 */}
        <div style={{
          display: "flex", gap: 0,
          background: P.card, border: `1.5px solid ${P.border}`,
          borderRadius: 14, marginBottom: 28, overflow: "hidden",
        }}>
          {[
            { icon: "👁",  title: "기본 정보 무료 열람", desc: "지역 · 업종 · 예상 금액 확인 무료" },
            { icon: "🔓",  title: "연락처 열람",          desc: "건당 15만원 결제 후 이메일 공개" },
            { icon: "📋",  title: "직접 제안",             desc: "고객에게 견적 제안서 직접 발송" },
          ].map((item, i) => (
            <div key={i} style={{
              flex: 1, padding: "18px 16px", textAlign: "center",
              borderRight: i < 2 ? `1px solid ${P.border}` : "none",
            }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: P.text, marginBottom: 3 }}>{item.title}</div>
              <div style={{ fontSize: 11, color: P.light, lineHeight: 1.4 }}>{item.desc}</div>
            </div>
          ))}
        </div>

        {/* 리드 목록 제목 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: P.text }}>
            열람 가능한 리드
            <span style={{
              marginLeft: 8, fontSize: 12, fontWeight: 700,
              background: "#111", color: P.gold,
              padding: "2px 10px", borderRadius: 20,
            }}>
              {leads.length}건
            </span>
          </div>
          <button onClick={fetchLeads} style={{ fontSize: 12, color: P.light, background: "none", border: "none", cursor: "pointer" }}>
            새로고침
          </button>
        </div>

        {/* 리드 카드 그리드 */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: P.light }}>불러오는 중...</div>
        ) : leads.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: P.light }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📭</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>아직 열람 가능한 리드가 없어요</div>
            <div style={{ fontSize: 13 }}>새 리드가 등록되면 여기에 표시됩니다</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {leads.map((lead, idx) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                style={{
                  background: P.card,
                  border: `1.5px solid ${selectedId === lead.id ? P.goldBorder : P.border}`,
                  borderRadius: 16, overflow: "hidden",
                  boxShadow: selectedId === lead.id ? "0 4px 20px rgba(245,194,0,0.2)" : "none",
                  transition: "box-shadow 0.2s, border-color 0.2s",
                }}
              >
                {/* 카드 상단 — 컬러 스트라이프 */}
                <div style={{
                  height: 4,
                  background: lead.building_type === "commercial"
                    ? "linear-gradient(90deg, #F5C200, #FFD740)"
                    : "linear-gradient(90deg, #6366F1, #818CF8)",
                }} />

                <div style={{ padding: "18px 18px 0" }}>
                  {/* 뱃지 행 */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
                    {/* 지역 */}
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      fontSize: 11, fontWeight: 700,
                      background: "#111", color: "#FFF",
                      padding: "3px 10px", borderRadius: 20,
                    }}>
                      <IconMapPin size={10} />
                      {REGION_LABEL[lead.region ?? ""] || "-"}
                    </span>
                    {/* 유형 */}
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      fontSize: 11, fontWeight: 600,
                      background: P.bg, color: P.mid,
                      padding: "3px 10px", borderRadius: 20,
                      border: `1px solid ${P.border}`,
                    }}>
                      {lead.building_type === "commercial" ? <IconBuildingStore size={10} /> : <IconHome size={10} />}
                      {TYPE_LABEL[lead.building_type ?? ""] || "-"}
                      {lead.commercial_sub ? ` · ${lead.commercial_sub}` : ""}
                    </span>
                    {/* 자재 등급 */}
                    {lead.material_grade && (
                      <span style={{
                        fontSize: 10, fontWeight: 700,
                        background: GRADE_BG[lead.material_grade] || P.bg,
                        color: GRADE_COLOR[lead.material_grade] || P.mid,
                        padding: "2px 8px", borderRadius: 20,
                      }}>
                        {GRADE_LABEL[lead.material_grade] || "-"}
                      </span>
                    )}
                  </div>

                  {/* 예상 금액 — 메인 숫자 */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: P.light, marginBottom: 4 }}>예상 견적 금액</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                      <span style={{ fontSize: 30, fontWeight: 900, color: P.text, letterSpacing: "-0.02em" }}>
                        {lead.estimated_total ? lead.estimated_total.toLocaleString("ko-KR") : "?"}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: P.mid }}>만원</span>
                    </div>
                    {lead.area && (
                      <div style={{ fontSize: 12, color: P.light, marginTop: 2 }}>
                        <IconRuler size={11} style={{ verticalAlign: "middle", marginRight: 3 }} />
                        {lead.area}평 기준
                      </div>
                    )}
                  </div>

                  {/* 공종 태그 (최대 4개 + 나머지) */}
                  {lead.works && lead.works.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11, color: P.light, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                        <IconTool size={11} /> 공종 {lead.works.length}개
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {lead.works.slice(0, 4).map(w => (
                          <span key={w} style={{
                            fontSize: 11, padding: "3px 9px", borderRadius: 20,
                            background: P.bg, color: P.mid,
                            border: `1px solid ${P.border}`,
                          }}>{w}</span>
                        ))}
                        {lead.works.length > 4 && (
                          <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, background: P.bg, color: P.light, border: `1px solid ${P.border}` }}>
                            +{lead.works.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 카드 하단 — 열람 버튼 */}
                <div style={{ padding: "0 18px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: P.light }}>{timeAgo(lead.created_at)}</span>
                  <button
                    onClick={() => { setSelectedId(lead.id); setShowModal(true); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "8px 16px", borderRadius: 20, border: "none",
                      background: "#111", color: P.gold,
                      fontSize: 12, fontWeight: 700, cursor: "pointer",
                    }}
                  >
                    <IconLock size={11} />
                    열람하기
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 열람 모달 */}
      <AnimatePresence>
        {showModal && selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100 }}
            />

            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              style={{
                position: "fixed", bottom: 0, left: 0, right: 0,
                background: "#fff", borderRadius: "24px 24px 0 0",
                padding: "32px 24px 48px",
                zIndex: 101, maxWidth: 560, margin: "0 auto",
              }}
            >
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "#E0E0E0", margin: "0 auto 24px" }} />

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: P.text, marginBottom: 6 }}>
                  연락처 열람
                </div>
                <div style={{ fontSize: 13, color: P.mid, lineHeight: 1.6 }}>
                  이 리드의 이메일 · 연락처를 확인하려면 열람권이 필요합니다
                </div>
              </div>

              {/* 리드 미리보기 */}
              <div style={{
                padding: "16px", borderRadius: 14,
                background: P.bg, border: `1.5px solid ${P.border}`,
                marginBottom: 20,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 11, color: P.light, marginBottom: 4 }}>
                      {REGION_LABEL[selected.region ?? ""] || "-"} · {TYPE_LABEL[selected.building_type ?? ""] || "-"}
                      {selected.commercial_sub ? ` · ${selected.commercial_sub}` : ""}
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: P.text }}>
                      {selected.estimated_total?.toLocaleString()}
                      <span style={{ fontSize: 13, fontWeight: 600, color: P.mid, marginLeft: 4 }}>만원</span>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    background: GRADE_BG[selected.material_grade ?? ""] || P.bg,
                    color: GRADE_COLOR[selected.material_grade ?? ""] || P.mid,
                    padding: "3px 10px", borderRadius: 20,
                  }}>
                    {GRADE_LABEL[selected.material_grade ?? ""] || "-"}
                  </span>
                </div>

                {/* 이메일 블러 처리 */}
                <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "#fff", border: `1px solid ${P.border}` }}>
                  <div style={{ fontSize: 11, color: P.light, marginBottom: 3 }}>이메일</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: P.text, filter: "blur(5px)", userSelect: "none" }}>
                    example@email.com
                  </div>
                </div>
              </div>

              {/* 혜택 */}
              <div style={{ marginBottom: 20 }}>
                {[
                  "고객 이메일 · 연락처 공개",
                  "공종 선택 상세 내역 공개",
                  "열람 후 30일간 재열람 가능",
                ].map(t => (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <IconCheck size={10} color={P.gold} strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: 13, color: P.mid }}>{t}</span>
                  </div>
                ))}
              </div>

              {/* 결제 버튼 (준비 중) */}
              <button
                style={{
                  width: "100%", padding: "15px",
                  borderRadius: 14, border: "none",
                  background: "linear-gradient(135deg, #FFD740, #F5C200)",
                  color: "#111", fontWeight: 800, fontSize: 16,
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
                onClick={() => alert("결제 연동 준비 중입니다. 문의: pomit@pomit.kr")}
              >
                열람권 구매 · 15만원
                <IconArrowRight size={18} />
              </button>
              <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: P.light }}>
                VAT 포함 · 1건 열람권 · 환불 불가
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
