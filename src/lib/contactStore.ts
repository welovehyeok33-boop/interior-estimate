"use client";
import { useSyncExternalStore } from "react";
import { createDraftStore } from "./draftStore";
const store = createDraftStore<{ name: string; phone: string }>("pomit_contact", value => ({
  name: typeof value.name === "string" ? value.name.slice(0, 50) : "",
  phone: typeof value.phone === "string" ? value.phone.slice(0, 14) : "",
}), "sessionStorage");
export const saveContact = store.save;
export const clearContact = store.clear;
export function useContactDraft() {
  return useSyncExternalStore(store.subscribe, store.load, store.serverSnapshot);
}
