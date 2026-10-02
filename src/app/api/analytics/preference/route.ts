import { cookies } from 'next/headers';
import { apiJson, sameOrigin } from '@/lib/serverAuth';
import { TRAFFIC_EXCLUSION_COOKIE, TRAFFIC_EXCLUSION_SECONDS, trafficExcluded } from '@/lib/trafficPreference';

// Public privacy preference; never grants access or changes another browser's settings.
export async function GET() {
  return apiJson({ excluded: trafficExcluded((await cookies()).get(TRAFFIC_EXCLUSION_COOKIE)?.value) });
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return apiJson({ error: '허용되지 않은 요청입니다.' }, 403);
  if (Number(request.headers.get('content-length')) > 100) return apiJson({ error: '입력값이 너무 깁니다.' }, 413);
  const raw = await request.text();
  if (raw.length > 100) return apiJson({ error: '입력값이 너무 깁니다.' }, 413);
  let body;
  try { body = JSON.parse(raw); } catch { return apiJson({ error: '입력값을 확인해주세요.' }, 400); }
  if (typeof body?.excluded !== 'boolean') return apiJson({ error: '입력값을 확인해주세요.' }, 400);
  (await cookies()).set(TRAFFIC_EXCLUSION_COOKIE, body.excluded ? '1' : '0', {
    path: '/', maxAge: TRAFFIC_EXCLUSION_SECONDS, httpOnly: true,
    secure: process.env.NODE_ENV === 'production', sameSite: 'lax',
  });
  return apiJson({ excluded: body.excluded });
}
