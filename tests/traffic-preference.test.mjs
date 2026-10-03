import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import * as preference from '../src/lib/trafficPreference.ts';
import * as attribution from '../src/lib/attribution.ts';
import * as details from '../src/lib/trafficDetails.ts';
import * as serverDetails from '../src/lib/serverTrafficDetails.ts';
import * as analytics from '../src/lib/analytics.ts';

function setup() {
  const values = new Map();
  const writes = [];
  const jar = { get: name => values.has(name) ? { value: values.get(name) } : undefined,
    set: (name, value, options) => { values.set(name, value); writes.push({ name, value, options }); } };
  const deps = {
    'next/headers': { cookies: async () => jar }, 'server-only': {},
    '@/lib/trafficPreference': preference, './trafficPreference': preference,
    './analytics': {}, 'node:crypto': {},
    '@/lib/attribution': attribution,
    '@/lib/trafficDetails': details, '@/lib/serverTrafficDetails': serverDetails, '@/lib/analytics': analytics,
    '@/lib/serverAuth': {
      apiJson: (body, status = 200) => Response.json(body, { status }),
      sameOrigin: r => r.headers.get('origin') === new URL(r.url).origin,
      isAdmin: async () => { throw new Error('Excluded requests must skip authentication and DB'); },
    },
    '@/lib/serverDb': { serverDb: () => { throw new Error('Must not touch DB'); } },
  };
  function load(path) {
    const source = readFileSync(new URL('../src/' + path, import.meta.url), 'utf8');
    const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    const exports = {};
    runInNewContext(output, { exports, process: { env: { NODE_ENV: 'production' } }, require: name => {
      if (!(name in deps)) throw new Error('Unexpected dependency ' + name);
      return deps[name];
    } });
    return exports;
  }
  const identities = load('lib/serverAnalytics.ts');
  deps['@/lib/serverAnalytics'] = identities;
  return { values, writes, identities, setting: load('app/api/analytics/preference/route.ts'), tracking: load('app/api/analytics/route.ts') };
}
function request(body, origin = 'https://form.it.kr') {
  return new Request('https://form.it.kr/api/analytics/preference', { method: 'POST', headers: { origin }, body: JSON.stringify(body) });
}
test('exclude survives without admin auth; blocks visits and conversion identities, can be reversed', async () => {
  const s = setup();
  assert.equal((await s.setting.GET()).status, 200);
  assert.equal((await (await s.setting.GET()).json()).excluded, false);
  assert.equal((await s.setting.POST(request({ excluded: true }))).status, 200);
  assert.equal((await (await s.setting.GET()).json()).excluded, true);
  assert.equal(s.writes[0].options.maxAge, 31536000);
  assert.equal(s.writes[0].options.httpOnly, true);
  assert.equal(s.writes[0].options.secure, true);
  s.values.set('formit_visitor', 'previous-visitor');
  assert.equal(await s.identities.visitorIdentity(), null);
  assert.equal(await s.identities.visitorIdentity(true), null);
  assert.equal((await (await s.tracking.POST(request({ kind: 'visit' }))).json()).skipped, true);
  await s.setting.POST(request({ excluded: false }));
  assert.equal(await s.identities.isTrafficExcluded(), false);
});
test('preference rejects foreign origin, invalid inputs and oversized payloads', async () => {
  const s = setup();
  assert.equal((await s.setting.POST(request({ excluded: true }, 'https://other.example'))).status, 403);
  for (const body of [null, {}, { excluded: 'true' }, { excluded: 1 }]) assert.equal((await s.setting.POST(request(body))).status, 400);
  assert.equal((await s.setting.POST(request({ excluded: true, padding: 'x'.repeat(101) }))).status, 413);
  assert.equal(s.writes.length, 0);
});
