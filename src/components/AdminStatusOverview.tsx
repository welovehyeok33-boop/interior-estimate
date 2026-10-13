"use client";

import { DETAIL_ESTIMATE_ENABLED } from "@/lib/features";
import { C } from './EstimateLayout';
import { CONSULT_EDIT_STATUS_OPTIONS } from '@/lib/adminCrm';
import { consultStatusStyle } from './adminStyles';

export type StatusCount = { status: string; count: number };
export default function AdminStatusOverview({ consultation, engine, loading, error, onOpen }: {
  consultation: StatusCount[]; engine: StatusCount[]; loading: boolean; error: string | null;
  onOpen: (flow: 'consult' | 'engine', status: string) => void;
}) {
  const groups = [
    { id: 'consult' as const, number: '01', title: '무료견적 · 상담', description: '고객 문의와 상담 진행 현황', data: consultation, labels: Object.fromEntries(CONSULT_EDIT_STATUS_OPTIONS) },
    { id: 'engine' as const, number: '02', title: '상세견적', description: '견적엔진 신청과 계약 현황', data: engine, labels: { new: '신규', qualified: '판매가능', contracted: '계약' } as Record<string, string> },
  ];
  return <section aria-label="상담 및 상세견적 전체 현황" style={{ marginBottom: 32 }}>
    <div style={{ color: C.admin.text, marginBottom: 14, display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
      <h2 style={{ fontSize: 18, margin: 0 }}>신청 관리 현황</h2>
      <span style={{ fontSize: 12, color: C.admin.muted }}>전체 기간 · 현재 상태 / 위 방문 통계 기간과 별도</span>
    </div>
    <div aria-busy={loading} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 16 }}>
      {groups.filter(group => DETAIL_ESTIMATE_ENABLED || group.id !== "engine").map(group => <div key={group.id} style={{ background: C.admin.surface, border: `1px solid ${C.admin.line}`, borderRadius: 16, padding: 24, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div><span style={{ color: C.admin.muted, fontSize: 11 }}>{group.description}</span><h3 style={{ color: C.admin.text, fontSize: 18, margin: '8px 0 18px' }}>{group.title}</h3></div>
          <button onClick={() => onOpen(group.id, 'all')} style={{ background: C.admin.accentBg, color: C.admin.accentText, border: 0, borderRadius: 8, padding: '10px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap' }}>전체 보기 ↗</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '15px 18px', background: C.admin.accentBg, borderRadius: 10, marginBottom: 12, color: C.admin.text }}>
          <strong style={{ fontSize: 13 }}>전체 접수</strong><strong style={{ fontSize: 32 }}>{loading || error ? '—' : (group.data.find(s => s.status === 'all')?.count ?? 0).toLocaleString()}<span style={{ fontSize: 12, marginLeft: 6 }}>건</span></strong>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
          {Object.entries(group.labels).filter(([id]) => id !== 'contact_attempted' || group.data.some(s => s.status === id && s.count > 0)).map(([id, label]) => <button disabled={loading || !!error} onClick={() => onOpen(group.id, id)} key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '14px 12px', background: C.admin.bg, borderRadius: 8, border: 0, cursor: 'pointer', textAlign: 'left' }}>
            <span style={{ color: C.admin.muted, fontSize: 12 }}><span aria-hidden="true" style={{ display: 'inline-block', width: 5, height: 5, borderRadius: 5, marginRight: 7, background: consultStatusStyle(id).color }} />{label}</span>
            <strong style={{ color: C.admin.text, fontSize: 20 }}>{loading || error ? '—' : (group.data.find(s => s.status === id)?.count ?? 0).toLocaleString()}</strong>
          </button>)}
        </div>
      </div>)}
    </div>
    {error && <p role="alert" style={{ color: C.consultStatus.lost.color }}>현황을 불러오지 못했어요. 상단 새로고침을 눌러주세요.</p>}
  </section>;
}
