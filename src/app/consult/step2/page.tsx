"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { IconArrowRight } from "@tabler/icons-react";
import { saveConsult } from "@/lib/consultStore";
import { C } from "@/components/EstimateLayout";

const AREAS = [10,15,20,25,30,33,40,50,60,80,100];

export default function ConsultStep2() {
  const router = useRouter();
  const [area, setArea] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  const finalArea = useCustom ? Number(custom) : area;
  const canNext = useCustom ? !!custom && Number(custom) > 0 : !!area;

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <div style={{ background: "#111111", padding: "13px 0" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/landing" style={{ fontWeight: 900, fontSize: 17, color: "#F5C200", textDecoration: "none" }}>폼잇.</Link>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>무료 상담 · 2단계</span>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 20px 80px" }}>

        {/* 진행바 */}
        <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= 2 ? "#F5C200" : C.border }} />
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.textDark, marginBottom: 6, letterSpacing: "-0.5px" }}>
            몇 평 정도 되나요?
          </div>
          <div style={{ fontSize: 13, color: C.textLight, marginBottom: 28 }}>공사 예정 공간의 전용면적 기준이에요</div>

          {/* 평수 버튼 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
            {AREAS.map(a => {
              const sel = !useCustom && area === a;
              return (
                <motion.button key={a}
                  onClick={() => { setArea(a); setUseCustom(false); }}
                  whileTap={{ scale: 0.93 }}
                  animate={{ scale: sel ? 1.05 : 1 }}
                  style={{
                    padding: "14px 8px", borderRadius: 12,
                    border: `${sel ? "2px" : "1.5px"} solid ${sel ? C.selectedBorder : C.border}`,
                    background: sel ? C.selectedBg : C.card,
                    cursor: "pointer", textAlign: "center",
                    boxShadow: sel ? `0 4px 16px rgba(245,194,0,0.25)` : "none",
                  }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: sel ? C.textDark : C.textMid }}>{a}평</div>
                </motion.button>
              );
            })}

            {/* 직접 입력 */}
            <motion.button
              onClick={() => { setUseCustom(true); setArea(null); }}
              animate={{ scale: useCustom ? 1.05 : 1 }}
              style={{
                padding: "14px 8px", borderRadius: 12,
                border: `${useCustom ? "2px" : "1.5px"} solid ${useCustom ? C.selectedBorder : C.border}`,
                background: useCustom ? C.selectedBg : C.card,
                cursor: "pointer", textAlign: "center",
                boxShadow: useCustom ? `0 4px 16px rgba(245,194,0,0.25)` : "none",
              }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: useCustom ? C.textDark : C.textMid }}>직접입력</div>
            </motion.button>
          </div>

          {useCustom && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 16 }}>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  placeholder="평수 입력"
                  value={custom}
                  onChange={e => setCustom(e.target.value)}
                  autoFocus
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "14px 48px 14px 16px",
                    borderRadius: 12, border: `2px solid ${C.selectedBorder}`,
                    fontSize: 16, color: C.textDark, outline: "none",
                    background: C.selectedBg,
                  }}
                />
                <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: C.textMid, fontWeight: 600 }}>평</span>
              </div>
            </motion.div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
            <button onClick={() => router.back()} style={{
              padding: "14px 20px", borderRadius: 30,
              border: `1.5px solid ${C.border}`, background: C.card,
              color: C.textMid, fontWeight: 600, fontSize: 14, cursor: "pointer",
            }}>
              ← 이전
            </button>
            <button
              disabled={!canNext}
              onClick={() => {
                saveConsult({ area: finalArea ?? undefined });
                router.push("/consult/step3");
              }}
              style={{
                flex: 1, padding: "14px",
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
          </div>
        </motion.div>
      </div>
    </div>
  );
}
