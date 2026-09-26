"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconArrowRight } from "@tabler/icons-react";
import { saveEstimate } from "@/lib/estimateStore";
import { FlightPath, C } from "@/components/EstimateLayout";

const GUIDE = [
  { range: "10평 이하",    desc: "소형 매장 · 1인샵" },
  { range: "10 ~ 30평",   desc: "일반 매장 · 소형 오피스" },
  { range: "30 ~ 60평",   desc: "중형 매장 · 카페 · 학원" },
  { range: "60 ~ 100평",  desc: "대형 매장 · 헬스장" },
  { range: "100평 이상",  desc: "대형 공간 · 복합시설" },
];

export default function Step2Page() {
  const router = useRouter();
  const [area, setArea] = useState<string>("");
  const canNext = Number(area) >= 1;

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>

      {/* 헤더 */}
      <div style={{ background: "#111111", padding: "13px 0" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ fontWeight: 800, fontSize: 17, color: "#F5C200", textDecoration: "none" }}>
            폼잇.
          </Link>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>세부 견적 · 2단계</span>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "28px 20px 80px" }}>

        {/* 진행 경로 */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 16px 12px", marginBottom: 24 }}>
          <FlightPath step={2} totalSteps={5} />
        </div>

        {/* 면적 입력 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.textDark, marginBottom: 4 }}>
            공사할 공간이 몇 평 정도 되나요?
          </div>
          <div style={{ fontSize: 13, color: C.textLight, marginBottom: 16 }}>
            어림잡아 입력해도 견적에 큰 차이 없어요
          </div>

          {/* 큰 입력창 */}
          <div style={{ position: "relative", marginBottom: 12 }}>
            <input
              type="number"
              min={1}
              max={9999}
              value={area}
              onChange={e => setArea(e.target.value)}
              placeholder="32"
              style={{
                width: "100%",
                height: 80,
                fontSize: 36,
                fontWeight: 800,
                color: C.textDark,
                textAlign: "center",
                background: C.card,
                border: `2px solid ${area && canNext ? C.selectedBorder : C.border}`,
                borderRadius: 16,
                outline: "none",
                boxSizing: "border-box",
                paddingRight: 60,
                transition: "border-color 0.15s ease",
              }}
            />
            <span style={{
              position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)",
              fontSize: 18, fontWeight: 700, color: C.textLight,
            }}>평</span>
          </div>

          <div style={{ fontSize: 13, color: C.textMid, textAlign: "center", lineHeight: 1.6 }}>
            정확하지 않아도 괜찮아요 — <span style={{ color: C.primary, fontWeight: 600 }}>대략적인 평수</span>를 입력하시면 됩니다.<br />
            <span style={{ fontSize: 12, color: C.textLight }}>등기부등본 또는 부동산 앱에서 확인할 수 있어요</span>
          </div>
        </div>

        {/* 평수 가이드 */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px", marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, marginBottom: 12 }}>평수 참고 가이드</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {GUIDE.map(g => (
              <div key={g.range} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.textMid, minWidth: 90 }}>{g.range}</span>
                <span style={{ fontSize: 12, color: C.textLight }}>{g.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => router.back()} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 14, color: C.textLight, fontWeight: 500,
          }}>
            ← 이전
          </button>
          <button
            disabled={!canNext}
            onClick={() => {
              saveEstimate({ area: Number(area), selectedWorks: [] });
              router.push("/estimate/detail/step3");
            }}
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
