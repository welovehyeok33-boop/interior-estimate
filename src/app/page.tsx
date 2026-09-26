"use client";

import Link from "next/link";
import { IconArrowRight, IconCheck, IconHome, IconBuildingStore, IconPhone, IconClipboardList, IconMessageCircle } from "@tabler/icons-react";
import { C } from "@/components/EstimateLayout";
import { saveConsult } from "@/lib/consultStore";

const cta = { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, minHeight: 52, padding: "12px 20px", boxSizing: "border-box" as const, background: C.primary, color: C.textDark, borderRadius: 14, textDecoration: "none", fontWeight: 800, fontSize: 16 };
const container = { maxWidth: 1040, margin: "0 auto", padding: "0 20px" };
const faqs = [
  ["공사 계획이 아직 없는데 신청해도 되나요?", "네. 지역이나 평수, 예산이 정해지지 않았어도 신청할 수 있어요. ‘아직 미정’ 또는 ‘모르겠어요’를 선택해주세요."],
  ["무료 견적 상담은 어떻게 진행되나요?", "공간과 공사 계획, 연락처를 남기면 신청 내용을 확인한 뒤 전화로 상담을 이어갑니다. 상담 신청에는 비용이 들지 않아요."],
  ["신청하면 바로 견적서가 나오나요?", "현재는 무료 견적 상담 신청 서비스예요. 공사 범위와 현장 조건을 확인한 뒤 비용을 상담합니다. 자동 상세 견적과 PDF 발송은 준비 중이에요."],
  ["집도, 상가도 신청할 수 있나요?", "아파트·빌라·단독주택과 매장·사무실 등 모두 신청할 수 있어요. 전체 공사인지 부분 공사인지 아직 몰라도 괜찮아요."],
];
export default function Home() {
  return <div style={{ background: C.bg, color: C.textDark, minHeight: "100vh" }}>
    <header style={{ background: C.card, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 20 }}>
      <nav aria-label="메인 메뉴" style={{ ...container, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 68 }}>
        <Link href="/" style={{ fontSize: 24, fontWeight: 900, textDecoration: "none", color: C.textDark }}>폼잇<span style={{ color: C.primary }}>.</span></Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/blog" style={{ color: C.textMid, fontSize: 14, textDecoration: "none" }}>가이드</Link>
          <Link href="/consult" style={{ ...cta, fontSize: 14, padding: "10px 14px", minHeight: 44 }}>무료 견적 상담</Link>
        </div>
      </nav>
    </header>
    <main>
      <section style={{ ...container, paddingTop: 48, paddingBottom: 56 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 36 }}>
          <div style={{ flex: "1 1 340px", minWidth: 0 }}>
            <p style={{ display: "inline-block", padding: "6px 12px", borderRadius: 20, background: C.gold, color: C.textMid, fontSize: 13, fontWeight: 700, margin: "0 0 20px" }}>인테리어, 처음이어도 괜찮아요</p>
            <h1 style={{ fontSize: "clamp(32px, 6vw, 52px)", letterSpacing: "-1.8px", lineHeight: 1.25, margin: "0 0 20px", wordBreak: "keep-all" }}>
              우리 공간 공사,<br />얼마부터 생각하면 될까요?
            </h1>
            <p style={{ fontSize: 17, color: C.textMid, lineHeight: 1.8, margin: "0 0 24px", wordBreak: "keep-all" }}>
              공간과 고민만 알려주세요.<br />필요한 공사와 예산을 상담으로 함께 정리해요.
            </p>
            <Link href="/consult" style={{ ...cta, maxWidth: 420 }}>무료 견적 상담 시작하기 <IconArrowRight size={20} /></Link>
            <p style={{ fontSize: 13, color: C.textMid, margin: "12px 0 0" }}>회원가입 없이 · 상담 신청 무료 · 모르는 항목은 미정으로</p>
          </div>
          <aside aria-label="상담 가능한 공간" style={{ flex: "1 1 280px", minWidth: 0, padding: 24, boxSizing: "border-box", background: C.card, border: `1px solid ${C.border}`, borderRadius: 24 }}>
            <p style={{ fontWeight: 800, fontSize: 19, margin: "0 0 20px" }}>어떤 공간을 준비하고 계세요?</p>
            {[
              { id: "residential", icon: <IconHome size={26} />, title: "우리 집 인테리어", desc: "아파트 · 빌라 · 단독주택" },
              { id: "commercial", icon: <IconBuildingStore size={26} />, title: "매장·사무실 인테리어", desc: "카페 · 식당 · 사무실 · 그 외 공간" },
            ].map(item => <Link key={item.title} href="/consult" onClick={() => saveConsult({ buildingType: item.id })} style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 14px", border: `1px solid ${C.border}`, borderRadius: 14, textDecoration: "none", color: C.textDark, marginBottom: 12 }}>
              {item.icon}<div style={{ flex: 1 }}><strong>{item.title}</strong><div style={{ fontSize: 12, color: C.textMid, marginTop: 6 }}>{item.desc}</div></div><IconArrowRight size={18} />
            </Link>)}
            <p style={{ fontSize: 14, lineHeight: 1.7, color: C.textMid, marginBottom: 0 }}>평수도, 업종도, 자재도 아직 몰라도 괜찮아요.<br />알고 있는 내용부터 시작해주세요.</p>
          </aside>
        </div>
      </section>
      <section style={{ background: C.headerFrom, color: C.card, padding: "44px 0" }}>
        <div style={container}>
          <h2 style={{ fontSize: 26, margin: "0 0 24px" }}>신청 후에는 이렇게 진행돼요</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 24 }}>
            {[
              { icon: <IconClipboardList />, title: "1. 간단한 정보 입력", desc: "지역, 공간 크기, 공사 계획을 알려주세요. 정해지지 않은 내용은 건너뛸 수 있어요." },
              { icon: <IconPhone />, title: "2. 신청 확인 후 연락", desc: "담당자가 남겨주신 전화번호로 연락해 자세한 내용을 확인해요." },
              { icon: <IconMessageCircle />, title: "3. 공사 범위와 비용 상담", desc: "공간 조건과 원하는 공사를 이야기하고, 필요한 다음 단계를 함께 정리해요." },
            ].map(item => <div key={item.title}>{item.icon}<h3 style={{ fontSize: 17 }}>{item.title}</h3><p style={{ fontSize: 14, lineHeight: 1.8, margin: 0 }}>{item.desc}</p></div>)}
          </div>
        </div>
      </section>
      <section style={{ maxWidth: 720, margin: "auto", padding: "48px 20px" }}>
        <h2 style={{ fontSize: 26, margin: "0 0 24px" }}>이런 고민부터 이야기해요</h2>
        {["전체 공사가 필요한지, 일부만 바꿔도 될지 모르겠어요.", "예산 안에서 어떤 공사를 먼저 할지 고민돼요.", "창업 준비 중인데 인테리어가 처음이에요."].map(text => <p key={text} style={{ display: "flex", alignItems: "flex-start", gap: 10, lineHeight: 1.7, color: C.textMid }}><IconCheck style={{ flexShrink: 0, marginTop: 3 }} size={20} />{text}</p>)}
        <Link href="/consult" style={{ ...cta, marginTop: 24 }}>내 공간 무료 견적 상담하기 <IconArrowRight size={18} /></Link>
        <h2 style={{ fontSize: 26, margin: "48px 0 20px" }}>자주 묻는 질문</h2>
        {faqs.map(([question, answer]) => <details key={question} style={{ borderBottom: `1px solid ${C.border}`, padding: "16px 0" }}>
          <summary style={{ fontWeight: 700, cursor: "pointer", lineHeight: 1.6 }}>{question}</summary>
          <p style={{ color: C.textMid, lineHeight: 1.8, fontSize: 14 }}>{answer}</p>
        </details>)}
        <div style={{ padding: 20, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, marginTop: 32 }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 17 }}>입력 조건별 예상 비용도 살펴볼 수 있어요</h3>
          <p style={{ color: C.textMid, lineHeight: 1.7, fontSize: 14 }}>간편 계산은 시험 운영 중인 참고용이에요. 실제 견적은 상담과 현장 확인이 필요해요.</p>
          <Link href="/estimate/detail" style={{ color: C.textDark, fontWeight: 700, display: "inline-block", padding: "12px 0" }}>예상 비용 계산해보기 →</Link>
        </div>
      </section>
    </main>
    <footer style={{ borderTop: `1px solid ${C.border}`, padding: "24px 20px", textAlign: "center", color: C.textMid, fontSize: 13, lineHeight: 2 }}>
      폼잇. · 인테리어 무료 견적 상담<br /><Link href="/blog" style={{ color: C.textMid }}>인테리어 가이드</Link>
    </footer>
  </div>;
}
