"use client";
import { useRef, useState, type CSSProperties, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IconArrowUpRight, IconCheck, IconArrowRight } from '@tabler/icons-react';
import { C } from './EstimateLayout';
import { PARTNER_BUDGETS, PARTNER_REGIONS, PARTNER_SPECIALTIES, PARTNER_CONSENT_VERSION, validatePartner } from '@/lib/partners';
const H = C.home;
const input: CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '14px 16px', border: `1px solid ${H.line}`, borderRadius: 12, background: C.card, color: H.ink, font: 'inherit', minHeight: 48 };
const button: CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, border: 0, borderRadius: 12, padding: '16px 24px', background: C.primary, color: C.textDark, textDecoration: 'none', fontWeight: 800, cursor: 'pointer' };
export default function PartnerRecruitment() {
  const [regions, setRegions] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const submission = useRef('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    submission.current ||= crypto.randomUUID();
    const payload = { company: String(data.get('company') || ''), contact: String(data.get('contact') || ''), phone: String(data.get('phone') || ''), regions, specialties, budget: String(data.get('budget') || ''), portfolio: String(data.get('portfolio') || ''), intro: String(data.get('intro') || ''), agreed: data.get('agreed') === 'on', consentVersion: PARTNER_CONSENT_VERSION, submissionId: submission.current };
    const invalid = validatePartner(payload);
    if (invalid) { setError(invalid); return; }
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/partners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '접수하지 못했습니다.');
      setDone(true);
    } catch (e) { setError(e instanceof Error ? e.message : '네트워크를 확인해주세요.'); }
    finally { setBusy(false); }
  }
  function choices(title: string, options: readonly string[], selected: string[], update: (v: string[]) => void) {
    return <fieldset style={{ border: 0, padding: 0, margin: '0 0 26px', minWidth: 0 }}><legend style={{ fontWeight: 700, marginBottom: 12 }}>{title} <span style={{ color: H.muted, fontSize: 12 }}>복수 선택 · 필수</span></legend><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{options.map(value => <label key={value} style={{ display: 'flex', alignItems: 'center', gap: 7, border: `1px solid ${selected.includes(value) ? H.accentLine : H.line}`, background: selected.includes(value) ? C.selectedBg : C.card, borderRadius: 10, padding: '10px 13px', fontSize: 14, cursor: 'pointer' }}><input type="checkbox" checked={selected.includes(value)} onChange={e => update(e.target.checked ? [...selected, value] : selected.filter(item => item !== value))} style={{ accentColor: H.bronze }} />{value}</label>)}</div></fieldset>;
  }
  return <div style={{ background: H.paper, color: H.ink, minHeight: '100vh', fontFamily: 'inherit', wordBreak: 'keep-all' }}>
    <header style={{ borderBottom: `1px solid ${H.line}` }}><div style={{ maxWidth: 1120, margin: 'auto', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><Link href="/" style={{ color: H.ink, fontWeight: 900, fontSize: 24, textDecoration: 'none' }}>폼잇.</Link><a href="#apply" style={{ ...button, padding: '10px 16px', fontSize: 13 }}>파트너 신청 <IconArrowUpRight size={16} /></a></div></header>
    <main>
      <section style={{ maxWidth: 1120, margin: 'auto', padding: '72px 24px 64px', display: 'flex', flexWrap: 'wrap', gap: 44, alignItems: 'center' }}>
        <div style={{ flex: '1 1 360px', minWidth: 0 }}><p style={{ color: H.bronze, fontSize: 12, letterSpacing: '0.16em', fontWeight: 800 }}>FORMIT PARTNERS</p><h1 style={{ fontSize: 'clamp(36px, 5vw, 58px)', lineHeight: 1.2, letterSpacing: '-0.055em', margin: '20px 0 24px' }}>좋은 공간을 만드는<br />파트너를 찾습니다.</h1><p style={{ color: H.muted, lineHeight: 1.9, fontSize: 16, maxWidth: 430 }}>주거부터 상가까지. 각자의 전문성을 바탕으로<br />고객의 다음 공간을 함께 만들어갈 인테리어 업체를 모집합니다.</p><a href="#apply" style={{ ...button, marginTop: 20 }}>파트너로 함께하기 <IconArrowRight size={18} /></a><p style={{ color: H.muted, fontSize: 12, marginTop: 16 }}>제휴 조건은 신청 검토 후 상담 시 안내드립니다.</p></div>
        <div style={{ flex: '1 1 360px', minWidth: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[['13', '주거 공간 스타일'], ['18', '오피스 공간 스타일'], ['10', '카페 공간 스타일'], ['17', '주거 공간 스타일']].map(([number, alt], i) => <div key={number} style={{ position: 'relative', aspectRatio: '1', borderRadius: 22, overflow: 'hidden', transform: i % 2 ? 'translateY(18px)' : undefined }}><Image src={`/home/forma/space-${number}.webp`} alt={alt} fill sizes="(max-width: 760px) 44vw, 260px" priority={i < 2} style={{ objectFit: 'cover' }} /></div>)}<span style={{ gridColumn: '1 / -1', color: H.muted, fontSize: 11, paddingTop: 18 }}>공간 스타일 이미지</span>
        </div>
      </section>
      <section style={{ background: H.ink, color: H.onDark, padding: '56px 24px' }}><div style={{ maxWidth: 1120, margin: 'auto' }}><p style={{ color: H.mutedOnDark, fontSize: 12 }}>함께하는 방식</p><h2 style={{ fontSize: 30, letterSpacing: '-0.04em', margin: '12px 0 30px' }}>잘하는 분야에, 맞는 고객을.</h2><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 28 }}>{[['01', '공사 계획을 함께 확인합니다', '지역, 공간 유형, 면적과 희망 예산 등 고객이 남긴 계획을 바탕으로 상담을 준비합니다.'], ['02', '전문 분야를 중요하게 봅니다', '시공 가능 지역과 실제 포트폴리오를 확인하고, 서로 맞는 협업 방향을 논의합니다.'], ['03', '상담부터 마무리까지', '견적의 명확함, 원활한 소통, 공사 후 관리까지 함께 고려합니다.']].map(([n, title, body]) => <article key={n} style={{ borderTop: `1px solid ${H.darkLine}`, paddingTop: 20 }}><span style={{ color: C.primary, fontSize: 13 }}>{n}</span><h3 style={{ fontSize: 18 }}>{title}</h3><p style={{ lineHeight: 1.8, color: H.mutedOnDark, fontSize: 14 }}>{body}</p></article>)}</div></div></section>
      <section style={{ maxWidth: 1120, margin: 'auto', padding: '64px 24px' }}><p style={{ color: H.bronze, fontSize: 12, fontWeight: 800 }}>모집 분야</p><h2 style={{ fontSize: 30, letterSpacing: '-0.04em' }}>주거와 상가, 모두 환영합니다.</h2><div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>{[['주거 인테리어', '아파트 · 빌라 · 단독주택', '생활을 이해하고 주거 공간을 완성하는 업체'], ['상가 인테리어', '오피스 · 카페 · 음식점 · 학원 · 매장 등', '업종과 운영 방식을 공간에 담아내는 업체']].map(([title, category, text]) => <article key={title} style={{ flex: '1 1 280px', border: `1px solid ${H.line}`, padding: 28, borderRadius: 18, background: C.card }}><h3 style={{ margin: '0 0 16px', fontSize: 22 }}>{title}</h3><p style={{ color: H.bronze, fontWeight: 700, fontSize: 14 }}>{category}</p><p style={{ color: H.muted, lineHeight: 1.8, fontSize: 14 }}>{text}</p></article>)}</div>
      <div style={{ marginTop: 48 }}><h2 style={{ fontSize: 26 }}>신청 후 이렇게 진행돼요.</h2><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%, 200px),1fr))', gap: 16 }}>{['파트너 신청', '업체·포트폴리오 검토', '제휴 조건 협의', '파트너 승인'].map((item, i) => <div key={item} style={{ padding: '20px 0', borderTop: `1px solid ${H.line}` }}><span style={{ color: H.bronze, fontSize: 12 }}>0{i + 1}</span><p style={{ fontWeight: 700 }}>{item}</p></div>)}</div><p style={{ color: H.muted, fontSize: 13, lineHeight: 1.8 }}>신청만으로 제휴가 확정되지는 않습니다. 사업자 정보와 필요한 증빙은 검토 과정에서 별도로 요청할 수 있습니다. 고객 소개나 계약 성사를 보장하지 않습니다.</p></div></section>
      <section id="apply" style={{ background: H.ivory, padding: '64px 20px', scrollMarginTop: 20 }}><div style={{ maxWidth: 760, margin: 'auto' }}><p style={{ color: H.bronze, fontSize: 12, fontWeight: 800 }}>PARTNER APPLICATION</p><h2 style={{ fontSize: 34, letterSpacing: '-0.04em', margin: '16px 0' }}>어떤 공간을 만들고 계신가요?</h2><p style={{ color: H.muted, lineHeight: 1.8, marginBottom: 32 }}>업체와 전문 분야를 알려주세요. 접수 내용을 검토한 후 연락드리겠습니다.</p>
      {done ? <div role="status" style={{ background: C.card, border: `1px solid ${H.line}`, padding: 36, borderRadius: 20 }}><IconCheck size={32} color={H.bronze} /><h3>파트너 신청이 접수됐습니다.</h3><p style={{ color: H.muted, lineHeight: 1.8 }}>남겨주신 정보로 검토 후 연락드리겠습니다.<br />같은 내용으로 다시 신청하지 않으셔도 됩니다.</p><Link href="/" style={button}>폼잇 홈으로</Link></div> : <form onSubmit={submit} style={{ background: C.card, padding: 'clamp(20px, 4vw, 36px)', borderRadius: 20, border: `1px solid ${H.line}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%, 240px),1fr))', gap: 20, marginBottom: 26 }}>{[['company', '업체명', 'text', 100], ['contact', '담당자명', 'text', 50], ['phone', '전화번호', 'tel', 20]].map(([name, label, type, max]) => <label key={name} style={{ display: 'grid', gap: 10, fontSize: 14, fontWeight: 700 }}>{label} *<input name={String(name)} type={String(type)} maxLength={Number(max)} required autoComplete={name === 'phone' ? 'tel' : name === 'company' ? 'organization' : 'name'} style={input} /></label>)}</div>
        {choices('시공 가능 지역', PARTNER_REGIONS, regions, setRegions)}{choices('전문 분야', PARTNER_SPECIALTIES, specialties, setSpecialties)}
        <label style={{ display: 'grid', gap: 10, marginBottom: 26, fontSize: 14, fontWeight: 700 }}>주로 진행하는 공사 금액 *<select name="budget" required defaultValue="" style={input}><option value="" disabled>선택해주세요</option>{PARTNER_BUDGETS.map(value => <option key={value}>{value}</option>)}</select></label>
        <label style={{ display: 'grid', gap: 10, marginBottom: 26, fontSize: 14, fontWeight: 700 }}>포트폴리오 링크 <span style={{ color: H.muted, fontSize: 12, fontWeight: 400 }}>선택 · 홈페이지, 블로그, SNS 등</span><input name="portfolio" type="url" maxLength={500} placeholder="https://" style={input} /></label>
        <label style={{ display: 'grid', gap: 10, marginBottom: 26, fontSize: 14, fontWeight: 700 }}>업체 소개 *<textarea name="intro" required minLength={10} maxLength={2000} rows={5} placeholder="주력 분야, 시공 경험과 협업 시 중요하게 생각하는 점을 알려주세요. (10~2,000자)" style={{ ...input, resize: 'vertical', lineHeight: 1.8 }} /></label>
        <div style={{ background: H.paper, padding: 18, borderRadius: 12, marginBottom: 20 }}><label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, fontWeight: 700 }}><input name="agreed" type="checkbox" required style={{ marginTop: 4, accentColor: H.bronze }} />[필수] 파트너 신청 개인정보 수집·이용 동의</label><p style={{ fontSize: 12, lineHeight: 1.9, color: H.muted, marginBottom: 0 }}>수집: 업체명, 담당자명, 전화번호, 활동 지역·분야, 공사 금액대, 소개 및 선택한 포트폴리오 링크<br />목적: 제휴 신청 검토와 연락<br />보유: 접수 후 90일. 만료 정보는 다음 신청 또는 관리자 조회 시 삭제하며, 만료 후에는 조회할 수 없습니다.<br />동의를 거부할 수 있으나 파트너 신청은 어렵습니다. <Link href="/privacy" style={{ color: H.bronze }}>개인정보 안내</Link></p></div>
        {error && <p role="alert" style={{ color: C.consultStatus.lost.color, lineHeight: 1.7 }}>{error}</p>}<button disabled={busy} type="submit" style={{ ...button, width: '100%', opacity: busy ? 0.6 : 1 }}>{busy ? '접수 중…' : '파트너 신청하기'} <IconArrowRight size={18} /></button><p style={{ color: H.muted, textAlign: 'center', fontSize: 12, lineHeight: 1.8 }}>제휴 비용과 운영 조건은 검토 후 개별 안내드립니다.</p>
      </form>}</div></section>
    </main><footer style={{ maxWidth: 1120, margin: 'auto', padding: '28px 24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, color: H.muted, fontSize: 12 }}><span>© 2026 폼잇. 함께 만드는 다음 공간.</span><Link href="/" style={{ color: H.muted }}>폼잇 홈으로</Link></footer>
  </div>;
}
