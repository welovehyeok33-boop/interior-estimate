"use client";
import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { C } from './EstimateLayout';
import { action, field, goldAction, muted, panel } from './adminStyles';
import type { PartnerAccount, PartnerLead } from '@/lib/partnerPortal';
type Lead = PartnerLead & { id: string; published: boolean };
export default function AdminPartnerPortal() {
  const [accounts, setAccounts] = useState<PartnerAccount[]>([]), [leads, setLeads] = useState<Lead[]>([]);
  const [company, setCompany] = useState(''), [email, setEmail] = useState(''), [error, setError] = useState(''), [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false), [loading, setLoading] = useState(true), [refresh, setRefresh] = useState(0);
  const [credential, setCredential] = useState<{ email: string; password: string } | null>(null), [show, setShow] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true); setError('');
      try {
        const [a, l] = await Promise.all([fetch('/api/admin/partner-portal', { cache: 'no-store', signal: controller.signal }), fetch('/api/admin/partner-leads', { cache: 'no-store', signal: controller.signal })]);
        if (a.status === 401 || l.status === 401) { window.location.assign('/admin'); return; }
        if (!a.ok || !l.ok) throw new Error('목록을 불러오지 못했어요. 다시 확인해주세요.');
        const [accountData, leadData] = await Promise.all([a.json(), l.json()]);
        if (!controller.signal.aborted) { setAccounts(accountData.accounts); setLeads(leadData.items); }
      } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : '다시 시도해주세요.'); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load(); return () => controller.abort();
  }, [refresh]);
  async function create(event: FormEvent) {
    event.preventDefault(); if (busy) return;
    setBusy(true); setError(''); setMessage(''); setCredential(null); setShow(false);
    try {
      const response = await fetch('/api/admin/partner-portal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ company, email }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error);
      setAccounts(previous => [result.account, ...previous]); setCredential({ email: result.account.email, password: result.password }); setCompany(''); setEmail(''); setMessage('계정을 발급했습니다. 이메일과 비밀번호를 해당 업체에 직접 전달해주세요.');
    } catch (e) { setError(e instanceof Error ? e.message : '발급하지 못했어요.'); }
    finally { setBusy(false); }
  }
  async function accountChange(account: PartnerAccount, reset = false) {
    if (busy) return;
    setBusy(true); setError(''); setMessage(''); setCredential(null); setShow(false);
    try {
      const response = await fetch('/api/admin/partner-portal', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: account.id, version: account.session_version, action: reset ? 'reset' : 'status', active: !account.active }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error);
      setAccounts(previous => previous.map(row => row.id === account.id ? result.account : row));
      if (reset) setCredential({ email: account.email, password: result.password });
      setMessage(reset ? '새 비밀번호를 발급하고 기존 로그인을 해제했습니다.' : '계정 이용 상태를 변경하고 기존 로그인을 해제했습니다.');
    } catch (e) { setError(e instanceof Error ? e.message : '변경하지 못했어요.'); }
    finally { setBusy(false); }
  }
  async function publish(row: Lead) {
    if (busy) return;
    setBusy(true); setError(''); setMessage('');
    try {
      const response = await fetch('/api/admin/partner-leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: row.id, published: !row.published }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error);
      setLeads(previous => previous.map(item => item.id === row.id ? { ...item, published: result.published } : item));
      setMessage(result.published ? '마스킹된 견적을 파트너에게 공개했습니다.' : '파트너 공개를 해제했습니다. 원본 상담은 그대로 보관됩니다.');
    } catch (e) { setError(e instanceof Error ? e.message : '변경하지 못했어요.'); }
    finally { setBusy(false); }
  }
  return <main data-clarity-mask="true" style={{ background: C.admin.bg, minHeight: '100vh', padding: '28px 20px 64px', color: C.admin.text }}><div style={{ maxWidth: 1180, margin: '0 auto' }}>
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, alignItems: 'center', marginBottom: 24 }}><div><Link href="/admin" style={{ color: C.admin.muted, fontSize: 12 }}>← 관리자</Link><h1 style={{ fontSize: 26, margin: '12px 0 8px' }}>파트너 공간 관리</h1><p style={muted}>계정 발급과 견적 공개를 한곳에서 관리합니다.</p></div><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><Link href="/partner/preview" target="_blank" style={{ ...action, textDecoration: 'none' }}>파트너 화면 미리보기 ↗</Link><Link href="/partner/login" target="_blank" style={{ ...action, textDecoration: 'none' }}>로그인 페이지 ↗</Link><button style={action} disabled={busy || loading} onClick={() => setRefresh(v => v + 1)}>새로고침</button></div></div>
    {error && <p role="alert" style={{ color: C.consultStatus.lost.color, lineHeight: 1.8 }}>{error}</p>}{message && <p role="status" style={muted}>{message}</p>}
    {credential && <section style={{ ...panel, marginBottom: 20, borderColor: C.primary }}><strong>발급한 비밀번호 · 이 화면에서만 확인 가능</strong><p style={muted}>{credential.email}</p><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}><input aria-label="발급한 비밀번호" readOnly type={show ? 'text' : 'password'} value={credential.password} style={{ ...field, fontFamily: 'monospace', width: 300 }} /><button style={action} onClick={() => setShow(!show)}>{show ? '가리기' : '보기'}</button><button style={action} onClick={() => { setCredential(null); setShow(false); }}>확인 완료</button></div><p style={muted}>파트너 로그인: https://form.it.kr/partner/login<br />화면을 떠나면 비밀번호를 다시 볼 수 없습니다. 필요하면 새로 발급해주세요. 자동 이메일은 발송하지 않습니다.</p></section>}
    <section style={{ ...panel, marginBottom: 24 }}><h2 style={{ fontSize: 20, margin: '0 0 10px' }}>파트너 계정 <span style={muted}>{accounts.length}개</span></h2><p style={muted}>제휴가 확정되고 이메일을 확인한 업체에 발급해주세요. 파트너는 관리자 페이지와 원본 상담을 볼 수 없습니다.</p><form onSubmit={create} style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end', margin: '22px 0' }}><label style={{ display: 'grid', gap: 8, flex: '1 1 180px', fontSize: 12 }}>업체명<input value={company} onChange={e => setCompany(e.target.value)} required minLength={2} maxLength={100} style={field} /></label><label style={{ display: 'grid', gap: 8, flex: '1 1 240px', fontSize: 12 }}>로그인 이메일<input value={email} onChange={e => setEmail(e.target.value)} type="email" required maxLength={254} style={field} /></label><button type="submit" disabled={busy || loading} style={goldAction}>{busy ? '처리 중…' : '계정 발급'}</button></form>
    {loading ? <p style={muted}>불러오는 중…</p> : !accounts.length ? <p style={muted}>발급한 계정이 없습니다.</p> : accounts.map(account => <article key={account.id} style={{ borderTop: `1px solid ${C.admin.line}`, padding: '16px 0', display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'space-between', alignItems: 'center' }}><div><strong>{account.company}</strong><p style={{ ...muted, margin: '6px 0 0', overflowWrap: 'anywhere' }}>{account.email} · {account.active ? '이용 중' : '이용 중지'}</p></div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}><button disabled={busy} style={action} onClick={() => void accountChange(account, true)}>비밀번호 재발급</button><button disabled={busy} style={action} onClick={() => void accountChange(account)}>{account.active ? '이용 중지' : '이용 재개'}</button></div></article>)}
    </section><section style={panel}><h2 style={{ fontSize: 20, margin: '0 0 10px' }}>견적 공개 관리 <span style={muted}>공개 {leads.filter(i => i.published).length}건</span></h2><p style={muted}>‘파트너 공개’를 누른 견적만 활성 파트너에게 표시됩니다. 이름은 성만, 전화번호는 전체 마스킹하며 관리자 메모·요청 내용·상세 주소는 전송하지 않습니다. 최근 90일의 최대 500건을 표시합니다.</p>{loading ? <p style={muted}>불러오는 중…</p> : !leads.length ? <p style={muted}>공개할 수 있는 최근 상담이 없습니다.</p> : leads.map(row => <article key={row.id} style={{ marginTop: 12, padding: 18, border: `1px solid ${row.published ? C.primary : C.admin.line}`, borderRadius: 12, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}><div><span style={{ ...muted, fontSize: 11 }}>{row.code} · {row.published ? '공개 중' : '미공개'}</span><h3 style={{ margin: '8px 0', fontSize: 16 }}>{row.space} · {row.region} · {row.area ? `${row.area}평` : '면적 협의'}</h3><p style={{ ...muted, margin: 0 }}>{row.customer} · {row.budget} · {row.schedule}</p></div><button type="button" aria-pressed={row.published} disabled={busy} style={row.published ? action : goldAction} onClick={() => void publish(row)}>{row.published ? '공개 해제' : '파트너 공개'}</button></article>)}</section>
    </div></main>;
}
