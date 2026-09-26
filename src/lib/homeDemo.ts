/**
 * Fictional, illustrative content for the home-page product preview only.
 * Amounts are in 만원; they are not a pricing engine, market benchmark, or quote.
 */
export const DEMO_WORKS = [
  { id: "demolition", name: "철거", detail: "기존 마감 정리", amount: 180 },
  { id: "wallpaper", name: "도배", detail: "실크 벽지", amount: 210 },
  { id: "floor", name: "바닥", detail: "강마루", amount: 360 },
  { id: "tile", name: "타일", detail: "욕실 마감", amount: 420 },
] as const;

export const DEMO_TOTAL = DEMO_WORKS.reduce((total, work) => total + work.amount, 0);

// These comparison ranges are also fictional display examples, not market data.
export const DEMO_SCAN_ITEMS = [
  { id: "demolition", name: "철거", quoted: 250, min: 170, max: 210 },
  { id: "wallpaper", name: "도배", quoted: 205, min: 190, max: 220 },
  { id: "floor", name: "바닥", quoted: 360, min: 320, max: 390 },
  { id: "tile", name: "타일", quoted: 480, min: 380, max: 430 },
] as const;

export type DemoMode = "estimate" | "scan";

export const DEMO_SCENES = {
  estimate: [
    { id: "space", label: "공간", duration: 3400 },
    { id: "works", label: "공종", duration: 4200 },
    { id: "material", label: "자재", duration: 3200 },
    { id: "result", label: "결과", duration: 6200 },
  ],
  scan: [
    { id: "document", label: "견적서", duration: 3600 },
    { id: "analyze", label: "분석", duration: 3800 },
    { id: "review", label: "확인", duration: 6200 },
  ],
} as const;

export type DemoScene = (typeof DEMO_SCENES)[DemoMode][number];

export interface DemoSceneState {
  readonly index: number;
  readonly scene: DemoScene;
  /** Milliseconds since the current scene began. */
  readonly elapsed: number;
  /** Current scene progress, in the half-open interval [0, 1). */
  readonly progress: number;
  /** Whole-loop progress, in the half-open interval [0, 1). */
  readonly cycleProgress: number;
}

function safeElapsed(elapsedMs: number): number {
  return Number.isFinite(elapsedMs) && elapsedMs > 0 ? elapsedMs : 0;
}

/** A deterministic scene clock, independent of rendering and animation APIs. */
export function getDemoScene(mode: DemoMode, elapsedMs: number): DemoSceneState {
  const scenes = DEMO_SCENES[mode];
  const duration = scenes.reduce((total, scene) => total + scene.duration, 0);
  const cycleElapsed = safeElapsed(elapsedMs) % duration;
  let elapsed = cycleElapsed;

  for (let index = 0; index < scenes.length; index += 1) {
    const scene = scenes[index];
    if (elapsed < scene.duration) {
      return {
        index,
        scene,
        elapsed,
        progress: elapsed / scene.duration,
        cycleProgress: cycleElapsed / duration,
      };
    }
    elapsed -= scene.duration;
  }

  // The positive-duration scenes above always return inside the loop.
  return { index: 0, scene: scenes[0], elapsed: 0, progress: 0, cycleProgress: 0 };
}

/** Number of illustrative work items selected within the works scene. */
export function getDemoSelectedCount(elapsedMs: number): number {
  return Math.min(DEMO_WORKS.length, Math.floor(safeElapsed(elapsedMs) / 700));
}
