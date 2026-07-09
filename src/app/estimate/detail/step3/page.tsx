"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconArrowRight, IconCheck,
  IconHammer, IconBuildingFactory2, IconGridDots, IconPaint,
  IconLayersIntersect, IconBrush, IconLayoutBottombar, IconTool,
  IconDoor, IconArmchair, IconAd,
  IconPick, IconDroplet, IconUmbrella, IconBolt,
  IconTemperature, IconFlame, IconWind, IconGauge,
  IconStack2, IconBolt as IconScrewBolt, IconDots,
} from "@tabler/icons-react";
import { saveEstimate, loadEstimate } from "@/lib/estimateStore";
import { FlightPath, C } from "@/components/EstimateLayout";

// ── 공종 데이터 ────────────────────────────────────────────
const FINISH_WORKS = [
  { id: "목공",      label: "목공",      desc: "몰딩·가벽·천장틀",     icon: <IconHammer size={22} strokeWidth={1.5} /> },
  { id: "경량",      label: "경량",      desc: "경량철골 파티션",       icon: <IconBuildingFactory2 size={22} strokeWidth={1.5} /> },
  { id: "타일",      label: "타일",      desc: "욕실·주방·바닥",       icon: <IconGridDots size={22} strokeWidth={1.5} /> },
  { id: "도장",      label: "도장",      desc: "페인트·에폭시",        icon: <IconPaint size={22} strokeWidth={1.5} /> },
  { id: "필름",      label: "필름",      desc: "시트·래핑",            icon: <IconLayersIntersect size={22} strokeWidth={1.5} /> },
  { id: "도배",      label: "도배",      desc: "합지·실크·친환경",     icon: <IconBrush size={22} strokeWidth={1.5} /> },
  { id: "바닥",      label: "바닥",      desc: "마루·강마루·LVT",      icon: <IconLayoutBottombar size={22} strokeWidth={1.5} /> },
  { id: "금속",      label: "금속",      desc: "스틸·알루미늄",        icon: <IconTool size={22} strokeWidth={1.5} /> },
  { id: "창호",      label: "창호",      desc: "창문·도어 교체",       icon: <IconDoor size={22} strokeWidth={1.5} /> },
  { id: "가구",      label: "가구",      desc: "붙박이장·주방가구",    icon: <IconArmchair size={22} strokeWidth={1.5} /> },
  { id: "간판",      label: "간판",      desc: "LED·채널·사인",        icon: <IconAd size={22} strokeWidth={1.5} /> },
];

const FUNCTION_WORKS = [
  { id: "철거",      label: "철거",      desc: "기존 인테리어 해체",   icon: <IconPick size={22} strokeWidth={1.5} /> },
  { id: "설비",      label: "설비",      desc: "배관·급배수",          icon: <IconDroplet size={22} strokeWidth={1.5} /> },
  { id: "방수",      label: "방수",      desc: "욕실·옥상 방수",       icon: <IconUmbrella size={22} strokeWidth={1.5} /> },
  { id: "전기/조명", label: "전기·조명", desc: "배선·조명 시공",       icon: <IconBolt size={22} strokeWidth={1.5} /> },
  { id: "냉난방",    label: "냉난방",    desc: "에어컨·보일러",        icon: <IconTemperature size={22} strokeWidth={1.5} /> },
  { id: "소방",      label: "소방",      desc: "스프링클러·감지기",    icon: <IconFlame size={22} strokeWidth={1.5} /> },
  { id: "덕트",      label: "덕트",      desc: "환기·공조 덕트",       icon: <IconWind size={22} strokeWidth={1.5} /> },
  { id: "가스",      label: "가스",      desc: "가스 배관·설비",       icon: <IconGauge size={22} strokeWidth={1.5} /> },
  { id: "단열",      label: "단열",      desc: "열·결로 차단",         icon: <IconStack2 size={22} strokeWidth={1.5} /> },
  { id: "철물",      label: "철물",      desc: "경첩·손잡이·레일",     icon: <IconScrewBolt size={22} strokeWidth={1.5} /> },
  { id: "그외",      label: "그 외",     desc: "기타 공종",            icon: <IconDots size={22} strokeWidth={1.5} /> },
];

type WorkItem = { id: string; label: string; desc: string; icon: React.ReactNode };

function WorkCard({ item, selected, onClick }: { item: WorkItem; selected: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.91 }}
      animate={{
        scale: selected ? 1.04 : 1,
        y: selected ? -2 : 0,
      }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
      style={{
        position: "relative",
        padding: "14px 10px 12px",
        borderRadius: 12,
        border: `${selected ? "2px" : "1.5px"} solid ${selected ? C.selectedBorder : C.border}`,
        background: selected ? C.selectedBg : C.card,
        cursor: "pointer", textAlign: "center",
        transition: "border-color 0.15s, background 0.15s",
        boxShadow: selected ? `0 4px 16px rgba(245,194,0,0.25)` : "none",
      }}
    >
      {/* 체크 뱃지 */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 30 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            style={{
              position: "absolute", top: 6, right: 6,
              width: 18, height: 18, borderRadius: "50%",
              background: C.primary,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <IconCheck size={10} color="#111" strokeWidth={3.5} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 아이콘 */}
      <motion.div
        animate={{ color: selected ? C.primary : "#CCCCCC", scale: selected ? 1.12 : 1 }}
        transition={{ duration: 0.2 }}
        style={{ marginBottom: 7, display: "flex", justifyContent: "center" }}
      >
        {item.icon}
      </motion.div>

      <div style={{ fontSize: 12, fontWeight: 700, color: selected ? C.textDark : C.textMid, marginBottom: 2, transition: "color 0.15s" }}>
        {item.label}
      </div>
      <div style={{ fontSize: 10, color: C.textLight, lineHeight: 1.3 }}>{item.desc}</div>
    </motion.button>
  );
}

export default function Step3Page() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const saved = loadEstimate();
    if (saved.selectedWorks && saved.selectedWorks.length > 0) {
      setSelected(saved.selectedWorks);
    }
  }, []);

  const toggle = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]);

  const canNext = selected.length > 0;

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>

      {/* 헤더 */}
      <div style={{ background: "#111111", padding: "13px 0" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ fontWeight: 800, fontSize: 17, color: "#F5C200", textDecoration: "none" }}>
            폼잇.
          </Link>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>세부 견적 · 3단계</span>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "28px 20px 80px" }}>

        {/* 진행 경로 */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 16px 12px", marginBottom: 24 }}>
          <FlightPath step={3} totalSteps={5} />
        </div>

        {/* 안내 메시지 */}
        <div style={{
          padding: "16px 18px", borderRadius: 14,
          background: C.selectedBg, border: `1.5px solid ${C.border}`,
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.textDark, marginBottom: 4 }}>
            실제로 필요한 공사만 골라주세요
          </div>
          <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6 }}>
            전부 선택할 필요 없어요. 이번 공사에서 진행할 것들만 체크하면 됩니다.<br />
            <span style={{ color: C.primary, fontWeight: 600 }}>잘 모르겠으면 넘어가도 괜찮아요</span> — 나중에 수정할 수 있습니다.
          </div>
        </div>

        {/* 선택 카운터 */}
        {selected.length > 0 && (
          <div style={{ padding: "9px 14px", borderRadius: 10, background: "#fff", border: `1.5px solid ${C.border}`, marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.textMid }}>
              선택됨 · <span style={{ color: C.primary, fontWeight: 700 }}>{selected.join(", ")}</span>
            </span>
          </div>
        )}

        {/* 마감공정 */}
        <WorkGroup
          label="마감공정"
          desc="도배·타일·바닥 등 마감 작업"
          works={FINISH_WORKS}
          selected={selected}
          onToggle={toggle}
        />

        <div style={{ borderTop: `1px dashed ${C.border}`, margin: "20px 0" }} />

        {/* 기능공정 */}
        <WorkGroup
          label="기능공정"
          desc="전기·설비·철거 등 기능 작업"
          works={FUNCTION_WORKS}
          selected={selected}
          onToggle={toggle}
        />

        {/* 하단 버튼 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28 }}>
          <button onClick={() => router.back()} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 14, color: C.textLight, fontWeight: 500,
          }}>
            ← 이전
          </button>
          <button
            disabled={!canNext}
            onClick={() => { saveEstimate({ selectedWorks: selected }); router.push("/estimate/detail/step4"); }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "12px 28px", borderRadius: 30, border: "none",
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

function WorkGroup({ label, desc, works, selected, onToggle }: {
  label: string; desc: string;
  works: WorkItem[]; selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.textDark }}>{label}</div>
        <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>{desc}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {works.map(item => (
          <WorkCard key={item.id} item={item} selected={selected.includes(item.id)} onClick={() => onToggle(item.id)} />
        ))}
      </div>
    </div>
  );
}
