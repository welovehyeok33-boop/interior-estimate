import Link from "next/link";
import { C } from "./EstimateLayout";

export default function AccountNotice() {
  return <main style={{ minHeight: "100vh", background: C.bg, color: C.textDark, boxSizing: "border-box", padding: "60px 20px" }}>
    <section style={{ maxWidth: 480, margin: "auto", padding: 24, border: `1px solid ${C.border}`, background: C.card, borderRadius: 20 }}>
      <Link href="/" style={{ color: C.textDark, fontWeight: 900, fontSize: 22, textDecoration: "none" }}>폼잇.</Link>
      <h1 style={{ fontSize: 24, lineHeight: 1.4 }}>회원가입 없이 상담할 수 있어요</h1>
      <p style={{ color: C.textMid, lineHeight: 1.8 }}>회원 기능은 준비 중이에요. 지금은 계정이나 비밀번호 없이 무료 견적 상담을 신청해주세요.</p>
      <Link href="/consult" style={{ display: "block", padding: 16, borderRadius: 12, background: C.primary, color: C.textDark, textDecoration: "none", textAlign: "center", fontWeight: 800 }}>무료 견적 상담 시작하기 →</Link>
    </section>
  </main>;
}
