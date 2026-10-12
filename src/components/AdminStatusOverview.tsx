"use client";

import { C } from './EstimateLayout';
import { CONSULT_STATUSES } from '@/lib/adminCrm';
import { consultStatusStyle } from './adminStyles';

export type StatusCount = { status: string; count: number };
export default function AdminStatusOverview({ consultation, engine, loading, error, onOpen }: {
  consultation: StatusCount[]; engine: StatusCount[]; loading: boolean; error: string | null;
  onOpen: (flow: 'consult' | 'engine') => void;
}) {
  const groups = [
    { id: 'consult' as const, number: '01', title: '무료견적 · 상담', description: '고객 문의와 상담 진행 현황', data: consultation, labels: CONSULT_STATUSES },
    { id: 'engine' as const, number: '02', title: '상세견적', description: '견적엔진 신청과 계약 현황', data: engine, labels: { new: '신규', qualified: '판매가능', contracted: '계약' } as Record<string, string> },
  ];
  return <section aria-label="상담 및 상세견적 전체 현황" style={{ marginBottom: 32 }}>
    <div style={{ background: C.primary, color: C.textDark, padding: '28px 26px', borderRadius: '18px 18px 0 0', display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
      <div><p style={{ fontSize: 12, fontWeight: 800, margin: '0 0 10px' }}>폼잇. 비즈니스 현황</p><h1 style={{ fontSize: 28, letterSpacing: '-0.04em', margin: 0 }}>들어온 견적, 한눈에.</h1></div>
      <span style={{ fontSize: 12, lineHeight: 1.6 }}>전체 기간 · 현재 상태 기준<br />상담과 상세견적을 따로 집계합니다.</span>
    </div>
    <div aria-busy={loading} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: 1, background: C.admin.line, border: `1px solid ${C.admin.line}`, borderTop: 0, borderRadius: '0 0 18px 18px', overflow: 'hidden' }}>
      {groups.map(group => <div key={group.id} style={{ background: C.admin.surface, padding: 24, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div><span style={{ color: C.primary, fontSize: 11, fontWeight: 800 }}>{group.number} / {group.description}</span><h2 style={{ color: C.admin.text, fontSize: 21, margin: '8px 0 18px' }}>{group.title}</h2></div>
          <button onClick={() => onOpen(group.id)} style={{ background: C.primary, color: C.textDark, border: 0, borderRadius: 8, padding: '10px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap' }}>목록 보기 →</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '15px 18px', background: C.admin.accentBg, border: `1px solid ${C.admin.line}`, borderRadius: 10, marginBottom: 12, color: C.primary }}>
          <strong style={{ fontSize: 13 }}>전체 접수</strong><strong style={{ fontSize: 32 }}>{loading || error ? '—' : (group.data.find(s => s.status === 'all')?.count ?? 0).toLocaleString()}<span style={{ fontSize: 12, marginLeft: 6 }}>건</span></strong>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
          {Object.entries(group.labels).filter(([id]) => id !== 'contact_attempted' || group.data.some(s => s.status === id && s.count > 0)).map(([id, label]) => <div key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '14px 12px', background: C.admin.bg, borderRadius: 8 }}>
            <span style={{ color: C.admin.muted, fontSize: 12 }}><span aria-hidden="true" style={{ display: 'inline-block', width: 5, height: 5, borderRadius: 5, marginRight: 7, background: consultStatusStyle(id).color }} />{label}</span>
            <strong style={{ color: C.admin.text, fontSize: 20 }}>{loading || error ? '—' : (group.data.find(s => s.status === id)?.count ?? 0).toLocaleString()}</strong>
          </div>)}
        </div>
      </div>)}
    </div>
    {error && <p role="alert" style={{ color: C.consultStatus.lost.color }}>현황을 불러오지 못했어요. 상단 새로고침을 눌러주세요.</p>}
  </section>;
}
