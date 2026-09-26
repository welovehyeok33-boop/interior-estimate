// Keep form answers available across Next.js route changes, even if storage is blocked.
export function createDraftStore<T extends object>(key: string, sanitize: (value: Record<string, unknown>) => Partial<T>, storage: "localStorage" | "sessionStorage" = "localStorage") {
  let memory: Partial<T> = {};
  let rawCache: string | null | undefined;
  let initialized = false;
  const listeners = new Set<() => void>();
  const empty: Partial<T> = {};
  function load(): Partial<T> {
    if (typeof window === "undefined") return empty;
    try {
      const raw = window[storage].getItem(key);
      if (initialized && raw === rawCache) return memory;
      rawCache = raw;
      initialized = true;
      const value: unknown = raw ? JSON.parse(raw) : {};
      memory = value && typeof value === "object" && !Array.isArray(value)
        ? sanitize(value as Record<string, unknown>) : {};
    } catch { /* Use the in-memory draft when storage is unavailable. */ }
    return memory;
  }
  function save(data: Partial<T>) {
    if (typeof window === "undefined") return;
    memory = sanitize({ ...load(), ...data });
    initialized = true;
    try {
      const raw = JSON.stringify(memory);
      window[storage].setItem(key, raw);
      rawCache = raw;
    } catch { /* Route navigation still retains the in-memory draft. */ }
    listeners.forEach(listener => listener());
  }
  function clear() {
    memory = {};
    initialized = true;
    try { window[storage].removeItem(key); rawCache = null; } catch { /* Keep memory cleared. */ }
    listeners.forEach(listener => listener());
  }
  function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key === key || event.key === null) { initialized = false; listener(); }
    };
    window.addEventListener("storage", onStorage);
    return () => { listeners.delete(listener); window.removeEventListener("storage", onStorage); };
  }
  return { load, save, clear, subscribe, serverSnapshot: () => empty };
}
