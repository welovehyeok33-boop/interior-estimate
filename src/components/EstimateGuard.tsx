"use client";
import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useEstimateDraft } from "@/lib/estimateStore";
import { firstMissingEstimateStep } from "@/lib/estimateValidation";
import { C } from "./EstimateLayout";
const subscribe = () => () => {};
export default function EstimateGuard({ children }: { children: React.ReactNode }) {
  const data = useEstimateDraft();
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  const router = useRouter();
  const path = usePathname();
  const step = Number(path.match(/step([2-5])$/)?.[1] ?? 1);
  const missing = firstMissingEstimateStep(data);
  useEffect(() => {
    if (ready && missing < step) router.replace(missing === 1 ? "/estimate/detail" : `/estimate/detail/step${missing}`);
  }, [ready, missing, step, router]);
  if (!ready || missing < step) return <p role="status" style={{ padding: 24, color: C.textMid }}>입력 내용을 확인하고 있어요.</p>;
  return children;
}
