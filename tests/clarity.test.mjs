import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import * as clarity from '../src/lib/clarity.ts';
import * as preference from '../src/lib/trafficPreference.ts';
import * as partnerPortal from '../src/lib/partnerPortal.ts';

function load(file, deps, globals = {}) {
  const code = ts.transpileModule(readFileSync(new URL('../src/' + file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports = {};
  runInNewContext(code, { exports, require: name => { if (!(name in deps)) throw new Error(name); return deps[name]; }, ...globals });
  return exports;
}
const settle = async () => { for (let i = 0; i < 30; i++) await Promise.resolve(); };
function api(env = 'production') {
  const values = new Map(), writes = [];
  const route = load('app/api/analytics/clarity/route.ts', {
    'next/headers': { cookies: async () => ({ get: n => values.has(n) ? { value: values.get(n) } : undefined,
      set: (name, value, options) => { values.set(name, value); writes.push({ name, value, options }); } }) },
    '@/lib/serverAuth': { ADMIN_COOKIE: 'formit_admin_session', apiJson: (b, s = 200) => Response.json(b, { status: s }), sameOrigin: r => r.headers.get('origin') === new URL(r.url).origin },
    '@/lib/trafficPreference': preference, '@/lib/clarity': clarity, '@/lib/partnerPortal': partnerPortal,
  }, { process: { env: { VERCEL_ENV: env, NODE_ENV: 'production' } }, URL });
  return { ...route, values, writes };
}
const request = (body, origin = 'https://form.it.kr') => new Request('https://form.it.kr/api/analytics/clarity', {
  method: 'POST', headers: { origin }, body: JSON.stringify(body),
});
test('Clarity eligibility fails closed on admin, exclusion, preview and noncanonical hosts', async () => {
  const s = api(), r = new Request('https://form.it.kr/api/analytics/clarity');
  assert.deepEqual(await (await s.GET(r)).json(), { eligible: true, consent: null });
  for (const cookie of ['formit_admin_session', preference.TRAFFIC_EXCLUSION_COOKIE, partnerPortal.PARTNER_PORTAL_COOKIE]) {
    s.values.set(cookie, '1'); assert.equal((await (await s.GET(r)).json()).eligible, false); s.values.clear();
  }
  assert.equal((await (await api('preview').GET(r)).json()).eligible, false);
  assert.equal((await (await s.GET(new Request('https://preview.vercel.app/api/analytics/clarity'))).json()).eligible, false);
});
test('Clarity consent is explicit, browser-scoped, reversible and HttpOnly', async () => {
  const s = api();
  for (const consent of ['granted', 'denied']) {
    assert.equal((await s.POST(request({ consent }))).status, 200);
    assert.equal((await (await s.GET(new Request('https://form.it.kr/api/analytics/clarity'))).json()).consent, consent);
  }
  assert.equal(s.writes[0].options.httpOnly, true);
  assert.equal(s.writes[0].options.secure, true);
  assert.equal(s.writes[0].options.sameSite, 'lax');
  assert.equal(s.writes[0].options.maxAge, 180 * 86400);
});
test('Clarity consent rejects CSRF, malformed choices and oversized payloads', async () => {
  const s = api();
  assert.equal((await s.POST(request({ consent: 'granted' }, 'https://evil.example'))).status, 403);
  for (const b of [null, {}, [], { consent: true }, { consent: 'yes' }]) assert.equal((await s.POST(request(b))).status, 400);
  assert.equal((await s.POST(request({ consent: 'granted', padding: 'x'.repeat(120) }))).status, 413);
  assert.equal(s.writes.length, 0);
});

function client(config = { eligible: true, consent: null }) {
  const hooks = [], effects = [], cleanups = [], scripts = [], events = new Map(), calls = [], attrs = {};
  let index = 0, path = '/', search = '', reloads = 0, fail = false, delayed;
  const navigator = { doNotTrack: '0', globalPrivacyControl: false };
  const window = { location: { pathname: '/', search: '', hash: '', reload: () => reloads++ },
    addEventListener: (n, f) => events.set(n, f), removeEventListener: n => events.delete(n) };
  const state = initial => { const i = index++; if (!(i in hooks)) hooks[i] = initial; return [hooks[i], v => { hooks[i] = typeof v === 'function' ? v(hooks[i]) : v; }]; };
  const effect = f => { index++; effects.push(f); };
  const view = (type, props) => ({ type, props });
  const component = load('components/ClarityAnalytics.tsx', {
    react: { useState: state, useRef: initial => { const i = index++; return hooks[i] ??= { current: initial }; }, useEffect: effect, useLayoutEffect: effect },
    'react/jsx-runtime': { jsx: view, jsxs: view }, 'next/link': { default: 'a' },
    'next/navigation': { usePathname: () => path, useSearchParams: () => ({ toString: () => search }) },
    '@/components/EstimateLayout': { C: {} }, '@/lib/clarity': clarity,
  }, { navigator, window, AbortController, document: { body: { setAttribute: (n, v) => attrs[n] = v },
    createElement: () => ({}), head: { appendChild: s => scripts.push(s) } },
    fetch: async (_url, options) => { calls.push(options); if (fail) throw new Error();
      if (options?.method === 'POST') config = { ...config, consent: JSON.parse(options.body).consent };
      if (delayed) await delayed;
      return { ok: true, json: async () => config };
    },
  }).default;
  function render(next = path, query = search) {
    cleanups.splice(0).forEach(f => f?.()); effects.length = 0; index = 0;
    path = next; search = query; window.location.pathname = path; window.location.search = search ? '?' + search : '';
    const tree = component(); effects.forEach(f => cleanups.push(f())); return tree;
  }
  return { scripts, events, navigator, window, attrs, calls, render, get reloads() { return reloads; },
    fail: () => fail = true, delay: promise => delayed = promise };
}
test('Clarity never loads before consent, on rejection, exclusion, DNT/GPC or private/query URLs', async () => {
  for (const variant of ['unset', 'denied', 'excluded', 'dnt', 'gpc', 'admin', 'result', 'query', 'hash', 'failure']) {
    const h = client({ eligible: variant !== 'excluded', consent: variant === 'unset' ? null : variant === 'denied' ? 'denied' : 'granted' });
    if (variant === 'dnt') h.navigator.doNotTrack = '1';
    if (variant === 'gpc') h.navigator.globalPrivacyControl = true;
    if (variant === 'hash') h.window.location.hash = '#private';
    if (variant === 'failure') h.fail();
    h.render(variant === 'admin' ? '/admin' : variant === 'result' ? '/estimate/detail/step5' : '/', variant === 'query' ? 'phone=01012345678' : '');
    await settle(); assert.equal(h.scripts.length, 0, variant);
  }
});
test('opt-in queues analytics consent with ads denied; masks before loading once, stops on private navigation', async () => {
  const h = client({ eligible: true, consent: 'granted' });
  h.render('/consult/step4'); await settle();
  assert.equal(h.scripts.length, 1);
  assert.equal(h.scripts[0].src, 'https://www.clarity.ms/tag/z972urj8pg');
  assert.equal(h.attrs['data-clarity-mask'], 'true');
  assert.equal(h.window.clarity.q[0][1].analytics_Storage, 'granted');
  assert.equal(h.window.clarity.q[0][1].ad_Storage, 'denied');
  h.render('/'); await settle(); assert.equal(h.scripts.length, 1);
  h.render('/admin'); await settle();
  assert.equal(h.reloads, 1);
  assert.equal(h.window.clarity.q.some(args => args[0] === 'stop'), true);
});
test('revocation and analytics exclusion stop and unload running SDK', async () => {
  const h = client({ eligible: true, consent: 'granted' });
  h.render(); await settle();
  h.events.get(clarity.CLARITY_PREFERENCE_EVENT)();
  assert.equal(h.reloads, 1);
  assert.equal(h.window.clarity.q.at(-2)[1].analytics_Storage, 'denied');
  assert.equal(h.window.clarity.q.at(-1)[0], 'stop');
});
test('a stale eligibility response cannot start recording after navigating to admin', async () => {
  let release; const h = client({ eligible: true, consent: 'granted' });
  h.delay(new Promise(resolve => release = resolve));
  h.render(); h.render('/admin'); release(); await settle();
  assert.equal(h.scripts.length, 0);
});
function buttons(tree) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap(buttons);
  return [...(tree.type === 'button' ? [tree] : []), ...buttons(tree.props?.children)];
}
test('visitor choice persists before loading; rejection never loads; privacy withdrawal unloads', async () => {
  for (const consent of ['granted', 'denied']) {
    const h = client(); h.render(); await settle();
    const tree = h.render(); await settle();
    const choice = buttons(tree).find(b => b.props.children === (consent === 'granted' ? '분석 허용' : '거부'));
    assert.ok(choice); choice.props.onClick(); await settle();
    assert.equal(JSON.parse(h.calls.find(c => c?.method === 'POST').body).consent, consent);
    h.render(); await settle(); assert.equal(h.scripts.length, consent === 'granted' ? 1 : 0);
    if (consent === 'granted') {
      const privacy = h.render('/privacy'); await settle();
      buttons(privacy).find(b => b.props.children === '거부').props.onClick(); await settle();
      assert.ok(h.reloads >= 1);
      assert.equal(h.window.clarity.q.some(args => args[0] === 'stop'), true);
    }
  }
});
test('root mask covers restored form summaries and no customer identifiers are sent', () => {
  const layout = readFileSync(new URL('../src/app/layout.tsx', import.meta.url), 'utf8');
  assert.match(layout, /<body data-clarity-mask="true"/);
  const component = readFileSync(new URL('../src/components/ClarityAnalytics.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(component, /clarity\?\.\('identify'|localStorage|sessionStorage|consultStore|estimateStore/);
});
