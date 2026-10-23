"use client";

import Link from 'next/link';
import { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import { IconArrowDown, IconArrowRight } from '@tabler/icons-react';
import { C } from './EstimateLayout';
import { RESIDENTIAL_SOURCES, RESIDENTIAL_STAGES, guideScrollPercent } from '@/lib/residentialChecklist';
import type { GuideAudience } from '@/lib/guideAudiences';
import type { GuideSource, GuideStage } from '@/lib/guideTypes';

function TapeCase() {
  return <svg viewBox="0 0 64 68" aria-hidden="true" style={{ width: 58, height: 62, display: 'block' }}>
    <rect x="23" y="3" width="20" height="7" rx="3" fill={C.ruler.housingInset} />
    <rect x="4" y="8" width="56" height="54" rx="16" fill={C.ruler.housingBottom} stroke={C.ruler.housingEdge} />
    <path d="M9 28V24Q9 13 21 13H43Q54 13 55 24" fill="none" stroke={C.ruler.housingEdge} />
    <circle cx="31" cy="34" r="18" fill={C.primary} stroke={C.ruler.tapeEdge} />
    <circle cx="31" cy="34" r="14" fill="none" stroke={C.primaryLight} />
    <circle cx="31" cy="34" r="5" fill={C.ruler.housingInset} />
    <rect x="17" y="57" width="30" height="6" rx="2" fill={C.ruler.metalEdge} />
  </svg>;
}

export default function ResidentialRoadmap() {
  return <GuideRoadmap audience="residential" stages={RESIDENTIAL_STAGES} sources={RESIDENTIAL_SOURCES} title="계약 전부터, 입주 후까지." notice="한국소비자원 안내를 참고해 구성한 일반적인 준비 목록이에요. 건물·공사 범위에 따라 순서와 필요한 절차가 달라질 수 있고, 계약·법률·안전 판단을 대신하지 않아요. 위험한 점검은 담당 전문가에게 요청하세요." />;
}

export function GuideRoadmap({ audience, stages, sources, title, notice }: { audience: GuideAudience; stages: readonly GuideStage[]; sources: readonly GuideSource[]; title: string; notice: string }) {
  const label = audience === 'residential' ? '주거' : '상가';
  const count = stages.reduce((total, stage) => total + stage.items.length, 0);
  const timeline = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: timeline, offset: ['start center', 'end 70%'] });
  const hookTop = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const [position, setPosition] = useState(0);
  useMotionValueEvent(scrollYProgress, 'change', value => setPosition(guideScrollPercent(value)));
  return <section aria-label={`${label} 인테리어 단계별 가이드`} style={{ marginTop: 32 }}>
    <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(23px, 4.5vw, 30px)', letterSpacing: '-0.04em' }}>{title}</h2>
    <p style={{ margin: '0 0 24px', color: C.textMid, lineHeight: 1.9, fontSize: 15 }}>줄자를 따라 내려가며 지금 필요한 일을 찾아보세요.<br />궁금한 항목을 누르면 자세한 안내로 이어져요.</p>

    <div style={{ position: 'sticky', top: 0, zIndex: 20, background: C.card, padding: '14px 0', marginBottom: 46, borderBottom: '1px solid ' + C.border, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
      <div role="progressbar" aria-label="가이드 탐색 위치" aria-valuemin={0} aria-valuemax={100} aria-valuenow={position} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 12, color: C.textMid }}>가이드 위치</span>
        <strong style={{ fontSize: 28, letterSpacing: '-0.05em', fontVariantNumeric: 'tabular-nums' }}>{position}<span style={{ fontSize: 14, marginLeft: 2 }}>%</span></strong>
      </div>
      <span style={{ fontSize: 12, color: C.textMid }}>{stages.length}단계 · {count}개 가이드</span>
    </div>

    <div ref={timeline} style={{ position: 'relative', display: 'grid', gridTemplateColumns: '58px minmax(0, 1fr)', columnGap: 'clamp(12px, 3vw, 28px)', alignItems: 'stretch' }}>
      <div aria-hidden="true" style={{ position: 'relative', width: 58 }}>
        <div style={{ position: 'absolute', top: -40, left: 0, zIndex: 3 }}><TapeCase /></div>
        <div style={{ position: 'absolute', top: 18, bottom: 0, left: 7, width: 44, border: '1px solid ' + C.ruler.trackEdge, boxSizing: 'border-box', background: C.ruler.track, borderRadius: '0 0 4px 4px' }}>
          <motion.div style={{ position: 'absolute', inset: 0, background: C.primaryLight, scaleY: scrollYProgress, transformOrigin: 'top', borderRadius: '0 0 4px 4px' }} />
          {Array.from({ length: 101 }, (_, tick) => <div key={tick} style={{ position: 'absolute', top: `${tick}%`, right: 0, width: tick % 10 === 0 ? 17 : tick % 5 === 0 ? 12 : 6, height: 1, background: C.ruler.tick }}>
            {tick % 10 === 0 && <span style={{ position: 'absolute', right: 20, top: -6, width: 22, textAlign: 'right', whiteSpace: 'nowrap', fontSize: 9, lineHeight: '12px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: C.ruler.tick }}>{tick}</span>}
          </div>)}
          <motion.div style={{ position: 'absolute', top: hookTop, left: -5, width: 52, height: 10, transform: 'translateY(-50%)', background: C.ruler.metalMid, border: '1px solid ' + C.ruler.metalEdge, borderRadius: 2, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-around', zIndex: 2 }}>
            <span style={{ width: 3, height: 3, background: C.ruler.metalEdge, borderRadius: '50%' }} /><span style={{ width: 3, height: 3, background: C.ruler.metalEdge, borderRadius: '50%' }} />
          </motion.div>
        </div>
      </div>

      <ol style={{ listStyle: 'none', padding: 0, margin: 0, minWidth: 0 }}>
        {stages.map((stage, index) => {
          return <li key={stage.id} id={`${audience}-${stage.id}`} style={{ scrollMarginTop: 110, paddingBottom: index === stages.length - 1 ? 0 : 34 }}>
            <section aria-labelledby={`heading-${stage.id}`} style={{ padding: 'clamp(16px, 3vw, 26px)', border: '1px solid ' + C.border, borderRadius: 16, background: C.card, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.textMid }}>STEP {String(index + 1).padStart(2, '0')}</span>
                <span style={{ fontSize: 11, color: C.textMid }}>{stage.items.length}개 가이드</span>
              </div>
              <h3 id={`heading-${stage.id}`} style={{ fontSize: 'clamp(18px, 3.6vw, 23px)', letterSpacing: '-0.04em', lineHeight: 1.5, margin: '0 0 8px' }}>{stage.title}</h3>
              <p style={{ color: C.textMid, fontSize: 13, lineHeight: 1.8, margin: '0 0 20px' }}>{stage.summary}</p>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>{stage.items.map(item => <li key={item.id} style={{ borderTop: '1px solid ' + C.border }}>
                <Link href={`/blog/${audience}/${item.id}`} style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between', padding: '15px 0', color: C.textDark, textDecoration: 'none', minHeight: 44, boxSizing: 'border-box' }}>
                  <span style={{ minWidth: 0 }}>
                    <strong style={{ display: 'block', fontSize: 14, fontWeight: 650, color: C.textDark, lineHeight: 1.7 }}>{item.title}</strong>
                    <span style={{ display: 'block', marginTop: 4, fontSize: 12, color: C.textMid, lineHeight: 1.9 }}>{item.detail}</span>
                  </span>
                  <IconArrowRight aria-hidden="true" size={18} stroke={1.6} style={{ flexShrink: 0, color: C.textMid }} />
                </Link>
              </li>)}</ul>
            </section>
            {index < stages.length - 1 && <div aria-hidden="true" style={{ display: 'flex', justifyContent: 'center', color: C.ruler.label, paddingTop: 14 }}><IconArrowDown size={16} stroke={1.5} /></div>}
          </li>;
        })}
      </ol>
    </div>

    <p style={{ fontSize: 12, color: C.textMid, lineHeight: 1.9, margin: '24px 0 0' }}>0~100%는 가이드의 탐색 위치이며 실제 공사 진행률·기간·완료 보증이 아니에요.</p>
    <details style={{ marginTop: 20, fontSize: 12, color: C.textMid, lineHeight: 1.9 }}>
      <summary style={{ cursor: 'pointer', padding: '8px 0' }}>참고 자료와 이용 안내</summary>
      <p>{notice}</p>
      <ul style={{ paddingLeft: 18 }}>{sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" style={{ color: C.textMid }}>{source.title}</a></li>)}</ul>
      <p>화면 구성·자료 확인: 2026-10-23. 참고 자료의 과거 통계·금액·법정 기간을 현재 기준으로 단정하지 않으며, 필요한 기준은 공식 기관에 확인하세요.</p>
    </details>
  </section>;
}
