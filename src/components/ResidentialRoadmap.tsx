"use client";

import { useRef, useState, useSyncExternalStore } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import { IconArrowDown, IconCheck } from '@tabler/icons-react';
import { C } from './EstimateLayout';
import { RESIDENTIAL_CHECKLIST_KEY, RESIDENTIAL_CHECK_IDS, RESIDENTIAL_SOURCES, RESIDENTIAL_STAGES, guideScrollPercent, parseResidentialChecks } from '@/lib/residentialChecklist';

const CHANGE_EVENT = 'formit-residential-checklist-change';
let memoryChecks = '';
let memoryOnly = false;

function readChecks(): string {
  if (memoryOnly) return memoryChecks;
  try { return window.localStorage.getItem(RESIDENTIAL_CHECKLIST_KEY) ?? ''; }
  catch { memoryOnly = true; return memoryChecks; }
}

function subscribeChecks(callback: () => void) {
  const storageChanged = (event: StorageEvent) => { if (!event.key || event.key === RESIDENTIAL_CHECKLIST_KEY) callback(); };
  window.addEventListener('storage', storageChanged);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => { window.removeEventListener('storage', storageChanged); window.removeEventListener(CHANGE_EVENT, callback); };
}

function toggleCheck(id: string) {
  if (!RESIDENTIAL_CHECK_IDS.includes(id)) return;
  const current = parseResidentialChecks(readChecks());
  const next = current.includes(id) ? current.filter(item => item !== id) : [...current, id];
  memoryChecks = JSON.stringify(next);
  try { if (!memoryOnly) window.localStorage.setItem(RESIDENTIAL_CHECKLIST_KEY, memoryChecks); }
  catch { memoryOnly = true; }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

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
  const timeline = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: timeline, offset: ['start center', 'end 70%'] });
  const hookTop = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const [position, setPosition] = useState(0);
  useMotionValueEvent(scrollYProgress, 'change', value => setPosition(guideScrollPercent(value)));
  const raw = useSyncExternalStore(subscribeChecks, readChecks, () => '');
  const checked = parseResidentialChecks(raw);

  return <section aria-label="주거 인테리어 단계별 체크리스트" style={{ marginTop: 32 }}>
    <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(23px, 4.5vw, 30px)', letterSpacing: '-0.04em' }}>계약 전부터, 입주 후까지.</h2>
    <p style={{ margin: '0 0 24px', color: C.textMid, lineHeight: 1.9, fontSize: 15 }}>줄자를 따라 내려가며 지금 필요한 일을 확인해보세요.<br />준비가 끝난 항목은 직접 체크할 수 있어요.</p>

    <div style={{ position: 'sticky', top: 0, zIndex: 20, background: C.card, padding: '14px 0', marginBottom: 46, borderBottom: '1px solid ' + C.border, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
      <div role="progressbar" aria-label="가이드 탐색 위치" aria-valuemin={0} aria-valuemax={100} aria-valuenow={position} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 12, color: C.textMid }}>가이드 위치</span>
        <strong style={{ fontSize: 28, letterSpacing: '-0.05em', fontVariantNumeric: 'tabular-nums' }}>{position}<span style={{ fontSize: 14, marginLeft: 2 }}>%</span></strong>
      </div>
      <span style={{ fontSize: 12, color: C.textMid }}>체크한 항목 <strong style={{ color: C.textDark }}>{checked.length}</strong> / {RESIDENTIAL_CHECK_IDS.length}</span>
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
        {RESIDENTIAL_STAGES.map((stage, index) => {
          const done = stage.items.filter(item => checked.includes(item.id)).length;
          return <li key={stage.id} id={`residential-${stage.id}`} style={{ scrollMarginTop: 110, paddingBottom: index === RESIDENTIAL_STAGES.length - 1 ? 0 : 34 }}>
            <section aria-labelledby={`heading-${stage.id}`} style={{ padding: 'clamp(16px, 3vw, 26px)', border: '1px solid ' + C.border, borderRadius: 16, background: C.card, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.textMid }}>STEP {String(index + 1).padStart(2, '0')}</span>
                <span aria-label={`${stage.items.length}개 중 ${done}개 확인`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.textMid }}>{done === stage.items.length && <IconCheck aria-hidden="true" size={13} />}{done}/{stage.items.length}</span>
              </div>
              <h3 id={`heading-${stage.id}`} style={{ fontSize: 'clamp(18px, 3.6vw, 23px)', letterSpacing: '-0.04em', lineHeight: 1.5, margin: '0 0 8px' }}>{stage.title}</h3>
              <p style={{ color: C.textMid, fontSize: 13, lineHeight: 1.8, margin: '0 0 20px' }}>{stage.summary}</p>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>{stage.items.map(item => <li key={item.id} style={{ borderTop: '1px solid ' + C.border }}>
                <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '15px 0', cursor: 'pointer', minHeight: 44, boxSizing: 'border-box' }}>
                  <input type="checkbox" checked={checked.includes(item.id)} onChange={() => toggleCheck(item.id)} aria-label={item.title} style={{ margin: '3px 0 0', width: 18, height: 18, flexShrink: 0, accentColor: C.primary }} />
                  <span style={{ minWidth: 0 }}>
                    <strong style={{ display: 'block', fontSize: 14, fontWeight: 650, color: C.textDark, lineHeight: 1.7 }}>{item.title}</strong>
                    <span style={{ display: 'block', marginTop: 4, fontSize: 12, color: C.textMid, lineHeight: 1.9 }}>{item.detail}</span>
                  </span>
                </label>
              </li>)}</ul>
            </section>
            {index < RESIDENTIAL_STAGES.length - 1 && <div aria-hidden="true" style={{ display: 'flex', justifyContent: 'center', color: C.ruler.label, paddingTop: 14 }}><IconArrowDown size={16} stroke={1.5} /></div>}
          </li>;
        })}
      </ol>
    </div>

    <p style={{ fontSize: 12, color: C.textMid, lineHeight: 1.9, margin: '24px 0 0' }}>0~100%는 가이드의 탐색 위치이며 실제 공사 진행률·기간·완료 보증이 아니에요. 체크 항목은 이 브라우저에만 저장되며, 브라우저 설정에 따라 유지되지 않을 수 있어요.</p>
    <details style={{ marginTop: 20, fontSize: 12, color: C.textMid, lineHeight: 1.9 }}>
      <summary style={{ cursor: 'pointer', padding: '8px 0' }}>참고 자료와 이용 안내</summary>
      <p>한국소비자원 안내를 참고해 구성한 일반적인 준비 목록이에요. 건물·공사 범위에 따라 순서와 필요한 절차가 달라질 수 있고, 계약·법률·안전 판단을 대신하지 않아요. 위험한 점검은 담당 전문가에게 요청하세요.</p>
      <ul style={{ paddingLeft: 18 }}>{RESIDENTIAL_SOURCES.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" style={{ color: C.textMid }}>{source.title}</a></li>)}</ul>
      <p>화면 구성·자료 확인: 2026-10-23. 참고 자료의 과거 통계·금액·법정 기간을 현재 기준으로 단정하지 않으며, 필요한 기준은 공식 기관에 확인하세요.</p>
    </details>
  </section>;
}
