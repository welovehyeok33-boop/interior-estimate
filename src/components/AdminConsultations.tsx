"use client";
import { useEffect, useState } from 'react';
import { C } from './EstimateLayout';
import { action, field, goldAction, muted, panel } from './adminStyles';
import { CONSULT_STATUSES, fromKstInput, kstInput, type Consultation } from '@/lib/adminCrm';
import { formatEstimateRegion } from '@/lib/estimateRegion';
import { formatConsultBudget, formatConsultSchedule } from '@/lib/consultStore';
import { INDUSTRY_LABELS } from '@/lib/intakeValidation';

const dateLabel = (value: string | null) => value ? new Date(value).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }) : '미정';
const grades: Record<string, string> = { economy: '실속형', budget: '실속형', standard: '스탠다드', premium: '하이앤드', highend: '하이앤드' };
function Editor({ item, onSaved }: { item: Consultation; onSaved: () => void }) {
  const [status, setStatus] = useState(item.status || 'new');
  const [note, setNote] = useState(item.admin_note || '');
  const [next, setNext] = useState(kstInput(item.next_contact_at));
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function save() {
    setBusy(true); setError('');
    try {
      const r = await fetch('/api/admin/consultations', { method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, status, admin_note: note, next_contact_at: fromKstInput(next), admin_version: item.admin_version }) });
      const body = await r.json();
      if (!r.ok) throw new Error(body.error || '저장 실패');
      onSaved();
    } catch (e) { setError(e instanceof Error ? e.message : '저장하지 못했어요.'); }
    finally { setBusy(false); }
  }
  return <div style={{ paddingTop: 16, borderTop: `1px solid ${C.home.darkLine}`, lineHeight: 1.8, overflowWrap: 'anywhere' }}>
    <div>전화번호: <a href={`tel:${item.phone.replace(/[^\d+]/g, '')}`} style={{ color: C.primary }}>{item.phone}</a></div>
    <div>공간: {item.building_type === 'residential' ? '주거' : item.building_type === 'commercial' ? '상가' : '미정'} · {item.area ? `${item.area}평` : '면적 미정'}</div>
    <div>업종: {INDUSTRY_LABELS[item.commercial_type || ''] || item.commercial_type || '—'} {item.commercial_sub} · 주거 등급: {grades[item.residential_grade || ''] || item.residential_grade || '—'}</div>
    <div>공사 경험: {item.experience === 'yes' ? '있음' : item.experience === 'no' ? '없음' : '—'} · 공사 범위: {item.work_scope === 'full' ? '전체' : item.work_scope === 'partial' ? '부분' : '—'}</div>
    <div>일정: {formatConsultSchedule(item.schedule ?? undefined)} · 예산: {formatConsultBudget(item.budget ?? undefined)}</div>
    {item.space_description && <p style={{ whiteSpace: 'pre-wrap' }}>공간 설명: {item.space_description}</p>}
    {item.memo && <p style={{ whiteSpace: 'pre-wrap' }}>고객 요청: {item.memo}</p>}
    <p style={muted}>개인정보 동의: {item.consent_at ? dateLabel(item.consent_at) : '기존 기록 없음'}</p>
    <fieldset disabled={busy} style={{ border: 0, padding: 0, margin: 0 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <label>상담 상태<br /><select value={status} onChange={e => setStatus(e.target.value)} style={field}>
          {!Object.hasOwn(CONSULT_STATUSES, status) && <option value={status}>{status} (기존)</option>}
          {Object.entries(CONSULT_STATUSES).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select></label>
        <label>다음 연락 일시 (한국시간)<br /><input type="datetime-local" value={next} onInput={e => setNext(e.currentTarget.value)} onChange={e => setNext(e.target.value)} style={field} /></label>
      </div>
      <label style={{ display: 'block', marginTop: 14 }}>관리자 상담 메모 (고객에게 공개되지 않음)
        <textarea value={note} onChange={e => setNote(e.target.value)} maxLength={4000} rows={4} style={{ ...field, display: 'block', width: '100%', resize: 'vertical' }} />
      </label>
      <p style={muted}>상담에 필요한 내용만 기록해주세요. 저장은 문자 발송이나 자동 알림을 실행하지 않습니다.</p>
      {error && <p role="alert">{error}</p>}
      <button type="button" onClick={save} style={goldAction}>{busy ? '저장 중…' : '상담 내용 저장'}</button>
    </fieldset>
  </div>;
}
export default function AdminConsultations({ refresh, onSaved }: { refresh: number; onSaved: () => void }) {
  const [items, setItems] = useState<Consultation[]>([]), [total, setTotal] = useState(0);
  const [q, setQ] = useState(''), [filter, setFilter] = useState({ q: '', status: 'all', due: false, page: 1 });
  const [open, setOpen] = useState<string | null>(null), [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true), [error, setError] = useState(''), [message, setMessage] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    async function read() {
      setLoading(true); setError('');
      try {
        const params = new URLSearchParams({ q: filter.q, status: filter.status, due: filter.due ? '1' : '0', page: String(filter.page) });
        const r = await fetch(`/api/admin/consultations?${params}`, { cache: 'no-store', signal: controller.signal });
        const body = await r.json();
        if (!r.ok) throw new Error(body.error || '조회 실패');
        if (!controller.signal.aborted) { setItems(body.items); setTotal(body.total); }
      } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : '조회 실패'); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void read(); return () => controller.abort();
  }, [filter, refresh, reload]);
  return <section aria-label="무료 견적 상담 관리" style={{ color: C.home.onDark }}>
    <h1 style={{ fontSize: 22 }}>상담 관리</h1>
    <form onSubmit={e => { e.preventDefault(); setFilter(v => ({ ...v, q, page: 1 })); setOpen(null); }} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
      <input aria-label="이름 또는 전화번호 검색" placeholder="이름 또는 전화번호" maxLength={80} value={q} onChange={e => setQ(e.target.value)} style={{ ...field, flex: '1 1 180px' }} />
      <button style={goldAction}>검색</button>
      <select aria-label="상담 상태 필터" value={filter.status} onChange={e => { setOpen(null); setFilter(v => ({ ...v, status: e.target.value, page: 1 })); }} style={field}>
        <option value="all">전체 상태</option>{Object.entries(CONSULT_STATUSES).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
      </select>
      <button type="button" style={action} onClick={() => { setOpen(null); setReload(v => v + 1); }}>목록 새로고침</button>
    </form>
    <label style={muted}><input type="checkbox" checked={filter.due} onChange={e => { setOpen(null); setFilter(v => ({ ...v, due: e.target.checked, page: 1 })); }} /> 연락 예정 시간이 지난 미완료 상담만</label>
    <p style={muted}>목록 이동·필터 변경 전 상담 내용을 저장해주세요. 한 페이지 25건 · 일시는 한국시간</p>
    {message && <p role="status">{message}</p>}
    {loading ? <p role="status">불러오는 중…</p> : error ? <p role="alert">{error}</p> : <>
      <p style={muted}>검색 결과 {total.toLocaleString()}건</p>
      {items.length === 0 && <p>조건에 맞는 상담이 없습니다.</p>}
      {items.map(item => <article key={item.id} style={{ ...panel, marginBottom: 10 }}>
        <button type="button" aria-expanded={open === item.id} onClick={() => setOpen(open === item.id ? null : item.id)} style={{ ...action, width: '100%', border: 0, background: 'transparent', textAlign: 'left', padding: '0 0 12px', display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <span><strong>{item.name}</strong> · {formatEstimateRegion(item.region)}<br /><span style={muted}>{dateLabel(item.created_at)} · {formatConsultBudget(item.budget ?? undefined)}</span></span>
          <span style={{ color: C.primary }}>{CONSULT_STATUSES[item.status] || item.status || '미정'}<br /><span style={muted}>다음 연락: {dateLabel(item.next_contact_at)}</span></span>
        </button>
        {open === item.id && <Editor key={`${item.id}:${item.admin_version}`} item={item} onSaved={() => { setOpen(null); setMessage('상담 내용을 저장했어요.'); setReload(v => v + 1); onSaved(); }} />}
      </article>)}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 16 }}>
        <button disabled={filter.page <= 1} style={action} onClick={() => { setOpen(null); setFilter(v => ({ ...v, page: v.page - 1 })); }}>이전</button>
        <span>{filter.page} / {Math.max(1, Math.ceil(total / 25))}</span>
        <button disabled={filter.page * 25 >= total} style={action} onClick={() => { setOpen(null); setFilter(v => ({ ...v, page: v.page + 1 })); }}>다음</button>
      </div>
    </>}
  </section>;
}
