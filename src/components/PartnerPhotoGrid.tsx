"use client";
import { useEffect, useRef, useState } from 'react';
import { IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';
import { C } from './EstimateLayout';
import { PhotoRow } from './HomeSpaceGallery';
import { HOME_SPACE_ROWS } from '@/lib/homeSpacePhotos';
export default function PartnerPhotoGrid() {
  const frame = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(240);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const observer = new ResizeObserver(entries => {
      const containerWidth = entries[0]?.contentRect.width;
      if (containerWidth) setWidth(Math.max(1, (containerWidth - 12) / 2));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div ref={frame} aria-label="주거·상가 사진 20장 슬라이드" style={{ flex: '1 1 360px', minWidth: 0, overflow: 'hidden' }}>
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onTouchStart={() => setHovered(true)} onTouchEnd={() => setHovered(false)} onTouchCancel={() => setHovered(false)} style={{ display: 'grid', gap: 12, overflow: 'hidden' }}>
      <PhotoRow mobile paused={paused || hovered} order={HOME_SPACE_ROWS[0]} cardWidth={width} captions={false} radius={22} />
      <PhotoRow mobile paused={paused || hovered} reverse order={HOME_SPACE_ROWS[1]} cardWidth={width} captions={false} radius={22} />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 14, color: C.home.muted, fontSize: 11 }}><span>공간 스타일 이미지 · 20장</span><button type="button" aria-pressed={paused} aria-label={paused ? '사진 자동 이동 재생' : '사진 자동 이동 일시정지'} onClick={() => setPaused(value => !value)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, minHeight: 32, padding: '4px 8px', border: `1px solid ${C.home.line}`, borderRadius: 8, background: 'transparent', color: C.home.muted, font: 'inherit', cursor: 'pointer' }}>{paused ? <IconPlayerPlay size={13} /> : <IconPlayerPause size={13} />}{paused ? '사진 슬라이드 재생' : '사진 슬라이드 멈춤'}</button></div>
  </div>;
}
