import { apiJson, isAdmin } from "@/lib/serverAuth";
import { serverDb } from "@/lib/serverDb";

export async function GET() {
  try {
    if (!await isAdmin()) return apiJson({ error: "로그인이 필요합니다." }, 401);
    const db = serverDb();
    const [report, total, pending, config] = await Promise.all([
      db.rpc("traffic_report"),
      db.from("consultations").select("id", { count: "exact", head: true }),
      db.from("consultations").select("id", { count: "exact", head: true }).eq("status", "new"),
      db.from("traffic_config").select("started_at").eq("id", 1).single(),
    ]);
    if (report.error || total.error || pending.error || config.error) throw new Error("Stats unavailable");
    return apiJson({ days: report.data, startedAt: config.data.started_at,
      totalRequests: total.count, pendingRequests: pending.count, updatedAt: new Date().toISOString() });
  } catch { return apiJson({ error: "통계를 불러오지 못했어요. 집계 DB 설정과 연결을 확인해주세요." }, 503); }
}
