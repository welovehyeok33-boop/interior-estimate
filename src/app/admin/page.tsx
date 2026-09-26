"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { formatEstimateRegion } from "@/lib/estimateRegion";
import { C } from "@/components/EstimateLayout";
import { formatConsultBudget, formatConsultSchedule } from "@/lib/consultStore";
import {
  IconLock, IconRefresh,
  IconMapPin, IconRuler, IconTool, IconDiamond,
  IconMail, IconCheck, IconChevronRight, IconTrash,
} from "@tabler/icons-react";

// ── 색상 시스템 ─────────────────────────────────────────────
const A = {
  bg:     "#0F0F0F",
  card:   "#1A1A1A",
  border: "#2A2A2A",
  hover:  "#222222",
  gold:   "#F5C200",
  goldBg: "rgba(245,194,0,0.1)",
  text:   "#F0F0F0",
  mid:    "#AAAAAA",
  light:  "#666666",
};

const ADMIN_PW = "1732";

// ── 타입 ────────────────────────────────────────────────────
type Lead = {
  id: string;
  created_at: string;
  email: string;
  region: string | null;
  building_type: string | null;
  residential_grade: string | null;
  commercial_type: string | null;
  commercial_sub: string | null;
  area: number | null;
  works: string[] | null;
  material_grade: string | null;
  estimated_total: number | null;
  status: "new" | "qualified" | "contracted";
};

type Consultation = {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  region: string | null;
  building_type: string | null;
  area: number | null;
  experience: string | null;
  schedule: string | null;
  work_scope: string | null;
  budget: string | null;
  memo: string | null;
  status: string | null;
};

// ── 레이블 맵 ───────────────────────────────────────────────
const TYPE_LABEL: Record<string, string> = { residential: "주거", commercial: "상가" };
const GRADE_LABEL: Record<string, string> = { economy: "실속형", standard: "스탠다드", premium: "하이앤드", budget: "실속형", highend: "하이앤드" };
const CONSULT_STATUS: Record<string, string> = { new: "신규", contacted: "연락 완료", contracted: "계약" };
const EXPERIENCE_LABEL: Record<string, string> = { yes: "있음", no: "없음" };
const WORK_SCOPE_LABEL: Record<string, string> = { full: "전체", partial: "부분" };
const STATUS_CONFIG = {
  new:        { label: "신규",     color: "#3B82F6", bg: "rgba(59,130,246,0.15)" },
  qualified:  { label: "판매가능", color: "#10B981", bg: "rgba(16,185,129,0.15)" },
  contracted: { label: "계약",     color: A.gold,    bg: A.goldBg },
};
const TABS = [
  { id: "all",        label: "전체" },
  { id: "new",        label: "신규" },
  { id: "qualified",  label: "판매가능" },
  { id: "contracted", label: "계약" },
];

// ── 날짜 포맷 ────────────────────────────────────────────────
function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function AdminPage() {
  const [authed, setAuthed]     = useState(false);
  const [pw, setPw]             = useState("");
  const [pwError, setPwError]   = useState(false);
  const [leads, setLeads]       = useState<Lead[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [flow, setFlow] = useState<"consult" | "engine">("consult");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [expandedConsult, setExpandedConsult] = useState<string | null>(null);
  const [tab, setTab]           = useState("all");
  const [loading, setLoading]   = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // ── 비밀번호 확인 ─────────────────────────────────────────
  useEffect(() => {
    // Session storage is available only after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (sessionStorage.getItem("admin_auth") === "1") setAuthed(true);
  }, []);

  const login = () => {
    if (pw === ADMIN_PW) {
      sessionStorage.setItem("admin_auth", "1");
      setAuthed(true);
    } else {
      setPwError(true);
      setTimeout(() => setPwError(false), 1200);
    }
  };

  // ── 리드 불러오기 ─────────────────────────────────────────
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const [leadResult, consultResult] = await Promise.all([
      supabase.from("leads").select("*").order("created_at", { ascending: false }),
      supabase.from("consultations").select("*").order("created_at", { ascending: false }),
    ]);
    if (leadResult.error || consultResult.error) {
      setLoadError("신청 내역을 불러오지 못했어요. DB 연결 및 테이블 권한을 확인해 주세요.");
    }
    if (!leadResult.error) setLeads((leadResult.data ?? []) as Lead[]);
    if (!consultResult.error) setConsultations((consultResult.data ?? []) as Consultation[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Authentication gates the first remote data load.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (authed) fetchLeads();
  }, [authed, fetchLeads]);

  // ── 삭제 ──────────────────────────────────────────────────
  const deleteLead = async (id: string) => {
    setDeleting(id);
    setActionError(null);
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) setActionError("삭제하지 못했어요. 다시 시도해 주세요.");
    else {
      setLeads(prev => prev.filter(l => l.id !== id));
      setExpanded(null);
      setConfirmDelete(null);
    }
    setDeleting(null);
  };

  // ── 상태 변경 ─────────────────────────────────────────────
  const changeStatus = async (id: string, next: Lead["status"]) => {
    setUpdating(id);
    setActionError(null);
    const { error } = await supabase.from("leads").update({ status: next }).eq("id", id);
    if (error) setActionError("상태를 저장하지 못했어요. 다시 시도해 주세요.");
    else setLeads(prev => prev.map(l => l.id === id ? { ...l, status: next } : l));
    setUpdating(null);
  };

  // ── 필터 ──────────────────────────────────────────────────
  const filtered = tab === "all" ? leads : leads.filter(l => l.status === tab);

  // ── 통계 ──────────────────────────────────────────────────
  const stats = {
    total:      leads.length,
    new:        leads.filter(l => l.status === "new").length,
    qualified:  leads.filter(l => l.status === "qualified").length,
    contracted: leads.filter(l => l.status === "contracted").length,
    revenue:    leads.filter(l => l.status === "contracted").reduce((s, l) => s + (l.estimated_total ?? 0), 0),
  };

  // ────────────────────────────────────────────────────────
  // 비밀번호 화면
  // ────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: A.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ width: 320, padding: "40px 32px", background: A.card, borderRadius: 20, border: `1px solid ${A.border}` }}
        >
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: A.gold, marginBottom: 6 }}>폼잇.</div>
            <div style={{ fontSize: 13, color: A.mid }}>관리자 페이지</div>
          </div>

          <motion.div animate={pwError ? { x: [-6, 6, -4, 4, 0] } : {}} transition={{ duration: 0.3 }}>
            <div style={{ position: "relative", marginBottom: 12 }}>
              <IconLock size={16} color={A.light} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="password"
                placeholder="비밀번호"
                value={pw}
                onChange={e => setPw(e.target.value)}
                onKeyDown={e => e.key === "Enter" && login()}
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "12px 14px 12px 40px",
                  background: "#111", border: `1.5px solid ${pwError ? "#EF4444" : A.border}`,
                  borderRadius: 10, color: A.text, fontSize: 15, outline: "none",
                  transition: "border-color 0.15s",
                }}
              />
            </div>
          </motion.div>

          {pwError && (
            <div style={{ fontSize: 12, color: "#EF4444", textAlign: "center", marginBottom: 10 }}>비밀번호가 틀렸어요</div>
          )}

          <button
            onClick={login}
            style={{
              width: "100%", padding: "12px",
              borderRadius: 10, border: "none",
              background: A.gold, color: "#111",
              fontWeight: 800, fontSize: 15, cursor: "pointer",
            }}
          >
            로그인
          </button>
        </motion.div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────
  // 어드민 메인
  // ────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: A.bg }}>

      {/* 헤더 */}
      <div style={{ background: "#111", borderBottom: `1px solid ${A.border}`, padding: "14px 0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontWeight: 900, fontSize: 18, color: C.primary }}>폼잇.</span>
            <span style={{ fontSize: 13, color: A.mid, marginLeft: 10 }}>어드민</span>
          </div>
          <button
            onClick={fetchLeads}
            style={{ display: "flex", alignItems: "center", gap: 6, background: A.card, border: `1px solid ${A.border}`, borderRadius: 8, padding: "7px 14px", cursor: "pointer", color: A.mid, fontSize: 13 }}
          >
            <IconRefresh size={14} /> 새로고침
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px 60px" }}>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
          {([
            { id: "consult", title: "1차 · 무료 견적 신청", count: consultations.length, note: "연락처를 남긴 상담 신청" },
            { id: "engine", title: "2차 · 상세 견적 미리보기", count: leads.length, note: "임시 엔진 결과와 이메일 신청" },
          ] as const).map(item => (
            <button key={item.id} onClick={() => setFlow(item.id)} aria-pressed={flow === item.id}
              style={{ flex: "1 1 250px", textAlign: "left", padding: "17px 18px", borderRadius: 14, cursor: "pointer", background: flow === item.id ? A.goldBg : A.card, border: `1.5px solid ${flow === item.id ? C.primary : A.border}`, color: A.text }}>
              <span style={{ display: "block", fontSize: 15, fontWeight: 800 }}>{item.title} <span style={{ color: C.primary }}>{item.count}</span></span>
              <span style={{ display: "block", marginTop: 5, fontSize: 12, color: A.mid }}>{item.note}</span>
            </button>
          ))}
        </div>

        {loadError && <p role="alert" style={{ color: "#F87171", fontSize: 13 }}>{loadError}</p>}
        {actionError && <p role="alert" style={{ color: "#F87171", fontSize: 13 }}>{actionError}</p>}

        {flow === "consult" ? (
          <section aria-label="무료 견적 신청 목록">
            <h1 style={{ color: A.text, fontSize: 20, margin: "0 0 6px" }}>무료 견적 신청</h1>
            <p style={{ color: A.mid, fontSize: 13, margin: "0 0 20px" }}>1차 유입용 · 고객 연락처와 요청 사항을 확인하세요.</p>
            {loading ? <p style={{ color: A.mid }}>불러오는 중...</p> : consultations.length === 0 ? (
              <p style={{ color: A.mid, padding: "36px 0" }}>아직 상담 신청이 없어요.</p>
            ) : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {consultations.map(item => (
                <div key={item.id} style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 14, overflow: "hidden" }}>
                  <button onClick={() => setExpandedConsult(expandedConsult === item.id ? null : item.id)} aria-expanded={expandedConsult === item.id}
                    style={{ width: "100%", background: "none", border: 0, color: A.text, cursor: "pointer", textAlign: "left", padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <span style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <strong>{item.name}</strong><span style={{ color: A.mid, fontSize: 13 }}>{formatEstimateRegion(item.region)} · {TYPE_LABEL[item.building_type ?? ""] || item.building_type || "공간 미정"}{item.area ? ` · ${item.area}평` : ""}</span>
                    </span>
                    <span style={{ fontSize: 12, color: A.mid }}>{fmtDate(item.created_at)} · {CONSULT_STATUS[item.status ?? ""] || item.status || "상태 미정"} <IconChevronRight size={13} style={{ verticalAlign: "middle" }} /></span>
                  </button>
                  {expandedConsult === item.id && <div style={{ borderTop: `1px solid ${A.border}`, padding: "16px 18px", color: A.text, fontSize: 13, lineHeight: 1.8, overflowWrap: "anywhere" }}>
                    <div>연락처: <a href={`tel:${item.phone}`} style={{ color: C.primary }}>{item.phone}</a></div>
                    <div>지역: {formatEstimateRegion(item.region)}</div>
                    <div>공간: {TYPE_LABEL[item.building_type ?? ""] || item.building_type || "-"} · {item.area ? `${item.area}평` : "면적 미정"}</div>
                    <div>공사 경험: {EXPERIENCE_LABEL[item.experience ?? ""] || "-"} · 일정: {formatConsultSchedule(item.schedule ?? undefined)}</div>
                    <div>공사 범위: {WORK_SCOPE_LABEL[item.work_scope ?? ""] || "-"} · 예산: {formatConsultBudget(item.budget ?? undefined)}</div>
                    {item.memo && <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>메모: {item.memo}</div>}
                  </div>}
                </div>
              ))}
            </div>}
          </section>
        ) : <section aria-label="상세 견적 미리보기 신청 목록">
        <h1 style={{ color: A.text, fontSize: 20, margin: "0 0 6px" }}>상세 견적 미리보기 신청</h1>
        <p style={{ color: A.mid, fontSize: 13, margin: "0 0 20px" }}>2차 견적엔진용 · 현재 금액은 임시 계산값이며 확정 견적이 아닙니다.</p>

        {/* 통계 카드 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { label: "전체 리드",   value: stats.total,      color: A.text },
            { label: "신규",        value: stats.new,        color: "#3B82F6" },
            { label: "판매가능",    value: stats.qualified,  color: "#10B981" },
            { label: "계약",        value: stats.contracted, color: A.gold },
          ].map(s => (
            <div key={s.label} style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ fontSize: 11, color: A.light, marginBottom: 8, fontWeight: 600, letterSpacing: "0.05em" }}>{s.label.toUpperCase()}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* 탭 */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {TABS.map(t => {
            const active = tab === t.id;
            const cnt = t.id === "all" ? leads.length : leads.filter(l => l.status === t.id).length;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{
                  padding: "8px 16px", borderRadius: 20, border: `1.5px solid ${active ? A.gold : A.border}`,
                  background: active ? A.goldBg : A.card,
                  color: active ? A.gold : A.mid, fontWeight: active ? 700 : 500,
                  fontSize: 13, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                {t.label}
                <span style={{ fontSize: 11, background: active ? A.gold : A.border, color: active ? "#111" : A.mid, borderRadius: 10, padding: "1px 7px", fontWeight: 700 }}>
                  {cnt}
                </span>
              </button>
            );
          })}
        </div>

        {/* 리드 목록 */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: A.mid }}>불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: A.light }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
            <div>아직 리드가 없어요</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map(lead => {
              const st = STATUS_CONFIG[lead.status];
              const isOpen = expanded === lead.id;
              return (
                <motion.div key={lead.id} layout
                  style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 14, overflow: "hidden" }}
                >
                  {/* 리드 요약 행 */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : lead.id)}
                    style={{
                      width: "100%", padding: "16px 20px",
                      display: "flex", alignItems: "center", gap: 12,
                      background: "none", border: "none", cursor: "pointer", textAlign: "left",
                    }}
                  >
                    {/* 상태 뱃지 */}
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      color: st.color, background: st.bg,
                      padding: "3px 10px", borderRadius: 20, flexShrink: 0,
                      minWidth: 54, textAlign: "center",
                    }}>
                      {st.label}
                    </span>

                    {/* 핵심 정보 */}
                    <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                      <span style={{ minWidth: 0, maxWidth: "100%", overflowWrap: "anywhere", fontSize: 13, fontWeight: 600, color: A.text }}>
                        {formatEstimateRegion(lead.region)}
                      </span>
                      <span style={{ minWidth: 0, maxWidth: "100%", overflowWrap: "anywhere", fontSize: 13, color: A.mid }}>
                        {TYPE_LABEL[lead.building_type ?? ""] || "-"}
                        {lead.commercial_sub ? ` · ${lead.commercial_sub}` : lead.commercial_type ? ` · ${lead.commercial_type}` : ""}
                      </span>
                      <span style={{ fontSize: 13, color: A.mid }}>{lead.area ? `${lead.area}평` : "-"}</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: A.gold }}>
                        {lead.estimated_total ? `${lead.estimated_total.toLocaleString()}만원` : "-"}
                      </span>
                    </div>

                    {/* 날짜 + 열기 */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, color: A.light }}>{fmtDate(lead.created_at)}</span>
                      <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                        <IconChevronRight size={16} color={A.light} />
                      </motion.div>
                    </div>
                  </button>

                  {/* 펼쳐진 상세 */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                        style={{ overflow: "hidden" }}
                      >
                        <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${A.border}` }}>

                          {/* 상세 정보 그리드 */}
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, margin: "16px 0" }}>
                            {[
                              { icon: <IconMail size={13} />,     label: "이메일",   val: lead.email },
                              { icon: <IconMapPin size={13} />,   label: "지역",     val: formatEstimateRegion(lead.region) },
                              { icon: <IconRuler size={13} />,    label: "평수",     val: lead.area ? `${lead.area}평` : "-" },
                              { icon: <IconDiamond size={13} />,  label: "자재등급", val: GRADE_LABEL[lead.material_grade ?? ""] || "-" },
                            ].map(item => (
                              <div key={item.label} style={{ minWidth: 0, overflowWrap: "anywhere", padding: "10px 14px", background: "#111", borderRadius: 10, border: `1px solid ${A.border}` }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, color: A.light }}>
                                  {item.icon}
                                  <span style={{ fontSize: 11, fontWeight: 600 }}>{item.label}</span>
                                </div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: A.text }}>{item.val}</div>
                              </div>
                            ))}
                          </div>

                          {/* 선택 공종 */}
                          {lead.works && lead.works.length > 0 && (
                            <div style={{ marginBottom: 16 }}>
                              <div style={{ fontSize: 11, color: A.light, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                                <IconTool size={12} /> 선택 공종 ({lead.works.length}개)
                              </div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {lead.works.map(w => (
                                  <span key={w} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, background: A.border, color: A.mid, fontWeight: 500 }}>{w}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 상태 변경 + 삭제 버튼 */}
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: 12, color: A.light, marginRight: 4 }}>상태 변경:</span>
                              {(["new", "qualified", "contracted"] as const).map(s => {
                                const cfg = STATUS_CONFIG[s];
                                const isCurrent = lead.status === s;
                                return (
                                  <button
                                    key={s}
                                    disabled={isCurrent || updating === lead.id}
                                    onClick={() => changeStatus(lead.id, s)}
                                    style={{
                                      padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${isCurrent ? cfg.color : A.border}`,
                                      background: isCurrent ? cfg.bg : "none",
                                      color: isCurrent ? cfg.color : A.light,
                                      fontSize: 12, fontWeight: isCurrent ? 700 : 500,
                                      cursor: isCurrent ? "default" : "pointer",
                                      display: "flex", alignItems: "center", gap: 5,
                                    }}
                                  >
                                    {isCurrent && <IconCheck size={11} />}
                                    {cfg.label}
                                  </button>
                                );
                              })}
                              {updating === lead.id && (
                                <span style={{ fontSize: 11, color: A.light, marginLeft: 4 }}>저장 중...</span>
                              )}
                            </div>

                            {/* 삭제 버튼 */}
                            {confirmDelete === lead.id ? (
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ fontSize: 12, color: "#EF4444" }}>정말 삭제?</span>
                                <button
                                  onClick={() => deleteLead(lead.id)}
                                  disabled={deleting === lead.id}
                                  style={{
                                    padding: "5px 12px", borderRadius: 20, border: "none",
                                    background: "#EF4444", color: "#fff",
                                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                                  }}
                                >
                                  {deleting === lead.id ? "삭제 중..." : "삭제"}
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(null)}
                                  style={{
                                    padding: "5px 12px", borderRadius: 20, border: `1px solid ${A.border}`,
                                    background: "none", color: A.light,
                                    fontSize: 12, cursor: "pointer",
                                  }}
                                >
                                  취소
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDelete(lead.id)}
                                style={{
                                  display: "flex", alignItems: "center", gap: 5,
                                  padding: "6px 12px", borderRadius: 20,
                                  border: `1px solid ${A.border}`, background: "none",
                                  color: "#EF4444", fontSize: 12, cursor: "pointer",
                                }}
                              >
                                <IconTrash size={12} /> 삭제
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
        </section>}
      </div>
    </div>
  );
}
