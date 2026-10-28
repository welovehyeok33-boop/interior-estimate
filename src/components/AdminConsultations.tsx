"use client";
import { useEffect, useState } from 'react';
import { C } from './EstimateLayout';
import { action, field, goldAction, muted, panel, consultStatusStyle, consultStatusBadge } from './adminStyles';
import { CONSULT_STATUSES, CONSULT_EDIT_STATUS_OPTIONS, updateConsultationCounts, type Consultation } from '@/lib/adminCrm';
import { formatEstimateRegion } from '@/lib/estimateRegion';
import { formatConsultBudget, formatConsultSchedule } from '@/lib/consultStore';
import { INDUSTRY_LABELS } from '@/lib/intakeValidation';
import { IconChevronDown, IconSearch, IconBuildingStore, IconRulerMeasure, IconCalendar, IconPhone, IconNotes, IconDeviceFloppy } from '@tabler/icons-react';

const dateLabel = (value: string | null) => value ? new Date(value).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }) : '미정';
const grades: Record<string, string> = { economy: '실속형', budget: '실속형', standard: '스탠다드', premium: '하이앤드', highend: '하이앤드' };
function Editor({ item, hidden = false, onSaved }: { item: Consultation; hidden?: boolean; onSaved: (updated: Consultation) => void }) {
  const [status, setStatus] = useState(item.status || 'new');
  const [note, setNote] = useState(item.admin_note || '');
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [composing, setComposing] = useState(false);
  const dirty = status !== (item.status || 'new') || note !== (item.admin_note || '');
  useEffect(() => {
    if (!dirty && !busy) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, busy]);
  async function save() {
    if (busy || composing) return;
    setBusy(true); setError(''); setSaved(false);
    try {
      const r = await fetch('/api/admin/consultations', { method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, status, admin_note: note, admin_version: item.admin_version }) });
      const body = await r.json();
      if (!r.ok) throw new Error(body.error || '저장 실패');
      const updated: Consultation = body.item;
      setStatus(updated.status);
      setNote(updated.admin_note || '');
      onSaved(updated);
      setSaved(true);
    } catch (e) { setError(e instanceof Error ? e.message : '저장하지 못했어요.'); }
    finally { setBusy(false); }
  }
  return <div hidden={hidden} style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${C.admin.line}`, lineHeight: 1.8, overflowWrap: 'anywhere', fontSize: 14 }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: 24, alignItems: 'start' }}>
    <section aria-label="신청 상세" style={{ minWidth: 0 }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, margin: '0 0 16px' }}><IconBuildingStore size={18} aria-hidden="true" color={C.admin.accentText} />신청 정보</h3>
      <a href={`tel:${item.phone.replace(/[^\d+]/g, '')}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px 18px', borderRadius: 12, background: C.admin.accentBg, color: C.admin.text, textDecoration: 'none', marginBottom: 12 }}>
        <span><span style={{ ...muted, display: 'block', fontSize: 11 }}>고객 연락처</span><strong style={{ fontSize: 20, letterSpacing: '0.02em' }}>{item.phone.replace(/^(\d{3})(\d{4})(\d{4})$/, '$1-$2-$3')}</strong></span><IconPhone size={20} aria-hidden="true" color={C.admin.accentText} />
      </a>
      <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, margin: 0 }}>
        {[
          ['공간 · 면적', `${item.building_type === 'residential' ? '주거' : item.building_type === 'commercial' ? '상가' : '공간 미정'} · ${item.area ? `${item.area}평` : '면적 미정'}`],
          [item.building_type === 'residential' ? '주거 등급' : '업종', item.building_type === 'residential' ? grades[item.residential_grade || ''] || item.residential_grade || '미입력' : [INDUSTRY_LABELS[item.commercial_type || ''] || item.commercial_type, item.commercial_sub].filter(Boolean).join(' · ') || '미입력'],
          ['공사 예정 시기', formatConsultSchedule(item.schedule ?? undefined)],
          ['희망 예산', formatConsultBudget(item.budget ?? undefined)],
          ['공사 경험', item.experience === 'yes' ? '있음' : item.experience === 'no' ? '없음' : '미입력'],
          ['공사 범위', item.work_scope === 'full' ? '전체 공사' : item.work_scope === 'partial' ? '부분 공사' : '미입력'],
        ].map(([label, value]) => <div key={label} style={{ background: C.admin.bg, borderRadius: 10, padding: '12px 14px', minWidth: 0 }}><dt style={{ ...muted, fontSize: 11, marginBottom: 5 }}>{label}</dt><dd style={{ margin: 0, fontWeight: 650, fontSize: 13 }}>{value}</dd></div>)}
      </dl>
      {(item.space_description || item.memo) && <div style={{ marginTop: 16, padding: '16px 18px', border: `1px solid ${C.admin.line}`, borderRadius: 12 }}>
        <h4 style={{ fontSize: 13, margin: '0 0 12px', display: 'flex', gap: 7, alignItems: 'center' }}><IconNotes size={16} aria-hidden="true" />고객이 남긴 내용</h4>
        {[[ '공간 설명', item.space_description ], [ '요청 사항', item.memo ]].filter(([, value]) => value).map(([label, value]) => <div key={label} style={{ marginTop: 10 }}><span style={{ ...muted, fontSize: 11 }}>{label}</span><p style={{ whiteSpace: 'pre-wrap', margin: '4px 0 0', fontSize: 13 }}>{value}</p></div>)}
      </div>}
      <p style={{ ...muted, fontSize: 11, margin: '14px 0 0' }}>개인정보 동의 · {item.consent_at ? dateLabel(item.consent_at) : '기존 기록 없음'}</p>
    </section>
    <section aria-label="상담 기록 편집" style={{ background: C.admin.bg, border: `1px solid ${C.admin.line}`, borderRadius: 14, padding: 20, minWidth: 0 }}>
    <h3 style={{ fontSize: 16, margin: '0 0 4px' }}>상담 기록</h3>
    <p style={{ ...muted, fontSize: 12, margin: '0 0 20px' }}>진행 상황과 상담 내용을 기록하세요.</p>
    <fieldset disabled={busy} onChange={() => { setSaved(false); setError(''); }} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
      <legend style={{ ...muted, fontSize: 11, marginBottom: 10 }}>관리자 전용 · 고객에게 공개되지 않음</legend>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 12 }}>
        <label style={{ fontSize: 12, fontWeight: 650 }}>상담 상태<select value={status} onChange={e => setStatus(e.target.value)} style={{ ...field, ...consultStatusStyle(status), width: '100%', display: 'block', marginTop: 6 }}>
          {!CONSULT_EDIT_STATUS_OPTIONS.some(([id]) => id === status) && <option value={status}>현재: {CONSULT_STATUSES[status] || status}</option>}
          {CONSULT_EDIT_STATUS_OPTIONS.map(([id, label]) => <option key={id} value={id} style={consultStatusStyle(id)}>{label}</option>)}
        </select></label>
      </div>
      <label style={{ display: 'block', marginTop: 20, fontSize: 12, fontWeight: 650 }}>관리자 상담 메모
        <textarea placeholder="상담 내용, 고객의 요청, 다음에 확인할 내용을 남겨주세요." value={note} onChange={e => setNote(e.target.value)} onCompositionStart={() => setComposing(true)} onCompositionEnd={() => setComposing(false)} maxLength={4000} rows={7} style={{ ...field, display: 'block', width: '100%', resize: 'vertical', marginTop: 6, fontFamily: 'inherit', fontSize: 13, fontWeight: 650, lineHeight: 1.8 }} />
      </label>
      <div style={{ ...muted, textAlign: 'right', fontSize: 11, marginTop: 5 }}>{note.length.toLocaleString()} / 4,000자</div>
      <p style={{ ...muted, fontSize: 11, margin: '12px 0 20px' }}>저장 버튼을 눌러야 반영됩니다. 접었다 다시 열어도 작성 중인 내용은 유지됩니다.<br />새로고침하거나 목록을 이동하기 전에는 저장해주세요. 저장해도 문자나 자동 알림은 발송되지 않습니다.</p>
      {error && <p role="alert" style={{ color: C.consultStatus.lost.color }}>{error}</p>}
      <button type="button" onClick={save} disabled={busy || composing} style={{ ...goldAction, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><IconDeviceFloppy size={17} aria-hidden="true" />{busy ? '저장 중…' : '상담 내용 저장'}</button>
      <p role="status" style={{ ...muted, minHeight: 22, margin: '8px 0 0', fontSize: 12 }}>{busy ? '저장 중…' : error ? '저장하지 못했어요. 저장 버튼을 눌러 다시 시도해주세요.' : dirty ? '아직 저장하지 않은 변경 내용이 있어요.' : saved ? '상담 내용을 저장했어요.' : '\u00a0'}</p>
    </fieldset>
    </section>
    </div>
  </div>;
}
export default function AdminConsultations({ refresh, onSaved, initialStatus = 'all' }: { refresh: number; onSaved: (before: Consultation, after: Consultation) => void; initialStatus?: string }) {
  const [items, setItems] = useState<Consultation[]>([]), [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<{ status: string; count: number }[]>([]);
  const consultationTotal = summary.find(row => row.status === 'all')?.count ?? 0;
  const contractedTotal = summary.find(row => row.status === 'contracted')?.count ?? 0;
  const contractRate = consultationTotal > 0 ? `${(contractedTotal / consultationTotal * 100).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}%` : '—';
  const [q, setQ] = useState(''), [filter, setFilter] = useState({ q: '', status: initialStatus, page: 1, month: '' });
  const [open, setOpen] = useState<string | null>(null), [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true), [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    async function read() {
      setLoading(true); setError('');
      try {
        const params = new URLSearchParams({ q: filter.q, status: filter.status, page: String(filter.page), month: filter.month });
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
      <p style={{ color: C.admin.accentText, fontSize: 12, fontWeight: 800, margin: '0 0 8px' }}>무료견적 신청</p>
      <h1 style={{ fontSize: 30, letterSpacing: '-0.04em', margin: '0 0 8px', fontWeight: 750 }}>상담 관리</h1>
      <p style={{ ...muted, margin: 0 }}>새로운 문의부터 계약까지, 상담 진행 상황을 한곳에서 확인하세요.</p>
    </div>
    <div style={{ ...panel, padding: '14px 16px', borderRadius: 12, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <strong style={{ fontSize: 14 }}>{filter.month ? `${filter.month.slice(0, 4)}년 ${Number(filter.month.slice(5))}월` : '전체 기간'} 상담 현황 <span style={{ ...muted, fontSize: 11, fontWeight: 400 }}>· 접수 기준</span></strong>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><IconCalendar size={17} aria-hidden="true" color={C.admin.muted} /><input aria-label="접수 월" type="month" min="2000-01" max="2099-12" value={filter.month} onChange={e => { setOpen(null); setFilter(v => ({ ...v, month: e.target.value, page: 1 })); }} style={field} /></label>
        <button type="button" style={action} onClick={() => { setOpen(null); setFilter(v => ({ ...v, month: new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 7), page: 1 })); }}>이번 달</button>
        <button type="button" style={action} onClick={() => { setOpen(null); setFilter(v => ({ ...v, month: '', page: 1 })); }}>전체 기간</button>
        </div>
      </div>
      <div aria-busy={loading} style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
        {['all', ...CONSULT_EDIT_STATUS_OPTIONS.map(([id]) => id)].map(status => ({ status, count: summary.find(row => row.status === status)?.count ?? 0 })).map(s => <button type="button" disabled={loading || !!error} key={s.status} aria-pressed={filter.status === s.status} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minHeight: 42, whiteSpace: 'nowrap', cursor: loading ? 'wait' : 'pointer', padding: '8px 12px', borderRadius: 8, background: filter.status === s.status ? C.primary : C.admin.bg, border: `1px solid ${filter.status === s.status ? C.primary : C.admin.line}`, color: filter.status === s.status ? C.textDark : C.admin.text }} onClick={() => { setOpen(null); setFilter(v => ({ ...v, status: s.status, page: 1 })); }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: filter.status === s.status ? C.textDark : C.admin.muted }}><span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 6, background: filter.status === s.status ? C.textDark : s.status === 'all' ? C.primary : consultStatusStyle(s.status).color }} />{s.status === 'all' ? '전체 상담' : CONSULT_STATUSES[s.status] || s.status}</span>
          <strong style={{ fontSize: 16, fontWeight: 750, fontVariantNumeric: 'tabular-nums' }}>{loading || error ? '—' : s.count.toLocaleString()}<span style={{ fontSize: 10, marginLeft: 3, fontWeight: 400 }}>건</span></strong>
        </button>)}
        <div aria-label="상담 계약률" title="선택 기간에 접수된 전체 상담 중 현재 계약 상태인 상담 비율" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minHeight: 42, padding: '8px 12px', borderRadius: 8, background: C.admin.accentBg, border: `1px solid ${C.primary}`, color: C.admin.text, boxSizing: 'border-box' }}>
          <span style={{ fontSize: 12, color: C.admin.accentText }}>계약률</span>
          <strong style={{ fontSize: 16, fontWeight: 750, fontVariantNumeric: 'tabular-nums' }}>{loading || error ? '—' : contractRate}</strong>
        </div>
      </div>
      <p style={{ ...muted, margin: '8px 0 0', fontSize: 11 }}>계약률 = 계약 ÷ 전체 상담 · 선택한 접수 기간 기준 · 상담이 없으면 — 표시</p>
      <details style={{ ...muted, marginTop: 8, fontSize: 11 }}><summary style={{ cursor: 'pointer' }}>집계 기준 안내</summary>선택 기간에 접수된 상담의 현재 상태입니다. 월말 당시 상태가 아니며, 상태별 건수는 아래 검색·상태 필터와 무관합니다. 과거 상태(연락 완료·견적 전달·종료 등)는 전체 상담에 포함되며 네 상태의 합계와 차이가 날 수 있습니다.</details>
    </div>
    <form onSubmit={e => { e.preventDefault(); setFilter(v => ({ ...v, q, page: 1 })); setOpen(null); }} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
      <label style={{ position: 'relative', flex: '1 1 220px' }}><IconSearch aria-hidden="true" size={18} style={{ position: 'absolute', top: 12, left: 13, color: C.admin.muted }} /><input aria-label="이름 또는 전화번호 검색" placeholder="이름 또는 전화번호 검색" maxLength={80} value={q} onChange={e => setQ(e.target.value)} style={{ ...field, paddingLeft: 40, width: '100%' }} /></label>
      <button style={goldAction}>검색</button>
      <select aria-label="상담 상태 필터" value={filter.status} onChange={e => { setOpen(null); setFilter(v => ({ ...v, status: e.target.value, page: 1 })); }} style={{ ...field, ...(filter.status === 'all' ? {} : consultStatusStyle(filter.status)) }}>
        {filter.status !== 'all' && !CONSULT_EDIT_STATUS_OPTIONS.some(([id]) => id === filter.status) && <option value={filter.status}>기존: {CONSULT_STATUSES[filter.status] || filter.status}</option>}
        <option value="all" style={field}>전체 상태</option>{CONSULT_EDIT_STATUS_OPTIONS.map(([id, label]) => <option key={id} value={id} style={consultStatusStyle(id)}>{label}</option>)}
      </select>
      <button type="button" style={action} onClick={() => { setOpen(null); setReload(v => v + 1); }}>목록 새로고침</button>
    </form>
    {loading ? <p role="status" style={{ ...panel, textAlign: 'center', padding: 36 }}>상담 목록을 불러오고 있어요…</p> : error ? <p role="alert" style={panel}>{error}</p> : <>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', margin: '24px 0 12px' }}><strong style={{ fontSize: 14 }}>상담 목록 <span style={{ color: C.admin.accentText, marginLeft: 4 }}>{total.toLocaleString()}</span></strong><span style={{ ...muted, fontSize: 12 }}>접수일 최신순 · 한국시간</span></div>
      {items.length === 0 && <div style={{ ...panel, textAlign: 'center', padding: '48px 20px' }}><strong>조건에 맞는 상담이 없어요</strong><p style={muted}>접수 월이나 검색 조건을 변경해보세요.</p></div>}
      {items.map(item => <article key={item.id} style={{ ...panel, padding: '12px 16px', marginBottom: 8,
        borderColor: C.primary,
      }}>
        <button type="button" aria-expanded={open === item.id} onClick={() => setOpen(open === item.id ? null : item.id)} style={{ ...action, width: '100%', border: 0, background: 'transparent', textAlign: 'left', padding: 0, display: 'flex', alignItems: 'center', gap: '8px 16px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <span style={{ minWidth: 0, flex: '1 1 240px', overflowWrap: 'anywhere' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}><strong style={{ fontSize: 17 }}>{item.name}</strong><span style={{ fontSize: 12, color: C.admin.muted }}>{formatEstimateRegion(item.region)}</span></span>
            <span style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 12px', margin: '3px 0', fontSize: 13, lineHeight: 1.6, color: C.admin.text }}>
              <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><IconBuildingStore size={14} aria-hidden="true" color={C.admin.muted} />{item.building_type === 'residential' ? '주거' : `${INDUSTRY_LABELS[item.commercial_type || ''] || item.commercial_type || '업종 미입력'}${item.commercial_sub?.trim() && !['unknown', 'etc'].includes(item.commercial_type || '') ? ` · ${item.commercial_sub.trim()}` : ''}`}</span>
              <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><IconRulerMeasure size={14} aria-hidden="true" color={C.admin.muted} />{typeof item.area === 'number' && Number.isFinite(item.area) && item.area > 0 ? `${item.area.toLocaleString('ko-KR')}평` : '평수 미입력'}</span>
            </span>
            <span style={{ ...muted, fontSize: 11, fontWeight: 400 }}>접수 {dateLabel(item.created_at)}</span>
          </span>
          <span style={{ minWidth: 110 }}><span style={{ ...muted, display: 'block', fontSize: 11, fontWeight: 400 }}>희망 예산</span><strong style={{ display: 'block', marginTop: 3, fontSize: 15 }}>{formatConsultBudget(item.budget ?? undefined)}</strong></span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span><span style={consultStatusBadge(item.status)}>{CONSULT_STATUSES[item.status] || item.status || '미정'}</span></span><IconChevronDown aria-hidden="true" size={18} style={{ color: C.admin.muted, transform: open === item.id ? 'rotate(180deg)' : undefined }} /></span>
        </button>
        {/* Keep each editor mounted so collapsing or opening another card preserves its draft and pending save. */}
        <Editor key={item.id} item={item} hidden={open !== item.id} onSaved={updated => {
          setItems(current => current.map(row => row.id === updated.id ? updated : row));
          setSummary(current => updateConsultationCounts(current, item.status, updated.status));
          onSaved(item, updated);
        }} />
      </article>)}
      <p style={{ ...muted, fontSize: 12, marginTop: 20 }}>목록 이동 전 변경 내용을 저장해주세요. 한 페이지에 25건씩 표시합니다.<br />저장한 상담은 현재 위치에 유지됩니다. 변경된 필터 조건은 목록 새로고침 시 적용됩니다.</p>
      <div style={{ display: 'flex', gap: 18, justifyContent: 'center', alignItems: 'center', marginTop: 24 }}>
        <button disabled={filter.page <= 1} style={action} onClick={() => { setOpen(null); setFilter(v => ({ ...v, page: v.page - 1 })); }}>이전</button>
        <span>{filter.page} / {Math.max(1, Math.ceil(total / 25))}</span>
        <button disabled={filter.page * 25 >= total} style={action} onClick={() => { setOpen(null); setFilter(v => ({ ...v, page: v.page + 1 })); }}>다음</button>
      </div>
    </>}
  </section>;
}
