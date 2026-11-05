"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { C } from './EstimateLayout';
import { action, field, goldAction, muted, panel } from './adminStyles';
import { PARTNER_STATUSES, safePortfolio, type PartnerRecord, type PartnerStatus } from '@/lib/partners';
type Draft = { status: PartnerStatus; admin_note: string; admin_version: number };
export default function AdminPartners({ active, refresh }: { active: boolean; refresh: number }) {
  const [rows, setRows] = useState<PartnerRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [opened, setOpened] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    async function load() {
    setLoading(true); setError('');
    await fetch(`/api/admin/partners?page=${page}`, { cache: 'no-store', signal: controller.signal }).then(async response => {
      const result = await response.json();
      if (controller.signal.aborted) return;
      if (!response.ok) throw new Error(result.error || '조회하지 못했습니다.');
      setRows(result.rows); setTotal(result.total);
    }).catch(e => { if (e.name !== 'AbortError') setError(e.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }
    void load();
    return () => controller.abort();
  }, [active, refresh, page]);
  function draft(row: PartnerRecord): Draft { return drafts[row.id] || { status: row.status, admin_note: row.admin_note, admin_version: row.admin_version }; }
  function change(row: PartnerRecord, patch: Partial<Draft>) { setDrafts(previous => ({ ...previous, [row.id]: { ...draft(row), ...patch } })); setMessage(''); }
  async function save(row: PartnerRecord) {
    if (saving) return;
    setSaving(row.id); setError(''); setMessage('');
    try {
      const response = await fetch('/api/admin/partners', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: row.id, ...draft(row) }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '저장하지 못했습니다.');
      setRows(previous => previous.map(item => item.id === row.id ? result.row : item));
      setDrafts(previous => { const next = { ...previous }; delete next[row.id]; return next; });
      setMessage('저장했습니다.');
    } catch (e) { setError(e instanceof Error ? e.message : '저장하지 못했습니다.'); }
    finally { setSaving(null); }
  }
  return <section style={panel} aria-label="파트너 신청 관리"><div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center' }}><div><h1 style={{ fontSize: 24, margin: '0 0 8px' }}>파트너 신청 <span style={{ color: C.admin.muted, fontSize: 14 }}>{total}건</span></h1><p style={muted}>고객 상담과 별도로 관리합니다. 상태와 메모는 저장 버튼을 눌러야 반영됩니다.</p></div><Link href="/partners" target="_blank" style={action}>모집 페이지 보기</Link></div>
    {error && <p role="alert" style={{ color: C.consultStatus.lost.color }}>{error}</p>}{message && <p role="status" style={muted}>{message}</p>}
    {loading ? <p style={muted}>불러오는 중…</p> : !rows.length ? <p style={{ ...muted, padding: '36px 0', textAlign: 'center' }}>접수된 파트너 신청이 없습니다.</p> : rows.map(row => {
      const value = draft(row); const dirty = value.status !== row.status || value.admin_note !== row.admin_note;
      return <article key={row.id} style={{ border: `1px solid ${C.admin.line}`, borderRadius: 14, marginTop: 12, overflow: 'hidden' }}><button type="button" aria-expanded={opened === row.id} aria-controls={`partner-${row.id}`} onClick={() => setOpened(opened === row.id ? null : row.id)} style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between', width: '100%', textAlign: 'left', border: 0, background: C.admin.surface, color: C.admin.text, padding: '18px 20px', cursor: 'pointer' }}><div><strong style={{ fontSize: 17 }}>{row.company}</strong><p style={{ ...muted, margin: '6px 0 0' }}>{row.regions.join(' · ')} / {row.specialties.join(' · ')}</p></div><span style={{ fontSize: 13 }}>{PARTNER_STATUSES[value.status]}{dirty ? ' · 미저장' : ''}　{opened === row.id ? '접기' : '펼치기'}</span></button>
      <div id={`partner-${row.id}`} hidden={opened !== row.id} style={{ borderTop: `1px solid ${C.admin.line}`, padding: 20 }}><p style={muted}>접수 {new Date(row.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</p><p>{row.contact} · <a href={`tel:${row.phone}`} style={{ color: C.admin.text }}>{row.phone}</a></p><p style={muted}>주요 공사 금액: {row.budget}</p>{row.portfolio && safePortfolio(row.portfolio) && <a href={row.portfolio} target="_blank" rel="noopener noreferrer" style={{ color: C.admin.text, overflowWrap: 'anywhere' }}>포트폴리오 보기 ↗</a>}<p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, overflowWrap: 'anywhere' }}>{row.intro}</p>
      <label style={{ display: 'grid', gap: 8, marginBottom: 18 }}>검토 상태<select disabled={saving === row.id} value={value.status} onChange={e => change(row, { status: e.target.value as PartnerStatus })} style={field}>{Object.entries(PARTNER_STATUSES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label style={{ display: 'grid', gap: 8 }}>관리자 메모<textarea disabled={saving === row.id} value={value.admin_note} onChange={e => change(row, { admin_note: e.target.value })} rows={5} maxLength={4000} style={{ ...field, fontFamily: 'inherit', lineHeight: 1.8 }} /></label><p style={muted}>접어도 작성 내용은 유지됩니다. 새로고침하거나 페이지를 떠나면 저장하지 않은 내용은 사라집니다.</p><button type="button" disabled={!dirty || !!saving} onClick={() => save(row)} style={{ ...goldAction, opacity: !dirty || saving ? 0.5 : 1 }}>{saving === row.id ? '저장 중…' : '검토 내용 저장'}</button></div></article>;
    })}
    {total > 25 && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 24 }}><button type="button" disabled={page <= 1 || loading || !!saving} style={action} onClick={() => setPage(page - 1)}>이전</button><span>{page} / {Math.ceil(total / 25)}</span><button type="button" disabled={page * 25 >= total || loading || !!saving} style={action} onClick={() => setPage(page + 1)}>다음</button></div>}
  </section>;
}
