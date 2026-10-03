import { apiJson, isAdmin, sameOrigin } from "@/lib/serverAuth";
import { serverDb } from "@/lib/serverDb";
import { isTrafficExcluded, trafficBucket, visitorIdentity } from "@/lib/serverAnalytics";
import { normalizeAttribution } from '@/lib/attribution';
import { trackedPage } from '@/lib/trafficDetails';
import { trafficMetadata } from '@/lib/serverTrafficDetails';
import { trafficKind } from '@/lib/analytics';

export async function POST(request: Request) {
  if (!sameOrigin(request)) return apiJson({ error: "Invalid origin" }, 403);
  try {
    if (await isTrafficExcluded()) return apiJson({ skipped: true });
    if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") return apiJson({ skipped: true });
    if (request.headers.get("dnt") === "1" || request.headers.get("sec-gpc") === "1" ||
        /bot|crawler|spider|headless/i.test(request.headers.get("user-agent") || "") || await isAdmin()) return apiJson({ skipped: true });
    if (Number(request.headers.get("content-length")) > 1000) return apiJson({ error: "Too large" }, 413);
    const raw = await request.text();
    if (raw.length > 1000) return apiJson({ error: "Too large" }, 413);
    let body;
    try { body = JSON.parse(raw); } catch { return apiJson({ error: "Invalid input" }, 400); }
    if (!["visit", "consult", "engine"].includes(body?.kind)) return apiJson({ error: "Invalid input" }, 400);
    const page = trackedPage(body.page);
    if (body.page !== undefined && (!page || trafficKind(page) !== body.kind)) return apiJson({ error: "Invalid page" }, 400);
    const db = serverDb();
    const limit = await db.rpc("consume_request_limit", { bucket: trafficBucket(request), max_hits: 120, window_seconds: 900 });
    if (limit.error) throw limit.error;
    if (!limit.data) return apiJson({ error: "Too many requests" }, 429);
    const visitor = await visitorIdentity(true);
    const result = await db.rpc("record_traffic_v3", { p_day: visitor!.day, p_visitor: visitor!.visitor, p_kind: body.kind,
      p_attribution: normalizeAttribution(body.attribution), p_page: page, p_metadata: page ? trafficMetadata(request.headers) : null });
    if (result.error) throw result.error;
    return apiJson({ ok: true });
  } catch { return apiJson({ error: "Analytics unavailable" }, 503); }
}
