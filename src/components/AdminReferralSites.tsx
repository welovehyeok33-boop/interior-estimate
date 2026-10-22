"use client";
import { useEffect, useState } from 'react';
import { IconCopy, IconExternalLink } from '@tabler/icons-react';
import { C } from './EstimateLayout';
import { action, goldAction, muted, panel, field } from './adminStyles';
import type { ReferralReport } from '@/lib/referralSites';

export default function AdminReferralSites({ refresh }: { refresh: number }) {
  const [range, setRange] = useState('7'), [retry, setRetry] = useState(0);
  const requestKey = `${range}:${retry}:${refresh}`;
  const [result, setResult] = useState<{ key: string; report: ReferralReport | null; error: string } | null>(null);
  const [copied, setCopied] = useState('');
  const loading = result?.key !== requestKey;
  const report = loading ? null : result?.report;
  const error = loading ? '' : result?.error;
  useEffect(() => {
    const controller = new AbortController();
    void fetch('/api/admin/referrals?range=' + range, { signal: controller.signal, cache: 'no-store' }).then(async r => {
      const data = await r.json(); if (!r.ok) throw new Error(data.error || '조회 실패');
      if (!controller.signal.aborted) setResult({ key: requestKey, report: data, error: '' });
    }).catch(e => { if (!controller.signal.aborted) setResult({ key: requestKey, report: null, error: e instanceof Error ? e.message : '조회 실패' }); });
    return () => controller.abort();
  }, [range, requestKey]);
  const number = (value: number | null) => value === null ? '—' : value.toLocaleString() + '명';
  const dateTime = (value: string) => new Date(value).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', hour12: false });
  return <section style={panel} aria-label="외부 유입처 관리" aria-busy={loading}>
    <h1 style={{ fontSize: 24, margin: '0 0 6px' }}>유입처 관리</h1>
    <p style={muted}>외부 사이트에서 폼잇 상담까지, 같은 기간의 흐름을 비교하세요.</p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '16px 0' }}>
      {[['today', '오늘'], ['yesterday', '어제'], ['7', '최근 7일'], ['30', '최근 30일']].map(([id, label]) => <button key={id} style={range === id ? goldAction : action} aria-pressed={range === id} onClick={() => setRange(id)}>{label}</button>)}
      <button style={action} disabled={loading} onClick={() => setRetry(v => v + 1)}>새로고침</button>
    </div>
    {loading && <p role="status" style={muted}>사이트별 집계를 확인하는 중…</p>}
    {error && <p role="alert">{error}</p>}
    {report && <>
      <p style={muted}>{report.from} ~ {report.to} · 한국시간 · 일별 방문자 합계</p>
      <p style={{ ...muted, fontSize: 12 }}>마지막 조회 {dateTime(report.updatedAt)} · 누락된 날짜가 있으면 수집된 날짜의 합계를 표시합니다.</p>
      <div aria-label="사이트별 유입 요약" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', alignItems: 'start', gap: 10 }}>
        {report.rows.map(row => <article aria-label={row.name} key={row.source} style={{ border: `1px solid ${C.admin.line}`, borderRadius: 12, padding: 12, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ minWidth: 0 }}><h2 style={{ margin: 0, fontSize: 15, lineHeight: 1.4 }}>{row.name}</h2><a href={'https://' + row.host} target="_blank" rel="noopener noreferrer" style={{ ...muted, fontSize: 11, textDecoration: 'none', overflowWrap: 'anywhere' }}>{row.host} <IconExternalLink size={11} /></a></div>
            <span style={{ ...muted, flexShrink: 0, fontSize: 11, background: row.external.status === 'ready' ? C.admin.accentBg : C.admin.bg, borderRadius: 20, padding: '3px 8px' }}>{({ ready: '통계 연결됨', pending: '연결 대기', error: '연결 확인 필요', partial: '부분 집계' })[row.external.status]}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 5, margin: '10px 0 8px' }}>
            {[{ label: '사이트 방문', value: row.external.visitors ?? row.external.recordedVisitors, note: row.external.visitors === null && row.external.visitorDays > 0 ? `부분 합계 · ${row.external.visitorDays}/${row.external.totalDays}일` : '' },
              { label: '폼잇 유입', value: row.arrivals, note: '' }, { label: '연락처 도착', value: row.contacts, note: '' }, { label: '신청 완료 방문', value: row.converted, note: '' }].map(({ label, value, note }, i) => <div key={label} style={{ minWidth: 0, background: i === 1 || i === 3 ? C.admin.accentBg : C.admin.bg, borderRadius: 7, padding: '7px 8px' }}>
              <div style={{ ...muted, fontSize: 11, lineHeight: '15px', minHeight: 30 }}>{label}</div><strong style={{ fontSize: 20, lineHeight: 1.3, display: 'block', fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere' }}>{number(value)}</strong>
              {note && <span style={{ ...muted, display: 'block', fontSize: 10, lineHeight: 1.5, marginTop: 3 }}>{note}</span>}
            </div>)}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '2px 10px', ...muted, fontSize: 11 }}>
            <span>유입 비율 <strong style={{ color: C.admin.text }}>{row.rate === null ? '계산 대기' : row.rate + '%'}</strong></span>
            <span>버튼 클릭 {number(row.external.clickers ?? row.external.recordedClickers)}{row.external.clickers === null && row.external.clickerDays > 0 ? ' · 부분 합계' : ''}</span>
          </div>
          <details style={{ marginTop: 6, borderTop: `1px solid ${C.admin.line}`, paddingTop: 4 }}>
          <summary style={{ ...muted, fontSize: 11, cursor: 'pointer', width: 'fit-content', padding: '3px 0' }}>집계 상세 · 홍보 링크</summary>
          {row.rate !== null && row.rate > 100 && <p style={{ ...muted, fontSize: 12 }}>100% 초과: 공유된 링크·집계 누락 등 비교 기준을 확인해주세요.</p>}
          {row.external.status === 'partial' && <p style={{ ...muted, fontSize: 12, margin: '2px 0' }}>방문 기록 {row.external.visitorDays}/{row.external.totalDays}일 · 클릭 기록 {row.external.clickerDays}/{row.external.totalDays}일 · 미수집 날짜나 집계 진행 중인 기간이 있어 비율은 계산하지 않습니다.</p>}
          {(row.external.status === 'pending' || row.external.status === 'error') && <p style={{ ...muted, fontSize: 12, margin: '2px 0' }}>사이트 통계를 확인할 수 없습니다. 폼잇 유입은 별도 표시합니다.</p>}
          {row.external.updatedAt && <p style={{ ...muted, fontSize: 11, margin: '4px 0' }}>사이트 통계 갱신 {dateTime(row.external.updatedAt)}</p>}
          <label style={{ ...muted, display: 'block' }} htmlFor={'link-' + row.source}>이 사이트에 사용할 폼잇 링크</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
            <input id={'link-' + row.source} readOnly value={row.link} style={{ ...field, flex: '1 1 260px', width: '100%' }} onFocus={e => e.currentTarget.select()} />
            <button style={action} onClick={async () => { try { await navigator.clipboard.writeText(row.link); setCopied(row.source); } catch { setCopied('failed'); } }}><IconCopy size={15} /> 링크 복사</button>
          </div>
          {copied === row.source && <p role="status" style={muted}>링크를 복사했어요.</p>}
          </details>
        </article>)}
      </div>
    </>}
    {copied === 'failed' && <p role="status">주소를 선택해서 직접 복사해주세요.</p>}
    <details style={{ marginTop: 16 }}>
      <summary style={{ ...muted, fontSize: 12, cursor: 'pointer', width: 'fit-content' }}>집계 기준 안내</summary>
      <p style={muted}>각 단계는 동일인을 이어서 추적한 수치가 아닌, 사이트별 일별 브라우저 집계의 비교입니다. 폼잇은 하루 첫 유입처 기준이며, 다른 곳에 공유한 링크·추적 차단·관리자 제외로 차이가 날 수 있습니다. 연락처 도착은 최근 30일의 수집된 상세 기록 기준입니다. 신청 완료 방문은 실제 신청 건수와 다를 수 있습니다.</p>
    </details>
  </section>;
}
