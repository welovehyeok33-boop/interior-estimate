"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { animate, useMotionValue, useReducedMotion, type MotionValue } from "framer-motion";
import { ESTIMATE_STEP_LABELS, getEstimateStep } from "@/lib/estimateProgress";

const EstimateProgressContext = createContext<MotionValue<number> | null>(null);

export function EstimateProgressProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const totalSteps = pathname?.startsWith("/consult") ? 4 : ESTIMATE_STEP_LABELS.length;
  const target = getEstimateStep(pathname) / totalSteps;
  // The detail layout survives route changes, so a new page inherits the tape's position.
  // A reload or direct link starts at its own step rather than replaying earlier steps.
  const progress = useMotionValue(target);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion !== false) {
      progress.jump(target);
      return;
    }

    if (progress.get() === target) return;

    const animation = animate(progress, target, {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    });

    return () => animation.stop();
  }, [progress, reduceMotion, target]);

  return (
    <EstimateProgressContext.Provider value={progress}>
      {children}
    </EstimateProgressContext.Provider>
  );
}

export function useEstimateProgress(): MotionValue<number> | null {
  return useContext(EstimateProgressContext);
}
