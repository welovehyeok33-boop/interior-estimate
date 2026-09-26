"use client";
import { useSyncExternalStore } from "react";
import { createDraftStore } from "./draftStore";
import { sanitizeEstimate, type EstimateState } from "./estimateValidation";
export type { EstimateState } from "./estimateValidation";
const store = createDraftStore<EstimateState>("interior_estimate", sanitizeEstimate);
export const saveEstimate = store.save;
export const loadEstimate = store.load;
export const clearEstimate = store.clear;
export function useEstimateDraft() {
  return useSyncExternalStore(store.subscribe, store.load, store.serverSnapshot);
}
export function useEstimateField<K extends keyof EstimateState>(key: K, fallback: EstimateState[K]) {
  const draft = useEstimateDraft();
  const value = draft[key] ?? fallback;
  const setValue = (next: EstimateState[K] | null | ((previous: EstimateState[K]) => EstimateState[K])) => {
    saveEstimate({ [key]: typeof next === "function" ? next(value) : next ?? undefined });
  };
  return [value, setValue] as const;
}
