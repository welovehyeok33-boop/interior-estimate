"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { IconArrowUpRight, IconMapPin, IconLock, IconRefresh, IconSearch, IconLayoutGrid } from '@tabler/icons-react';
import { C } from './EstimateLayout';
import { PARTNER_LEAD_CAPACITY, type PartnerLeadCard } from '@/lib/partnerPortal';

export default function PartnerLeadBoard({ company, mode = 'partner', examples = [] }: { company: string; mode?: 'partner' | 'admin' | 'demo'; examples?: PartnerLeadCard[] }) {
  const [items, setItems] = useState<PartnerLeadCard[]>(examples), [loading, setLoading] = useState(mode !== 'demo'), [error, setError] = useState('');
  const [kind, setKind] = useState('all'), [region, setRegion] = useState('all'), [search, setSearch] = useState(''), [refresh, setRefresh] = useState(0);
  const [open, setOpen] = useState<string | null>(null), [loggingOut, setLoggingOut] = useState(false), [joining, setJoining] = useState<string | null>(null);
  useEffect(() => {
    if (mode === 'demo') return;
    const controller = new AbortController();
    async function load() {
      setLoading(true); setError('');
      try {
        const response = await fetch(mode === 'admin' ? '/api/admin/partner-leads?preview=1' : '/api/partner/leads', { cache: 'no-store', signal: controller.signal });
        if (response.status === 401) { window.location.assign(mode === 'admin' ? '/admin' : '/partner/login'); return; }
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || '견적을 불러오지 못했어요.');
        if (!controller.signal.aborted) setItems(result.items);
      } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : '다시 시도해주세요.'); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load(); return () => controller.abort();
  }, [mode, refresh]);
  async function logout() {
    setLoggingOut(true);
    try { const r = await fetch('/api/partner/session', { method: 'DELETE' }); if (!r.ok) throw new Error(); window.location.assign('/partner/login'); }
    catch { setError('로그아웃하지 못했어요. 다시 시도해주세요.'); setLoggingOut(false); }
  }
  async function view(row: PartnerLeadCard) {
    if (row.detail) { setOpen(open === row.id ? null : row.id); return; }
    if (mode !== 'partner' || joining) return;
    setJoining(row.id); setError('');
    try {
      const response = await fetch('/api/partner/bids', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: row.id }) });
      if (response.status === 401) { window.location.assign('/partner/login'); return; }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '참여하지 못했어요.');
      setOpen(row.id); setRefresh(v => v + 1);
    } catch (e) { setError(e instanceof Error ? e.message : '다시 시도해주세요.'); }
    finally { setJoining(null); }
  }
  const filtered = items.filter(row => (kind === 'all' || row.kind === kind) && (region === 'all' || row.region === region) && `${row.code} ${row.region} ${row.space}`.toLowerCase().includes(search.trim().toLowerCase()));
  const regions = Array.from(new Set(items.map(row => row.region))).sort();
  const button = { padding: '10px 14px', border: `1px solid ${C.home.line}`, borderRadius: 9, background: C.card, color: C.home.ink, font: 'inherit', fontSize: 12, cursor: 'pointer' };
  return <div data-clarity-mask="true" style={{ minHeight: '100vh', background: C.home.paper, color: C.home.ink }}>
    {mode !== 'partner' && <div style={{ background: C.primary, color: C.textDark, textAlign: 'center', padding: '10px 18px', fontSize: 12, fontWeight: 650 }}>{mode === 'demo' ? '화면 미리보기 · 아래 견적은 모두 예시입니다.' : '관리자 접속 · 열람해도 비딩 참여 자리는 차감되지 않습니다.'}</div>}
    <header style={{ background: C.card, borderBottom: `1px solid ${C.home.line}` }}><div style={{ maxWidth: 1240, margin: '0 auto', padding: '20px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}><Link href="/" style={{ color: C.textDark, background: C.primary, padding: '6px 11px', borderRadius: 7, fontSize: 19, fontWeight: 900, textDecoration: 'none' }}>폼잇.</Link><span style={{ fontSize: 11, letterSpacing: '.12em', color: C.home.muted, fontWeight: 650 }}>PARTNER LOUNGE</span></div>
      <div style={{ display: 'flex', flexWrap: 'wrap', maxWidth: '100%', gap: 12, alignItems: 'center', fontSize: 12 }}><strong style={{ maxWidth: 240, overflowWrap: 'anywhere' }}>{company}</strong><span style={{ padding: '4px 8px', borderRadius: 6, background: C.selectedBg, color: C.home.bronze }}>{mode === 'admin' ? '관리자' : '파트너'}</span>{mode === 'partner' ? <button disabled={loggingOut} style={button} onClick={() => void logout()}>로그아웃</button> : <Link href="/admin/partner-portal" style={{ ...button, textDecoration: 'none' }}>공개 관리 ↗</Link>}</div>
    </div></header>
    <main style={{ maxWidth: 1240, margin: '0 auto', padding: '36px 24px 64px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}><div><p style={{ color: C.home.bronze, fontSize: 11, letterSpacing: '.1em', fontWeight: 750, margin: '0 0 12px' }}>NEXT PROJECT</p><h1 style={{ fontSize: 'clamp(25px, 4vw, 34px)', margin: '0 0 10px', letterSpacing: '-.045em' }}>우리에게 맞는 다음 공사</h1><p style={{ color: C.home.muted, fontSize: 13, lineHeight: 1.8, margin: 0 }}>견적 한 건에 최대 2개 파트너만 비딩에 참여하고 상세 내용을 열람할 수 있어요.</p></div><button onClick={() => setRefresh(v => v + 1)} disabled={loading || mode === 'demo' || !!joining} style={{ ...button, display: 'flex', alignItems: 'center', gap: 6 }}><IconRefresh size={15} />새로고침</button></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10, marginBottom: 30 }}>{[['공개 견적', items.length], ['참여 가능', items.filter(row => row.open && row.participants < PARTNER_LEAD_CAPACITY).length], ['주거 · 상가', `${items.filter(row => row.kind === 'residential').length} · ${items.filter(row => row.kind === 'commercial').length}`]].map(([label, value], i) => <div key={label} style={{ background: i === 1 ? C.selectedBg : C.card, padding: '20px 14px', borderRadius: 13, border: `1px solid ${i === 1 ? C.primary : C.home.line}` }}><div style={{ fontSize: 11, color: C.home.muted, marginBottom: 12 }}>{label}</div><strong style={{ fontSize: i === 2 ? 'clamp(18px,3.4vw,26px)' : 'clamp(23px,4vw,30px)', letterSpacing: '-.04em' }}>{loading ? '—' : value}</strong></div>)}</div>
      <section aria-label="공개 견적 목록"><div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 7 }}>{[['all', '전체'], ['residential', '주거'], ['commercial', '상가']].map(([id, label]) => <button key={id} type="button" aria-pressed={kind === id} onClick={() => setKind(id)} style={{ ...button, padding: '10px 18px', background: kind === id ? C.home.ink : C.card, color: kind === id ? C.home.onDark : C.home.muted }}>{label}</button>)}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}><select aria-label="공사 지역" value={region} onChange={e => setRegion(e.target.value)} style={button}><option value="all">모든 지역</option>{regions.map(value => <option key={value}>{value}</option>)}</select><label style={{ display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${C.home.line}`, background: C.card, borderRadius: 9, padding: '0 12px', minHeight: 38 }}><IconSearch size={15} color={C.home.muted} /><input aria-label="견적 검색" value={search} maxLength={60} onChange={e => setSearch(e.target.value)} placeholder="지역·공간·견적번호 검색" style={{ width: 180, minWidth: 0, border: 0, outline: 'none', font: 'inherit', fontSize: 12, background: C.card, color: C.home.ink }} /></label></div>
      </div><p style={{ fontSize: 12, color: C.home.muted, margin: '0 0 16px' }}>{loading ? '견적을 불러오는 중이에요…' : `총 ${filtered.length}건`}<span style={{ marginLeft: 10, fontSize: 11 }}>최근 90일 · 공개일순 · 최대 500건</span></p>
      {error && <p role="alert" style={{ padding: 16, borderRadius: 10, background: C.card, color: C.consultStatus.lost.color, fontSize: 13 }}>{error} <button type="button" style={button} onClick={() => setRefresh(value => value + 1)}>새로고침</button></p>}
      {!loading && !error && !filtered.length && <div style={{ padding: '64px 24px', textAlign: 'center', background: C.card, border: `1px solid ${C.home.line}`, borderRadius: 16 }}><IconLayoutGrid size={32} stroke={1.3} color={C.home.muted} /><h2 style={{ fontSize: 18 }}>{items.length ? '조건에 맞는 견적이 없어요' : '새로운 공사를 기다리는 중이에요'}</h2><p style={{ fontSize: 13, color: C.home.muted }}>다른 조건을 선택하거나 새로운 공개 견적을 기다려주세요.</p></div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,310px),1fr))', gap: 16 }}>{!loading && filtered.map(row => {
        const detail = row.detail, full = row.participants >= PARTNER_LEAD_CAPACITY;
        const disabled = !detail && (!row.open || full || !!joining);
        return <article key={row.id} style={{ background: C.card, border: `1px solid ${C.home.line}`, borderRadius: 16, padding: 22, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}><span style={{ fontSize: 11, fontWeight: 700, padding: '5px 9px', borderRadius: 6, background: row.joined ? C.selectedBg : C.home.paper, color: row.joined ? C.home.bronze : C.home.muted }}>{row.joined ? '참여 완료' : !row.open ? '모집 마감' : full ? '참여 마감' : '비딩 모집'}</span><strong style={{ fontSize: 12, color: full ? C.home.muted : C.home.bronze }}>참여 {row.participants}/{PARTNER_LEAD_CAPACITY}</strong></div>
          <p style={{ fontSize: 10, color: C.home.muted, margin: '16px 0 8px' }}>{row.code}</p><h2 style={{ fontSize: 21, letterSpacing: '-.035em', margin: '0 0 10px' }}>{row.space}</h2><p style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.home.muted, fontSize: 12, margin: 0 }}><IconMapPin size={14} />{row.region} · {row.area ? `${row.area}평` : '면적 협의'}</p>
          <div style={{ margin: '22px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}><div><span style={{ fontSize: 11, color: C.home.muted }}>희망 예산</span><p style={{ fontSize: detail ? 17 : 12, fontWeight: 750, margin: '7px 0 0' }}>{detail?.budget || '참여 후 확인'}</p></div><div><span style={{ fontSize: 11, color: C.home.muted }}>공사 시기</span><p style={{ fontSize: detail ? 14 : 12, fontWeight: 650, margin: '9px 0 0' }}>{detail?.schedule || '참여 후 확인'}</p></div></div>
          <div style={{ paddingTop: 17, borderTop: `1px solid ${C.home.line}`, display: 'grid', gap: 13 }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}><strong style={{ fontSize: 12 }}>{detail?.customer || '고객 정보 비공개'}</strong><span style={{ fontSize: 11, color: C.home.muted, display: 'flex', alignItems: 'center', gap: 4 }}><IconLock size={11} />{detail?.phone || '***-****-****'}</span></div>
          <button type="button" disabled={disabled} aria-expanded={open === row.id && !!detail} onClick={() => void view(row)} style={{ ...button, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: detail ? C.card : C.primary, color: C.textDark, opacity: disabled ? .45 : 1 }}>{joining === row.id ? '참여 처리 중…' : detail ? open === row.id ? '접기' : mode === 'admin' ? '견적 요약 · 관리자' : '견적 요약' : !row.open ? '모집 마감' : full ? '2개 파트너 참여 완료' : '비딩 참여 · 견적 열람'}<IconArrowUpRight size={14} /></button></div>
          {open === row.id && detail && <div style={{ marginTop: 18, padding: 14, borderRadius: 9, background: C.home.paper, fontSize: 12, lineHeight: 1.9 }}><div>{row.region} · {row.space} · {row.area ? `${row.area}평` : '면적 협의'}</div><div>{detail.budget} · {detail.schedule}</div><div style={{ color: C.home.muted, marginTop: 8 }}>공개 {new Date(row.publishedAt).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })}</div></div>}
        </article>;
      })}</div></section>
      <p style={{ fontSize: 12, color: C.home.muted, lineHeight: 1.8, marginTop: 24 }}>비딩 참여 시 해당 견적의 2자리 중 1자리가 확정됩니다. 같은 파트너 계정의 재열람은 추가 차감되지 않습니다. 이름은 성만, 연락처는 전체 마스킹되며 견적 문의는 폼잇 담당자에게 연락해주세요.</p>
    </main>
  </div>;
}
