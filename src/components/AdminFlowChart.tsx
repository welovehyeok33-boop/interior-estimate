"use client";
import { DETAIL_ESTIMATE_ENABLED } from "@/lib/features";
import { C } from './EstimateLayout';
import { muted } from './adminStyles';
import type { TrafficDetails } from '@/lib/trafficDetails';

export default function AdminFlowChart({ details }: { details: TrafficDetails | undefined }) {
  const flows = [
    { title: '무료견적 · 상담', prefix: '/consult', labels: ['공간', '면적', '일정·예산', '연락처'] },
    { title: '상세견적', prefix: '/estimate/detail', labels: ['공간', '면적', '공사', '자재', '결과'] },
  ];
  return <section aria-label="견적별 단계 도달 현황" style={{ marginTop: 24 }}>
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'baseline' }}><h3 style={{ fontSize: 17, margin: 0 }}>방문부터 견적까지</h3><span style={muted}>선택 기간 · 일별 단계 도달 합계</span></div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 16, marginTop: 16 }}>
      {flows.filter(flow => DETAIL_ESTIMATE_ENABLED || flow.prefix !== "/estimate/detail").map((flow, group) => {
        const values = flow.labels.map((label, i) => ({ label, value: details?.pages.find(p => p.path === (i ? `${flow.prefix}/step${i + 1}` : flow.prefix))?.visitors ?? 0 }));
        const max = Math.max(1, ...values.map(v => v.value));
        return <div key={flow.prefix} style={{ padding: 18, minWidth: 0, boxSizing: 'border-box', borderRadius: 12, background: C.admin.bg }}>
          <h4 style={{ fontSize: 14, margin: '0 0 18px' }}>{flow.title}</h4>
          {!details ? <p style={muted}>단계별 데이터를 불러오지 못했어요.</p> : <div style={{ display: 'grid', gridTemplateColumns: `repeat(${values.length}, minmax(0, 1fr))`, gap: 8 }}>
            {values.map((v, i) => <div key={v.label} style={{ minWidth: 0 }}>
              <div style={{ ...muted, fontSize: 11, minHeight: 32 }}>{i + 1}. {v.label}</div>
              <div aria-hidden="true" style={{ height: 82, width: '100%', maxWidth: 48, background: C.admin.raised, borderRadius: 6, overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}><div style={{ width: '100%', height: `${v.value / max * 100}%`, background: group ? C.admin.chartAlt : C.primary, borderRadius: '5px 5px 0 0' }} /></div>
              <strong style={{ display: 'block', fontSize: 18, marginTop: 8 }}>{v.value.toLocaleString()}<span style={{ fontSize: 10, color: C.admin.muted, fontWeight: 400 }}>회</span></strong>
            </div>)}
          </div>}
        </div>;
      })}
    </div>
    <p style={{ ...muted, fontSize: 11 }}>순서를 추적한 이탈률이 아닌 단계별 도달 기록입니다. 뒤 단계가 더 많을 수 있습니다. 상세 기록은 최근 30일 보관되며 수집 제외·중단 시 기본 방문 집계와 다를 수 있습니다.</p>
  </section>;
}
