"use client";

import Link from 'next/link';
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import type { ResidentialGuideBody } from '@/data/residentialGuideDetails';
import { RESIDENTIAL_SOURCES, residentialGuidePath, type ResidentialGuide } from '@/lib/residentialChecklist';
import { GuideShell } from './GuideViews';
import { C } from './EstimateLayout';

export default function ResidentialGuideDetail({ guide, content }: { guide: ResidentialGuide; content: ResidentialGuideBody }) {
  const back = '/blog/residential#residential-' + guide.stageId;
  return <GuideShell>
    <article style={{ maxWidth: 700, margin: '0 auto' }}>
      <Link href={back} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, marginBottom: 24, color: C.textMid, fontSize: 13, textDecoration: 'none' }}><IconArrowLeft size={16} aria-hidden="true" />줄자 가이드로 돌아가기</Link>
      <p style={{ color: C.textMid, fontSize: 12, lineHeight: 1.8, margin: '0 0 12px' }}>주거 인테리어 · STEP {String(guide.step).padStart(2, '0')}<br />{guide.stageTitle}</p>
      <h1 style={{ fontSize: 'clamp(26px, 5vw, 36px)', letterSpacing: '-0.04em', lineHeight: 1.5, margin: '0 0 18px' }}>{guide.title}</h1>
      <p style={{ color: C.textMid, fontSize: 16, lineHeight: 1.9, margin: '0 0 32px' }}>{guide.detail}</p>
      <section aria-label="준비 방법" style={{ borderTop: '1px solid ' + C.border, paddingTop: 26 }}>
        <h2 style={{ fontSize: 21, margin: '0 0 18px' }}>이렇게 준비해보세요</h2>
        <ol style={{ margin: 0, paddingLeft: 22, fontSize: 15, lineHeight: 2, color: C.textMid }}>{content.points.map(point => <li key={point} style={{ paddingLeft: 6, marginBottom: 14 }}>{point}</li>)}</ol>
      </section>
      <section aria-label="업체에 물어볼 질문 예시" style={{ padding: '24px', background: C.bg, border: '1px solid ' + C.border, borderRadius: 14, margin: '28px 0' }}>
        <h2 style={{ fontSize: 18, margin: '0 0 12px' }}>이렇게 물어보세요</h2>
        <p style={{ fontSize: 15, lineHeight: 1.9, margin: 0 }}>{content.question}</p>
      </section>
      <section aria-label="챙겨둘 자료">
        <h2 style={{ fontSize: 20, margin: '0 0 12px' }}>챙겨둘 자료</h2>
        <p style={{ color: C.textMid, lineHeight: 1.9, fontSize: 15, margin: 0 }}>{content.record}</p>
      </section>
      <nav aria-label="이전·다음 가이드" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))', gap: 12, marginTop: 36 }}>
        {guide.previous && <Link href={residentialGuidePath(guide.previous.id)} style={{ padding: 20, border: '1px solid ' + C.border, borderRadius: 12, color: C.textDark, textDecoration: 'none', minWidth: 0 }}><span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.textMid, marginBottom: 8 }}><IconArrowLeft size={15} aria-hidden="true" />이전 항목</span><strong style={{ fontSize: 14, lineHeight: 1.8 }}>{guide.previous.title}</strong></Link>}
        {guide.next && <Link href={residentialGuidePath(guide.next.id)} style={{ padding: 20, border: '1px solid ' + C.border, borderRadius: 12, color: C.textDark, textDecoration: 'none', minWidth: 0 }}><span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.textMid, marginBottom: 8 }}>다음 항목<IconArrowRight size={15} aria-hidden="true" /></span><strong style={{ fontSize: 14, lineHeight: 1.8 }}>{guide.next.title}</strong></Link>}
      </nav>
      <Link href={back} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, marginTop: 20, color: C.textDark, fontSize: 14, fontWeight: 650 }}>이 단계의 전체 항목 보기</Link>
      <details style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid ' + C.border, fontSize: 12, color: C.textMid, lineHeight: 1.9 }}>
        <summary style={{ cursor: 'pointer', minHeight: 32 }}>참고 자료와 이용 안내</summary>
        <p>일반적인 공사 준비를 위한 안내이며 개별 계약·법률·안전 판단을 대신하지 않아요. 공사 범위와 건물 조건에 맞는 사항은 업체·관리 주체·관련 전문가에게 확인하세요. 자료 확인: 2026-10-23.</p>
        <ul style={{ paddingLeft: 18 }}>{RESIDENTIAL_SOURCES.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" style={{ color: C.textMid }}>{source.title}</a></li>)}</ul>
        <p>참고 자료의 과거 단가·통계·법정 기간을 현재 기준으로 단정하지 않아요. 콘텐츠 검수 전에는 검색 노출 대상에서 제외합니다.</p>
      </details>
    </article>
  </GuideShell>;
}
