"use client";
import { useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';
import { C } from './EstimateLayout';
import { PhotoRow } from './HomeSpaceGallery';
import { HOME_SPACE_PHOTOS, HOME_SPACE_ROWS } from '@/lib/homeSpacePhotos';
import { CONSTRUCTION_PHOTOS, CONSTRUCTION_ORDER } from '@/lib/constructionPhotos';
export default function HomeProjectGallery({ mobile, construction = false }: { mobile: boolean; construction?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const inView = useInView(root, { amount: 0.05 });
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const text = construction ? C.home.mutedOnDark : C.home.muted;
  const photos = construction ? CONSTRUCTION_PHOTOS : HOME_SPACE_PHOTOS;
  const orders = construction ? [CONSTRUCTION_ORDER] : HOME_SPACE_ROWS;
  const width = construction ? mobile ? 228 : 280 : mobile ? 154 : 220;
  return <div ref={root} role="region" aria-label={construction ? '직접 진행한 시공 현장 사진 30장' : '주거·상가 완공 공간 사진 20장'} style={{ minWidth: 0, overflow: 'hidden' }}>
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onTouchStart={() => setHovered(true)} onTouchEnd={() => setHovered(false)} onTouchCancel={() => setHovered(false)} style={{ display: 'grid', gap: 12 }}>
      {orders.map((order, index) => <PhotoRow key={index} mobile={mobile} order={order} photos={photos} reverse={index === 1} paused={paused || hovered || !inView} cardWidth={width} radius={18} captions={construction} eager={!construction} />)}
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 14, color: text, fontSize: 11 }}>
      <span>{construction ? '직접 진행한 현장의 공사 과정' : '주거·상가 인테리어 스타일'}</span>
      {reduced ? <span>자동 이동 꺼짐</span> : <button type="button" aria-label={`${construction ? '시공 현장' : '완공 사진'} 자동 이동 ${paused ? '재생' : '일시정지'}`} aria-pressed={paused} onClick={() => setPaused(value => !value)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 34, padding: '6px 10px', border: `1px solid ${construction ? C.home.darkLine : C.home.line}`, borderRadius: 9, background: 'transparent', color: text, font: 'inherit', cursor: 'pointer' }}>{paused ? <IconPlayerPlay size={13} /> : <IconPlayerPause size={13} />}{paused ? '재생' : '잠시 멈춤'}</button>}
    </div>
  </div>;
}
