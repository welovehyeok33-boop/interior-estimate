import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import * as periods from '../src/lib/adminStatsPeriod.ts';
import * as trafficDetails from '../src/lib/trafficDetails.ts';
import { createClient } from '@supabase/supabase-js';

function setup(admin = true, failed = false, countFailed = false) {
  const calls = [];
  const counts = [];
  const client = createClient('https://database.example', 'test-key', { global: { fetch: async (input, options) => {
    counts.push({ url: new URL(input), method: options.method });
    return new Response(null, countFailed ? { status: 500 } : { headers: { 'Content-Range': '*/3' } });
  } } });
  const deps = {
    '@/lib/trafficDetails': trafficDetails,
    '@/lib/adminStatsPeriod': { ...periods, parseStatsPeriod: params => periods.parseStatsPeriod(params, new Date('2026-10-22T03:00:00Z')) },
    '@/lib/serverAuth': {
      isAdmin: async () => admin,
      sameOrigin: r => r.headers.get('origin') === new URL(r.url).origin,
      apiJson: (body, status = 200) => Response.json(body, { status }),
    },
    '@/lib/serverDb': { serverDb: () => ({ from: client.from.bind(client), rpc: async (name, args) => {
      calls.push({ name, args });
      return { data: name === 'admin_dashboard' ? { visitors: 10 } : { enabled: true }, error: failed ? 'unavailable' : null };
    } }) },
  };
  const source = readFileSync(new URL('../src/app/api/admin/analytics/route.ts', import.meta.url), 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  runInNewContext(output, { exports, URL, require: name => {
    if (!(name in deps)) throw new Error('Unexpected import ' + name);
    return deps[name];
  } });
  return { ...exports, calls, counts };
}
function patch(body, origin = 'https://form.it.kr') {
  return new Request('https://form.it.kr/api/admin/analytics', { method: 'PATCH', headers: { origin }, body: JSON.stringify(body) });
}

test('admin traffic reads require auth, validate range, combine private reports', async () => {
  const blocked = setup(false);
  assert.equal((await blocked.GET(new Request('https://form.it.kr/api/admin/analytics'))).status, 401);
  assert.equal(blocked.calls.length, 0);
  const s = setup();
  assert.equal((await s.GET(new Request('https://form.it.kr/api/admin/analytics?range=all'))).status, 400);
  const response = await s.GET(new Request('https://form.it.kr/api/admin/analytics?range=yesterday'));
  const { detailCoverage, ...report } = await response.json();
  assert.deepEqual(report, { visitors: 10, details: { enabled: true, consultStages: {
    '/consult': 3, '/consult/step2': 3, '/consult/step3': 3, '/consult/step4': 3,
  } } });
  assert.equal(blocked.counts.length, 0);
  assert.equal(s.counts.length, 4);
  s.counts.forEach(({ url, method }, index) => {
    assert.equal(method, 'HEAD');
    assert.equal(url.pathname, '/rest/v1/traffic_details');
    assert.equal(url.searchParams.get('select'), 'traffic_daily!inner(source)');
    assert.deepEqual(url.searchParams.getAll('day'), ['gte.2026-10-21', 'lte.2026-10-21']);
    assert.equal(url.searchParams.get('pages'), 'cs.{' + trafficDetails.CONSULT_STAGE_PATHS[index] + '}');
    assert.deepEqual(url.searchParams.getAll('traffic_daily.source'), ['not.in.(direct,unknown)', 'neq.']);
  });
  assert.equal(detailCoverage.complete, true);
  assert.equal(s.calls.length, 2);
  for (const call of s.calls) { assert.equal(call.args.p_days, 1); assert.equal(call.args.p_offset, 1); }
});

test('monthly analytics uses exact bounded range RPCs and preserves incomplete-detail coverage', async () => {
  const s = setup();
  const response = await s.GET(new Request('https://form.it.kr/api/admin/analytics?range=month&month=2026-08'));
  assert.equal(response.status, 200);
  assert.deepEqual(s.calls.map(call => call.name), ['admin_dashboard_range', 'admin_traffic_details_range']);
  for (const call of s.calls) assert.deepEqual({ ...call.args }, { p_from: '2026-08-01', p_to: '2026-08-31' });
  assert.deepEqual((await response.json()).detailCoverage, { complete: false, from: null, to: null });
  assert.equal(s.counts.length, 0);
  const current = setup();
  await current.GET(new Request('https://form.it.kr/api/admin/analytics?range=month&month=2026-10'));
  assert.equal(current.calls[0].args.p_to, '2026-10-22');
  const invalid = setup();
  for (const query of ['range=month', 'range=month&month=2026-11', 'range=month&month=2026-13', 'range=month&month=2026-10&month=2026-09']) assert.equal((await invalid.GET(new Request('https://form.it.kr/api/admin/analytics?' + query))).status, 400);
  assert.equal(invalid.calls.length, 0);
  const blocked = setup(false);
  assert.equal((await blocked.GET(new Request('https://form.it.kr/api/admin/analytics?range=month&month=2026-10'))).status, 401);
  assert.equal(blocked.calls.length, 0);
  assert.equal((await setup(true,true).GET(new Request('https://form.it.kr/api/admin/analytics?range=month&month=2026-10'))).status, 503);
});

test('stage count failures leave summary and raw details available', async () => {
  const response = await setup(true, false, true).GET(new Request('https://form.it.kr/api/admin/analytics'));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).details.consultStages, null);
});

test('settings require same origin and auth; malformed inputs never touch database', async () => {
  const s = setup();
  assert.equal((await s.PATCH(patch({ enabled: true, ipEnabled: true }, 'https://other.example'))).status, 403);
  for (const body of [null, {}, { enabled: 'true', ipEnabled: true }]) assert.equal((await s.PATCH(patch(body))).status, 400);
  assert.equal((await s.PATCH(patch({ padding: 'x'.repeat(201) }))).status, 413);
  assert.equal(s.calls.length, 0);
  const blocked = setup(false);
  assert.equal((await blocked.PATCH(patch({ enabled: true, ipEnabled: true }))).status, 401);
  assert.equal(blocked.calls.length, 0);
  assert.equal((await s.PATCH(patch({ enabled: false, ipEnabled: false }))).status, 200);
  assert.equal(s.calls[0].name, 'set_traffic_detail_settings');
  assert.equal(s.calls[0].args.p_enabled, false);
  assert.equal(s.calls[0].args.p_ip_enabled, false);
  assert.equal((await setup(true, true).PATCH(patch({ enabled: true, ipEnabled: true }))).status, 503);
});
