import { cookies } from 'next/headers';
import { ADMIN_COOKIE, apiJson, sameOrigin } from '@/lib/serverAuth';
import { TRAFFIC_EXCLUSION_COOKIE, trafficExcluded } from '@/lib/trafficPreference';
import { CLARITY_CONSENT_COOKIE, clarityConsent, clarityServerAllowed } from '@/lib/clarity';
import { PARTNER_PORTAL_COOKIE } from '@/lib/partnerPortal';

export async function GET(request: Request) {
  const jar = await cookies();
  return apiJson({
    eligible: clarityServerAllowed(process.env.VERCEL_ENV, new URL(request.url).hostname,
      trafficExcluded(jar.get(TRAFFIC_EXCLUSION_COOKIE)?.value), !!jar.get(ADMIN_COOKIE)?.value || !!jar.get(PARTNER_PORTAL_COOKIE)?.value),
    consent: clarityConsent(jar.get(CLARITY_CONSENT_COOKIE)?.value),
  });
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return apiJson({ error: '허용되지 않은 요청입니다.' }, 403);
  if (Number(request.headers.get('content-length')) > 100) return apiJson({ error: '입력값이 너무 깁니다.' }, 413);
  const raw = await request.text();
  if (raw.length > 100) return apiJson({ error: '입력값이 너무 깁니다.' }, 413);
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return apiJson({ error: '입력값을 확인해주세요.' }, 400); }
  const value = body && typeof body === 'object' && 'consent' in body ? (body as { consent: unknown }).consent : null;
  if (value !== 'granted' && value !== 'denied') return apiJson({ error: '입력값을 확인해주세요.' }, 400);
  const jar = await cookies();
  jar.set(CLARITY_CONSENT_COOKIE, value, {
    path: '/', maxAge: 180 * 86400, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax',
  });
  if (value === 'denied') {
    for (const name of ['_clck', '_clsk']) {
      // Clear both host-only and domain-scoped first-party Clarity cookies.
      jar.set(name, '', { path: '/', maxAge: 0 });
      const hostname = new URL(request.url).hostname;
      if (['form.it.kr', 'www.form.it.kr'].includes(hostname)) {
        jar.set(name, '', { path: '/', domain: 'form.it.kr', maxAge: 0 });
      }
    }
  }
  return apiJson({ consent: value });
}
