"use client";
import { Fragment, useEffect, useState, type CSSProperties } from 'react';
import { IconChevronDown, IconCopy, IconExternalLink } from '@tabler/icons-react';
import { C } from './EstimateLayout';
import { action, goldAction, muted, panel, field } from './adminStyles';
import { groupReferralRows, REFERRAL_RATE_LABELS, type ReferralReport } from '@/lib/referralSites';

const cell: CSSProperties = { padding: '10px 12px', borderTop: `1px solid ${C.admin.line}`, verticalAlign: 'middle' };
const metricCell: CSSProperties = { ...cell, textAlign: 'right', fontVariantNumeric: 'tabular-nums' };
const columns = ['사이트', '사이트 방문', '폼잇 유입', '연락처 도착', '신청 완료 방문', '유입 비율', '상세'];

export default function AdminReferralSites({ refresh }: { refresh: number }) {
  const [range, setRange] = useState('7'), [retry, setRetry] = useState(0);
  const requestKey = `${range}:${retry}:${refresh}`;
  const [result, setResult] = useState<{ key: string; report: ReferralReport | null; error: string } | null>(null);
  const [copied, setCopied] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
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
    <p style={muted}>폼잇 유입 비율 = 해당 사이트에서 온 폼잇 유입자 ÷ 해당 사이트 방문자 × 100</p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '16px 0' }}>
      {[['today', '오늘'], ['yesterday', '어제'], ['7', '최근 7일'], ['30', '최근 30일']].map(([id, label]) => <button key={id} style={range === id ? goldAction : action} aria-pressed={range === id} onClick={() => setRange(id)}>{label}</button>)}
      <button style={action} disabled={loading} onClick={() => setRetry(v => v + 1)}>새로고침</button>
    </div>
    {loading && <p role="status" style={muted}>사이트별 집계를 확인하는 중…</p>}
    {error && <p role="alert">{error}</p>}
    {report && <>
      <p style={muted}>{report.from} ~ {report.to} · 한국시간 · 일별 방문자 합계</p>
      <p style={{ ...muted, fontSize: 12 }}>마지막 조회 {dateTime(report.updatedAt)} · 누락된 날짜가 있으면 수집된 날짜의 합계를 표시합니다.</p>
      <div role="region" aria-label="사이트별 유입 요약" tabIndex={0} style={{ maxWidth: '100%', overflowX: 'auto', border: `1px solid ${C.admin.line}`, borderRadius: 12 }}>
        <table style={{ width: '100%', minWidth: 780, borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
          <thead><tr>{columns.map((label, i) => <th key={label} scope="col" style={{ padding: '11px 12px', textAlign: i === 0 ? 'left' : 'right', whiteSpace: 'nowrap', fontSize: 11, fontWeight: 600, color: C.admin.muted, background: i === 2 || i === 4 ? C.admin.accentBg : C.admin.bg, ...(i === 0 ? { minWidth: 230 } : {}) }}>{label}</th>)}</tr></thead>
          {groupReferralRows(report.rows).map(group => <tbody key={group.id} aria-label={group.name}>
            {group.id !== 'interiorfree' && <tr><th scope="rowgroup" colSpan={columns.length} style={{ ...cell, padding: '7px 12px', background: C.admin.bg, color: C.admin.muted, fontSize: 11, fontWeight: 600, textAlign: 'left' }}>{group.name} <span style={{ marginLeft: 4, fontWeight: 400 }}>{group.rows.length}곳</span></th></tr>}
            {group.rows.map(row => <Fragment key={row.source}>
              <tr aria-label={row.name}>
                <th scope="row" style={{ ...cell, textAlign: 'left', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
                    <a href={'https://' + row.host} title={row.host} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: C.admin.text, textDecoration: 'none' }}>{row.name}<IconExternalLink size={12} style={{ color: C.admin.muted }} /></a>
                    <span style={{ ...muted, fontSize: 10, fontWeight: 400, borderRadius: 20, background: row.external.status === 'ready' ? C.admin.accentBg : C.admin.bg, padding: '2px 6px' }}>{({ ready: '연결됨', pending: '연결 대기', error: '연결 확인 필요', partial: '부분 집계' })[row.external.status]}</span>
                  </div>
                </th>
                {[{ value: row.external.visitors ?? row.external.recordedVisitors, days: row.external.visitors === null ? row.external.visitorDays : 0 },
                  { value: row.arrivals, days: 0 }, { value: row.contacts, days: 0 }, { value: row.converted, days: 0 }].map(({ value, days }, i) => <td key={i} style={{ ...metricCell, ...(i === 1 || i === 3 ? { background: C.admin.accentBg } : {}) }}>
                    <strong style={{ fontSize: 16, whiteSpace: 'nowrap' }}>{number(value)}</strong>
                    {days > 0 && <span style={{ ...muted, display: 'block', whiteSpace: 'nowrap', fontSize: 10, lineHeight: 1.4 }}>부분 · {days}/{row.external.totalDays}일</span>}
                  </td>)}
                <td style={metricCell} title={row.rate === null ? REFERRAL_RATE_LABELS[row.rateBasis.state] : `폼잇 유입 ${number(row.rateBasis.arrivals)} ÷ 사이트 방문 ${number(row.rateBasis.visitors)} × 100 · 같은 ${row.rateBasis.days}/${row.rateBasis.totalDays}일 기준`}>
                  <strong style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{row.rate === null ? REFERRAL_RATE_LABELS[row.rateBasis.state] : row.rate + '%'}</strong>
                  {row.rate !== null && row.rateBasis.state === 'provisional' && <span style={{ ...muted, display: 'block', fontSize: 10, lineHeight: 1.4, whiteSpace: 'nowrap' }}>{row.rateBasis.days < row.rateBasis.totalDays ? `잠정 · ${row.rateBasis.days}/${row.rateBasis.totalDays}일` : '집계 중'}</span>}
                </td>
                <td style={{ ...cell, textAlign: 'right' }}><button type="button" aria-label={row.name + ' 상세·홍보 링크'} aria-expanded={expanded === row.source} aria-controls={'referral-detail-' + row.source} onClick={() => setExpanded(current => current === row.source ? null : row.source)} style={{ ...action, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 34, minWidth: 34, padding: 6, borderRadius: 8 }}><IconChevronDown size={16} aria-hidden="true" style={{ transform: expanded === row.source ? 'rotate(180deg)' : 'none' }} /></button></td>
              </tr>
              {expanded === row.source && <tr id={'referral-detail-' + row.source}><td colSpan={columns.length} style={{ ...cell, padding: '14px 16px' }}>
                <div style={{ maxWidth: 720 }}>
                  <p style={{ ...muted, margin: '0 0 6px' }}>{row.host}</p>
                  <p style={{ ...muted, fontSize: 12, margin: '4px 0' }}>
                    {row.rate !== null ? `같은 ${row.rateBasis.days}/${row.rateBasis.totalDays}일 기준: 폼잇 유입 ${number(row.rateBasis.arrivals)} ÷ 사이트 방문 ${number(row.rateBasis.visitors)} × 100 = ${row.rate}%` : ({
                      ready: '', provisional: '', no_visitors: '집계된 사이트 방문이 0명이어서 비율을 계산하지 않습니다.', no_data: '비교할 사이트 방문 기록이 아직 없습니다.', not_connected: '사이트 통계 연결을 기다리는 중입니다.', unavailable: '비율 계산에 필요한 통계 조회를 확인해주세요.',
                    })[row.rateBasis.state]}
                  </p>
                  {row.rateBasis.state === 'provisional' && <p style={{ ...muted, fontSize: 12, margin: '4px 0' }}>집계 중인 수치 또는 방문 기록이 있는 같은 날짜만 비교한 잠정 비율입니다. 위 폼잇 유입 열은 선택 기간 전체 합계이므로 계산에 사용한 수치와 다를 수 있습니다.</p>}
                  {row.rate !== null && row.rate > 100 && <p style={{ ...muted, fontSize: 12 }}>100% 초과: 공유된 링크·집계 누락 등 비교 기준을 확인해주세요.</p>}
                  {row.external.status === 'partial' && <p style={{ ...muted, fontSize: 12, margin: '2px 0' }}>방문 기록 {row.external.visitorDays}/{row.external.totalDays}일 · 미수집 날짜를 0명으로 간주하지 않습니다.</p>}
                  {(row.external.status === 'pending' || row.external.status === 'error') && <p style={{ ...muted, fontSize: 12, margin: '2px 0' }}>사이트 통계를 확인할 수 없습니다. 폼잇 유입은 별도 표시합니다.</p>}
                  {row.external.updatedAt && <p style={{ ...muted, fontSize: 11, margin: '4px 0' }}>사이트 통계 갱신 {dateTime(row.external.updatedAt)}</p>}
                  <label style={{ ...muted, display: 'block', marginTop: 10 }} htmlFor={'link-' + row.source}>이 사이트에 사용할 폼잇 링크</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                    <input id={'link-' + row.source} readOnly value={row.link} style={{ ...field, flex: '1 1 260px', width: '100%' }} onFocus={e => e.currentTarget.select()} />
                    <button style={action} onClick={async () => { try { await navigator.clipboard.writeText(row.link); setCopied(row.source); } catch { setCopied('failed'); } }}><IconCopy size={15} /> 링크 복사</button>
                  </div>
                  {copied === row.source && <p role="status" style={muted}>링크를 복사했어요.</p>}
                </div>
              </td></tr>}
            </Fragment>)}
          </tbody>)}
        </table>
      </div>
      <p style={{ ...muted, fontSize: 11, marginTop: 8 }}>좁은 화면에서는 표를 좌우로 밀어 볼 수 있어요. 행 끝의 화살표를 누르면 집계 상세와 홍보 링크가 열립니다.</p>
    </>}
    {copied === 'failed' && <p role="status">주소를 선택해서 직접 복사해주세요.</p>}
    <details style={{ marginTop: 16 }}>
      <summary style={{ ...muted, fontSize: 12, cursor: 'pointer', width: 'fit-content' }}>집계 기준 안내</summary>
      <p style={muted}>유입 비율은 해당 사이트의 방문자 대비 폼잇 유입자 비율입니다. 방문 기록이 있는 같은 날짜끼리 비교하며 집계 중이거나 날짜가 빠진 경우 잠정 비율로 표시합니다. 방문 0명·데이터 부족·조회 오류는 비율과 구분합니다. 각 단계는 동일인을 이어서 추적한 수치가 아닌, 사이트별 일별 브라우저 집계의 비교입니다. 폼잇은 하루 첫 유입처 기준이며, 다른 곳에 공유한 링크·추적 차단·관리자 제외로 차이가 날 수 있습니다. 연락처 도착은 최근 30일의 수집된 상세 기록 기준입니다. 신청 완료 방문은 실제 신청 건수와 다를 수 있습니다.</p>
    </details>
  </section>;
}
