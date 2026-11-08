"use client";
import { DETAIL_ESTIMATE_ENABLED } from "@/lib/features";
import { C } from './EstimateLayout';
import { muted } from './adminStyles';
import { CONSULT_STAGE_PATHS, type TrafficDetails } from '@/lib/trafficDetails';

export default function AdminFlowChart({ details, requests }: { details: TrafficDetails | undefined; requests: number | null }) {
  const flows = [
    { title: '무료견적 · 상담', prefix: '/consult', labels: ['공간', '면적', '일정·예산', '연락처'] },
    { title: '상세견적', prefix: '/estimate/detail', labels: ['공간', '면적', '공사', '자재', '결과'] },
  ];
  return <section aria-label="견적별 단계 도달 현황" style={{ marginTop: 24 }}>
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'baseline' }}><h3 style={{ fontSize: 17, margin: 0 }}>방문부터 견적까지</h3><span style={muted}>선택 기간 · 단계 도달과 신청 건수</span></div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 16, marginTop: 16 }}>
      {flows.filter(flow => DETAIL_ESTIMATE_ENABLED || flow.prefix !== "/estimate/detail").map((flow, group) => {
        const isConsult = flow.prefix === '/consult';
        const values: { label: string; value: number | null; unit: '회' | '건' }[] = flow.labels.map((label, i) => ({ label,
          value: isConsult ? details?.consultStages?.[CONSULT_STAGE_PATHS[i]] ?? null
            : details ? details.pages.find(p => p.path === (i ? `${flow.prefix}/step${i + 1}` : flow.prefix))?.visitors ?? 0 : null, unit: '회' }));
        if (isConsult) values.push({ label: '무료 견적 신청', value: requests, unit: '건' });
        const max = Math.max(1, ...values.map(v => v.value ?? 0));
        return <div key={flow.prefix} style={{ padding: 18, minWidth: 0, boxSizing: 'border-box', borderRadius: 12, background: C.admin.bg }}>
          <h4 style={{ fontSize: 14, margin: '0 0 18px' }}>{flow.title}</h4>
          {(!details || (isConsult && !details.consultStages)) && <p style={muted}>단계별 도달 기록을 확인할 수 없어요. 신청 건수는 접수 기록 기준으로 표시합니다.</p>}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${values.length}, minmax(0, 1fr))`, gap: 8 }}>
            {values.map((v, i) => <div key={v.label} style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{ ...muted, fontSize: 11, minHeight: 32, lineHeight: 1.5, overflowWrap: 'anywhere' }}>{i + 1}. {v.label}</div>
              <div aria-hidden="true" style={{ height: 82, width: '100%', maxWidth: 48, marginTop: 'auto', flexShrink: 0, background: C.admin.raised, borderRadius: 6, overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}><div style={{ width: '100%', height: `${(v.value ?? 0) / max * 100}%`, background: group ? C.admin.chartAlt : C.primary, borderRadius: '5px 5px 0 0' }} /></div>
              <strong style={{ display: 'block', fontSize: 18, marginTop: 8, whiteSpace: 'nowrap' }}>{v.value === null ? '—' : <>{v.value.toLocaleString()}<span style={{ fontSize: 10, color: C.admin.muted, fontWeight: 400 }}>{v.unit}</span></>}</strong>
            </div>)}
          </div>
        </div>;
      })}
    </div>
    <p style={{ ...muted, fontSize: 11 }}>무료견적·상담의 1~4단계는 출처가 확인된 유입의 일별 도달 기록(회)이며, 5단계는 선택 기간의 전체 실제 접수 건수(건)입니다. 각 단계는 방문 순서와 관계없이 집계하며, 도달 기록은 최근 30일 보관됩니다.</p>
  </section>;
}
