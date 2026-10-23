import 'server-only';
import { createHmac, randomBytes } from 'node:crypto';
import { serverDb } from './serverDb';
import { buildConsultationSms, fitsShortSms, type ConsultationSmsSummary } from './consultationSms';

const API_ORIGIN = 'https://api.solapi.com';
const REQUEST_TIMEOUT = 7000;
const MAX_UNIT_COST = 20;
export const TEST_SMS = buildConsultationSms({ buildingType: 'commercial', commercialType: 'office',
  commercialSub: '일반 오피스', area: 28, budget: '3000' }, 'test') ?? '';

type SmsConfig = { key: string; secret: string; from: string; to: string; dailyLimit: number };
type SkipReason = 'disabled' | 'not_production' | 'invalid_config' | 'daily_limit' | 'test_limit' | 'quota_unavailable';
type FailureReason = 'price_unavailable' | 'price_limit' | 'provider_rejected' | 'invalid_response' | 'invalid_message';
type SmsPricing = { status: 'ok'; unitCost: number } | { status: 'failed';
  reason: 'configuration' | 'http' | 'network' | 'format' | 'limit'; httpStatus?: number; shape?: 'json' | 'array' | 'country' | 'sms' };
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

async function checkPrice(settings: SmsConfig): Promise<SmsPricing> {
  let response: Response;
  try {
    response = await fetch(API_ORIGIN + '/pricing/v1/messaging?countryId=82&serviceMethod=MT', { method: 'GET',
      headers: { Authorization: authorization(settings) }, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(REQUEST_TIMEOUT) });
  } catch { return { status: 'failed', reason: 'network' }; }
  if (!response.ok) return { status: 'failed', reason: 'http', httpStatus: response.status };
  let data: unknown;
  try { data = await readJson(response); } catch { return { status: 'failed', reason: 'format', shape: 'json' }; }
  const price = object(data);
  if (Array.isArray(data)) return { status: 'failed', reason: 'format', shape: 'array' };
  if (price?.countryId !== '82') return { status: 'failed', reason: 'format', shape: 'country' };
  if (typeof price.sms !== 'number' || !Number.isFinite(price.sms) || price.sms <= 0) {
    return { status: 'failed', reason: 'format', shape: 'sms' };
  }
  if (Math.ceil(price.sms * 1.1) > MAX_UNIT_COST) return { status: 'failed', reason: 'limit' };
  return { status: 'ok', unitCost: Math.round(price.sms * 1.1 * 100) / 100 };
}

// A free, authenticated GET can diagnose configuration/price without consuming a test
// or exposing a provider body, credential, account identifier, or full phone number.
export async function smsPricingStatus(): Promise<SmsPricing> {
  const settings = config();
  return 'reason' in settings ? { status: 'failed', reason: 'configuration' } : checkPrice(settings.value);
}

export async function sendAdminSms(kind: 'consultation' | 'test', summary?: ConsultationSmsSummary): Promise<SmsOutcome> {
  const settings = config();
  if ('reason' in settings) return { status: 'skipped', reason: settings.reason };
  const value = settings.value;
  try {
    const text = kind === 'test' ? TEST_SMS : summary ? buildConsultationSms(summary) : null;
    if (!text || !fitsShortSms(text)) return { status: 'failed', reason: 'invalid_message' };
    const pricing = await checkPrice(value);
    if (pricing.status !== 'ok') return { status: 'failed', reason: pricing.reason === 'limit' ? 'price_limit' : 'price_unavailable' };
    // Persistent, atomic limits use the existing service-role-only RPC, not instance memory.
    // Claim only after the free preflight succeeds. An ambiguous paid attempt consumes
    // this guard permanently for this 24h window; never retry a potentially accepted POST.
    // A new, explicitly approved template can be tested without deleting old guards.
    // The same fixed test text stays single-attempt across instances and deployments.
    if (kind === 'test') {
      const once = await consume(value, 'test-send:' + TEST_SMS, 1);
      if (once !== 'allowed') return { status: 'skipped', reason: once === 'blocked' ? 'test_limit' : 'quota_unavailable' };
    }
    const day = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const quota = await consume(value, 'daily:' + day, value.dailyLimit);
    if (quota !== 'allowed') return { status: 'skipped', reason: quota === 'blocked' ? 'daily_limit' : 'quota_unavailable' };

    let response: Response;
    try {
      // Exactly one fixed recipient and a length-checked, allowlisted summary. No names,
      // phones, free text, automatic LMS, charging API, or retry after an ambiguous POST.
      response = await fetch(API_ORIGIN + '/messages/v4/send-many/detail', { method: 'POST',
        headers: { Authorization: authorization(value), 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ from: value.from, to: value.to, type: 'SMS', autoTypeDetect: false,
          text }], strict: true, allowDuplicates: false, showMessageList: true }),
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

export async function notifyNewConsultationSms(summary: ConsultationSmsSummary) {
  const result = await sendAdminSms('consultation', summary);
  if (result.status !== 'accepted' && !(result.status === 'skipped' && ['disabled', 'not_production'].includes(result.reason))) {
    // Never log provider bodies, errors, recipients, Authorization, or credentials.
    console.warn('Formit consultation SMS', { status: result.status, reason: result.reason });
  }
}
