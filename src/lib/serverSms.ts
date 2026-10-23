import 'server-only';
import { createHmac, randomBytes } from 'node:crypto';
import { serverDb } from './serverDb';

const API_ORIGIN = 'https://api.solapi.com';
const REQUEST_TIMEOUT = 7000;
const MAX_UNIT_COST = 20;
export const CONSULTATION_SMS = '[폼잇] 새 견적 문의가 접수됐습니다.\nhttps://form.it.kr/admin';
export const TEST_SMS = '[폼잇] 문자 알림 연결 테스트입니다.\nhttps://form.it.kr/admin';

type SmsConfig = { key: string; secret: string; from: string; to: string; dailyLimit: number };
type SkipReason = 'disabled' | 'not_production' | 'invalid_config' | 'daily_limit' | 'test_limit' | 'quota_unavailable';
type FailureReason = 'price_unavailable' | 'price_limit' | 'provider_rejected' | 'invalid_response';
export type SmsOutcome =
  | { status: 'accepted' }
  | { status: 'skipped'; reason: SkipReason }
  | { status: 'failed'; reason: FailureReason }
  | { status: 'unknown'; reason: 'network' };

function config(): { value: SmsConfig } | { reason: SkipReason } {
  if (process.env.FORMIT_SMS_ENABLED !== 'true') return { reason: 'disabled' };
  // Preview deployments and local tests must never send a real paid message.
  if (process.env.VERCEL_ENV !== 'production' || process.env.NODE_ENV !== 'production') return { reason: 'not_production' };
  const key = process.env.SOLAPI_API_KEY?.trim() || '';
  const secret = process.env.SOLAPI_API_SECRET?.trim() || '';
  const from = process.env.SOLAPI_FROM_NUMBER?.trim() || '';
  const to = process.env.SOLAPI_ADMIN_NUMBER?.trim() || '';
  const limit = process.env.FORMIT_SMS_DAILY_LIMIT?.trim() || '20';
  if (!/^[A-Za-z0-9_-]{8,100}$/.test(key) || !/^[A-Za-z0-9_-]{16,200}$/.test(secret)
    || !/^010\d{8}$/.test(from) || !/^010\d{8}$/.test(to) || !/^\d{1,2}$/.test(limit)
    || Number(limit) < 1 || Number(limit) > 50) return { reason: 'invalid_config' };
  return { value: { key, secret, from, to, dailyLimit: Number(limit) } };
}

export function smsReadiness() {
  const settings = config();
  if ('reason' in settings) return { ready: false, reason: settings.reason, recipient: null, dailyLimit: null };
  return { ready: true, reason: null, recipient: '끝자리 ' + settings.value.to.slice(-4), dailyLimit: settings.value.dailyLimit };
}

function authorization(settings: SmsConfig) {
  const date = new Date().toISOString();
  const salt = randomBytes(16).toString('hex');
  const signature = createHmac('sha256', settings.secret).update(date + salt).digest('hex');
  return `HMAC-SHA256 apiKey=${settings.key}, date=${date}, salt=${salt}, signature=${signature}`;
}

function object(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

async function consume(settings: SmsConfig, purpose: string, limit: number) {
  const bucket = createHmac('sha256', settings.secret).update('formit-sms-v1:' + purpose).digest('hex');
  const { data, error } = await serverDb().rpc('consume_request_limit', { bucket, max_hits: limit, window_seconds: 86400 });
  if (error) return 'unavailable';
  return data === true ? 'allowed' : 'blocked';
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.length > 32000) throw new Error('Invalid SMS response');
  return JSON.parse(text);
}

export async function sendAdminSms(kind: 'consultation' | 'test'): Promise<SmsOutcome> {
  const settings = config();
  if ('reason' in settings) return { status: 'skipped', reason: settings.reason };
  const value = settings.value;
  try {
    // Persistent, atomic limits use the existing service-role-only RPC, not instance memory.
    // A failed or ambiguous test attempt also consumes this guard: never auto-send it again.
    if (kind === 'test') {
      const once = await consume(value, 'test', 1);
      if (once !== 'allowed') return { status: 'skipped', reason: once === 'blocked' ? 'test_limit' : 'quota_unavailable' };
    }
    const day = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const quota = await consume(value, 'daily:' + day, value.dailyLimit);
    if (quota !== 'allowed') return { status: 'skipped', reason: quota === 'blocked' ? 'daily_limit' : 'quota_unavailable' };

    // Check this account's current SMS price before any paid request. Leave room for VAT.
    let pricing: unknown;
    try {
      const response = await fetch(API_ORIGIN + '/pricing/v1/messaging', { method: 'GET',
        headers: { Authorization: authorization(value) }, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(REQUEST_TIMEOUT) });
      if (!response.ok) return { status: 'failed', reason: 'price_unavailable' };
      pricing = await readJson(response);
    } catch { return { status: 'failed', reason: 'price_unavailable' }; }
    const price = object(pricing);
    if (price?.countryId !== '82' || typeof price.sms !== 'number' || !Number.isFinite(price.sms) || price.sms <= 0) {
      return { status: 'failed', reason: 'price_unavailable' };
    }
    if (Math.ceil(price.sms * 1.1) > MAX_UNIT_COST) return { status: 'failed', reason: 'price_limit' };

    let response: Response;
    try {
      // Exactly one fixed recipient and a fixed short text. No customer data, automatic LMS,
      // fallback channel, charging API, or retry after a potentially accepted POST.
      response = await fetch(API_ORIGIN + '/messages/v4/send-many/detail', { method: 'POST',
        headers: { Authorization: authorization(value), 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ from: value.from, to: value.to, type: 'SMS', autoTypeDetect: false,
          text: kind === 'test' ? TEST_SMS : CONSULTATION_SMS }], strict: true, allowDuplicates: false, showMessageList: true }),
        cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(REQUEST_TIMEOUT) });
    } catch { return { status: 'unknown', reason: 'network' }; }
    if (!response.ok) return { status: 'failed', reason: 'provider_rejected' };
    let result: Record<string, unknown> | null;
    try { result = object(await readJson(response)); } catch { return { status: 'failed', reason: 'invalid_response' }; }
    const count = object(object(result?.groupInfo)?.count);
    if (Array.isArray(result?.failedMessageList) && result.failedMessageList.length) return { status: 'failed', reason: 'provider_rejected' };
    if (count?.registeredSuccess !== 1 || (typeof count.registeredFailed === 'number' && count.registeredFailed !== 0)) {
      return { status: 'failed', reason: 'invalid_response' };
    }
    return { status: 'accepted' };
  } catch { return { status: 'skipped', reason: 'quota_unavailable' }; }
}

export async function notifyNewConsultationSms() {
  const result = await sendAdminSms('consultation');
  if (result.status !== 'accepted' && !(result.status === 'skipped' && ['disabled', 'not_production'].includes(result.reason))) {
    // Never log provider bodies, errors, recipients, Authorization, or credentials.
    console.warn('Formit consultation SMS', { status: result.status, reason: result.reason });
  }
}
