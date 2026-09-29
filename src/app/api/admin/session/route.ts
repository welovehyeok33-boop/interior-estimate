import { cookies } from 'next/headers';
import { ADMIN_COOKIE, SESSION_SECONDS, apiJson, isAdmin, issueSession, passwordMatches, rateLimit, sameOrigin } from '@/lib/serverAuth';

export async function GET() {
  try { return apiJson({ authenticated: await isAdmin() }); }
  catch { return apiJson({ error: '관리자 인증 설정을 확인해주세요.' }, 503); }
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return apiJson({ error: '허용되지 않은 요청입니다.' }, 403);
  if (Number(request.headers.get('content-length')) > 1024) return apiJson({ error: '입력값이 너무 깁니다.' }, 413);
  try {
    if (!await rateLimit(request, 'login', 5)) return apiJson({ error: '로그인 시도가 많아요. 15분 후 다시 시도해주세요.' }, 429);
    const raw = await request.text();
    if (raw.length > 1024) return apiJson({ error: '입력값이 너무 깁니다.' }, 413);
    let body;
    try { body = JSON.parse(raw); } catch { return apiJson({ error: '잘못된 요청입니다.' }, 400); }
    if (typeof body?.password !== 'string' || body.password.length > 200 || !passwordMatches(body.password)) return apiJson({ error: '비밀번호를 확인해주세요.' }, 401);
    (await cookies()).set(ADMIN_COOKIE, issueSession(), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: SESSION_SECONDS });
    return apiJson({ authenticated: true });
  } catch { return apiJson({ error: '로그인을 처리하지 못했어요. 잠시 후 다시 시도해주세요.' }, 503); }
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return apiJson({ error: '허용되지 않은 요청입니다.' }, 403);
  (await cookies()).delete(ADMIN_COOKIE);
  return apiJson({ authenticated: false });
}
