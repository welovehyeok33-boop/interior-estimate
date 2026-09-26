"use client";
import { useSyncExternalStore } from "react";
import { createDraftStore } from "./draftStore";
import { sanitizeConsult, type ConsultState } from "./consultValidation";
export type { ConsultState } from "./consultValidation";
const store = createDraftStore<ConsultState>("pomit_consult", sanitizeConsult);
export const saveConsult = store.save;
export const loadConsult = store.load;
export const clearConsult = store.clear;
export function useConsultDraft() {
  return useSyncExternalStore(store.subscribe, store.load, store.serverSnapshot);
}
