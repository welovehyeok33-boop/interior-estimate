import { apiJson, isAdmin, sameOrigin } from "@/lib/serverAuth";
import { serverDb } from "@/lib/serverDb";
import { parseStatsPeriod } from '@/lib/adminStatsPeriod';

export async function GET(request: Request) {
  try {
    if (!await isAdmin()) return apiJson({ error: "로그인이 필요합니다." }, 401);
    const period = parseStatsPeriod(new URL(request.url).searchParams);
    if (!period) return apiJson({ error: '기간을 확인해주세요.' }, 400);
    const monthly = period.range === 'month';
    const args = monthly ? { p_from: period.from, p_to: period.to } : { p_days: period.dates.length, p_offset: period.range === 'yesterday' ? 1 : 0 };
    const db = serverDb();
    const [summary, details] = await Promise.all([
      db.rpc(monthly ? 'admin_dashboard_range' : 'admin_dashboard', args),
      db.rpc(monthly ? 'admin_traffic_details_range' : 'admin_traffic_details', args),
    ]);
    if (summary.error || details.error) throw new Error('Stats unavailable');
    return apiJson({ ...summary.data, details: details.data, detailCoverage: period.detailCoverage });
  } catch { return apiJson({ error: "통계를 불러오지 못했어요. 집계 DB 설정과 연결을 확인해주세요." }, 503); }
}

export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return apiJson({ error: '허용되지 않은 요청입니다.' }, 403);
  try {
    if (!await isAdmin()) return apiJson({ error: '로그인이 필요합니다.' }, 401);
    const raw = await request.text();
    if (raw.length > 200) return apiJson({ error: '입력이 너무 큽니다.' }, 413);
    let body;
    try { body = JSON.parse(raw); } catch { return apiJson({ error: '설정을 확인해주세요.' }, 400); }
    if (typeof body?.enabled !== 'boolean' || typeof body?.ipEnabled !== 'boolean') return apiJson({ error: '설정을 확인해주세요.' }, 400);
    const { error } = await serverDb().rpc('set_traffic_detail_settings', { p_enabled: body.enabled, p_ip_enabled: body.ipEnabled });
    if (error) throw error;
    return apiJson({ ok: true });
  } catch { return apiJson({ error: '수집 설정을 저장하지 못했어요.' }, 503); }
}
