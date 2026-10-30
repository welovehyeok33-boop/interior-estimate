"use client";
import { useId, useState, type FocusEvent, type MouseEvent, type PointerEvent } from 'react';
import { C } from './EstimateLayout';
import { action, muted } from './adminStyles';
import { referralVisitorTrend } from '@/lib/referralTrend';
import type { ReferralReport } from '@/lib/referralSites';

const shortDate = (day: string) => `${Number(day.slice(5, 7))}/${Number(day.slice(8))}`;
const count = (value: number | null) => value === null ? '미수집' : `${value.toLocaleString('ko-KR')}명`;

export default function ReferralVisitorChart({ report }: { report: ReferralReport }) {
  const [source, setSource] = useState('all');
  const [activeDay, setActiveDay] = useState('');
  const [hover, setHover] = useState<{ day: string; left: number; top: number; below: boolean } | null>(null);
  const tooltipId = useId();
  const days = referralVisitorTrend(report, source);
  const index = Math.max(0, days.findIndex(day => day.day === activeDay));
  const selectedIndex = activeDay && days.some(day => day.day === activeDay) ? index : days.length - 1;
  const selected = days[selectedIndex];
  const known = days.filter(day => day.visitors !== null);
  const sum = known.reduce((total, day) => total + day.visitors!, 0);
  const total = known.length && Number.isSafeInteger(sum) ? sum : null;
  const max = Math.max(0, ...known.map(day => day.visitors!));
  const ceiling = Math.max(2, Math.ceil(max / 2) * 2);
  const x = (i: number) => (i + 0.5) / days.length * 720;
  const y = (value: number) => 172 - value / ceiling * 160;
  const partial = days.some(day => day.knownSites < day.totalSites || day.visitors === null);
  const labels = [...new Set(Array.from({ length: Math.min(5, days.length) }, (_, i) =>
    days.length === 1 ? 0 : Math.round(i * (days.length - 1) / (Math.min(5, days.length) - 1))))];
  const title = source === 'all' ? '전체 사이트' : report.rows.find(row => row.source === source)?.name || '사이트';
  const hovered = hover ? days.find(day => day.day === hover.day) : null;
  const showTooltip = (i: number, event: PointerEvent<HTMLButtonElement> | MouseEvent<HTMLButtonElement> | FocusEvent<HTMLButtonElement>) => {
    const bounds = event.currentTarget.parentElement?.getBoundingClientRect();
    if (!bounds) return;
    const pointer = 'clientX' in event && event.clientX > 0;
    const left = pointer ? event.clientX - bounds.left : x(i) / 720 * bounds.width;
    const top = pointer ? event.clientY - bounds.top : y(days[i].visitors ?? 0);
    setActiveDay(days[i].day);
    setHover({ day: days[i].day, left: Math.max(76, Math.min(bounds.width - 76, left)), top: top < 70 ? top + 14 : top - 12, below: top < 70 });
  };
  return <section aria-label="일별 사이트 방문자 그래프" style={{ margin: '20px 0', padding: '18px 16px 14px', border: `1px solid ${C.admin.line}`, borderRadius: 12, minWidth: 0 }}>
    <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
      <div><h2 style={{ fontSize: 16, margin: '0 0 4px' }}>일별 사이트 방문자</h2><p style={{ ...muted, fontSize: 12, margin: 0 }}>{title} · {partial ? '확인된 기록 기준' : '선택 기간 기준'}</p></div>
      <div style={{ textAlign: 'right' }}><span style={{ ...muted, fontSize: 11, display: 'block' }}>{partial ? '확인된 방문 합계' : '방문 합계'}</span><strong style={{ fontSize: 23, fontVariantNumeric: 'tabular-nums' }}>{total === null ? '—' : `${total.toLocaleString('ko-KR')}명`}</strong></div>
    </div>
    <div role="group" aria-label="그래프 사이트 선택" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '14px 0' }}>
      {[{ source: 'all', name: '전체 합계' }, ...report.rows].map(site => <button key={site.source} type="button" aria-pressed={source === site.source} onClick={() => { setSource(site.source); setHover(null); }}
        style={{ ...action, minHeight: 32, padding: '5px 10px', fontSize: 12, fontWeight: source === site.source ? 700 : 500, borderRadius: 7,
          borderColor: source === site.source ? C.primary : C.admin.line, background: source === site.source ? C.admin.accentBg : C.admin.surface }}>
        {site.name.replace(/ 인테리어$/, '')}
      </button>)}
    </div>
    <p role="status" aria-live="polite" style={{ ...muted, fontSize: 12, margin: '0 0 10px', minHeight: 21 }}>
      {selected ? <><strong style={{ color: C.admin.text }}>{selected.day.replaceAll('-', '.')} · {count(selected.visitors)}</strong><span style={{ marginLeft: 8 }}>{selected.knownSites}/{selected.totalSites}곳 수집{selected.knownSites > 0 && selected.knownSites < selected.totalSites ? ' · 부분 집계' : ''}</span></> : '선택 기간의 방문 기록이 없어요.'}
    </p>
    <div style={{ display: 'grid', gridTemplateColumns: '36px minmax(0, 1fr)', gap: 4 }}>
      <div aria-hidden="true" style={{ position: 'relative', height: 180, fontSize: 10, color: C.admin.muted, textAlign: 'right' }}>
        {[ceiling, ceiling / 2, 0].map(value => <span key={value} style={{ position: 'absolute', top: `${y(value) / 180 * 100}%`, right: 2, transform: 'translateY(-50%)', maxWidth: '100%', overflow: 'hidden' }}>{value.toLocaleString('ko-KR', { notation: 'compact' })}</span>)}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ position: 'relative', height: 180 }}>
          <svg aria-hidden="true" viewBox="0 0 720 180" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 180, overflow: 'visible' }}>
            {[ceiling, ceiling / 2, 0].map(value => <line key={value} x1={0} x2={720} y1={y(value)} y2={y(value)} stroke={C.admin.line} strokeWidth={1} vectorEffect="non-scaling-stroke" />)}
            {selected && <line x1={x(selectedIndex)} x2={x(selectedIndex)} y1={8} y2={172} stroke={C.admin.line} strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />}
            {days.map((day, i) => {
              const before = days[i - 1];
              if (day.visitors === null || !before || before.visitors === null) return null;
              return <line key={day.day} x1={x(i - 1)} x2={x(i)} y1={y(before.visitors)} y2={y(day.visitors)} stroke={C.admin.chart} strokeWidth={3} strokeLinecap="round" vectorEffect="non-scaling-stroke"
                strokeDasharray={day.knownSites < day.totalSites || before.knownSites < before.totalSites ? '5 5' : undefined} />;
            })}
          </svg>
          {days.map((day, i) => day.visitors === null ? null : <span key={day.day} aria-hidden="true" style={{ position: 'absolute', left: `${x(i) / 720 * 100}%`, top: `${y(day.visitors) / 180 * 100}%`, transform: 'translate(-50%, -50%)',
            width: i === selectedIndex ? 10 : 6, height: i === selectedIndex ? 10 : 6, boxSizing: 'border-box', borderRadius: '50%', border: `2px solid ${C.admin.chart}`, background: day.knownSites < day.totalSites ? C.admin.surface : C.admin.chart, pointerEvents: 'none' }} />)}
          {!known.length && <p style={{ ...muted, fontSize: 12, position: 'absolute', inset: '40px 8px auto', textAlign: 'center', pointerEvents: 'none' }}>선택 기간에 수집된 방문 기록이 없어요.</p>}
          <div role="group" aria-label="날짜별 방문자 선택" onPointerLeave={() => setHover(null)} style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: `repeat(${Math.max(1, days.length)}, minmax(0, 1fr))` }}>
            {days.map((day, i) => <button key={day.day} type="button" aria-label={`${day.day} ${count(day.visitors)}, ${day.knownSites}/${day.totalSites}곳 수집`} aria-pressed={selectedIndex === i} tabIndex={selectedIndex === i ? 0 : -1}
              aria-describedby={hover?.day === day.day ? tooltipId : undefined}
              onPointerEnter={event => showTooltip(i, event)} onPointerMove={event => showTooltip(i, event)} onFocus={event => showTooltip(i, event)} onClick={event => showTooltip(i, event)} onBlur={() => setHover(null)}
              onKeyDown={event => {
                const next = ({ ArrowLeft: Math.max(0, i - 1), ArrowRight: Math.min(days.length - 1, i + 1), Home: 0, End: days.length - 1 } as Record<string, number>)[event.key];
                if (next === undefined) return;
                event.preventDefault();
                event.currentTarget.parentElement?.querySelectorAll('button')[next]?.focus();
              }}
              style={{ width: '100%', minWidth: 0, height: '100%', padding: 0, border: 0, borderRadius: 4, background: 'transparent', cursor: 'pointer', outlineOffset: -2 }} />)}
          </div>
          {hover && hovered && <div id={tooltipId} role="tooltip" data-visitor-tooltip="true" style={{ position: 'absolute', zIndex: 2, left: hover.left, top: hover.top, transform: hover.below ? 'translateX(-50%)' : 'translate(-50%, -100%)', pointerEvents: 'none', width: 152, boxSizing: 'border-box', border: `1px solid ${C.admin.line}`, borderRadius: 8, background: C.admin.surface, color: C.admin.text, padding: '8px 10px', lineHeight: 1.5 }}>
            <span style={{ ...muted, display: 'block', fontSize: 11 }}>{hovered.day.replaceAll('-', '.')}</span>
            <strong style={{ fontSize: 19, display: 'block', fontVariantNumeric: 'tabular-nums' }}>{count(hovered.visitors)}</strong>
            <span style={{ ...muted, fontSize: 10 }}>{hovered.knownSites}/{hovered.totalSites}곳 확인{hovered.knownSites < hovered.totalSites ? ' · 부분 집계' : ''}</span>
          </div>}
        </div>
        <div aria-hidden="true" style={{ position: 'relative', height: 24, fontSize: 10, color: C.admin.muted }}>
          {labels.map(i => <span key={i} style={{ position: 'absolute', left: `${x(i) / 720 * 100}%`, top: 5, transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>{shortDate(days[i].day)}</span>)}
        </div>
      </div>
    </div>
    <p style={{ ...muted, fontSize: 11, margin: '8px 0 0' }}>날짜를 가리키거나 누르면 수치가 보여요. 키보드는 좌우 방향키로 이동할 수 있어요.<br />누락 날짜는 빈 구간, 일부 사이트만 확인된 합계는 점선으로 표시합니다. 사이트 간 중복 방문은 포함되며 오늘 수치는 집계 중입니다.</p>
  </section>;
}
