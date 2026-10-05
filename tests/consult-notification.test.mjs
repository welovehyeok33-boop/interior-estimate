import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

function load(path, deps, globals = {}) {
  const exports = {};
  const code = ts.transpileModule(readFileSync(new URL('../src/' + path, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  runInNewContext(code, { exports, console: { error() {} }, require: name => {
    if (!(name in deps)) throw new Error(name);
    return deps[name];
  }, ...globals });
  return exports;
}
const id = 'd7c73c82-c9d5-4d68-b8d1-40d788639156';
function mail(env = {}, statuses = [200]) {
  const calls = [];
  const api = load('lib/consultNotification.ts', { 'server-only': {} }, {
    process: { env: { VERCEL_ENV: 'production', RESEND_API_KEY: 'fake-test-key', CONSULT_NOTIFY_FROM: 'notify@example.com', CONSULT_NOTIFY_TO: 'owner@example.com', ...env } },
    AbortSignal, setTimeout: callback => callback(), fetch: async (url, options) => {
      calls.push({ url, options });
      const status = statuses[Math.min(calls.length - 1, statuses.length - 1)];
      if (status === 0) throw new Error('network');
      return { ok: status === 200, status };
    },
  });
  return { ...api, calls };
}
test('mail is production/config gated, no applicant data in payload', async () => {
  for (const env of [{ VERCEL_ENV: 'preview' }, { RESEND_API_KEY: '' }, { CONSULT_NOTIFY_TO: 'bad\naddress' }]) {
    const s = mail(env); await s.notifyConsultation(id); assert.equal(s.calls.length, 0);
  }
  const s = mail(); await s.notifyConsultation(id);
  assert.equal(s.calls.length, 1);
  const body = JSON.parse(s.calls[0].options.body);
  assert.deepEqual(body.to, ['owner@example.com']);
  assert.ok(body.text.includes('https://form.it.kr/admin'));
  assert.equal(body.text.includes(id), false);
  assert.equal(s.calls[0].options.headers['Idempotency-Key'], 'consult-notification/' + id);
});
test('transient failures retry same payload/key, permanent rejection stops, network failures are contained', async () => {
  for (const statuses of [[429, 500, 200], [0, 0, 0]]) {
    const s = mail({}, statuses); await s.notifyConsultation(id); assert.equal(s.calls.length, 3);
    assert.equal(new Set(s.calls.map(c => c.options.body)).size, 1);
    assert.equal(new Set(s.calls.map(c => c.options.headers['Idempotency-Key'])).size, 1);
  }
  const s = mail({}, [403]); await s.notifyConsultation(id); assert.equal(s.calls.length, 1);
});
test('only new saved applications schedule notification; mail/scheduling failure never rejects saved application', async () => {
  for (const code of [null, '23505', 'database_down']) {
    for (const schedulingFails of [false, true]) {
      const callbacks = [];
      const route = load('app/api/consultations/route.ts', {
        '@/lib/serverDb': { serverDb: () => ({ from: () => ({ insert: async () => ({ error: code ? { code } : null }) }) }) },
        '@/lib/serverAuth': { sameOrigin: () => true, isAdmin: async () => true, rateLimit: async () => true, apiJson: (b, status = 200) => Response.json(b, { status }) },
        '@/lib/intakeValidation': { CONSENT_VERSION: 'test', validateConsult: () => null },
        '@/lib/estimateRegion': { serializeLeadRegion: () => 'test' },
        '@/lib/serverAnalytics': { visitorIdentity: async () => null },
        'next/server': { after: cb => { if (schedulingFails) throw new Error('schedule'); callbacks.push(cb); } },
        '@/lib/consultNotification': { notifyConsultation: async () => { throw new Error('mail failure'); } },
      });
      const r = await route.POST(new Request('https://form.it.kr/api/consultations', { method: 'POST', body: JSON.stringify({ submissionId: id, name: 'fixture', phone: '01012345678' }) }));
      assert.equal(r.status, code === 'database_down' ? 503 : 200);
      assert.equal(callbacks.length, !code && !schedulingFails ? 1 : 0);
      for (const cb of callbacks) await cb();
    }
  }
});
