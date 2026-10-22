"use client";
import { useEffect, useState } from 'react';
import { C } from './EstimateLayout';
import { attributedConversion, consultContactVisitors, conversionRate, koreaDay, type TrafficReport } from '@/lib/analytics';
import { SOURCE_LABELS } from '@/lib/attribution';
import { statsMonth, statsQuery, validStatsMonth } from '@/lib/adminStatsPeriod';
import { action, goldAction, muted, panel } from './adminStyles';
import AdminFlowChart from './AdminFlowChart';
import TrafficPreference from './TrafficPreference';
import AdminTrafficDetails, { DETAIL_TABS, type DetailTab } from './AdminTrafficDetails';

export default function AdminTraffic({ refresh, view, active = true }: { refresh: number; view: 'overview' | 'sources'; active?: boolean }) {
  const [range, setRange] = useState('7');
  const [detailTab, setDetailTab] = useState<DetailTab>('sources');
  const [data, setData] = useState<TrafficReport | null>(null);
  const [error, setError] = useState(''), [loading, setLoading] = useState(true), [retry, setRetry] = useState(0);
  const [month, setMonth] = useState('');
  const query = statsQuery(range, month);
  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    async function read() {
      setLoading(true); setError('');
      try {
        const r = await fetch('/api/admin/analytics?' + query, { cache: 'no-store', signal: controller.signal });
        const body = await r.json();
        if (!r.ok) throw new Error(body.error || '통계 조회 실패');
        if (!controller.signal.aborted) setData(body);
      } catch (e) { if (!controller.signal.aborted) { setData(null); setError(e instanceof Error ? e.message : '조회 실패'); } }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void read(); return () => controller.abort();
  }, [query, refresh, retry, active]);
  const days = data?.days.filter(d => d.day >= data.from && d.day <= data.to) || [];
  const totals = days.reduce((a, d) => ({ visitors: a.visitors + d.visitors, requests: a.requests + d.requests,
    converted: a.converted + d.converted, starts: a.starts + d.consult_starts, engine: a.engine + d.engine_starts }),
    { visitors: 0, requests: 0, converted: 0, starts: 0, engine: 0 });
  const attributed = attributedConversion(data?.sources || []);
  const directVisitors = Math.max(0, totals.visitors - attributed.visitors);
  const rate = attributed.rate;
  const contactVisitors = data?.detailCoverage?.complete === false ? null : consultContactVisitors(data?.details);
  const cell = { padding: '16px 12px', borderBottom: `1px solid ${C.admin.line}`, textAlign: 'left' as const };
  const table = { width: '100%', minWidth: 520, borderCollapse: 'collapse' as const, fontSize: 13 };
  return <section aria-label="방문 및 신청 통계" aria-busy={loading} style={{ ...panel, minWidth: 0, maxWidth: '100%', boxSizing: 'border-box', overflowWrap: 'anywhere', marginBottom: 28 }}>
    <h2 style={{ margin: '0 0 6px', fontSize: 20, letterSpacing: '-0.03em' }}>{view === 'overview' ? '방문 · 신청 분석' : '유입 트래픽'}</h2>
    <p style={{ ...muted, margin: '0 0 20px' }}>방문에서 신청까지, 폼잇의 흐름을 확인하세요.</p>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
      {[['today', '오늘'], ['yesterday', '어제'], ['7', '최근 7일'], ['30', '최근 30일']].map(([id, label]) =>
        <button key={id} aria-pressed={range === id} onClick={() => setRange(id)} style={range === id ? goldAction : action}>{label}</button>)}
      <label style={{ ...(range === 'month' ? goldAction : action), display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 12px', maxWidth: '100%' }}>월별
        <input type="month" aria-label="통계 조회 월 선택" min="2000-01" max={statsMonth()} value={range === 'month' ? month : ''}
          onChange={event => { const value = event.target.value; if (!value) { setMonth(''); setRange('7'); } else if (validStatsMonth(value)) { setMonth(value); setRange('month'); } }}
          style={{ minWidth: 0, width: 132, minHeight: 40, border: 0, background: 'transparent', color: 'inherit', colorScheme: 'inherit', font: 'inherit' }} />
      </label>
      <button disabled={loading} onClick={() => setRetry(v => v + 1)} style={action}>새로고침</button>
    </div>
    <details style={{ margin: '12px 0', color: C.admin.muted }}>
      <summary style={{ cursor: 'pointer', padding: '10px 0', fontSize: 13 }}>내 방문 집계 제외 설정</summary>
      <TrafficPreference />
    </details>
    {loading ? <p role="status">통계를 불러오는 중…</p> : error ? <p role="alert">{error}</p> : data && <>
      <p style={muted}>{data.from} ~ {data.to} · 한국시간 · {data.to === koreaDay() ? '오늘 수치는 진행 중입니다.' : '일별 방문자 합계'}</p>
      {data.detailCoverage?.complete === false && <p style={{ ...muted, fontSize: 12 }}>선택 기간에 30일 보관 기한이 지난 상세 기록이 있어 상담 입력 진입은 —로 표시합니다. {data.detailCoverage.from ? `단계별·세부 통계는 ${data.detailCoverage.from} ~ ${data.detailCoverage.to}의 보관 기록만 표시합니다.` : '이 기간의 단계별·세부 기록은 보관되어 있지 않습니다.'} 방문·신청 건수와 전환율은 선택 기간 전체 기준입니다.</p>}
      {data.from <= koreaDay(new Date(data.startedAt)) && <p style={muted}>선택 기간에 집계 시작 전 또는 일부 시간만 집계된 날짜가 포함됩니다.</p>}
      {view === 'overview' ? <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: 10 }}>
          {[
            ['출처 확인 불가', directVisitors + '명'],
            ['외부 유입', attributed.visitors + '명'],
            ['상담 입력 진입', contactVisitors === null ? '—' : contactVisitors + '명'],
            ['무료 견적 신청', totals.requests + '건'],
            ['신청 전환율', rate === null ? '—' : rate + '%'],
          ].map(([label, value], index) => <div key={label} style={{ padding: 18, background: index === 1 || index === 3 ? C.admin.accentBg : C.admin.bg, borderTop: `3px solid ${index === 1 || index === 3 ? `var(--admin-metric-accent-edge, ${C.primary})` : `var(--admin-metric-edge, ${C.admin.line})`}`, borderRadius: 10 }}>
            <div style={{ ...muted, fontSize: 12 }}>{label}</div><strong style={{ display: 'block', fontSize: 28, fontWeight: 750, color: C.admin.text, marginTop: 12, fontVariantNumeric: 'tabular-nums' }}>{value}</strong>
          </div>)}
        </div>
        <p style={{ ...muted, fontSize: 12 }}>전체 방문 {totals.visitors}명 · 출처 확인 불가에는 직접 접속, 출처가 전달되지 않은 방문과 미분류 기록이 포함됩니다. 외부 유입은 검색·외부 링크·캠페인 등 출처가 기록된 방문입니다. 여러 날짜를 선택하면 일별 방문자 합계로 표시됩니다.</p>
        <p style={{ ...muted, fontSize: 12 }}>전환율: 출처 있는 유효한 신청 완료 방문 {attributed.converted} ÷ 출처 있는 방문 {attributed.visitors}. 삭제된 상담은 전환에서 제외하며 같은 브라우저의 하루 신청은 1명으로 집계합니다. 직접 방문·출처 확인 불가·미분류는 분자와 분모에서 모두 제외합니다. 전체 기준 전환율: {conversionRate(totals.converted, totals.visitors) === null ? '—' : `${conversionRate(totals.converted, totals.visitors)}%`}. 방문·신청 건수는 전체 기준이며, 이 제외 기준은 봇 판정이 아닙니다.</p>
        {data.detailCoverage?.complete === false && !data.detailCoverage.from ? null : <AdminFlowChart details={data.details} />}
        <p style={{ ...muted, fontSize: 12 }}>상담 입력 진입은 마지막 연락처 입력 페이지 도착 기준입니다. 전화번호 입력·신청 완료 여부와 무관하며, 같은 브라우저는 하루 1회 집계합니다. 최근 30일의 수집된 단계 기록을 사용하며, 수집 제외·중단 기간은 포함되지 않습니다.</p>
        <details style={{ marginTop: 20 }}><summary style={{ fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: '12px 0' }}>일별 수치 자세히 보기</summary>
        <div style={{ overflowX: 'auto' }}><table style={table}>
          <thead><tr>{['날짜', '방문자', '상담 방문 (모든 단계)', '신청 건수', '전체 기준 전환율'].map(t => <th key={t} style={cell}>{t}</th>)}</tr></thead>
          <tbody>{days.map(d => <tr key={d.day}>
            <th scope="row" style={cell}>{d.day}</th><td style={cell}>{d.day < koreaDay(new Date(data.startedAt)) ? '수집 전' : d.visitors}</td>
            <td style={cell}>{d.consult_starts}</td><td style={cell}>{d.requests}</td><td style={cell}>{conversionRate(d.converted, d.visitors) ?? '—'}{d.visitors > 0 ? '%' : ''}</td>
          </tr>)}</tbody>
        </table></div></details>
      </> : <>
        <nav aria-label="트래픽 세부 카테고리" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '16px 0' }}>
          {DETAIL_TABS.map(t => <button key={t.id} aria-pressed={detailTab === t.id} onClick={() => setDetailTab(t.id)} style={detailTab === t.id ? goldAction : action}>{t.title}</button>)}
        </nav>
        {detailTab === 'sources' ? <>
        <h3>어디서 들어왔나요?</h3>
        <p style={muted}>브라우저별 하루 첫 유입 기준입니다. 출처를 전달하지 않는 앱·브라우저는 직접 / 출처 없음으로 표시될 수 있습니다.</p>
        <div style={{ overflowX: 'auto' }}><table style={table}>
          <thead><tr>{['유입처 / 매체', '캠페인', '방문', '상담 방문 (모든 단계)', '신청 완료 방문', '전환율'].map(t => <th key={t} style={cell}>{t}</th>)}</tr></thead>
          <tbody>{data.sources.map((s, i) => <tr key={i}>
            <td style={cell}>{s.source ? SOURCE_LABELS[s.source] || s.source : '수집 전·미분류'}<br /><small style={muted}>{s.medium || '—'}</small></td>
            <td style={{ ...cell, overflowWrap: 'anywhere' }}>{s.campaign || '—'}</td><td style={cell}>{s.visitors}</td><td style={cell}>{s.starts}</td><td style={cell}>{s.converted}</td>
            <td style={cell}>{conversionRate(s.converted, s.visitors) ?? '—'}{s.visitors ? '%' : ''}</td>
          </tr>)}</tbody>
        </table></div>
        {data.sources.length === 0 && <p>선택 기간에 방문 기록이 없습니다.</p>}
        <h3>처음 방문한 페이지</h3>
        <div style={{ overflowX: 'auto' }}><table style={table}>
          <thead><tr>{['첫 페이지', '방문', '신청 완료 방문'].map(t => <th key={t} style={cell}>{t}</th>)}</tr></thead>
          <tbody>{data.landings.map((l, i) => <tr key={i}><td style={cell}>{l.landing || '수집 전·미분류'}</td><td style={cell}>{l.visitors}</td><td style={cell}>{l.converted}</td></tr>)}</tbody>
        </table></div>
        <p style={muted}>홍보 링크에 utm_source, utm_medium, utm_campaign을 붙이면 캠페인별로 나뉩니다. 영문자로 시작하는 영문·숫자·밑줄·하이픈 64자 이내 식별자를 사용하세요. 이름·전화번호 등 개인정보를 넣지 마세요.<br />
          유입 경로 수집 시작: {new Date(data.attributionStartedAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}. 이전 유입처는 복원할 수 없습니다.</p>
        </> : data.details ? <AdminTrafficDetails data={data.details} tab={detailTab} onSaved={() => setRetry(v => v + 1)} /> : <p role="alert">상세 통계 설정을 불러오지 못했어요. 새로고침해주세요.</p>}
      </>}
      <details style={{ ...muted, marginTop: 16, fontSize: 11 }}><summary style={{ cursor: 'pointer' }}>집계 기준 및 마지막 갱신</summary><p>방문자는 브라우저별 하루 1회입니다. 여러 날의 합계는 기간 전체 순방문자가 아닙니다.
        신청 전환율은 현재 저장된 상담으로 이어진 일별 신청 완료 방문 ÷ 일별 방문의 합계입니다. 삭제된 상담만 남은 방문은 전환에서 제외됩니다. 쿠키 없는 신청·집계 제외 방문의 신청도 접수 건수에는 포함됩니다.
        관리자 로그인 중 방문, 방문 제외 설정, 알려진 봇, 추적 거부 설정은 제외합니다. 브라우저·기기를 바꾸면 별도 집계될 수 있습니다.<br />
        마지막 갱신: {new Date(data.updatedAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</p></details>
    </>}
  </section>;
}
