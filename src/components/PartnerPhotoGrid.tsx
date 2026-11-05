"use client";
import { useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';
import { C } from './EstimateLayout';
const PHOTOS = [
  { number: '14', alt: '따뜻한 조명으로 완성한 침실' },
  { number: '19', alt: '식물과 조명이 어우러진 매장' },
  { number: '16', alt: '차분한 타일과 간접 조명의 욕실' },
  { number: '05', alt: '우드와 조명으로 완성한 다이닝 공간' },
] as const;
export default function PartnerPhotoGrid() {
  const reducedMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const still = !!reducedMotion || paused || hovered;
  return <div aria-label="주거·상가 완공 공간 사진" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ flex: '1 1 360px', minWidth: 0 }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingTop: 8, paddingBottom: 24 }}>
      {PHOTOS.map(({ number, alt }, i) => {
        const offset = i % 2 ? 18 : 0;
        return <motion.figure key={number} initial={false} animate={{ y: still ? offset : [offset, offset - 8, offset] }} transition={still ? { duration: 0.5 } : { duration: 7 + i, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'relative', aspectRatio: '1', margin: 0, borderRadius: 22, overflow: 'hidden', background: C.home.stone }}>
          <motion.div initial={false} animate={{ scale: still ? 1.04 : [1.04, 1.12, 1.04] }} transition={still ? { duration: 0.5 } : { duration: 13 + i * 2, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', inset: 0 }}>
            <Image src={`/home/forma/space-${number}.webp`} alt={alt} fill sizes="(max-width: 760px) 44vw, 260px" priority={i < 2} style={{ objectFit: 'cover' }} />
          </motion.div>
        </motion.figure>;
      })}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, color: C.home.muted, fontSize: 11 }}><span>공간 스타일 이미지</span>{!reducedMotion && <button type="button" aria-pressed={paused} onClick={() => setPaused(value => !value)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, minHeight: 32, padding: '4px 8px', border: `1px solid ${C.home.line}`, borderRadius: 8, background: 'transparent', color: C.home.muted, font: 'inherit', cursor: 'pointer' }}>{paused ? <IconPlayerPlay size={13} /> : <IconPlayerPause size={13} />}{paused ? '사진 움직임 재생' : '사진 움직임 멈춤'}</button>}</div>
  </div>;
}
