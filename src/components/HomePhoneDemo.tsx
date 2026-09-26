"use client";

import { useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion, useAnimationFrame, useInView, useReducedMotion } from "framer-motion";
import {
  IconArrowRight, IconBattery3, IconCheck, IconFileDescription,
  IconHome, IconMaximize, IconPlayerPause, IconPlayerPlay,
  IconScan, IconShieldCheck, IconWifi,
} from "@tabler/icons-react";
import { C } from "@/components/EstimateLayout";
import { DEMO_SCENES, DEMO_WORKS, DEMO_TOTAL, DEMO_SCAN_ITEMS, getDemoScene, getDemoSelectedCount, type DemoMode } from "@/lib/homeDemo";

const ease = [0.22, 1, 0.36, 1] as const;
const card: CSSProperties = { background: C.card, border: `1px solid ${C.home.line}`, borderRadius: 12 };
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const format = (amount: number) => amount.toLocaleString("ko-KR");

function subscribeVisibility(notify: () => void) {
  document.addEventListener("visibilitychange", notify);
  return () => document.removeEventListener("visibilitychange", notify);
}

/** An isolated, fictional product tour. Never reads or writes the visitor's estimate. */
export default function HomePhoneDemo() {
  const root = useRef<HTMLElement>(null);
  const clock = useRef(0);
  const pending = useRef(0);
  const [mode, setMode] = useState<DemoMode>("estimate");
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [manualPreview, setManualPreview] = useState(false);
  const inView = useInView(root, { amount: 0.3 });
  const reducedMotion = useReducedMotion();
  const visible = useSyncExternalStore(subscribeVisibility, () => document.visibilityState === "visible", () => false);
  // Keep the first client render identical to SSR before reading motion preferences.
  const motionReduced = visible && reducedMotion === true;
  const running = playing && !manualPreview && inView && visible && reducedMotion === false;
  const { index, scene, elapsed: sceneTime } = getDemoScene(mode, elapsed);
  const scenes = DEMO_SCENES[mode];
  const staticPreview = manualPreview || motionReduced;
  const displayTime = staticPreview ? scene.duration - 1 : sceneTime;
  const animateUI = running && reducedMotion === false;

  useAnimationFrame((_, delta) => {
    if (!running) return;
    // One bounded clock drives selection, counters, scanning, and scene changes together.
    // Hidden tabs and offscreen tours stop without accumulating a catch-up jump.
    pending.current += Math.min(delta, 64);
    if (pending.current < 50) return;
    const duration = scenes.reduce((total, item) => total + item.duration, 0);
    clock.current = (clock.current + pending.current) % duration;
    pending.current = 0;
    setElapsed(clock.current);
  });

  function chooseMode(next: DemoMode) {
    if (next === mode) return;
    clock.current = 0;
    pending.current = 0;
    setElapsed(0);
    setMode(next);
    setManualPreview(!playing);
  }

  function chooseScene(next: number) {
    const start = scenes.slice(0, next).reduce((total, item) => total + item.duration, 0);
    clock.current = start;
    pending.current = 0;
    setElapsed(start);
    setPlaying(false);
    setManualPreview(true);
  }

  function togglePlayback() {
    pending.current = 0;
    setManualPreview(false);
    setPlaying(value => !value);
  }

  return (
    <figure ref={root} aria-label="폼잇 서비스 이용 미리보기" style={{ width: "100%", maxWidth: 340, minWidth: 0, margin: 0, color: C.home.ink }}>
      <div role="group" aria-label="미리보기 서비스 선택" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, padding: 4, border: `1px solid ${C.home.line}`, borderRadius: 14, background: C.home.stone, margin: "0 auto 20px", maxWidth: 300 }}>
        {(["estimate", "scan"] as const).map(option => (
          <button key={option} type="button" aria-pressed={mode === option} onClick={() => chooseMode(option)} style={{ minHeight: 40, padding: "8px 5px", border: 0, borderRadius: 10, background: mode === option ? C.card : C.phone.clear, boxShadow: mode === option ? `0 2px 5px ${C.home.shadow}` : "none", color: mode === option ? C.home.ink : C.home.muted, font: "inherit", fontSize: 12, fontWeight: mode === option ? 750 : 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
            {option === "estimate" ? <IconHome size={15} /> : <IconScan size={15} />}
            {option === "estimate" ? "견적 만들기" : "견적 스캔"}
            {option === "scan" && <span style={{ fontSize: 10, fontWeight: 600, color: C.home.bronze }}>예정</span>}
          </button>
        ))}
      </div>

      <div style={{ position: "relative", width: "100%", maxWidth: 300, margin: "0 auto", boxSizing: "border-box", padding: 9, borderRadius: 39, background: `linear-gradient(145deg, ${C.phone.frameEdge}, ${C.phone.frame} 22%, ${C.home.ink} 80%, ${C.phone.frameEdge})`, border: `1px solid ${C.phone.frameHighlight}`, boxShadow: `0 28px 50px -14px ${C.home.phoneShadow}, inset 0 0 0 3px ${C.phone.frame}` }}>
        <div style={{ position: "absolute", left: -3, top: 101, width: 3, height: 34, borderRadius: "2px 0 0 2px", background: C.phone.frameEdge }} />
        <div style={{ position: "absolute", left: -3, top: 146, width: 3, height: 34, borderRadius: "2px 0 0 2px", background: C.phone.frameEdge }} />
        <div style={{ position: "absolute", right: -3, top: 120, width: 3, height: 52, borderRadius: "0 2px 2px 0", background: C.phone.frameEdge }} />

        {/* The phone is an illustration; only the real controls outside it are interactive. */}
        <div aria-hidden="true" style={{ borderRadius: 30, background: C.phone.screen, overflow: "hidden", position: "relative" }}>
          <div style={{ height: 34, padding: "0 19px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10, fontWeight: 750 }}>
            <span>9:41</span>
            <div style={{ position: "absolute", width: 76, height: 20, top: 6, left: "50%", transform: "translateX(-50%)", borderRadius: 14, background: C.phone.frame, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8, boxSizing: "border-box" }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.home.darkLine, boxShadow: `inset 0 0 0 1px ${C.phone.frameEdge}` }} />
            </div>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><IconWifi size={12} /><IconBattery3 size={17} /></span>
          </div>
          <div style={{ height: 43, margin: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${C.home.line}` }}>
            <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.8px" }}>폼잇<span style={{ color: C.primary }}>.</span></span>
            <span style={{ color: C.home.muted, fontSize: 10, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 4, height: 4, background: C.home.bronze, borderRadius: "50%" }} />
              {mode === "scan" ? "출시 예정 · 화면 예시" : "서비스 미리보기"}
            </span>
          </div>

          <div style={{ height: 438, position: "relative", overflow: "hidden" }}>
            <AnimatePresence initial={false} mode="sync">
              <motion.div key={`${mode}-${scene.id}`} initial={animateUI ? { opacity: 0, x: 18 } : false} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: animateUI ? -12 : 0 }} transition={{ duration: animateUI ? 0.32 : 0, ease }} style={{ position: "absolute", inset: 0, padding: "16px 16px 12px", display: "flex", flexDirection: "column", boxSizing: "border-box", background: C.phone.screen }}>
                {scene.id === "space" && <SpaceScene time={displayTime} animate={animateUI} />}
                {scene.id === "works" && <WorksScene time={displayTime} animate={animateUI} />}
                {scene.id === "material" && <MaterialScene time={displayTime} animate={animateUI} />}
                {scene.id === "result" && <ResultScene time={displayTime} />}
                {(scene.id === "document" || scene.id === "analyze") && <DocumentScene analyzing={scene.id === "analyze"} time={displayTime} />}
                {scene.id === "review" && <ReviewScene />}
              </motion.div>
            </AnimatePresence>
          </div>
          <div style={{ height: 19, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ width: 83, height: 4, borderRadius: 4, background: C.home.ink }} /></div>
        </div>
      </div>

      <div role="group" aria-label="미리보기 장면 선택" style={{ display: "grid", gridTemplateColumns: `repeat(${scenes.length}, minmax(0, 1fr))`, gap: 5, maxWidth: 300, margin: "19px auto 0" }}>
        {scenes.map((item, position) => (
          <button type="button" key={item.id} aria-label={`${item.label} 장면 보기`} aria-pressed={position === index} onClick={() => chooseScene(position)} style={{ padding: "6px 2px", minHeight: 44, border: 0, background: C.phone.clear, cursor: "pointer", font: "inherit", color: position === index ? C.home.ink : C.home.muted, fontSize: 11, fontWeight: position === index ? 750 : 500 }}>
            <span style={{ height: 2, display: "block", background: C.home.line, marginBottom: 8, overflow: "hidden", borderRadius: 2 }}>
              <motion.span style={{ display: "block", height: "100%", background: C.home.bronze, width: `${position < index ? 100 : position === index ? (staticPreview ? 100 : clamp(sceneTime / item.duration) * 100) : 0}%` }} />
            </span>
            {item.label}
          </button>
        ))}
      </div>
      <figcaption style={{ textAlign: "center", marginTop: 5, color: C.home.muted }}>
        <div style={{ fontSize: 11, lineHeight: 1.7, wordBreak: "keep-all" }}>
          {mode === "estimate" ? "선택한 공종의 예시 금액이에요." : "출시 예정 기능의 시연 화면이에요."}<br />
          {mode === "estimate" ? "실제 견적은 현장과 조건에 따라 달라져요." : "분석 내용과 비교 금액은 설명용 예시예요."}
        </div>
        <button type="button" onClick={togglePlayback} disabled={!visible || motionReduced} aria-label={motionReduced ? "자동 재생 꺼짐" : playing ? "미리보기 일시정지" : "미리보기 재생"} style={{ minHeight: 44, margin: "2px auto 0", padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, border: 0, background: C.phone.clear, color: C.home.muted, cursor: motionReduced ? "default" : "pointer", font: "inherit", fontSize: 11 }}>
          {playing && !motionReduced ? <IconPlayerPause size={13} /> : <IconPlayerPlay size={13} />}
          {motionReduced ? "모션 줄이기 · 장면을 눌러보세요" : playing ? "일시정지" : "재생"}
        </button>
      </figcaption>
    </figure>
  );
}

function SceneHeading({ label, title, description }: { label: string; title: ReactNode; description: string }) {
  return <div style={{ marginBottom: 13 }}>
    <div style={{ color: C.home.bronze, fontSize: 10, fontWeight: 700, letterSpacing: "0.5px", marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.3, letterSpacing: "-0.8px", wordBreak: "keep-all" }}>{title}</div>
    <div style={{ color: C.home.muted, fontSize: 11, lineHeight: 1.6, marginTop: 5, wordBreak: "keep-all" }}>{description}</div>
  </div>;
}

function DemoAction({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return <div style={{ marginTop: "auto", minHeight: 37, borderRadius: 10, background: muted ? C.home.stone : C.primaryLight, display: "flex", justifyContent: "center", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 750 }}>{children}<IconArrowRight size={15} /></div>;
}

function ContextChips() {
  return <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
    {["서울", "아파트", "32평"].map(text => <span key={text} style={{ fontSize: 10, color: C.home.muted, border: `1px solid ${C.home.line}`, borderRadius: 6, padding: "3px 6px", background: C.card }}>{text}</span>)}
  </div>;
}

function Tap({ time, start }: { time: number; start: number }) {
  const progress = (time - start) / 650;
  if (progress < 0 || progress > 1) return null;
  return <motion.span style={{ position: "absolute", right: 11, top: "50%", marginTop: -12, width: 24, height: 24, borderRadius: "50%", border: `1.5px solid ${C.home.bronze}`, background: C.phone.scan, scale: 0.7 + progress * 0.7, opacity: 1 - progress, pointerEvents: "none" }} />;
}

function SpaceScene({ time, animate }: { time: number; animate: boolean }) {
  const selected = time >= 650;
  const area = time >= 1750 ? "32" : time >= 1300 ? "3" : "—";
  return <>
    <SceneHeading label="01 / SPACE" title={<>어떤 공간을<br />바꾸고 싶으세요?</>} description="공간부터 가볍게 알려주세요." />
    <div style={{ display: "flex", gap: 5, marginBottom: 11 }}>
      {["서울", "수도권", "지방"].map((region, index) => <motion.div key={region} animate={{ background: selected && index === 0 ? C.selectedBg : C.card, borderColor: selected && index === 0 ? C.primary : C.home.line }} transition={{ duration: animate ? 0.22 : 0 }} style={{ position: "relative", flex: 1, textAlign: "center", padding: "7px 0", border: "1px solid", borderRadius: 8, fontSize: 11, fontWeight: selected && index === 0 ? 750 : 500 }}>{region}{index === 0 && <Tap time={time} start={650} />}</motion.div>)}
    </div>
    <div style={{ ...card, padding: "10px 12px", marginBottom: 10, backgroundImage: `linear-gradient(${C.phone.grid} 1px, ${C.phone.clear} 1px), linear-gradient(90deg, ${C.phone.grid} 1px, ${C.phone.clear} 1px)`, backgroundSize: "12px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10, color: C.home.muted }}><span>MY SPACE</span><span>아파트</span></div>
      <svg viewBox="0 0 220 91" style={{ display: "block", width: "100%", height: 91, marginTop: 5 }}>
        <path d="M24 10H195V79H24Z" fill={C.home.ivory} stroke={C.home.bronze} strokeWidth="2" />
        <motion.path d="M84 11H157V78H84Z" animate={{ fill: selected ? C.gold : C.home.ivory }} transition={{ duration: animate ? 0.35 : 0 }} />
        <path d="M84 10V38M84 59V79M158 10V79M24 45H84M158 42H195" fill="none" stroke={C.home.bronze} strokeWidth="1.6" />
        <path d="M84 38A21 21 0 0 1 105 59H84" fill="none" stroke={C.home.accentLine} />
        <rect x="103" y="20" width="40" height="12" rx="3" fill={C.card} stroke={C.home.accentLine} />
        <rect x="112" y="39" width="22" height="12" rx="3" fill={C.card} stroke={C.home.accentLine} />
        <rect x="35" y="18" width="28" height="19" rx="2" fill={C.card} stroke={C.home.accentLine} />
        <rect x="166" y="51" width="21" height="19" rx="2" fill={C.card} stroke={C.home.accentLine} />
        <text x="120" y="70" fontSize="9" fill={C.home.bronze} textAnchor="middle">LIVING</text>
      </svg>
    </div>
    <div style={{ ...card, padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 5, color: C.home.muted }}><IconMaximize size={14} />공사할 면적</span>
      <span style={{ fontSize: 25, fontWeight: 800, letterSpacing: "-1px", fontVariantNumeric: "tabular-nums" }}>{area}<span style={{ marginLeft: 5, fontSize: 11, fontWeight: 500, color: C.home.muted }}>평</span></span>
    </div>
    <DemoAction>필요한 공사 선택하기</DemoAction>
  </>;
}

function WorksScene({ time, animate }: { time: number; animate: boolean }) {
  const selected = getDemoSelectedCount(time);
  return <>
    <SceneHeading label="02 / SCOPE" title="필요한 공사만 쏙." description="전체가 아니어도 괜찮아요." />
    <ContextChips />
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {DEMO_WORKS.map((work, index) => <motion.div key={work.id} animate={{ background: index < selected ? C.selectedBg : C.card, borderColor: index < selected ? C.primary : C.home.line }} transition={{ duration: animate ? 0.2 : 0 }} style={{ ...card, position: "relative", padding: "9px 11px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 19, height: 19, borderRadius: 6, border: `1px solid ${index < selected ? C.primary : C.home.line}`, background: index < selected ? C.primaryLight : C.card, display: "flex", alignItems: "center", justifyContent: "center" }}>{index < selected && <IconCheck size={13} stroke={2.5} />}</span>
        <div><div style={{ fontSize: 12, fontWeight: 750 }}>{work.name}</div><div style={{ fontSize: 10, color: C.home.muted, marginTop: 2 }}>{work.detail}</div></div>
        <Tap time={time} start={(index + 1) * 700} />
      </motion.div>)}
    </div>
    <div style={{ padding: "9px 0", color: C.home.muted, fontSize: 10, textAlign: "right" }}><strong style={{ color: C.home.ink }}>{selected}개</strong> 공종 선택</div>
    <DemoAction muted={selected < DEMO_WORKS.length}>자재 살펴보기</DemoAction>
  </>;
}

function MaterialScene({ time, animate }: { time: number; animate: boolean }) {
  const selected = time >= 900;
  return <>
    <SceneHeading label="03 / MATERIAL" title="우리 집에 맞는 마감." description="예산과 취향 사이, 원하는 균형을 찾아요." />
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {[
        { title: "실속형", note: "기능 중심의 합리적인 선택", colors: [C.home.ivory, C.home.line, C.card] },
        { title: "스탠다드", note: "품질과 비용의 균형", colors: [C.home.accentLine, C.home.stone, C.home.bronze] },
        { title: "하이앤드", note: "취향을 담은 섬세한 마감", colors: [C.home.ink, C.home.muted, C.home.ivory] },
      ].map((grade, index) => <motion.div key={grade.title} animate={{ borderColor: selected && index === 1 ? C.primary : C.home.line, background: selected && index === 1 ? C.selectedBg : C.card }} transition={{ duration: animate ? 0.25 : 0 }} style={{ ...card, position: "relative", padding: "12px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
        <div><div style={{ fontSize: 12, fontWeight: 750, display: "flex", alignItems: "center", gap: 5 }}>{grade.title}{selected && index === 1 && <IconCheck size={13} />}</div><div style={{ fontSize: 10, color: C.home.muted, marginTop: 4 }}>{grade.note}</div></div>
        <div style={{ display: "flex", flexShrink: 0 }}>{grade.colors.map((color, swatch) => <span key={swatch} style={{ width: 17, height: 27, borderRadius: 3, background: color, border: `1px solid ${C.home.line}`, transform: `rotate(${swatch * 8 - 8}deg)`, marginLeft: -5 }} />)}</div>
        {index === 1 && <Tap time={time} start={900} />}
      </motion.div>)}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 5, color: C.home.muted, fontSize: 10, padding: "12px 0" }}><IconShieldCheck size={13} />선택 내용은 언제든 바꿀 수 있어요.</div>
    <DemoAction>내 예상 견적 확인하기</DemoAction>
  </>;
}

function ResultScene({ time }: { time: number }) {
  const progress = 1 - (1 - clamp(time / 1250)) ** 3;
  return <>
    <SceneHeading label="04 / ESTIMATE" title="공사 계획이 한눈에." description="서울 · 아파트 32평 · 스탠다드" />
    <div style={{ borderRadius: 14, background: C.home.ink, padding: "15px 15px 13px", color: C.home.onDark, marginBottom: 11, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", right: -18, top: -20, width: 96, height: 96, border: `1px solid ${C.phone.glass}`, borderRadius: "50%", pointerEvents: "none" }} />
      <div style={{ color: C.home.mutedOnDark, fontSize: 10 }}>선택한 4개 공종 · 예시 금액</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 5, margin: "5px 0 8px" }}><span style={{ fontSize: 33, fontWeight: 800, letterSpacing: "-1.5px", fontVariantNumeric: "tabular-nums", color: C.primaryLight }}>{format(Math.round(DEMO_TOTAL * progress))}</span><span style={{ fontSize: 12 }}>만원</span></div>
      <div style={{ height: 3, display: "flex", gap: 3 }}>{DEMO_WORKS.map((work, index) => <span key={work.id} style={{ flex: work.amount, background: index % 2 ? C.home.accentLine : C.primaryLight, borderRadius: 2, opacity: 0.95 - index * 0.12 }} />)}</div>
    </div>
    <div style={{ ...card, padding: "2px 12px" }}>{DEMO_WORKS.map((work, index) => <div key={work.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "8px 0", borderBottom: index < DEMO_WORKS.length - 1 ? `1px solid ${C.home.stone}` : "none" }}><span style={{ color: C.home.muted }}>{work.name}</span><strong>{format(work.amount)}만원</strong></div>)}</div>
    <p style={{ margin: "8px 0", color: C.home.muted, fontSize: 10, lineHeight: 1.5 }}>전체 공사비가 아닌 선택 항목의 예시예요.<br />정확한 금액은 현장 확인이 필요해요.</p>
    <DemoAction>내 공간으로 견적 시작하기</DemoAction>
  </>;
}

function DocumentScene({ analyzing, time }: { analyzing: boolean; time: number }) {
  const progress = clamp(time / 2900);
  const found = Math.min(DEMO_SCAN_ITEMS.length, Math.floor(progress * (DEMO_SCAN_ITEMS.length + 1)));
  return <>
    <SceneHeading label={analyzing ? "02 / SCAN" : "01 / DOCUMENT"} title={analyzing ? "항목을 하나씩 읽어요." : "받은 견적서도 한눈에."} description={analyzing ? "공종과 금액을 나누어 살펴보는 과정" : "복잡한 견적서, 확인할 부분부터 찾아요."} />
    <div style={{ ...card, padding: "15px 13px", position: "relative", overflow: "hidden", boxShadow: `0 8px 18px ${C.home.shadow}`, margin: "0 3px", transform: analyzing ? "rotate(0deg)" : "rotate(-2deg)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontSize: 12, fontWeight: 750 }}>인테리어 공사 견적서</span><IconFileDescription size={17} color={C.home.bronze} /></div>
      <div style={{ fontSize: 10, color: C.home.muted, marginBottom: 12 }}>서울 · 아파트 32평 · 예시 문서</div>
      <div style={{ display: "flex", justifyContent: "space-between", color: C.home.muted, fontSize: 9, borderTop: `1px solid ${C.home.line}`, borderBottom: `1px solid ${C.home.line}`, padding: "6px 0" }}><span>공사 항목</span><span>제시 금액</span></div>
      {DEMO_SCAN_ITEMS.map((item, index) => <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.home.stone}`, fontSize: 11 }}><span style={{ display: "flex", gap: 4, alignItems: "center" }}>{item.name}{analyzing && index < found && <IconCheck size={11} color={C.phone.green} />}</span><strong>{item.quoted}만원</strong></div>)}
      <div style={{ color: C.home.muted, fontSize: 9, textAlign: "right", marginTop: 9 }}>FORMIT · DEMO DOCUMENT</div>
      {analyzing && <motion.div style={{ position: "absolute", left: 0, right: 0, top: `${12 + progress * 82}%`, height: 28, marginTop: -28, borderBottom: `1.5px solid ${C.primary}`, background: `linear-gradient(${C.phone.clear}, ${C.phone.scan})`, opacity: progress >= 1 ? 0 : 1 }} />}
    </div>
    <div style={{ display: "flex", gap: 7, alignItems: "center", marginTop: 17, fontSize: 11, color: C.home.muted }}>
      {analyzing ? <IconScan size={15} color={C.home.bronze} /> : <IconFileDescription size={15} color={C.home.bronze} />}
      {analyzing ? `${found}개 항목 정리 중 · ${Math.round(progress * 100)}%` : "견적서 예시가 준비됐어요"}
    </div>
    <DemoAction muted>{analyzing ? "비교할 항목 정리하기" : "견적서 살펴보기"}</DemoAction>
  </>;
}

function ReviewScene() {
  const attention = DEMO_SCAN_ITEMS.filter(item => item.quoted > item.max || item.quoted < item.min).length;
  return <>
    <SceneHeading label="03 / REVIEW" title="한 번 더 확인해요." description={`${attention}개 항목은 세부 조건 확인이 필요해요.`} />
    <div style={{ ...card, padding: "0 11px" }}>{DEMO_SCAN_ITEMS.map((item, index) => {
      const high = item.quoted > item.max || item.quoted < item.min;
      return <div key={item.id} style={{ padding: "9px 0", borderBottom: index < DEMO_SCAN_ITEMS.length - 1 ? `1px solid ${C.home.stone}` : "none" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, fontWeight: 700 }}><span>{item.name}</span><span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 5, color: high ? C.phone.amber : C.phone.green, background: high ? C.phone.amberBg : C.phone.greenBg }}>{high ? "조건 확인" : "예시 범위 내"}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 4, color: C.home.muted, fontSize: 10, marginTop: 4 }}><span>제시 <b style={{ color: C.home.ink }}>{item.quoted}만</b></span><span>비교 예시 {item.min}~{item.max}만</span></div>
      </div>;
    })}</div>
    <div style={{ margin: "10px 0", display: "flex", alignItems: "flex-start", gap: 5, color: C.home.muted, fontSize: 10, lineHeight: 1.6 }}><IconShieldCheck size={14} style={{ flexShrink: 0, marginTop: 1 }} />자재·면적·철거 범위를 함께 확인해야<br />같은 기준으로 비교할 수 있어요.</div>
    <DemoAction muted>견적 스캔 · 출시 준비 중</DemoAction>
  </>;
}
