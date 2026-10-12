"use client";
import { useEffect, useState } from 'react';
import { C } from './EstimateLayout';
import { action, field, goldAction, muted, panel, consultStatusStyle, consultStatusBadge } from './adminStyles';
import { CONSULT_STATUSES, CONSULT_STATUS_OPTIONS, fromKstInput, kstInput, type Consultation } from '@/lib/adminCrm';
import { formatEstimateRegion } from '@/lib/estimateRegion';
import { formatConsultBudget, formatConsultSchedule } from '@/lib/consultStore';
import { INDUSTRY_LABELS } from '@/lib/intakeValidation';
import { IconChevronDown, IconSearch, IconBuildingStore, IconRulerMeasure, IconCalendar } from '@tabler/icons-react';

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
  return <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${C.admin.line}`, lineHeight: 1.8, overflowWrap: 'anywhere', fontSize: 14 }}>
    <h3 style={{ fontSize: 15, margin: '0 0 14px' }}>신청 상세</h3>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '12px 24px', padding: 18, borderRadius: 12, background: C.admin.bg }}>
    <div>전화번호: <a href={`tel:${item.phone.replace(/[^\d+]/g, '')}`} style={{ color: C.primary }}>{item.phone}</a></div>
    <div>공간: {item.building_type === 'residential' ? '주거' : item.building_type === 'commercial' ? '상가' : '미정'} · {item.area ? `${item.area}평` : '면적 미정'}</div>
    <div>업종: {INDUSTRY_LABELS[item.commercial_type || ''] || item.commercial_type || '—'} {item.commercial_sub} · 주거 등급: {grades[item.residential_grade || ''] || item.residential_grade || '—'}</div>
    <div>공사 경험: {item.experience === 'yes' ? '있음' : item.experience === 'no' ? '없음' : '—'} · 공사 범위: {item.work_scope === 'full' ? '전체' : item.work_scope === 'partial' ? '부분' : '—'}</div>
    <div>일정: {formatConsultSchedule(item.schedule ?? undefined)} · 예산: {formatConsultBudget(item.budget ?? undefined)}</div>
    </div>
    {item.space_description && <p style={{ whiteSpace: 'pre-wrap' }}>공간 설명: {item.space_description}</p>}
    {item.memo && <p style={{ whiteSpace: 'pre-wrap' }}>고객 요청: {item.memo}</p>}
    <p style={muted}>개인정보 동의: {item.consent_at ? dateLabel(item.consent_at) : '기존 기록 없음'}</p>
    <fieldset disabled={busy} style={{ border: 0, padding: '20px 0 0', margin: 0, borderTop: `1px solid ${C.admin.line}` }}>
      <legend style={{ fontSize: 15, fontWeight: 700, paddingRight: 12 }}>상담 기록</legend>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <label>상담 상태<br /><select value={status} onChange={e => setStatus(e.target.value)} style={{ ...field, ...consultStatusStyle(status) }}>
          {!CONSULT_STATUS_OPTIONS.some(([id]) => id === status) && <option value={status}>{CONSULT_STATUSES[status] || `${status} (기존)`}</option>}
          {CONSULT_STATUS_OPTIONS.map(([id, label]) => <option key={id} value={id} style={consultStatusStyle(id)}>{label}</option>)}
        </select></label>
        <label>다음 연락 일시 (한국시간)<br /><input type="datetime-local" disabled={status === 'lost'} value={status === 'lost' ? '' : next} onInput={e => setNext(e.currentTarget.value)} onChange={e => setNext(e.target.value)} style={field} /></label>
      </div>
      {status === 'lost' && <p style={muted}>무산으로 저장하면 다음 연락 일정이 해제됩니다. 기존 상담 기록과 메모는 유지됩니다.</p>}
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
  const [summary, setSummary] = useState<{ status: string; count: number }[]>([]);
  const [q, setQ] = useState(''), [filter, setFilter] = useState({ q: '', status: 'all', due: false, page: 1, month: '' });
  const [open, setOpen] = useState<string | null>(null), [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true), [error, setError] = useState(''), [message, setMessage] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    async function read() {
      setLoading(true); setError('');
      try {
        const params = new URLSearchParams({ q: filter.q, status: filter.status, due: filter.due ? '1' : '0', page: String(filter.page), month: filter.month });
        const r = await fetch(`/api/admin/consultations?${params}`, { cache: 'no-store', signal: controller.signal });
        const body = await r.json();
        if (!r.ok) throw new Error(body.error || '조회 실패');
        if (!controller.signal.aborted) { setItems(body.items); setTotal(body.total); setSummary(body.summary || []); }
      } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : '조회 실패'); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void read(); return () => controller.abort();
  }, [filter, refresh, reload]);
  return <section aria-label="무료 견적 상담 관리" style={{ color: C.admin.text }}>
    <div style={{ marginBottom: 28 }}>
      <p style={{ ...muted, fontSize: 11, letterSpacing: '0.15em', margin: '0 0 8px' }}>CONSULTATIONS</p>
      <h1 style={{ fontSize: 30, letterSpacing: '-0.04em', margin: '0 0 8px', fontWeight: 750 }}>상담 관리</h1>
      <p style={{ ...muted, margin: 0 }}>새로운 문의부터 계약까지, 상담 진행 상황을 한곳에서 확인하세요.</p>
    </div>
    <div style={{ ...panel, marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div><span style={{ ...muted, display: 'block', fontSize: 12 }}>접수 기준</span><strong style={{ fontSize: 19 }}>{filter.month ? `${filter.month.slice(0, 4)}년 ${Number(filter.month.slice(5))}월` : '전체 기간'} 상담 현황</strong></div>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><IconCalendar size={17} aria-hidden="true" color={C.admin.muted} /><input aria-label="접수 월" type="month" min="2000-01" max="2099-12" value={filter.month} onChange={e => { setOpen(null); setFilter(v => ({ ...v, month: e.target.value, page: 1 })); }} style={field} /></label>
        <button type="button" style={action} onClick={() => { setOpen(null); setFilter(v => ({ ...v, month: new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 7), page: 1 })); }}>이번 달</button>
        <button type="button" style={action} onClick={() => { setOpen(null); setFilter(v => ({ ...v, month: '', page: 1 })); }}>전체 기간</button>
        </div>
      </div>
      <div aria-busy={loading} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(108px, 1fr))', gap: 8, marginTop: 24 }}>
        {(summary.length ? summary : ['all', ...CONSULT_STATUS_OPTIONS.map(([id]) => id)].map(status => ({ status, count: 0 }))).filter(s => !['contact_attempted', 'contacted'].includes(s.status) || s.count > 0).map(s => <button type="button" disabled={loading || !!error} key={s.status} aria-pressed={filter.status === s.status} style={{ textAlign: 'left', cursor: loading ? 'wait' : 'pointer', padding: '16px 14px', borderRadius: 12, background: filter.status === s.status ? C.admin.raised : C.admin.bg, border: `1px solid ${filter.status === s.status ? C.primary : C.admin.line}`, color: C.admin.text }} onClick={() => { setOpen(null); setFilter(v => ({ ...v, status: s.status, page: 1 })); }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: C.admin.muted }}><span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 6, background: s.status === 'all' ? C.primary : consultStatusStyle(s.status).color }} />{s.status === 'all' ? '전체 상담' : CONSULT_STATUSES[s.status] || s.status}</span>
          <strong style={{ display: 'block', fontSize: 28, marginTop: 12, fontWeight: 650, fontVariantNumeric: 'tabular-nums' }}>{loading || error ? '—' : s.count.toLocaleString()}<span style={{ fontSize: 11, color: C.admin.muted, marginLeft: 5, fontWeight: 400 }}>건</span></strong>
        </button>)}
      </div>
      <details style={{ ...muted, marginTop: 16, fontSize: 12 }}><summary style={{ cursor: 'pointer' }}>집계 기준 안내</summary>선택 기간에 접수된 상담의 현재 상태입니다. 월말 당시 상태가 아니며, 상태별 건수는 아래 검색·상태·연락 예정 필터와 무관합니다.</details>
    </div>
    <form onSubmit={e => { e.preventDefault(); setFilter(v => ({ ...v, q, page: 1 })); setOpen(null); }} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
      <label style={{ position: 'relative', flex: '1 1 220px' }}><IconSearch aria-hidden="true" size={18} style={{ position: 'absolute', top: 12, left: 13, color: C.admin.muted }} /><input aria-label="이름 또는 전화번호 검색" placeholder="이름 또는 전화번호 검색" maxLength={80} value={q} onChange={e => setQ(e.target.value)} style={{ ...field, paddingLeft: 40, width: '100%' }} /></label>
      <button style={goldAction}>검색</button>
      <select aria-label="상담 상태 필터" value={filter.status} onChange={e => { setOpen(null); setFilter(v => ({ ...v, status: e.target.value, page: 1 })); }} style={{ ...field, ...(filter.status === 'all' ? {} : consultStatusStyle(filter.status)) }}>
        {filter.status === 'contact_attempted' && <option value="contact_attempted">연락 시도 (기존)</option>}
        <option value="all" style={field}>전체 상태</option>{CONSULT_STATUS_OPTIONS.map(([id, label]) => <option key={id} value={id} style={consultStatusStyle(id)}>{label}</option>)}
      </select>
      <button type="button" style={action} onClick={() => { setOpen(null); setReload(v => v + 1); }}>목록 새로고침</button>
    </form>
    <label style={muted}><input type="checkbox" checked={filter.due} onChange={e => { setOpen(null); setFilter(v => ({ ...v, due: e.target.checked, page: 1 })); }} /> 연락 예정 시간이 지난 미완료 상담만</label>
    {message && <p role="status" style={{ ...muted, padding: '12px 16px', borderRadius: 10, background: C.consultStatus.contracted.background, color: C.consultStatus.contracted.color }}>{message}</p>}
    {loading ? <p role="status" style={{ ...panel, textAlign: 'center', padding: 36 }}>상담 목록을 불러오고 있어요…</p> : error ? <p role="alert" style={panel}>{error}</p> : <>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', margin: '24px 0 12px' }}><strong style={{ fontSize: 14 }}>상담 목록 <span style={{ color: C.primary, marginLeft: 4 }}>{total.toLocaleString()}</span></strong><span style={{ ...muted, fontSize: 12 }}>접수일 최신순 · 한국시간</span></div>
      {items.length === 0 && <div style={{ ...panel, textAlign: 'center', padding: '48px 20px' }}><strong>조건에 맞는 상담이 없어요</strong><p style={muted}>접수 월이나 검색 조건을 변경해보세요.</p></div>}
      {items.map(item => <article key={item.id} style={{ ...panel, padding: 20, marginBottom: 10, borderColor: open === item.id ? C.admin.subtle : C.admin.line }}>
        <button type="button" aria-expanded={open === item.id} onClick={() => setOpen(open === item.id ? null : item.id)} style={{ ...action, width: '100%', border: 0, background: 'transparent', textAlign: 'left', padding: 0, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <span style={{ minWidth: 0, flex: '1 1 240px', overflowWrap: 'anywhere' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}><strong style={{ fontSize: 17 }}>{item.name}</strong><span style={{ fontSize: 12, color: C.admin.muted }}>{formatEstimateRegion(item.region)}</span></span>
            <span style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', margin: '7px 0', fontSize: 13, lineHeight: 1.6, color: C.admin.text }}>
              <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><IconBuildingStore size={14} aria-hidden="true" color={C.admin.muted} />{item.building_type === 'residential' ? '주거' : `${INDUSTRY_LABELS[item.commercial_type || ''] || item.commercial_type || '업종 미입력'}${item.commercial_sub?.trim() && !['unknown', 'etc'].includes(item.commercial_type || '') ? ` · ${item.commercial_sub.trim()}` : ''}`}</span>
              <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><IconRulerMeasure size={14} aria-hidden="true" color={C.admin.muted} />{typeof item.area === 'number' && Number.isFinite(item.area) && item.area > 0 ? `${item.area.toLocaleString('ko-KR')}평` : '평수 미입력'}</span>
            </span>
            <span style={{ ...muted, fontSize: 11, fontWeight: 400 }}>접수 {dateLabel(item.created_at)}</span>
          </span>
          <span style={{ minWidth: 110 }}><span style={{ ...muted, display: 'block', fontSize: 11, fontWeight: 400 }}>희망 예산</span><strong style={{ display: 'block', marginTop: 6, fontSize: 15 }}>{formatConsultBudget(item.budget ?? undefined)}</strong></span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 18 }}><span><span style={consultStatusBadge(item.status)}>{CONSULT_STATUSES[item.status] || item.status || '미정'}</span><span style={{ ...muted, display: 'block', fontSize: 11, marginTop: 8, fontWeight: 400 }}>다음 연락 · {dateLabel(item.next_contact_at)}</span></span><IconChevronDown aria-hidden="true" size={18} style={{ color: C.admin.muted, transform: open === item.id ? 'rotate(180deg)' : undefined }} /></span>
        </button>
        {open === item.id && <Editor key={`${item.id}:${item.admin_version}`} item={item} onSaved={() => { setOpen(null); setMessage('상담 내용을 저장했어요.'); setReload(v => v + 1); onSaved(); }} />}
      </article>)}
      <p style={{ ...muted, fontSize: 12, marginTop: 20 }}>목록 이동 전 변경 내용을 저장해주세요. 한 페이지에 25건씩 표시합니다.</p>
      <div style={{ display: 'flex', gap: 18, justifyContent: 'center', alignItems: 'center', marginTop: 24 }}>
        <button disabled={filter.page <= 1} style={action} onClick={() => { setOpen(null); setFilter(v => ({ ...v, page: v.page - 1 })); }}>이전</button>
        <span>{filter.page} / {Math.max(1, Math.ceil(total / 25))}</span>
        <button disabled={filter.page * 25 >= total} style={action} onClick={() => { setOpen(null); setFilter(v => ({ ...v, page: v.page + 1 })); }}>다음</button>
      </div>
    </>}
  </section>;
}
