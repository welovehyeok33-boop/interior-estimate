"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { koreaDay, trafficKind } from "@/lib/analytics";

// Serialize requests so first-page navigation cannot issue multiple visitor cookies.
let queue = Promise.resolve();
const recorded = new Set<string>();
export default function VisitTracker() {
  const pathname = usePathname();
  useEffect(() => {
    const record = () => {
      const kind = trafficKind(pathname);
      if (!kind || document.visibilityState !== "visible" || navigator.doNotTrack === "1" ||
          (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return;
      const eventKey = koreaDay() + ":" + kind;
      if (recorded.has(eventKey)) return;
      recorded.add(eventKey);
      queue = queue.then(async () => {
        try {
          const response = await fetch("/api/analytics", { method: "POST", credentials: "same-origin",
            headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind }), keepalive: true });
          if (!response.ok) recorded.delete(eventKey);
        } catch { recorded.delete(eventKey); }
      });
    };
    record();
    document.addEventListener("visibilitychange", record);
    const interval = window.setInterval(record, 60000);
    return () => { document.removeEventListener("visibilitychange", record); window.clearInterval(interval); };
  }, [pathname]);
  return null;
}
