import { apiJson, isAdmin } from "@/lib/serverAuth";
import { serverDb } from "@/lib/serverDb";

export async function GET(request: Request) {
  try {
    if (!await isAdmin()) return apiJson({ error: "로그인이 필요합니다." }, 401);
    const range = new URL(request.url).searchParams.get('range') || '7';
    if (!['today', 'yesterday', '7', '30'].includes(range)) return apiJson({ error: '기간을 확인해주세요.' }, 400);
    const { data, error } = await serverDb().rpc('admin_dashboard', {
      p_days: range === '30' ? 30 : range === '7' ? 7 : 1, p_offset: range === 'yesterday' ? 1 : 0,
    });
    if (error) throw error;
    return apiJson(data);
  } catch { return apiJson({ error: "통계를 불러오지 못했어요. 집계 DB 설정과 연결을 확인해주세요." }, 503); }
}
