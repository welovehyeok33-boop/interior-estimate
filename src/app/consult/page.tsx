"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { IconArrowRight, IconBuildingSkyscraper, IconTrain, IconMountain } from "@tabler/icons-react";
import { saveConsult } from "@/lib/consultStore";
import { C } from "@/components/EstimateLayout";

const REGIONS = [
  { id: "seoul", label: "서울", desc: "서울특별시", icon: <IconBuildingSkyscraper size={24} strokeWidth={1.5} /> },
  { id: "metro", label: "수도권", desc: "경기 · 인천", icon: <IconTrain size={24} strokeWidth={1.5} /> },
  { id: "local", label: "지방", desc: "그 외 지역", icon: <IconMountain size={24} strokeWidth={1.5} /> },
];

const TYPES = [
  { id: "residential", label: "주거", desc: "아파트 · 빌라 · 단독주택" },
  { id: "commercial", label: "상가", desc: "매장 · 오피스 · 상업공간" },
];

export default function ConsultStep1() {
  const router = useRouter();
  const [region, setRegion] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);

  const canNext = !!region && !!type;

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <div style={{ background: "#111111", padding: "13px 0" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/landing" style={{ fontWeight: 900, fontSize: 17, color: "#F5C200", textDecoration: "none" }}>폼잇.</Link>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>무료 상담 · 1단계</span>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 20px 80px" }}>

        {/* 진행바 */}
        <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i === 1 ? "#F5C200" : C.border }} />
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.textDark, marginBottom: 6, letterSpacing: "-0.5px" }}>
            어디서 공사하실 건가요?
          </div>
          <div style={{ fontSize: 13, color: C.textLight, marginBottom: 28 }}>지역과 공간 유형을 선택해주세요</div>

          {/* 지역 */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 12 }}>지역</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {REGIONS.map(r => {
                const sel = region === r.id;
                return (
                  <motion.button key={r.id} onClick={() => setRegion(r.id)}
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
                    <motion.div animate={{ color: sel ? "#F5C200" : "#CCCCCC" }} style={{ marginBottom: 8, display: "flex", justifyContent: "center" }}>
                      {r.icon}
                    </motion.div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: sel ? C.textDark : C.textMid }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: C.textLight, marginTop: 3 }}>{r.desc}</div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* 공간 유형 */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 12 }}>공간 유형</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
              {TYPES.map(t => {
                const sel = type === t.id;
                return (
                  <motion.button key={t.id} onClick={() => setType(t.id)}
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
                    <div style={{ fontWeight: 800, fontSize: 16, color: sel ? C.textDark : C.textMid, marginBottom: 4 }}>{t.label}</div>
                    <div style={{ fontSize: 12, color: C.textLight }}>{t.desc}</div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <button
            disabled={!canNext}
            onClick={() => {
              saveConsult({ region: region ?? undefined, buildingType: type ?? undefined });
              router.push("/consult/step2");
            }}
            style={{
              width: "100%", padding: "15px",
              borderRadius: 30, border: "none",
              background: canNext ? `linear-gradient(135deg, #FFD740, #F5C200)` : C.border,
              color: canNext ? "#111" : C.textLight,
              fontWeight: 700, fontSize: 15,
              cursor: canNext ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            다음 <IconArrowRight size={16} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
