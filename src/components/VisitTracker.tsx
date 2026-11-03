"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { koreaDay, trafficKind } from "@/lib/analytics";
import { captureAttribution } from '@/lib/attribution';
import { trackedPage } from '@/lib/trafficDetails';
import { deliverTraffic } from '@/lib/trafficDelivery';

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
      const page = trackedPage(pathname);
      const eventKey = koreaDay() + ":" + page;
      if (recorded.has(eventKey)) return;
      recorded.add(eventKey);
      const attribution = captureAttribution(window.location.href, document.referrer);
      queue = queue.then(async () => {
        try {
          if (!await deliverTraffic(JSON.stringify({ kind, attribution, page }))) recorded.delete(eventKey);
        } catch { recorded.delete(eventKey); }
      });
    };
    record();
    document.addEventListener("visibilitychange", record);
    window.addEventListener("online", record);
    const interval = window.setInterval(record, 60000);
    return () => { document.removeEventListener("visibilitychange", record); window.removeEventListener("online", record); window.clearInterval(interval); };
  }, [pathname]);
  return null;
}
