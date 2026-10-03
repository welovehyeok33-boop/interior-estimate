"use client";
import { useEffect, useState } from 'react';
import { C } from './EstimateLayout';
import { conversionRate, koreaDay, type TrafficReport } from '@/lib/analytics';
import { SOURCE_LABELS } from '@/lib/attribution';
import { CONSULT_STATUSES } from '@/lib/adminCrm';
import { action, goldAction, muted, panel } from './adminStyles';
import TrafficPreference from './TrafficPreference';

export default function AdminTraffic({ refresh, view }: { refresh: number; view: 'overview' | 'sources' }) {
  const [range, setRange] = useState('7');
  const [data, setData] = useState<TrafficReport | null>(null);
  const [error, setError] = useState(''), [loading, setLoading] = useState(true), [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function read() {
      setLoading(true); setError('');
      try {
        const r = await fetch('/api/admin/analytics?range=' + range, { cache: 'no-store', signal: controller.signal });
        const body = await r.json();
        if (!r.ok) throw new Error(body.error || '통계 조회 실패');
        if (!controller.signal.aborted) setData(body);
      } catch (e) { if (!controller.signal.aborted) { setData(null); setError(e instanceof Error ? e.message : '조회 실패'); } }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void read(); return () => controller.abort();
  }, [range, refresh, retry]);
  const days = data?.days.filter(d => d.day >= data.from && d.day <= data.to) || [];
  const totals = days.reduce((a, d) => ({ visitors: a.visitors + d.visitors, requests: a.requests + d.requests,
    converted: a.converted + d.converted, starts: a.starts + d.consult_starts, engine: a.engine + d.engine_starts }),
    { visitors: 0, requests: 0, converted: 0, starts: 0, engine: 0 });
  const rate = conversionRate(totals.converted, totals.visitors);
  const cell = { padding: '12px 10px', borderBottom: `1px solid ${C.home.darkLine}`, textAlign: 'left' as const };
  const table = { width: '100%', minWidth: 520, borderCollapse: 'collapse' as const, fontSize: 13 };
  return <section aria-label="방문 및 신청 통계" aria-busy={loading} style={{ ...panel, marginBottom: 28 }}>
    <h2 style={{ margin: '0 0 8px', fontSize: 23 }}>{view === 'overview' ? '방문자 집계' : '유입 트래픽'}</h2>
    <p style={muted}>한국시간 기준 · 방문부터 상담 신청까지</p>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
      {[['today', '오늘'], ['yesterday', '어제'], ['7', '최근 7일'], ['30', '최근 30일']].map(([id, label]) =>
        <button key={id} aria-pressed={range === id} onClick={() => setRange(id)} style={range === id ? goldAction : action}>{label}</button>)}
      <button disabled={loading} onClick={() => setRetry(v => v + 1)} style={action}>새로고침</button>
    </div>
    <details style={{ margin: '16px 0', color: C.home.onDark }}>
      <summary style={{ cursor: 'pointer', padding: '10px 0', fontSize: 13 }}>내 방문 집계 제외 설정</summary>
      <TrafficPreference />
    </details>
    {loading ? <p role="status">통계를 불러오는 중…</p> : error ? <p role="alert">{error}</p> : data && <>
      <p style={muted}>{data.from} ~ {data.to} · 오늘 수치는 진행 중입니다.</p>
      {data.from <= koreaDay(new Date(data.startedAt)) && <p style={muted}>선택 기간에 집계 시작 전 또는 일부 시간만 집계된 날짜가 포함됩니다.</p>}
      {view === 'overview' ? <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
          {[
            [days.length > 1 ? '일별 방문자 합계' : '방문자', totals.visitors + '명'],
            ['무료 견적 신청', totals.requests + '건'], ['신청 전환율', rate === null ? '—' : rate + '%'],
            ['상담 입력 진입', totals.starts + '명'], ['상세견적 진입', totals.engine + '명'],
            ['신청 완료 방문', totals.converted + '명'],
          ].map(([label, value]) => <div key={label} style={{ padding: 16, background: C.headerFrom, borderRadius: 12 }}>
            <div style={muted}>{label}</div><strong style={{ display: 'block', fontSize: 28, color: C.primary, marginTop: 8 }}>{value}</strong>
          </div>)}
        </div>
        <h3>상담 현황 <small style={muted}>전체 기간</small></h3>
        <p>전체 접수 {data.totalRequests}건 · 신규 {data.pendingRequests}건 · 연락 예정 시간 경과 {data.dueRequests}건</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{data.statuses.map(s => <span key={s.status} style={{ ...action, cursor: 'default' }}>{CONSULT_STATUSES[s.status] || s.status} {s.count}</span>)}</div>
        <h3>일별 추이</h3>
        <div style={{ overflowX: 'auto' }}><table style={table}>
          <thead><tr>{['날짜', '방문자', '상담 진입', '신청 건수', '전환율'].map(t => <th key={t} style={cell}>{t}</th>)}</tr></thead>
          <tbody>{days.map(d => <tr key={d.day}>
            <th scope="row" style={cell}>{d.day}</th><td style={cell}>{d.day < koreaDay(new Date(data.startedAt)) ? '수집 전' : d.visitors}</td>
            <td style={cell}>{d.consult_starts}</td><td style={cell}>{d.requests}</td><td style={cell}>{conversionRate(d.converted, d.visitors) ?? '—'}{d.visitors > 0 ? '%' : ''}</td>
          </tr>)}</tbody>
        </table></div>
      </> : <>
        <h3>어디서 들어왔나요?</h3>
        <p style={muted}>브라우저별 하루 첫 유입 기준입니다. 출처를 전달하지 않는 앱·브라우저는 직접 / 출처 없음으로 표시될 수 있습니다.</p>
        <div style={{ overflowX: 'auto' }}><table style={table}>
          <thead><tr>{['유입처 / 매체', '캠페인', '방문', '상담 진입', '신청 완료 방문', '전환율'].map(t => <th key={t} style={cell}>{t}</th>)}</tr></thead>
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
      </>}
      <p style={{ ...muted, marginTop: 24 }}>방문자는 브라우저별 하루 1회입니다. 여러 날의 합계는 기간 전체 순방문자가 아닙니다.
        신청 전환율은 일별 신청 완료 방문 ÷ 일별 방문의 합계입니다. 쿠키 없는 신청·집계 제외 방문의 신청도 접수 건수에는 포함됩니다.
        관리자 로그인 중 방문, 방문 제외 설정, 알려진 봇, 추적 거부 설정은 제외합니다. 브라우저·기기를 바꾸면 별도 집계될 수 있습니다.<br />
        마지막 갱신: {new Date(data.updatedAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</p>
    </>}
  </section>;
}
