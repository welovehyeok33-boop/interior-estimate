import { apiJson, isAdmin, sameOrigin } from '@/lib/serverAuth';
import { sendAdminSms, smsReadiness, smsPricingStatus } from '@/lib/serverSms';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET() {
  try {
    if (!await isAdmin()) return apiJson({ error: '관리자 로그인이 필요해요.' }, 401);
    const settings = smsReadiness();
    const pricing = settings.ready ? await smsPricingStatus() : null;
    return apiJson({ ...settings, ready: settings.ready && pricing?.status === 'ok', pricing,
      reason: settings.reason ?? (pricing?.status === 'failed' ? pricing.reason === 'limit' ? 'price_limit' : 'price_unavailable' : null) });
  } catch { return apiJson({ error: '문자 설정을 확인하지 못했어요.' }, 503); }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return apiJson({ error: '허용되지 않은 요청입니다.' }, 403);
  try {
    if (!await isAdmin()) return apiJson({ error: '관리자 로그인이 필요해요.' }, 401);
    if (Number(request.headers.get('content-length')) > 256) return apiJson({ error: '잘못된 요청입니다.' }, 400);
    const text = await request.text();
    if (text.length > 256) return apiJson({ error: '잘못된 요청입니다.' }, 400);
    let body: unknown;
    try { body = JSON.parse(text); } catch { return apiJson({ error: '잘못된 요청입니다.' }, 400); }
    if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).length !== 1
      || !('confirmTest' in body) || body.confirmTest !== true) return apiJson({ error: '테스트 문자 1건 발송을 확인해주세요.' }, 400);
    const result = await sendAdminSms('test');
    return apiJson(result, result.status === 'accepted' ? 200 : result.status === 'skipped' ? 429 : 502);
  } catch { return apiJson({ error: '테스트 발송 결과를 확인하지 못했어요. 중복 발송하지 말고 발송 내역을 확인해주세요.' }, 503); }
}
