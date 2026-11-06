"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from 'framer-motion';
import { IconArrowUpRight, IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';
import { C } from './EstimateLayout';
import { HOME_SPACE_PHOTOS as SPACES, HOME_SPACE_ROWS } from '@/lib/homeSpacePhotos';

export type SpacePhoto = { category: string; name: string; src: string; alt?: string };

export function PhotoRow({ mobile, reverse, paused, order, cardWidth, captions = true, radius = 16, photos = SPACES, eager = false }: { mobile: boolean; reverse?: boolean; paused: boolean; order: readonly number[]; cardWidth?: number; captions?: boolean; radius?: number; photos?: readonly SpacePhoto[]; eager?: boolean }) {
  const x = useMotionValue(0);
  const phase = useRef(0);
  const [dragging, setDragging] = useState(false);
  const reduced = useReducedMotion();
  const width = cardWidth ?? (mobile ? 154 : 198);
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
        {order.map((index, slot) => {
          const space = photos[index];
          return <figure key={index} style={{ position: 'relative', flex: '0 0 auto', width, height: width, margin: 0, borderRadius: radius, overflow: 'hidden', background: C.home.stone }}>
            <Image quality={90} src={space.src} alt={space.alt ?? `${space.category} 인테리어 예시 · ${space.name}`} fill loading={eager && copy === 0 && slot < 2 ? 'eager' : 'lazy'} sizes={cardWidth ? `${Math.ceil(cardWidth)}px` : "(max-width: 768px) 154px, 198px"} draggable={false} style={{ objectFit: 'cover', objectPosition: 'center', pointerEvents: 'none' }} />
            {captions && <figcaption style={{ position: 'absolute', left: 10, right: 10, bottom: 10, padding: '8px 10px', borderRadius: 8, background: C.home.nav, color: C.home.ink, display: 'flex', gap: 7, alignItems: 'center', fontSize: mobile ? 10 : 11 }}>
              <span style={{ color: C.home.bronze, fontWeight: 750, flexShrink: 0 }}>{space.category}</span>
              <span style={{ whiteSpace: 'nowrap', letterSpacing: '-0.3px' }}>{space.name}</span>
            </figcaption>}
          </figure>;
        })}
      </div>)}
    </motion.div>
  </div>;
}

export default function HomeSpaceGallery({ mobile, compact = false }: { mobile: boolean; compact?: boolean }) {
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const titleId = compact ? 'consult-space-gallery-title' : 'space-gallery-title';
  return <section aria-labelledby={titleId} style={{ background: compact ? 'transparent' : C.home.paper, marginTop: compact ? 40 : 0, padding: compact ? '28px 0 0' : mobile ? '58px 0' : '82px 0', overflow: 'hidden', borderTop: `1px solid ${compact ? C.border : C.home.line}` }}>
    <div style={{ maxWidth: compact ? '100%' : 1080, margin: '0 auto', padding: compact ? 0 : mobile ? '0 20px' : '0 32px', display: 'grid', gridTemplateColumns: mobile || compact ? 'minmax(0, 1fr)' : '0.85fr 1.65fr', gap: compact ? 18 : mobile ? 28 : 54, alignItems: 'center' }}>
      {compact ? <div>
        <h2 id={titleId} style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 750, letterSpacing: '-0.5px', color: C.textDark }}>공간 포트폴리오</h2>
        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.8, color: C.textMid }}>주거와 상가, 다양한 공간을 만나보세요.</p>
      </div> : <div>
        <p style={{ fontSize: 11, fontWeight: 650, letterSpacing: '1.6px', color: C.home.bronze, margin: '0 0 16px' }}>SPACE INSPIRATION</p>
        <h2 id={titleId} style={{ fontSize: mobile ? 29 : 36, lineHeight: 1.35, letterSpacing: '-1.2px', fontWeight: 750, margin: '0 0 18px', color: C.home.ink, wordBreak: 'keep-all' }}>어떤 공간을<br />바꾸고 싶으세요?</h2>
        <p style={{ fontSize: 14, color: C.home.muted, lineHeight: 1.9, margin: '0 0 24px', wordBreak: 'keep-all' }}>매일의 집부터, 새로운 시작을 담을 상가까지.<br />마음에 드는 분위기에서<br />나의 공간을 그려보세요.</p>
        <Link href="/consult" style={{ display: 'inline-flex', gap: 14, alignItems: 'center', fontSize: 13, fontWeight: 750, textDecoration: 'none', color: C.home.ink, padding: '13px 17px', borderRadius: 8, background: C.home.service }}>내 공간 견적 알아보기<IconArrowUpRight size={17} aria-hidden="true" /></Link>
        <p style={{ margin: '20px 0 0', fontSize: 10, lineHeight: 1.7, color: C.home.muted }}>인테리어 스타일 예시</p>
      </div>}
      <div style={{ minWidth: 0, overflow: 'hidden' }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onTouchStart={() => setHovered(true)} onTouchEnd={() => setHovered(false)} onTouchCancel={() => setHovered(false)}>
        <div style={{ display: 'grid', gap: 12 }}>
          <PhotoRow mobile={mobile} paused={paused || hovered} order={HOME_SPACE_ROWS[0]} />
          <PhotoRow mobile={mobile} paused={paused || hovered} reverse order={HOME_SPACE_ROWS[1]} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 14 }}>
          <span style={{ fontSize: 10, color: C.home.muted, letterSpacing: '0.2px' }}>{compact ? '인테리어 스타일 예시' : '주거와 상가, 다양한 공간의 가능성'}</span>
          <button type="button" aria-label={paused ? '사진 자동 이동 재생' : '사진 자동 이동 일시정지'} aria-pressed={paused} onClick={() => setPaused(value => !value)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, flexShrink: 0, borderRadius: '50%', border: `1px solid ${C.home.line}`, background: C.home.paper, color: C.home.muted, cursor: 'pointer' }}>{paused ? <IconPlayerPlay size={14} aria-hidden="true" /> : <IconPlayerPause size={14} aria-hidden="true" />}</button>
        </div>
      </div>
    </div>
  </section>;
}
