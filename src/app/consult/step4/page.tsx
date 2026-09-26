"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { IconPhone, IconUser, IconCheck } from "@tabler/icons-react";
import { loadConsult, clearConsult } from "@/lib/consultStore";
import { supabase } from "@/lib/supabase";
import { C } from "@/components/EstimateLayout";

export default function ConsultStep4() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const phoneClean = phone.replace(/[^0-9]/g, "");
  const canNext = name.trim().length > 0 && phoneClean.length >= 10 && agreed;

  const handleSubmit = async () => {
    if (!canNext) return;
    setSending(true);
    const data = loadConsult();
    try {
      await supabase.from("consultations").insert({
        region: data.region ?? null,
        building_type: data.buildingType ?? null,
        area: data.area ?? null,
        experience: data.experience ?? null,
        schedule: data.schedule ?? null,
        work_scope: data.workScope ?? null,
        budget: data.budget ?? null,
        memo: data.memo ?? null,
        name: name.trim(),
        phone: phoneClean,
        status: "new",
      });
      clearConsult();
      setDone(true);
    } catch (err) {
      console.error(err);
    }
    setSending(false);
  };

  if (done) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: "center", maxWidth: 360 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 16, delay: 0.1 }}
            style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "#F5C200",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <IconCheck size={36} color="#111" strokeWidth={3} />
          </motion.div>
          <div style={{ fontSize: 24, fontWeight: 900, color: C.textDark, marginBottom: 12, letterSpacing: "-0.5px" }}>
            상담 신청 완료!
          </div>
          <div style={{ fontSize: 15, color: C.textMid, lineHeight: 1.7, marginBottom: 8 }}>
            <span style={{ color: "#F5C200", fontWeight: 700 }}>{name}</span>님, 감사합니다.
          </div>
          <div style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, marginBottom: 36 }}>
            24시간 이내에 전문가가<br />
            <span style={{ fontWeight: 700, color: C.textMid }}>{phone}</span>으로 직접 연락드릴게요.
          </div>
          <Link href="/landing" style={{
            display: "block", padding: "14px",
            borderRadius: 14, background: "#111",
            color: "#F5C200", fontWeight: 700, fontSize: 15,
            textDecoration: "none",
          }}>
            홈으로 돌아가기
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <div style={{ background: "#111111", padding: "13px 0" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/landing" style={{ fontWeight: 900, fontSize: 17, color: "#F5C200", textDecoration: "none" }}>폼잇.</Link>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>무료 상담 · 마지막 단계</span>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 20px 80px" }}>

        {/* 진행바 */}
        <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: "#F5C200" }} />
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.textDark, marginBottom: 6, letterSpacing: "-0.5px" }}>
            거의 다 됐어요!
          </div>
          <div style={{ fontSize: 13, color: C.textLight, marginBottom: 32 }}>연락받으실 정보를 입력해주세요</div>

          {/* 이름 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 8 }}>이름</div>
            <div style={{ position: "relative" }}>
              <IconUser size={18} color={C.textLight} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input
                type="text"
                placeholder="홍길동"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "14px 14px 14px 44px",
                  borderRadius: 12,
                  border: `1.5px solid ${name ? C.selectedBorder : C.border}`,
                  fontSize: 15, color: C.textDark, outline: "none",
                  background: name ? C.selectedBg : C.card,
                  transition: "all 0.15s",
                }}
              />
            </div>
          </div>

          {/* 전화번호 */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 8 }}>전화번호</div>
            <div style={{ position: "relative" }}>
              <IconPhone size={18} color={C.textLight} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input
                type="tel"
                placeholder="010-0000-0000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "14px 14px 14px 44px",
                  borderRadius: 12,
                  border: `1.5px solid ${phoneClean.length >= 10 ? C.selectedBorder : C.border}`,
                  fontSize: 15, color: C.textDark, outline: "none",
                  background: phoneClean.length >= 10 ? C.selectedBg : C.card,
                  transition: "all 0.15s",
                }}
              />
            </div>
          </div>

          {/* 개인정보 동의 */}
          <div
            onClick={() => setAgreed(!agreed)}
            style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              padding: "14px 16px", borderRadius: 12,
              border: `1.5px solid ${agreed ? C.selectedBorder : C.border}`,
              background: agreed ? C.selectedBg : C.card,
              cursor: "pointer", marginBottom: 28,
            }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
              border: `2px solid ${agreed ? "#F5C200" : C.border}`,
              background: agreed ? "#F5C200" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s",
            }}>
              {agreed && <IconCheck size={11} color="#111" strokeWidth={3.5} />}
            </div>
            <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.6 }}>
              <span style={{ fontWeight: 700, color: C.textDark }}>개인정보 수집 · 이용에 동의합니다</span><br />
              수집한 정보는 상담 목적으로만 사용되며, 상담 완료 후 파기됩니다.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => router.back()} style={{
              padding: "14px 20px", borderRadius: 30,
              border: `1.5px solid ${C.border}`, background: C.card,
              color: C.textMid, fontWeight: 600, fontSize: 14, cursor: "pointer",
            }}>
              ← 이전
            </button>
            <button
              disabled={!canNext || sending}
              onClick={handleSubmit}
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
              {sending ? "전송 중..." : "상담 신청 완료 →"}
            </button>
          </div>

          <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: C.textLight }}>
            🔒 개인정보는 안전하게 보호됩니다
          </div>
        </motion.div>
      </div>
    </div>
  );
}
