"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from 'framer-motion';
import { IconArrowUpRight, IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';
import { C } from './EstimateLayout';
import { HOME_SPACE_PHOTOS as SPACES, HOME_SPACE_ROWS } from '@/lib/homeSpacePhotos';

function PhotoRow({ mobile, reverse, paused, order }: { mobile: boolean; reverse?: boolean; paused: boolean; order: readonly number[] }) {
  const x = useMotionValue(0);
  const phase = useRef(0);
  const [dragging, setDragging] = useState(false);
  const reduced = useReducedMotion();
  const width = mobile ? 154 : 198;
  const gap = 12;
  const distance = (width + gap) * order.length;
  useAnimationFrame((_time, delta) => {
    if (paused || reduced || dragging) return;
    phase.current = (phase.current + Math.min(delta, 64) * 0.023) % distance;
    x.set(reverse ? phase.current - distance : -phase.current);
  });
  return <div style={{ overflow: 'hidden', width: '100%' }}>
    <motion.div drag={mobile ? 'x' : false} dragConstraints={{ left: -distance, right: 0 }} dragElastic={0} dragMomentum={false}
      onDragStart={() => setDragging(true)} onDragEnd={() => { phase.current = ((reverse ? x.get() + distance : -x.get()) + distance) % distance; setDragging(false); }}
      style={{ x, display: 'flex', gap, width: 'max-content', touchAction: 'pan-y', willChange: paused || reduced ? 'auto' : 'transform' }}>
      {[0, 1].map(copy => <div key={copy} aria-hidden={copy === 1 ? true : undefined} style={{ display: 'flex', gap }}>
        {order.map(index => {
          const space = SPACES[index];
          return <figure key={index} style={{ position: 'relative', flex: '0 0 auto', width, height: width, margin: 0, borderRadius: 16, overflow: 'hidden', background: C.home.stone }}>
            <Image src={space.src} alt={`${space.category} 인테리어 예시 · ${space.name}`} fill sizes="(max-width: 768px) 154px, 198px" draggable={false} style={{ objectFit: 'cover', objectPosition: 'center', pointerEvents: 'none' }} />
            <figcaption style={{ position: 'absolute', left: 10, right: 10, bottom: 10, padding: '8px 10px', borderRadius: 8, background: C.home.nav, color: C.home.ink, display: 'flex', gap: 7, alignItems: 'center', fontSize: mobile ? 10 : 11 }}>
              <span style={{ color: C.home.bronze, fontWeight: 750, flexShrink: 0 }}>{space.category}</span>
              <span style={{ whiteSpace: 'nowrap', letterSpacing: '-0.3px' }}>{space.name}</span>
            </figcaption>
          </figure>;
        })}
      </div>)}
    </motion.div>
  </div>;
}

export default function HomeSpaceGallery({ mobile }: { mobile: boolean }) {
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  return <section aria-labelledby="space-gallery-title" style={{ background: C.home.paper, padding: mobile ? '58px 0' : '82px 0', overflow: 'hidden', borderTop: `1px solid ${C.home.line}` }}>
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: mobile ? '0 20px' : '0 32px', display: 'grid', gridTemplateColumns: mobile ? 'minmax(0, 1fr)' : '0.85fr 1.65fr', gap: mobile ? 28 : 54, alignItems: 'center' }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 650, letterSpacing: '1.6px', color: C.home.bronze, margin: '0 0 16px' }}>SPACE INSPIRATION</p>
        <h2 id="space-gallery-title" style={{ fontSize: mobile ? 29 : 36, lineHeight: 1.35, letterSpacing: '-1.2px', fontWeight: 750, margin: '0 0 18px', color: C.home.ink, wordBreak: 'keep-all' }}>어떤 공간을<br />바꾸고 싶으세요?</h2>
        <p style={{ fontSize: 14, color: C.home.muted, lineHeight: 1.9, margin: '0 0 24px', wordBreak: 'keep-all' }}>매일의 집부터, 새로운 시작을 담을 상가까지.<br />마음에 드는 분위기에서<br />나의 공간을 그려보세요.</p>
        <Link href="/consult" style={{ display: 'inline-flex', gap: 14, alignItems: 'center', fontSize: 13, fontWeight: 750, textDecoration: 'none', color: C.home.ink, padding: '13px 17px', borderRadius: 8, background: C.home.service }}>내 공간 견적 알아보기<IconArrowUpRight size={17} aria-hidden="true" /></Link>
        <p style={{ margin: '20px 0 0', fontSize: 10, lineHeight: 1.7, color: C.home.muted }}>인테리어 스타일 예시</p>
      </div>
      <div style={{ minWidth: 0, overflow: 'hidden' }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onTouchStart={() => setHovered(true)} onTouchEnd={() => setHovered(false)} onTouchCancel={() => setHovered(false)}>
        <div style={{ display: 'grid', gap: 12 }}>
          <PhotoRow mobile={mobile} paused={paused || hovered} order={HOME_SPACE_ROWS[0]} />
          <PhotoRow mobile={mobile} paused={paused || hovered} reverse order={HOME_SPACE_ROWS[1]} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 14 }}>
          <span style={{ fontSize: 10, color: C.home.muted, letterSpacing: '0.2px' }}>주거와 상가, 다양한 공간의 가능성</span>
          <button type="button" aria-label={paused ? '사진 자동 이동 재생' : '사진 자동 이동 일시정지'} aria-pressed={paused} onClick={() => setPaused(value => !value)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, flexShrink: 0, borderRadius: '50%', border: `1px solid ${C.home.line}`, background: C.home.paper, color: C.home.muted, cursor: 'pointer' }}>{paused ? <IconPlayerPlay size={14} aria-hidden="true" /> : <IconPlayerPause size={14} aria-hidden="true" />}</button>
        </div>
      </div>
    </div>
  </section>;
}
