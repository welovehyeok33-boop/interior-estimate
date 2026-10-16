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
  return <section style={panel} aria-label="외부 유입처 관리" aria-busy={loading}>
    <h1 style={{ fontSize: 24, margin: '0 0 6px' }}>유입처 관리</h1>
    <p style={muted}>외부 사이트에서 폼잇 상담까지, 같은 기간의 흐름을 비교하세요.</p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '20px 0' }}>
      {[['today', '오늘'], ['yesterday', '어제'], ['7', '최근 7일'], ['30', '최근 30일']].map(([id, label]) => <button key={id} style={range === id ? goldAction : action} aria-pressed={range === id} onClick={() => setRange(id)}>{label}</button>)}
      <button style={action} disabled={loading} onClick={() => setRetry(v => v + 1)}>새로고침</button>
    </div>
    {loading && <p role="status" style={muted}>사이트별 집계를 확인하는 중…</p>}
    {error && <p role="alert">{error}</p>}
    {report && <>
      <p style={muted}>{report.from} ~ {report.to} · 한국시간 · 일별 방문자 합계</p>
      <div style={{ display: 'grid', gap: 18 }}>
        {report.rows.map(row => <article key={row.source} style={{ border: `1px solid ${C.admin.line}`, borderRadius: 14, padding: 20, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><h2 style={{ margin: 0, fontSize: 18 }}>{row.name}</h2><a href={'https://' + row.host} target="_blank" rel="noopener noreferrer" style={{ ...muted, textDecoration: 'none' }}>{row.host} <IconExternalLink size={13} /></a></div>
            <span style={{ ...muted, background: row.external.status === 'ready' ? C.admin.accentBg : C.admin.bg, borderRadius: 20, padding: '5px 12px' }}>{({ ready: '통계 연결됨', pending: '연결 대기', error: '연결 확인 필요', partial: '부분 집계' })[row.external.status]}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: 10, margin: '18px 0' }}>
            {[['사이트 방문', row.external.visitors], ['폼잇 유입', row.arrivals], ['연락처 페이지 도착', row.contacts], ['신청 완료 방문', row.converted]].map(([label, value], i) => <div key={String(label)} style={{ background: i === 1 || i === 3 ? C.admin.accentBg : C.admin.bg, borderRadius: 10, padding: 16 }}>
              <div style={muted}>{label}</div><strong style={{ fontSize: 26, display: 'block', marginTop: 8 }}>{number(value as number | null)}</strong>
            </div>)}
          </div>
          <p style={muted}>폼잇 유입 비율 <strong style={{ color: C.admin.text }}>{row.rate === null ? '계산 대기' : row.rate + '%'}</strong> · 폼잇 버튼 클릭 {number(row.external.clickers)}{row.rate !== null && row.rate > 100 ? ' · 100% 초과: 공유된 링크·집계 누락 등 비교 기준을 확인해주세요.' : ''}</p>
          {row.external.status !== 'ready' && <p style={muted}>사이트 방문 합계가 완전하지 않아 유입 비율을 계산하지 않습니다. 폼잇에서 확인된 유입은 별도로 표시됩니다.</p>}
          <label style={{ ...muted, display: 'block' }} htmlFor={'link-' + row.source}>이 사이트에 사용할 폼잇 링크</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
            <input id={'link-' + row.source} readOnly value={row.link} style={{ ...field, flex: '1 1 260px', width: '100%' }} onFocus={e => e.currentTarget.select()} />
            <button style={action} onClick={async () => { try { await navigator.clipboard.writeText(row.link); setCopied(row.source); } catch { setCopied('failed'); } }}><IconCopy size={15} /> 링크 복사</button>
          </div>
          {copied === row.source && <p role="status" style={muted}>링크를 복사했어요.</p>}
        </article>)}
      </div>
    </>}
    {copied === 'failed' && <p role="status">주소를 선택해서 직접 복사해주세요.</p>}
    <p style={{ ...muted, marginTop: 24 }}>각 단계는 동일인을 이어서 추적한 수치가 아닌, 사이트별 일별 브라우저 집계의 비교입니다. 폼잇은 하루 첫 유입처 기준이며, 다른 곳에 공유한 링크·추적 차단·관리자 제외로 차이가 날 수 있습니다. 연락처 도착은 최근 30일의 수집된 상세 기록 기준입니다. 신청 완료 방문은 실제 신청 건수와 다를 수 있습니다.</p>
  </section>;
}
