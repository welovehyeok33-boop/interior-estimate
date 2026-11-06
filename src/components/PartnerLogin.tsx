"use client";
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { IconArrowRight, IconLock, IconBuildingStore } from '@tabler/icons-react';
import { C } from './EstimateLayout';

export default function PartnerLogin() {
  const [email, setEmail] = useState(''), [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function login(event: FormEvent) {
    event.preventDefault(); if (busy) return;
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/partner/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '로그인하지 못했어요.');
      setPassword(''); window.location.assign('/partner/leads');
    } catch (e) { setError(e instanceof Error ? e.message : '다시 시도해주세요.'); setBusy(false); }
  }
  const field = { boxSizing: 'border-box' as const, width: '100%', padding: '14px 16px', border: `1px solid ${C.home.line}`, borderRadius: 10, background: C.card, color: C.home.ink, font: 'inherit', fontSize: 16 };
  return <div data-clarity-mask="true" style={{ minHeight: '100vh', background: C.home.paper, color: C.home.ink }}>
    <header style={{ maxWidth: 1200, padding: '22px 24px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}><Link href="/" style={{ color: C.textDark, background: C.primary, padding: '7px 12px', borderRadius: 8, fontWeight: 900, fontSize: 20, textDecoration: 'none' }}>폼잇.</Link><span style={{ fontSize: 12, color: C.home.muted }}>파트너 전용 공간</span></header>
    <main style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 24px 64px', display: 'flex', flexWrap: 'wrap-reverse', gap: 24, alignItems: 'stretch' }}>
      <section style={{ flex: '1 1 320px', boxSizing: 'border-box', minWidth: 0, padding: '48px 32px', borderRadius: 24, background: C.home.ink, color: C.home.onDark, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 48 }}>
        <div><span style={{ color: C.primary, fontSize: 11, fontWeight: 750, letterSpacing: '0.14em' }}>FORMIT PARTNERS</span><h1 style={{ fontSize: 'clamp(30px, 4vw, 42px)', lineHeight: 1.3, letterSpacing: '-0.045em', margin: '24px 0 20px' }}>잘 맞는 의뢰,<br />더 나은 현장.</h1><p style={{ color: C.home.mutedOnDark, fontSize: 14, lineHeight: 1.9, margin: 0 }}>공간과 예산, 공사 일정을 한눈에.<br />폼잇과 함께 다음 공사를 준비하세요.</p></div>
        <div style={{ display: 'grid', gap: 15 }}><IconBuildingStore size={34} color={C.primary} stroke={1.5} /><strong style={{ fontSize: 15 }}>인테리어를 아는 파트너를 위한 공간</strong><span style={{ color: C.home.mutedOnDark, fontSize: 12, lineHeight: 1.8 }}>주거부터 상가까지, 공개된 견적을 확인하고<br />우리 업체에 맞는 공사를 살펴보세요.</span></div>
      </section>
      <section style={{ flex: '1 1 320px', minWidth: 0, boxSizing: 'border-box', background: C.card, border: `1px solid ${C.home.line}`, borderRadius: 24, padding: '40px 28px' }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: C.selectedBg, display: 'grid', placeItems: 'center' }}><IconLock size={21} /></div><h2 style={{ margin: '22px 0 8px', fontSize: 26, letterSpacing: '-0.04em' }}>파트너 로그인</h2><p style={{ color: C.home.muted, fontSize: 13, lineHeight: 1.8, margin: '0 0 28px' }}>폼잇에서 발급받은 계정으로 로그인해주세요.</p>
        <form onSubmit={login} style={{ display: 'grid', gap: 20 }}><label style={{ display: 'grid', gap: 9, fontSize: 13, fontWeight: 650 }}>이메일<input type="email" autoComplete="username" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} placeholder="partner@company.com" style={field} /></label><label style={{ display: 'grid', gap: 9, fontSize: 13, fontWeight: 650 }}>비밀번호<input type="password" autoComplete="current-password" required maxLength={200} value={password} onChange={e => setPassword(e.target.value)} placeholder="비밀번호를 입력해주세요" style={field} /></label>{error && <p role="alert" style={{ margin: 0, fontSize: 13, color: C.consultStatus.lost.color, lineHeight: 1.7 }}>{error}</p>}<button disabled={busy} type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 15, marginTop: 4, background: C.primary, color: C.textDark, border: 0, borderRadius: 10, font: 'inherit', fontSize: 14, fontWeight: 750, cursor: 'pointer', opacity: busy ? .6 : 1 }}>{busy ? '로그인 중…' : '파트너 공간 입장하기'}<IconArrowRight size={18} /></button></form>
        <p style={{ color: C.home.muted, fontSize: 12, lineHeight: 1.8, marginTop: 22 }}>계정 발급·비밀번호 문의는 폼잇 담당자에게 연락해주세요.</p><div style={{ borderTop: `1px solid ${C.home.line}`, marginTop: 30, paddingTop: 22, display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', fontSize: 12 }}><span style={{ color: C.home.muted }}>아직 폼잇 파트너가 아니신가요?</span><Link href="/partners" style={{ color: C.home.ink, fontWeight: 750 }}>파트너 제휴 신청 ↗</Link></div>
      </section>
    </main><footer style={{ textAlign: 'center', padding: '0 24px 28px', fontSize: 11, color: C.home.muted }}>© 폼잇.　<Link href="/privacy" style={{ color: 'inherit' }}>개인정보 처리 안내</Link></footer>
  </div>;
}
