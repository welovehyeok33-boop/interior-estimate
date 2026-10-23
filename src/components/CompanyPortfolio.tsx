"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { IconArrowDown, IconArrowRight, IconArrowUpRight, IconBuilding, IconCode, IconSparkles, IconChartArrowsVertical, IconCornerDownLeft, IconLock } from '@tabler/icons-react';
import { C } from './EstimateLayout';
import { PORTFOLIO_FIELDS, PORTFOLIO_WORKS, PORTFOLIO_PREVIEW_NOTICE, PORTFOLIO_IMAGE_NOTICE, getPortfolioField, type PortfolioFieldId } from '@/lib/portfolio';

const H = C.home;
const wrap = { maxWidth: 1120, margin: '0 auto', padding: '0 clamp(20px, 4vw, 40px)' };
const eyebrow = { fontSize: 11, fontWeight: 650, letterSpacing: '0.13em', margin: '0 0 20px', color: H.bronze } as const;
const paragraph = { fontSize: 15, lineHeight: 1.95, color: H.muted, wordBreak: 'keep-all' } as const;
const arrowLink = { color: H.ink, minHeight: 44, display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none', fontSize: 14, fontWeight: 700 } as const;
const fieldIcons = { interior: IconBuilding, development: IconCode, ai: IconSparkles, marketing: IconChartArrowsVertical };
const fieldPositions = { interior: [1, 1], development: [2, 1], ai: [2, 2], marketing: [1, 2] } as const;

function ConnectionMap() {
  const [selected, setSelected] = useState<PortfolioFieldId>('interior');
  const field = getPortfolioField(selected);
  const reduceMotion = useReducedMotion();
  return <section id="connections" aria-label="분야의 연결 방식" style={{ ...wrap, paddingTop: 88, paddingBottom: 90, scrollMarginTop: 88 }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', columnGap: 'clamp(30px, 6vw, 88px)', rowGap: 28, alignItems: 'center' }}>
      <div>
        <p style={eyebrow}>HOW WE CONNECT</p>
        <h2 style={{ fontSize: 'clamp(29px, 4vw, 44px)', lineHeight: 1.35, letterSpacing: '-0.055em', margin: '0 0 18px', wordBreak: 'keep-all' }}>분야는 다르지만,<br />서로의 다음이 됩니다.</h2>
        <p style={{ ...paragraph, margin: '0 0 30px' }}>인테리어의 질문을 서비스로 만들고,<br />기술과 콘텐츠로 확장해 다시 현장으로.<br />우리가 지향하는 하나의 연결 방식입니다.</p>
      </div>
      <div style={{ gridRow: 'span 2' }}>
        <div role="group" aria-label="분야를 선택하면 연결 설명이 바뀝니다" style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '68px clamp(18px, 5vw, 64px)', padding: '24px 8px', isolation: 'isolate' }}>
          <svg viewBox="0 0 400 360" preserveAspectRatio="none" aria-hidden="true" style={{ position: 'absolute', width: '76%', height: '72%', left: '12%', top: '14%', zIndex: -1 }}>
            <path d="M60 0 H340 Q400 0 400 60 V300 Q400 360 340 360 H60 Q0 360 0 300 V60 Q0 0 60 0Z" fill="none" stroke={H.line} strokeWidth="2" />
            <path d="M193 0 L205 6 L193 12 M400 173 L394 185 L388 173 M207 360 L195 354 L207 348 M0 187 L6 175 L12 187" fill="none" stroke={H.bronze} strokeWidth="2" />
          </svg>
          <span aria-hidden="true" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', background: H.paper, color: H.muted, padding: '10px 8px', fontSize: 11, whiteSpace: 'nowrap' }}>다시, 더 나은 경험으로</span>
          {PORTFOLIO_FIELDS.map(item => {
            const Icon = fieldIcons[item.id];
            const active = selected === item.id;
            return <button key={item.id} type="button" aria-pressed={active} aria-controls="portfolio-field-detail" onClick={() => setSelected(item.id)} style={{ gridColumn: fieldPositions[item.id][0], gridRow: fieldPositions[item.id][1], padding: '24px 12px', minHeight: 142, border: '1px solid ' + (active ? H.ink : H.line), borderRadius: 14, background: active ? H.ink : H.paper, color: active ? H.onDark : H.ink, fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer', boxShadow: active ? '6px 6px 0 ' + C.primary : 'none' }}>
              <Icon aria-hidden="true" size={25} stroke={1.5} style={{ color: active ? C.primary : H.bronze, marginBottom: 18 }} />
              <strong style={{ fontSize: 19, display: 'block', marginBottom: 7 }}>{item.label}</strong>
              <span style={{ fontSize: 9, letterSpacing: '0.04em', lineHeight: 1.5, display: 'block', color: active ? H.mutedOnDark : H.muted }}>{item.english}</span>
            </button>;
          })}
        </div>
        <p style={{ color: H.muted, fontSize: 12, margin: '24px 0 0', textAlign: 'center' }}>각 분야를 눌러 연결 방식을 살펴보세요.</p>
      </div>
      <div id="portfolio-field-detail" role="region" aria-labelledby="portfolio-field-heading" aria-live="polite" aria-atomic="true" style={{ minHeight: 240, paddingTop: 24, borderTop: '1px solid ' + H.line }}>
        <motion.div key={field.id} initial={false} animate={{ opacity: 1 }} transition={{ duration: reduceMotion ? 0 : 0.2 }}>
          <p style={{ ...eyebrow, marginBottom: 12, letterSpacing: '0.04em' }}>{field.number} / {field.label} <span style={{ marginLeft: 8, color: H.muted, fontWeight: 400 }}>{field.status}</span></p>
          <h3 id="portfolio-field-heading" style={{ fontSize: 20, lineHeight: 1.5, letterSpacing: '-0.035em', margin: '0 0 12px', wordBreak: 'keep-all' }}>{field.title}</h3>
          <p style={{ ...paragraph, margin: '0 0 14px', fontSize: 14 }}>{field.description}</p>
          <p style={{ fontSize: 12, color: H.bronze, lineHeight: 1.8, margin: 0 }}>{field.connection}</p>
        </motion.div>
      </div>
    </div>
  </section>;
}

function WorkPreview({ kind }: { kind: (typeof PORTFOLIO_WORKS)[number]['id'] }) {
  return <div aria-label="실제 고객 데이터가 없는 서비스 구조 설명 그래픽" style={{ background: kind === 'operations' ? H.ink : H.ivory, border: '1px solid ' + (kind === 'operations' ? H.darkLine : H.line), borderRadius: 14, overflow: 'hidden', minWidth: 0 }}>
    <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 5, borderBottom: '1px solid ' + (kind === 'operations' ? H.darkLine : H.line) }}>
      {[0, 1, 2].map(dot => <span key={dot} style={{ width: 5, height: 5, borderRadius: '50%', background: H.muted }} />)}
      <span style={{ fontSize: 10, marginLeft: 10, color: kind === 'operations' ? H.mutedOnDark : H.muted }}>FORMIT / {kind === 'consultation' ? 'SERVICE' : kind === 'guides' ? 'GUIDE' : 'OPERATIONS'}</span>
    </div>
    <div style={{ padding: 'clamp(22px, 4vw, 36px)' }}>
      {kind === 'consultation' ? <>
        <p style={{ ...eyebrow, fontSize: 10, marginBottom: 14 }}>공간에 관한 질문부터</p>
        <p style={{ fontSize: 24, letterSpacing: '-0.04em', lineHeight: 1.4, fontWeight: 750, margin: '0 0 25px' }}>어떤 공간을<br />준비하고 있나요?</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>{['주거', '상가'].map(label => <div key={label} style={{ padding: '16px 14px', borderRadius: 8, border: '1px solid ' + H.line, background: H.paper, fontSize: 13, fontWeight: 650 }}>{label}</div>)}</div>
        <p style={{ color: H.muted, fontSize: 11, lineHeight: 1.8, margin: '24px 0 0' }}>공간 → 면적 → 일정·예산 → 연락처</p>
      </> : kind === 'guides' ? <>
        <p style={{ ...eyebrow, fontSize: 10, marginBottom: 20 }}>위에서 아래로, 준비의 순서</p>
        <div style={{ display: 'grid', gridTemplateColumns: '22px minmax(0, 1fr)', gap: 18 }}>
          <div aria-hidden="true" style={{ background: C.primary, borderRadius: 3, position: 'relative', overflow: 'hidden' }}>{Array.from({ length: 16 }, (_, i) => <span key={i} style={{ position: 'absolute', top: (i / 16 * 100) + '%', right: 0, height: 1, width: i % 4 === 0 ? 13 : 6, background: H.bronze }} />)}</div>
          <div>{['계획을 정하고', '계약을 확인하고', '다음 단계를 준비해요'].map((label, index) => <div key={label} style={{ padding: '15px 0', borderBottom: index < 2 ? '1px solid ' + H.line : 'none', fontSize: 13, display: 'flex', gap: 13, alignItems: 'center' }}><span style={{ color: H.bronze, fontSize: 10 }}>{'0' + (index + 1)}</span>{label}<IconArrowUpRight size={15} aria-hidden="true" style={{ marginLeft: 'auto', flexShrink: 0 }} /></div>)}</div>
        </div>
      </> : <>
        <p style={{ ...eyebrow, color: H.mutedOnDark, fontSize: 10, marginBottom: 22 }}>숫자가 아닌, 연결 구조를 소개합니다</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 9 }}>{['사이트 방문', '폼잇 유입', '상담 신청', '상담 관리'].map((label, index) => <div key={label} style={{ padding: '18px 12px', border: '1px solid ' + H.darkLine, borderRadius: 8, color: index === 1 ? C.primary : H.onDark }}><span style={{ color: H.mutedOnDark, fontSize: 10, display: 'block', marginBottom: 9 }}>{'0' + (index + 1)}</span><strong style={{ fontSize: 13 }}>{label}</strong></div>)}</div>
        <p style={{ display: 'flex', gap: 7, alignItems: 'center', fontSize: 10, color: H.mutedOnDark, margin: '20px 0 0' }}><IconLock size={12} aria-hidden="true" />관리자 전용 · 고객 정보 비공개</p>
      </>}
      <p style={{ color: kind === 'operations' ? H.mutedOnDark : H.muted, fontSize: 10, margin: '25px 0 0', lineHeight: 1.6 }}>서비스의 구조를 요약한 그래픽입니다.</p>
    </div>
  </div>;
}

export default function CompanyPortfolio() {
  return <div style={{ background: H.paper, color: H.ink, overflowWrap: 'anywhere' }}>
    <header style={{ borderBottom: '1px solid ' + H.line }}>
      <div style={{ ...wrap, minHeight: 76, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap', paddingTop: 12, paddingBottom: 12 }}>
        <Link href="/" aria-label="폼잇 홈" style={{ display: 'flex', gap: 10, alignItems: 'center', textDecoration: 'none', color: H.ink }}><Image src="/logo.png" alt="" width={31} height={28} style={{ objectFit: 'contain' }} /><strong style={{ fontSize: 18, letterSpacing: '-0.04em' }}>폼잇.</strong></Link>
        <nav aria-label="포트폴리오 메뉴" style={{ display: 'flex', gap: 'clamp(15px, 3vw, 32px)', flexWrap: 'wrap' }}><a href="#connections" style={arrowLink}>연결 방식</a><a href="#work" style={arrowLink}>작업</a><Link href="/blog" style={arrowLink}>가이드<IconArrowUpRight size={14} aria-hidden="true" /></Link></nav>
      </div>
    </header>
    <main>
      <section aria-labelledby="portfolio-title" style={{ ...wrap, paddingTop: 'clamp(44px, 7vw, 84px)', paddingBottom: 66 }}>
        <p style={{ ...eyebrow, marginBottom: 30, display: 'flex', alignItems: 'center', gap: 9 }}><span style={{ width: 6, height: 6, background: C.primary, borderRadius: '50%' }} />{PORTFOLIO_PREVIEW_NOTICE}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 370px), 1fr))', gap: 'clamp(30px, 5vw, 64px)', alignItems: 'end' }}>
          <div>
            <h1 id="portfolio-title" style={{ fontSize: 'clamp(36px, 5.3vw, 65px)', lineHeight: 1.22, fontWeight: 780, letterSpacing: '-0.065em', margin: '0 0 30px', wordBreak: 'keep-all' }}>공간에서 시작해,<br />가능성을<br /><span style={{ color: H.bronze }}>연결합니다.</span></h1>
            <p style={{ ...paragraph, margin: '0 0 25px', fontSize: 16 }}>인테리어를 이해하는 시선으로,<br />개발로 만들고 AI로 확장하며<br />마케팅으로 사람과 연결합니다.</p>
            <a href="#connections" style={{ ...arrowLink, borderBottom: '1px solid ' + H.ink, paddingBottom: 7, marginTop: 6 }}>우리가 연결하는 일<IconArrowDown size={17} aria-hidden="true" /></a>
          </div>
          <figure style={{ margin: 0, minWidth: 0 }}>
            <div style={{ position: 'relative', aspectRatio: '4 / 5', maxHeight: 530, borderRadius: '60px 4px 4px 4px', overflow: 'hidden' }}><Image src="/portfolio/space-concept-v1.png" alt="따뜻한 빛과 원목 소재로 구성한 주거 공간의 AI 콘셉트" fill sizes="(max-width: 820px) 100vw, 50vw" style={{ objectFit: 'cover' }} preload /><span style={{ position: 'absolute', left: 18, bottom: 18, padding: '10px 13px', background: H.paper, color: H.ink, fontSize: 10, letterSpacing: '0.08em' }}>EVERYTHING STARTS WITH SPACE.</span></div>
            <figcaption style={{ fontSize: 10, color: H.muted, lineHeight: 1.8, marginTop: 12 }}>{PORTFOLIO_IMAGE_NOTICE}</figcaption>
          </figure>
        </div>
      </section>
      <div style={{ borderTop: '1px solid ' + H.line, borderBottom: '1px solid ' + H.line, background: H.ivory }}><p style={{ ...wrap, paddingTop: 22, paddingBottom: 22, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '16px 24px', fontSize: 11, letterSpacing: '0.12em', color: H.muted }}>{['INTERIOR', 'DEVELOPMENT', 'AI', 'MARKETING'].map((label, index) => <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ color: H.bronze, fontSize: 9 }}>0{index + 1}</span>{label}</span>)}</p></div>
      <ConnectionMap />
      <section id="work" aria-labelledby="work-heading" style={{ background: H.ivory, borderTop: '1px solid ' + H.line, borderBottom: '1px solid ' + H.line, scrollMarginTop: 24 }}>
        <div style={{ ...wrap, paddingTop: 78, paddingBottom: 72 }}>
          <p style={eyebrow}>SELECTED WORK / FORMIT</p>
          <h2 id="work-heading" style={{ fontSize: 'clamp(29px, 4vw, 44px)', lineHeight: 1.4, letterSpacing: '-0.05em', margin: '0 0 15px' }}>생각을, 실제 쓰이는 것으로.</h2>
          <p style={{ ...paragraph, margin: '0 0 36px', fontSize: 14 }}>하나의 플랫폼 안에서 이어지는 세 가지 작업.<br />현재 확인할 수 있는 폼잇 서비스와 구현된 구조를 소개합니다.</p>
          {PORTFOLIO_WORKS.map(work => <article key={work.id} aria-labelledby={'work-' + work.id} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 330px), 1fr))', gap: 'clamp(28px, 5vw, 70px)', padding: '42px 0', borderTop: '1px solid ' + H.line, alignItems: 'center' }}>
            <div>
              <p style={{ color: H.bronze, fontSize: 11, margin: '0 0 18px', display: 'flex', gap: 15, alignItems: 'center' }}>{work.number}<span style={{ fontSize: 10, color: H.muted, padding: '4px 8px', border: '1px solid ' + H.line, borderRadius: 4 }}>{work.status}</span></p>
              <h3 id={'work-' + work.id} style={{ fontSize: 'clamp(25px, 3.2vw, 35px)', lineHeight: 1.45, letterSpacing: '-0.045em', whiteSpace: 'pre-line', wordBreak: 'keep-all', margin: '0 0 22px' }}>{work.title}</h3>
              <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 10px' }}>{work.name}</p>
              <p style={{ ...paragraph, fontSize: 14, maxWidth: 440, margin: '0 0 18px' }}>{work.description}</p>
              <p style={{ fontSize: 11, color: H.bronze, margin: '0 0 16px', lineHeight: 1.8 }}>{work.type}</p>
              <div style={{ display: 'flex', gap: 25, flexWrap: 'wrap' }}>{work.links.map(link => <Link key={link.href} href={link.href} style={arrowLink}>{link.label}<IconArrowUpRight size={17} aria-hidden="true" /></Link>)}</div>
              {work.id === 'operations' && <details style={{ fontSize: 13, color: H.muted, lineHeight: 1.9, marginTop: 12 }}><summary style={{ cursor: 'pointer', minHeight: 44, color: H.ink }}>어떤 흐름을 관리하나요?</summary><p style={{ margin: '4px 0 0' }}>유입처별 방문과 폼잇 유입을 비교하고, 상담 상태를 관리하는 구조입니다. 공개 시안에는 관리자 화면, 개인 정보, 실제 방문·매출 수치를 넣지 않았습니다.</p></details>}
            </div>
            <WorkPreview kind={work.id} />
          </article>)}
        </div>
      </section>
      <section aria-labelledby="next-heading" style={{ background: H.ink, color: H.onDark }}>
        <div style={{ ...wrap, paddingTop: 72, paddingBottom: 76, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 330px), 1fr))', gap: 36, alignItems: 'center' }}>
          <div><p style={{ ...eyebrow, color: C.primary }}>WHAT COMES NEXT</p><h2 id="next-heading" style={{ fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-0.05em', margin: 0, lineHeight: 1.4, wordBreak: 'keep-all' }}>공간의 경험에,<br />AI의 가능성을 더합니다.</h2></div>
          <div><p style={{ display: 'inline-flex', gap: 8, alignItems: 'center', color: C.primary, fontSize: 12, margin: '0 0 15px' }}><IconSparkles size={16} aria-hidden="true" />AI 견적 스캔 · 준비 중</p><p style={{ ...paragraph, color: H.mutedOnDark, fontSize: 14, margin: '0 0 18px' }}>견적 항목의 구조화와 반복적인 정보 정리를 돕는 방향을 탐색합니다. 이 영역은 확장 구상이며, 현재 파일 업로드·자동 분석·시세 판정 기능을 제공하지 않습니다.</p><Link href="/estimate/scan" style={{ ...arrowLink, color: H.onDark }}>준비 현황 보기<IconArrowUpRight size={17} aria-hidden="true" /></Link></div>
        </div>
      </section>
      <section aria-label="인테리어 상담 안내" style={{ ...wrap, paddingTop: 70, paddingBottom: 70, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 25, flexWrap: 'wrap' }}><div><p style={eyebrow}>START WITH YOUR SPACE</p><h2 style={{ fontSize: 'clamp(25px, 3.5vw, 38px)', letterSpacing: '-0.05em', margin: '0 0 10px', lineHeight: 1.5 }}>지금 준비하는 공간이 있나요?</h2><p style={{ ...paragraph, fontSize: 14, margin: 0 }}>실제 인테리어 상담은 폼잇 서비스에서 신청할 수 있어요.</p></div><Link href="/landing" style={{ ...arrowLink, background: C.primary, padding: '16px 23px', borderRadius: 8, boxSizing: 'border-box' }}>인테리어 상담 알아보기<IconArrowRight size={18} aria-hidden="true" /></Link></section>
    </main>
    <footer style={{ borderTop: '1px solid ' + H.line }}><div style={{ ...wrap, paddingTop: 25, paddingBottom: 30, display: 'flex', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}><p style={{ fontSize: 11, color: H.muted, margin: 0, lineHeight: 1.8 }}>폼잇 · 회사 소개 콘셉트 시안<br />실제 시공 사례·고객사·성과 수치를 제시하는 페이지가 아닙니다.</p><a href="#portfolio-title" style={{ ...arrowLink, fontSize: 12, alignSelf: 'start' }}>처음으로<IconCornerDownLeft size={15} aria-hidden="true" /></a></div></footer>
  </div>;
}
