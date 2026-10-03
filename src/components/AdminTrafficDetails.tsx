"use client";
import { useState, type ReactNode } from 'react';
import { C } from './EstimateLayout';
import { action, goldAction, muted } from './adminStyles';
import { conversionRate } from '@/lib/analytics';
import { locationLabel, TRACKED_PAGES, type TrafficDetails, type TrafficSegment } from '@/lib/trafficDetails';
import { SOURCE_LABELS } from '@/lib/attribution';

export type DetailTab = 'sources' | 'regions' | 'devices' | 'flow' | 'recent' | 'settings';
export const DETAIL_TABS: { id: DetailTab; title: string }[] = [
  { id: 'sources', title: '유입처·성과' }, { id: 'regions', title: '지역' }, { id: 'devices', title: '접속 환경' },
  { id: 'flow', title: '방문 흐름' }, { id: 'recent', title: '최근 방문·IP' }, { id: 'settings', title: '수집 설정' },
];
function GridTable({ headings, rows }: { headings: string[]; rows: ReactNode[][] }) {
  const cell = { padding: '12px 10px', borderBottom: `1px solid ${C.home.darkLine}`, textAlign: 'left' as const, overflowWrap: 'anywhere' as const };
  return <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', minWidth: 460, borderCollapse: 'collapse', fontSize: 13 }}>
    <thead><tr>{headings.map(h => <th scope="col" key={h} style={cell}>{h}</th>)}</tr></thead>
    <tbody>{rows.map((row, i) => <tr key={i}>{row.map((v, j) => <td key={j} style={cell}>{v}</td>)}</tr>)}</tbody>
  </table>{rows.length === 0 && <p>선택 기간에 수집된 상세 기록이 없습니다.</p>}</div>;
}
function Segments({ title, rows }: { title: string; rows: TrafficSegment[] }) {
  return <><h3>{title}</h3><GridTable headings={['구분', '일별 방문 합계', '신청 완료 방문', '전환율']} rows={rows.map(r => [r.label, r.visitors, r.converted, `${conversionRate(r.converted, r.visitors) ?? 0}%`])} /></>;
}
function Settings({ data, onSaved }: { data: TrafficDetails; onSaved: () => void }) {
  const [enabled, setEnabled] = useState(data.enabled), [ip, setIp] = useState(data.ipEnabled);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function save() {
    setBusy(true); setError('');
    try {
      const r = await fetch('/api/admin/analytics', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled, ipEnabled: ip }) });
      const body = await r.json();
      if (!r.ok) throw new Error(body.error || '설정 저장 실패');
      onSaved();
    } catch (e) { setError(e instanceof Error ? e.message : '설정 저장 실패'); }
    finally { setBusy(false); }
  }
  return <><h3>전체 사이트 수집 설정</h3><fieldset disabled={busy} style={{ border: 0, padding: 0 }}>
    <label style={{ display: 'block', marginBottom: 16 }}><input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} /> 지역·접속 환경·방문 흐름 상세 수집</label>
    <label style={{ display: 'block', marginBottom: 16 }}><input type="checkbox" checked={ip} disabled={!enabled} onChange={e => setIp(e.target.checked)} /> 일부 가린 IP 수집·표시</label>
    <p style={muted}>원본 IP는 저장하지 않습니다. IPv4는 앞 두 구간, IPv6는 앞 세 구간만 남깁니다. IP 수집을 끄면 기존 IP도 화면에서 숨기며 이후 수집하지 않습니다. 다시 켜면 보관 중인 마스킹 값은 다시 표시됩니다.</p>
    <p style={muted}>상세 수집을 꺼도 기본 방문·유입처·신청 통계는 유지됩니다. 기존 상세 기록은 보존 기간 동안 조회 가능합니다. 개별 브라우저의 ‘내 방문 제외’와 추적 거부 설정이 우선 적용됩니다.</p>
    {error && <p role="alert">{error}</p>}
    <button type="button" style={goldAction} onClick={save}>{busy ? '저장 중…' : '수집 설정 저장'}</button>
  </fieldset></>;
}
export default function AdminTrafficDetails({ data, tab, onSaved }: { data: TrafficDetails; tab: DetailTab; onSaved: () => void }) {
  const [regionLevel, setRegionLevel] = useState('city');
  const regions = new Map<string, TrafficSegment>();
  for (const r of data.regions) {
    const label = locationLabel({ country: r.country, region: regionLevel === 'country' ? null : r.region, city: regionLevel === 'city' ? r.city : null });
    const v = regions.get(label) || { label, visitors: 0, converted: 0 };
    v.visitors += r.visitors; v.converted += r.converted; regions.set(label, v);
  }
  return <div>
    <p style={muted}>상세 수집 대상: 일별 방문 합계 {data.visitors} · 수집 시작 {new Date(data.startedAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}<br />
      과거 기록은 복원되지 않습니다. 상세 수집 중단·만료 등으로 기본 방문 통계보다 적을 수 있습니다. 최근 30일만 조회하며, 만료 상세 기록은 다음 수집·조회 시 정리합니다.</p>
    {!data.enabled && <p role="status">상세 수집이 꺼져 있습니다. 아래는 이미 수집된 기록입니다.</p>}
    {tab === 'regions' && <>
      <div style={{ display: 'flex', gap: 8 }}>{[['country','국가'],['region','시/도'],['city','도시']].map(([id,label]) => <button key={id} aria-pressed={regionLevel === id} onClick={() => setRegionLevel(id)} style={regionLevel === id ? goldAction : action}>{label}</button>)}</div>
      <p style={muted}>Vercel이 IP로 추정한 위치입니다. 고객이 신청서에 입력한 공사 지역과 다르며, VPN·이동통신망으로 부정확할 수 있습니다. 위치가 제공되지 않으면 ‘확인 불가’로 표시합니다.</p>
      <Segments title="지역별 방문·신청" rows={[...regions.values()].sort((a,b) => b.visitors-a.visitors)} />
    </>}
    {tab === 'devices' && <>
      <p style={muted}>요청의 브라우저 정보로 추정한 분류입니다. 앱 내 브라우저·일부 태블릿은 정확히 구분되지 않을 수 있습니다. 원본 User-Agent는 저장하지 않습니다.</p>
      <Segments title="기기별" rows={data.devices} /><Segments title="브라우저별" rows={data.browsers} /><Segments title="운영체제별" rows={data.systems} />
    </>}
    {tab === 'flow' && <>
      <h3>페이지·단계별 도달</h3>
      <p style={muted}>같은 브라우저가 같은 날 해당 단계를 방문했는지 집계합니다. 방문 순서를 강제한 퍼널이 아니므로 뒤 단계 숫자가 더 클 수 있고, 단계 간 차이를 정확한 이탈 인원으로 해석하면 안 됩니다. ‘신청 완료 방문’은 해당 페이지를 본 날 신청까지 완료한 방문입니다.</p>
      <GridTable headings={['페이지 / 단계','도달 방문','당일 신청 완료 방문']} rows={Object.entries(TRACKED_PAGES).map(([path,label]) => { const r = data.pages.find(p => p.path === path); return [label,r?.visitors || 0,r?.converted || 0]; })} />
      <p style={muted}>무료견적은 4단계에서 실제 신청 완료 여부를 집계합니다. 상세견적 5단계는 개발 중 결과 화면 진입이며, 신청 완료로 간주하지 않습니다.</p>
    </>}
    {tab === 'recent' && <>
      <h3>최근 방문 기록 · 최대 50건</h3>
      <p style={muted}>선택 기간 내 최근 수집 순입니다. 한 행은 브라우저별 하루 기록이며 사람이나 IP별 기록이 아닙니다. 새로운 페이지를 처음 수집할 때 시간이 갱신되고, 체류 시간이나 모든 클릭을 기록하지는 않습니다. 개인 이름·전화번호와 연결해 표시하지 않습니다.</p>
      <GridTable headings={['최근 수집 (한국시간)','IP (일부 가림)','추정 위치 / 환경','유입 / 신청','방문한 페이지 (첫 도달 순)']} rows={data.recent.map(r => [
        new Date(r.last_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }), r.ip_mask || (data.ipEnabled ? '확인 불가' : '수집·표시 꺼짐'),
        <span key="environment">{locationLabel(r)}<br />{r.device} · {r.browser} · {r.os}</span>,
        <span key="source">{r.source ? SOURCE_LABELS[r.source] || r.source : '미분류'}{r.campaign ? ` / ${r.campaign}` : ''}<br />{r.converted ? '신청 완료' : '신청 기록 없음'}</span>,
        r.pages.map(p => TRACKED_PAGES[p] || '기타').join(' → '),
      ])} />
    </>}
    {tab === 'settings' && <Settings data={data} onSaved={onSaved} />}
  </div>;
}
