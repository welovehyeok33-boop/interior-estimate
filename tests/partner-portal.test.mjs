import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import * as crypto from 'node:crypto';
import ts from 'typescript';
import * as portal from '../src/lib/partnerPortal.ts';
const id = '12345678-1234-4123-8123-123456789abc', version = '22345678-1234-4123-8123-123456789abc';
const nextVersion = '32345678-1234-4123-8123-123456789abc';
const account = { id, company: '검증 업체', email: 'test@example.invalid', active: true, session_version: version, created_at: '2026-11-06T00:00:00Z' };
const source = { id, created_at: '2026-11-06T00:00:00Z', name: '김민수', phone: '01012345678', region: '서울 강남구 상세주소', building_type: 'commercial', commercial_type: 'office', commercial_sub: '고객이메일@example.com', area: 30, budget: '3000', schedule: '1month', status: 'new', admin_note: '관리자 비밀', memo: '01099998888', space_description: '개인 정보' };
function load(file, deps, globals = {}) {
  const exports = {};
  runInNewContext(ts.transpileModule(readFileSync(new URL('../src/' + file, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText,
    { exports, require: n => { if (!(n in deps)) throw new Error('Unexpected dependency ' + n); return deps[n]; }, URL, Date, Buffer, ...globals });
  return exports;
}
const sessions = load('lib/partnerSession.ts', { 'node:crypto': crypto, './partnerPortal': portal });
const request = (body, origin = 'https://form.it.kr') => new Request('https://form.it.kr/api/partner/session', { method: 'POST', headers: { origin }, body: JSON.stringify(body) });
const get = () => new Request('https://form.it.kr/api/partner/leads');
function harness(options = {}) {
  const calls = [], values = new Map(), writes = [];
  let currentVersion = version;
  const db = () => {
    let signedIn = false;
    return { auth: {
      signInWithPassword: async credentials => { calls.push(['signIn', credentials.email]); signedIn = true; if (options.rotated) currentVersion = nextVersion; return { error: options.badPassword ? {} : null, data: { user: { id, app_metadata: { formit_partner: !options.wrongRole } } } }; },
      admin: { getUserById: async () => ({ data: { user: { id, app_metadata: { formit_partner: !options.wrongRole }, ...(options.banned ? { banned_until: '2099-01-01T00:00:00Z' } : {}) } }, error: null }),
        createUser: async v => { calls.push(['createUser', v]); return { data: { user: { id } }, error: options.duplicate ? {} : null }; },
        deleteUser: async v => { calls.push(['deleteUser', v]); return {}; }, updateUserById: async v => { calls.push(['resetPassword', v]); return { error: null }; } },
    }, from: table => {
      if (signedIn) throw new Error('Never use a password-mutated Supabase client for service-role queries');
      calls.push(['from', table]); const filters = [], query = {}; let action = 'read', payload;
      for (const method of ['select', 'eq', 'gte', 'order', 'limit']) query[method] = (...args) => { calls.push([method, ...args]); if (method === 'eq') filters.push(args); return query; };
      for (const method of ['insert', 'update', 'upsert', 'delete']) query[method] = v => { action = method; payload = v; calls.push([method, v]); return query; };
      function result(single = false) {
        if (options.dbFailure) return { data: null, error: {} };
        if (table === 'partner_portal_accounts') {
          if (options.disabled || filters.some(([k, v]) => k === 'session_version' && v !== currentVersion)) return { data: null, error: null };
          return { data: single ? { ...account, ...(action === 'update' ? payload : {}), session_version: currentVersion } : [account], error: options.insertFailure && action === 'insert' ? {} : null };
        }
        if (table === 'consultations') return { data: options.missingSource ? null : single ? source : [source], error: null };
        if (table === 'partner_lead_publications') return { data: [{ consultation_id: id, published_at: '2026-11-06T00:00:00Z', consultations: source }], error: null };
        throw new Error(table);
      }
      query.maybeSingle = query.single = async () => result(true);
      query.then = resolve => Promise.resolve(result()).then(resolve);
      return query;
    } };
  };
  const deps = {
    'server-only': {}, 'node:crypto': crypto, 'next/headers': { cookies: async () => ({ get: n => values.has(n) ? { value: values.get(n) } : undefined, set: (n, v, config) => { values.set(n, v); writes.push({ name: n, value: v, config }); }, delete: n => values.delete(n) }) },
    './partnerPortal': portal, '@/lib/partnerPortal': portal, './partnerSession': sessions, '@/lib/partnerSession': sessions,
    './serverDb': { serverDb: db }, '@/lib/serverDb': { serverDb: db },
    '@/lib/serverAuth': { isAdmin: async () => options.admin !== false, sameOrigin: r => r.headers.get('origin') === new URL(r.url).origin,
      rateLimit: async (_r, kind) => { calls.push(['rate', kind]); return options.limited !== true; }, apiJson: (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } }) },
  };
  const globals = { process: { env: { SUPABASE_SERVICE_ROLE_KEY: 'test-only-signing-key', NODE_ENV: 'production' } } };
  const server = load('lib/serverPartnerPortal.ts', deps, globals);
  deps['@/lib/serverPartnerPortal'] = server;
  return { calls, values, writes, server, session: load('app/api/partner/session/route.ts', deps, globals), leads: load('app/api/partner/leads/route.ts', deps, globals),
    accounts: load('app/api/admin/partner-portal/route.ts', deps, globals), publishing: load('app/api/admin/partner-leads/route.ts', deps, globals),
    authenticate: () => values.set(portal.PARTNER_PORTAL_COOKIE, sessions.signPartnerSession(id, version, Date.now() + 100000, server.partnerSessionSecret())) };
}
test('partner DTO contains only coarse, allowlisted fields; never names, phone, notes or addresses', () => {
  const row = portal.partnerLead(source, source.created_at), serialized = JSON.stringify(row);
  assert.equal(row.customer, '김 고객님'); assert.equal(row.phone, '***-****-****'); assert.equal(row.region, '서울');
  assert.equal(row.space, '오피스'); assert.equal(row.area, 30); assert.equal(row.budget, '3,000만원');
  for (const secret of ['김민수', source.phone, source.admin_note, source.memo, source.space_description, '강남구', '@example.com']) assert.equal(serialized.includes(secret), false, secret);
  for (const patch of [{ name: 'email@example.com', region: '01099998888', commercial_type: '__proto__', schedule: 'constructor', budget: '01012345678', area: Infinity }, { name: 'x', region: null, area: -1 }]) {
    const dto = portal.partnerLead({ ...source, ...patch }, source.created_at);
    assert.equal(dto.customer, '비공개 고객님'); assert.equal(dto.area, null); assert.equal(dto.region, '지역 협의');
    assert.equal(typeof dto.space, 'string'); assert.equal(typeof dto.schedule, 'string');
  }
  assert.equal(portal.maskedSurname('남궁민수'), '남궁 고객님');
});
test('partner sessions reject tampering, wrong scope, expiry and malformed identities', () => {
  const now = Date.now(), token = sessions.signPartnerSession(id, version, now + 100000, 'secret');
  assert.equal(sessions.readPartnerSession(token, 'secret', now).id, id);
  for (const bad of [token.replace(id, nextVersion), token + 'extra', 'x'.repeat(300), sessions.signPartnerSession(id, version, now - 1, 'secret'), sessions.signPartnerSession(id, version, now + 9 * 3600000, 'secret')]) assert.equal(sessions.readPartnerSession(bad, 'secret', now), null);
  assert.equal(sessions.readPartnerSession(token, 'admin-session-secret', now), null);
});
test('unauthenticated and forged partner visits never query customer data', async () => {
  const h = harness(); assert.equal((await h.leads.GET()).status, 401); assert.equal(h.calls.length, 0);
  h.values.set(portal.PARTNER_PORTAL_COOKIE, 'forged'); assert.equal((await h.leads.GET()).status, 401); assert.equal(h.calls.length, 0);
});
test('every partner read checks active account, version, Auth identity and role', async () => {
  for (const variant of ['disabled', 'wrongRole', 'banned']) {
    const h = harness({ [variant]: true }); h.authenticate(); assert.equal((await h.leads.GET()).status, 401, variant);
    assert.equal(h.calls.some(c => c[0] === 'from' && c[1] === 'partner_lead_publications'), false);
  }
});
test('valid partner sees explicit publications only; query omits phone and private free text', async () => {
  const h = harness(); h.authenticate(); const response = await h.leads.GET(); assert.equal(response.status, 200); assert.equal(response.headers.get('cache-control'), 'no-store');
  const body = await response.json(); assert.equal(body.items.length, 1); assert.equal(body.items[0].customer, '김 고객님');
  const query = h.calls.find(c => c[0] === 'select' && c[1].includes('consultations!inner'))[1];
  assert.doesNotMatch(query, /phone|memo|description|admin_note|\*/);
  assert.ok(h.calls.some(c => c[0] === 'gte' && c[1] === 'consultations.created_at'));
  assert.equal(JSON.stringify(body).includes(source.phone), false);
});
test('login applies same-origin/rate limits and cannot promote an ordinary or suspended account', async () => {
  const valid = { email: account.email, password: 'test-password' };
  const cross = harness(); assert.equal((await cross.session.POST(request(valid, 'https://evil.example'))).status, 403); assert.equal(cross.calls.length, 0);
  for (const [option, expected] of [['limited', 429], ['disabled', 401], ['badPassword', 401], ['wrongRole', 401], ['rotated', 401]]) {
    const h = harness({ [option]: true }); assert.equal((await h.session.POST(request(valid))).status, expected, option); assert.equal(h.writes.length, 0);
  }
  const h = harness(); assert.equal((await h.session.POST(request(valid))).status, 200); assert.equal(h.writes.length, 1);
  assert.equal(h.writes[0].config.httpOnly, true); assert.equal(h.writes[0].config.secure, true); assert.equal(h.writes[0].config.sameSite, 'strict');
  assert.equal(h.writes[0].config.maxAge, 8 * 3600); assert.equal(h.writes[0].value.includes(account.email), false);
  assert.ok(h.calls.some(c => c[0] === 'rate' && c[1] === 'partner_login'));
  assert.equal((await h.session.DELETE(request({}))).status, 200); assert.equal(h.values.has(portal.PARTNER_PORTAL_COOKIE), false);
});
test('admin account and publishing APIs deny partner/anonymous access and CSRF', async () => {
  const h = harness({ admin: false });
  for (const route of [h.accounts, h.publishing]) {
    assert.equal((await route.GET(get())).status, 401); assert.equal((await route.POST(request({}))).status, 401);
  }
  assert.equal((await h.accounts.PATCH(request({}))).status, 401); assert.equal(h.calls.length, 0);
  const a = harness();
  for (const route of [a.accounts, a.publishing]) assert.equal((await route.POST(request({}, 'https://evil.example'))).status, 403);
  assert.equal((await a.accounts.PATCH(request({}, 'https://evil.example'))).status, 403); assert.equal(a.calls.length, 0);
});
test('admin issuance returns password only once, never on list; invalid account input is rejected', async () => {
  const h = harness();
  assert.equal((await h.accounts.POST(request({ email: 'bad', company: 'a' }))).status, 400);
  const issued = await h.accounts.POST(request({ email: account.email, company: account.company })); assert.equal(issued.status, 201);
  assert.ok((await issued.json()).password.length >= 24);
  assert.equal(h.calls.find(c => c[0] === 'createUser')[1].app_metadata.formit_partner, true);
  assert.equal(h.calls.find(c => c[0] === 'createUser')[1].email_confirm, true);
  assert.equal(JSON.stringify(await (await h.accounts.GET()).json()).includes('password'), false);
  const failed = harness({ insertFailure: true }); assert.equal((await failed.accounts.POST(request({ email: account.email, company: account.company }))).status, 503);
  assert.ok(failed.calls.some(c => c[0] === 'deleteUser' && c[1] === id));
});
test('suspension/password reset rotate sessions with optimistic concurrency checks', async () => {
  for (const action of ['status', 'reset']) {
    const h = harness(); const r = await h.accounts.PATCH(request({ id, version, action, active: false })); assert.equal(r.status, 200);
    assert.ok(h.calls.some(c => c[0] === 'update' && c[1].session_version !== version));
    assert.ok(h.calls.some(c => c[0] === 'eq' && c[1] === 'session_version' && c[2] === version));
    if (action === 'reset') assert.ok(h.calls.some(c => c[0] === 'resetPassword'));
  }
});
test('publication is explicit and reversible, rejects missing sources and never changes consultations', async () => {
  const h = harness();
  assert.equal((await h.publishing.POST(request({ id, published: true }))).status, 200);
  assert.ok(h.calls.some(c => c[0] === 'upsert' && c[1].consultation_id === id));
  assert.equal((await h.publishing.POST(request({ id, published: false }))).status, 200);
  assert.ok(h.calls.some(c => c[0] === 'delete'));
  assert.equal(h.calls.some(c => c[0] === 'update'), false);
  assert.equal((await harness({ missingSource: true }).publishing.POST(request({ id, published: true }))).status, 404);
});
test('schema denies anon/authenticated table access and cascades publication deletion', () => {
  const sql = readFileSync(new URL('../supabase/migrations/20261106_partner_portal.sql', import.meta.url), 'utf8');
  for (const table of ['partner_portal_accounts', 'partner_lead_publications']) assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`));
  assert.match(sql, /revoke all[^;]+from public, anon, authenticated/);
  assert.match(sql, /references public\.consultations\(id\) on delete cascade/);
  assert.doesNotMatch(sql, /grant[^;]+to (?:anon|authenticated)|insert into public\.partner_lead_publications/);
});
const jsx = (type, props) => ({ type, props });
function nodes(tree, predicate) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap(child => nodes(child, predicate));
  return [...(predicate(tree) ? [tree] : []), ...nodes(tree.props?.children, predicate)];
}
test('partner board filters masked summaries by type/region and expands without a raw record fetch', () => {
  const state = [], effects = []; let cursor = 0;
  const palette = new Proxy({}, { get: () => '' });
  const deps = { react: { useState: initial => { const i = cursor++; if (!(i in state)) state[i] = initial; return [state[i], value => state[i] = typeof value === 'function' ? value(state[i]) : value]; }, useEffect: f => effects.push(f) },
    'react/jsx-runtime': { jsx, jsxs: jsx }, 'next/link': { default: 'a' }, './EstimateLayout': { C: { home: palette, consultStatus: { lost: palette } } }, '@tabler/icons-react': {} };
  const component = load('components/PartnerLeadBoard.tsx', deps, { AbortController, fetch: () => { throw new Error('Demo and expansion never fetch raw data'); } }).default;
  const examples = [portal.partnerLead(source, source.created_at), portal.partnerLead({ ...source, id: nextVersion, building_type: 'residential', region: '경기' }, source.created_at)];
  const render = () => { cursor = 0; effects.length = 0; return component({ company: '예시 업체', mode: 'demo', examples }); };
  let tree = render(); effects.forEach(f => f()); assert.equal(nodes(tree, n => n.type === 'article').length, 2);
  nodes(tree, n => n.type === 'button' && n.props.children === '주거')[0].props.onClick(); tree = render(); assert.equal(nodes(tree, n => n.type === 'article').length, 1);
  nodes(tree, n => n.type === 'select')[0].props.onChange({ target: { value: '서울' } }); tree = render(); assert.equal(nodes(tree, n => n.type === 'article').length, 0);
  nodes(tree, n => n.type === 'button' && n.props.children === '전체')[0].props.onClick(); tree = render();
  nodes(tree, n => n.type === 'button' && 'aria-expanded' in n.props)[0].props.onClick(); tree = render();
  assert.equal(nodes(tree, n => n.type === 'button' && n.props['aria-expanded'] === true).length, 1);
  assert.equal(JSON.stringify(tree).includes(source.phone), false);
});
test('production preview and lead page are server guarded; public previews use fictional rows only', async () => {
  const deps = { 'react/jsx-runtime': { jsx, jsxs: jsx }, 'next/navigation': { notFound: () => { throw new Error('not-found'); }, redirect: path => { throw new Error('redirect:' + path); } },
    '@/lib/serverAuth': { isAdmin: async () => false }, '@/lib/serverPartnerPortal': { currentPartner: async () => null }, '@/components/PartnerLeadBoard': { default: 'board' } };
  const prod = load('app/partner/preview/page.tsx', deps, { process: { env: { VERCEL_ENV: 'production' } } });
  await assert.rejects(prod.default(), /not-found/);
  const preview = await load('app/partner/preview/page.tsx', deps, { process: { env: { VERCEL_ENV: 'preview' } } }).default();
  assert.equal(preview.props.mode, 'demo'); assert.equal(preview.props.examples.length, 6);
  assert.ok(preview.props.examples.every(row => row.code.startsWith('EX-') && row.phone === '***-****-****'));
  await assert.rejects(load('app/partner/leads/page.tsx', deps).default(), /redirect:\/partner\/login/);
});
test('admin session opens partner board with admin-only data access, without issuing a partner session', async () => {
  const deps = { 'react/jsx-runtime': { jsx, jsxs: jsx },
    'next/navigation': { redirect: path => { throw new Error('redirect:' + path); } },
    '@/lib/serverAuth': { isAdmin: async () => true },
    '@/lib/serverPartnerPortal': { currentPartner: async () => { throw new Error('Admin must not require a partner account'); } },
    '@/components/PartnerLeadBoard': { default: 'board' }, '@/components/PartnerLogin': { default: 'login' } };
  const board = await load('app/partner/leads/page.tsx', deps).default();
  assert.equal(board.props.mode, 'admin'); assert.equal(board.props.company, '폼잇 관리자');
  await assert.rejects(load('app/partner/login/page.tsx', deps).default(), /redirect:\/partner\/leads/);
  deps['@/lib/serverAuth'].isAdmin = async () => false;
  deps['@/lib/serverPartnerPortal'].currentPartner = async () => account;
  const partnerBoard = await load('app/partner/leads/page.tsx', deps).default();
  assert.equal(partnerBoard.props.company, account.company); assert.equal(partnerBoard.props.mode, undefined);
  await assert.rejects(load('app/partner/login/page.tsx', deps).default(), /redirect:\/partner\/leads/);
  deps['@/lib/serverPartnerPortal'].currentPartner = async () => null;
  assert.equal((await load('app/partner/login/page.tsx', deps).default()).type, 'login');
});
