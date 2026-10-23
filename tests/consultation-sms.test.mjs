import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import * as crypto from 'node:crypto';
import ts from 'typescript';
import * as validation from '../src/lib/intakeValidation.ts';
import * as region from '../src/lib/estimateRegion.ts';

const source = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
function load(path, deps, globals = {}) {
  const exports = {};
  runInNewContext(ts.transpileModule(source(path), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText,
    { exports, require: name => { if (!(name in deps)) throw new Error('Unexpected test dependency: ' + name); return deps[name]; }, ...globals });
  return exports;
}
const env = { FORMIT_SMS_ENABLED: 'true', NODE_ENV: 'production', VERCEL_ENV: 'production',
  SOLAPI_API_KEY: 'fixture-key', SOLAPI_API_SECRET: 'fixture-secret-not-real-1234567890',
  SOLAPI_FROM_NUMBER: '01012345678', SOLAPI_ADMIN_NUMBER: '01098765432', FORMIT_SMS_DAILY_LIMIT: '20' };
const accepted = () => Response.json({ groupInfo: { count: { registeredSuccess: 1, registeredFailed: 0 } }, failedMessageList: [] });

function sms(options = {}) {
  const calls = [], quotas = [], warnings = [], timeouts = [];
  const db = { rpc: async (name, args) => {
    quotas.push({ name, ...args });
    if (options.quotaThrow) throw new Error('private database detail');
    return options.quota ? options.quota(quotas.length, args) : { data: true, error: null };
  } };
  const request = async (url, init) => {
    calls.push({ url, init });
    if (init.method === 'GET') {
      if (options.pricingThrow) throw new Error('private pricing failure');
      return options.pricing ? options.pricing() : Response.json({ countryId: '82', sms: 18 });
    }
    if (options.postThrow) throw new Error('private network detail with Authorization');
    return options.post ? options.post() : accepted();
  };
  const module = load('src/lib/serverSms.ts', { 'server-only': {}, 'node:crypto': crypto, './serverDb': { serverDb: () => db } },
    { process: { env: { ...env, ...options.env } }, fetch: request, Date,
      AbortSignal: { timeout: ms => { timeouts.push(ms); return AbortSignal.timeout(ms); } },
      console: { warn: (...args) => warnings.push(args) } });
  return { ...module, calls, quotas, warnings, timeouts };
}

test('only explicitly enabled production can use complete private SMS configuration', async () => {
  for (const [patch, reason] of [[{ FORMIT_SMS_ENABLED: undefined }, 'disabled'], [{ FORMIT_SMS_ENABLED: 'false' }, 'disabled'],
    [{ VERCEL_ENV: 'preview' }, 'not_production'], [{ VERCEL_ENV: undefined }, 'not_production'], [{ NODE_ENV: 'development' }, 'not_production'],
    [{ SOLAPI_API_KEY: '' }, 'invalid_config'], [{ SOLAPI_API_SECRET: '' }, 'invalid_config'],
    [{ SOLAPI_FROM_NUMBER: 'bad' }, 'invalid_config'], [{ SOLAPI_ADMIN_NUMBER: '01098765432,01012345678' }, 'invalid_config'],
    [{ FORMIT_SMS_DAILY_LIMIT: '0' }, 'invalid_config'], [{ FORMIT_SMS_DAILY_LIMIT: '51' }, 'invalid_config'], [{ FORMIT_SMS_DAILY_LIMIT: '2.5' }, 'invalid_config']]) {
    const s = sms({ env: patch });
    const result = await s.sendAdminSms('consultation');
    assert.equal(result.status, 'skipped'); assert.equal(result.reason, reason);
    assert.equal(s.quotas.length, 0); assert.equal(s.calls.length, 0);
    assert.equal(s.smsReadiness().ready, false);
  }
});

test('readiness only exposes a masked recipient and safe operational status', () => {
  const s = sms(); const result = s.smsReadiness();
  assert.equal(result.ready, true); assert.equal(result.recipient, '끝자리 5432'); assert.equal(result.dailyLimit, 20);
  for (const privateValue of [env.SOLAPI_API_KEY, env.SOLAPI_API_SECRET, env.SOLAPI_FROM_NUMBER, env.SOLAPI_ADMIN_NUMBER]) assert.ok(!JSON.stringify(result).includes(privateValue));
});

test('uses fresh HMAC signatures, fixed API URLs, timeouts, one fixed recipient and explicit SMS only', async () => {
  const s = sms(); assert.equal((await s.sendAdminSms('consultation')).status, 'accepted');
  assert.equal(s.calls.length, 2); assert.equal(s.calls[0].url, 'https://api.solapi.com/pricing/v1/messaging');
  assert.equal(s.calls[1].url, 'https://api.solapi.com/messages/v4/send-many/detail');
  const salts = [];
  for (const call of s.calls) {
    assert.equal(call.init.cache, 'no-store'); assert.equal(call.init.redirect, 'error');
    const match = call.init.headers.Authorization.match(/^HMAC-SHA256 apiKey=([^,]+), date=([^,]+), salt=([^,]+), signature=([a-f0-9]+)$/);
    assert.ok(match); assert.equal(match[1], env.SOLAPI_API_KEY); assert.equal(match[3].length, 32);
    assert.equal(match[4], crypto.createHmac('sha256', env.SOLAPI_API_SECRET).update(match[2] + match[3]).digest('hex'));
    salts.push(match[3]);
  }
  assert.notEqual(salts[0], salts[1]); assert.deepEqual(s.timeouts, [7000, 7000]);
  const payload = JSON.parse(s.calls[1].init.body);
  assert.deepEqual(payload.messages, [{ from: env.SOLAPI_FROM_NUMBER, to: env.SOLAPI_ADMIN_NUMBER, type: 'SMS', autoTypeDetect: false, text: s.CONSULTATION_SMS }]);
  assert.equal(payload.strict, true); assert.equal(payload.allowDuplicates, false); assert.equal(payload.showMessageList, true);
  assert.equal(s.quotas[0].name, 'consume_request_limit'); assert.equal(s.quotas[0].max_hits, 20); assert.equal(s.quotas[0].window_seconds, 86400);
  assert.match(s.quotas[0].bucket, /^[a-f0-9]{64}$/);
});

test('both fixed texts conservatively fit SMS and contain no customer fields or long-message options', () => {
  const s = sms();
  for (const text of [s.CONSULTATION_SMS, s.TEST_SMS]) {
    assert.ok(Buffer.byteLength(text, 'utf8') <= 90, 'Even UTF-8 size fits the EUC-KR SMS limit');
    assert.match(text, /https:\/\/form\.it\.kr\/admin$/);
    assert.doesNotMatch(text, /010|고객명|#{|\$\{/);
  }
  assert.notEqual(s.CONSULTATION_SMS, s.TEST_SMS);
});

test('unknown, malformed or too-expensive prices never reach a paid POST', async () => {
  for (const options of [{ pricingThrow: true }, { pricing: () => new Response('', { status: 503 }) },
    { pricing: () => new Response('not-json') }, { pricing: () => Response.json({ sms: 18 }) },
    { pricing: () => Response.json({ countryId: '1', sms: 1 }) }, { pricing: () => Response.json({ countryId: '82', sms: '18' }) },
    { pricing: () => Response.json({ countryId: '82', sms: 0 }) }, { pricing: () => Response.json({ countryId: '82', sms: 20 }) },
    { pricing: () => Response.json({ countryId: '82', sms: 18.19 }) }]) {
    const s = sms(options); assert.equal((await s.sendAdminSms('test')).status, 'failed');
    assert.equal(s.calls.length, 1); assert.equal(s.calls[0].init.method, 'GET');
  }
});

test('daily and test limits are persistent and fail closed before contacting SOLAPI', async () => {
  for (const [kind, options, reason] of [['consultation', { quota: () => ({ data: false }) }, 'daily_limit'],
    ['test', { quota: () => ({ data: false }) }, 'test_limit'],
    ['consultation', { quota: () => ({ data: null, error: { message: 'private' } }) }, 'quota_unavailable'],
    ['test', { quotaThrow: true }, 'quota_unavailable']]) {
    const s = sms(options); const result = await s.sendAdminSms(kind);
    assert.equal(result.status, 'skipped'); assert.equal(result.reason, reason); assert.equal(s.calls.length, 0);
  }
  const once = sms(); assert.equal((await once.sendAdminSms('test')).status, 'accepted');
  assert.deepEqual(once.quotas.map(q => q.max_hits), [1, 20]);
  assert.notEqual(once.quotas[0].bucket, once.quotas[1].bucket);
});

test('parallel test requests can consume the atomic guard only once', async () => {
  let tests = 0;
  const s = sms({ quota: (_n, args) => ({ data: args.max_hits === 1 ? ++tests === 1 : true }) });
  const results = await Promise.all([s.sendAdminSms('test'), s.sendAdminSms('test')]);
  assert.equal(results.filter(r => r.status === 'accepted').length, 1);
  assert.equal(s.calls.filter(c => c.init.method === 'POST').length, 1);
});

test('ambiguous or rejected paid requests never retry, leak errors or claim delivery', async () => {
  for (const [options, status, reason] of [[{ postThrow: true }, 'unknown', 'network'],
    [{ post: () => new Response('', { status: 500 }) }, 'failed', 'provider_rejected'],
    [{ post: () => Response.json({ failedMessageList: [{ statusCode: 'failed', text: 'private' }] }) }, 'failed', 'provider_rejected'],
    [{ post: () => new Response('bad-json') }, 'failed', 'invalid_response'],
    [{ post: () => Response.json({ groupInfo: { count: { registeredSuccess: 0 } } }) }, 'failed', 'invalid_response']]) {
    const s = sms(options); const result = await s.sendAdminSms('consultation');
    assert.equal(result.status, status); assert.equal(result.reason, reason);
    assert.equal(s.calls.filter(c => c.init.method === 'POST').length, 1);
    assert.doesNotMatch(JSON.stringify(result), /private|Authorization|fixture|010/);
  }
});

test('notification logs contain only safe enums and suppress normal disabled/non-production states', async () => {
  for (const patch of [{ FORMIT_SMS_ENABLED: 'false' }, { VERCEL_ENV: 'preview' }]) {
    const s = sms({ env: patch }); await s.notifyNewConsultationSms(); assert.equal(s.warnings.length, 0);
  }
  const s = sms({ postThrow: true }); await s.notifyNewConsultationSms(); assert.equal(s.warnings.length, 1);
  assert.doesNotMatch(JSON.stringify(s.warnings), /private|Authorization|fixture|010|HMAC/);
});

const application = { region: 'seoul', buildingType: 'residential', residentialGrade: 'standard', area: 28, schedule: '1month', budget: 'unknown',
  name: '검증용', phone: '01012345678', agreed: true, consentVersion: validation.CONSENT_VERSION, submissionId: 'e1a1cf87-8651-445d-b4f3-37eb7186f89b' };
const request = (body = application, origin = 'https://form.it.kr') => new Request('https://form.it.kr/api/consultations', {
  method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
function intake(options = {}) {
  const scheduled = [], inserts = [], sends = [], warnings = [];
  const result = load('src/app/api/consultations/route.ts', {
    '@/lib/serverDb': { serverDb: () => ({ from: () => ({ insert: async row => { inserts.push(row); return { error: options.error || null }; } }) }) },
    '@/lib/serverAuth': { sameOrigin: r => r.headers.get('origin') === new URL(r.url).origin, isAdmin: async () => false,
      rateLimit: async () => options.limited !== true, apiJson: (body, status = 200) => Response.json(body, { status }) },
    '@/lib/intakeValidation': validation, '@/lib/estimateRegion': region, '@/lib/serverAnalytics': { visitorIdentity: async () => null },
    'next/server': { after: callback => { if (options.scheduleThrow) throw new Error('private'); scheduled.push(callback); } },
    '@/lib/serverSms': { notifyNewConsultationSms: async () => { sends.push(true); if (options.sendThrow) throw new Error('private'); } },
  }, { Date, console: { warn: (...args) => warnings.push(args) } });
  return { ...result, scheduled, inserts, sends, warnings };
}

test('successful insert acknowledges before notification, with no customer object sent to SMS helper', async () => {
  const s = intake(); const result = await s.POST(request());
  assert.equal(result.status, 200); assert.equal(s.inserts.length, 1); assert.equal(s.scheduled.length, 1); assert.equal(s.sends.length, 0);
  await s.scheduled[0](); assert.equal(s.sends.length, 1);
});

test('duplicate insert, invalid request, rate limit and storage failures never schedule SMS', async () => {
  for (const [options, req, status] of [[{ error: { code: '23505' } }, request(), 200],
    [{ error: { code: 'storage_error' } }, request(), 503], [{}, request(application, 'https://other.test'), 403],
    [{}, request({ ...application, phone: 'bad' }), 400], [{ limited: true }, request(), 429]]) {
    const s = intake(options); assert.equal((await s.POST(req)).status, status); assert.equal(s.scheduled.length, 0); assert.equal(s.sends.length, 0);
  }
});

test('notification scheduling or execution failures cannot change saved inquiry success', async () => {
  const a = intake({ scheduleThrow: true }); assert.equal((await a.POST(request())).status, 200); assert.equal(a.inserts.length, 1);
  const b = intake({ sendThrow: true }); assert.equal((await b.POST(request())).status, 200); await b.scheduled[0](); assert.equal(b.inserts.length, 1);
  assert.doesNotMatch(JSON.stringify([...a.warnings, ...b.warnings]), /private|010|검증용/);
});

function admin(auth = true) {
  const sends = [];
  const result = load('src/app/api/admin/sms/route.ts', {
    '@/lib/serverAuth': { isAdmin: async () => auth, sameOrigin: r => r.headers.get('origin') === new URL(r.url).origin,
      apiJson: (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } }) },
    '@/lib/serverSms': { smsReadiness: () => ({ ready: true, recipient: '끝자리 5432', dailyLimit: 20 }),
      sendAdminSms: async kind => { sends.push(kind); return { status: 'accepted' }; } },
  });
  return { ...result, sends };
}
const adminRequest = (body, origin = 'https://form.it.kr') => new Request('https://form.it.kr/api/admin/sms', { method: 'POST', headers: { origin }, body: JSON.stringify(body) });
test('diagnostics require admin authentication, same origin, explicit test confirmation and no recipient override', async () => {
  const a = admin(false); assert.equal((await a.GET()).status, 401); assert.equal((await a.POST(adminRequest({ confirmTest: true }))).status, 401); assert.equal(a.sends.length, 0);
  const s = admin(); assert.equal((await s.POST(adminRequest({ confirmTest: true }, 'https://other.test'))).status, 403);
  for (const body of [{}, { confirmTest: false }, { confirmTest: true, to: '01011112222' }, []]) assert.equal((await s.POST(adminRequest(body))).status, 400);
  assert.equal(s.sends.length, 0); const response = await s.POST(adminRequest({ confirmTest: true })); assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store'); assert.deepEqual(s.sends, ['test']);
});

test('browser diagnostics contain no server imports, secrets or real contact details', () => {
  const page = source('src/app/admin/sms/page.tsx');
  assert.match(page, /^"use client"/); assert.match(source('src/lib/serverSms.ts'), /^import 'server-only'/);
  assert.doesNotMatch(page, /SOLAPI_API|serverSms|010\d{8}|process\.env/);
  assert.match(page, /disabled=\{!settings\.ready \|\| busy \|\| attempted\}/);
  assert.match(page, /JSON\.stringify\(\{ confirmTest: true \}\)/);
  assert.match(page, /최대 20원/);
});
