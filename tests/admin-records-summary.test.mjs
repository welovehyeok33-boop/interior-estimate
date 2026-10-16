import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import * as crm from '../src/lib/adminCrm.ts';

function setup(auth = true, failed = false) {
  const calls = [];
  const deps = {
    '@/lib/adminCrm': crm,
    '@/lib/serverAuth': { isAdmin: async () => auth, apiJson: (body, status = 200) => Response.json(body, { status }) },
    '@/lib/serverDb': { serverDb: () => ({ from: table => {
      const entry = { table, head: false, status: null, limit: null }; calls.push(entry);
      const query = {
        select: (_columns, options) => { entry.head = !!options?.head; return query; },
        eq: (_column, value) => { entry.status = value; return query; },
        order: () => query,
        limit: value => { entry.limit = value; return query; },
        then: resolve => Promise.resolve({ data: [], count: entry.status ? 0 : table === 'leads' ? 800 : 1200, error: failed && entry.head ? {} : null }).then(resolve),
      };
      return query;
    } }) },
  };
  const source = readFileSync(new URL('../src/app/api/admin/records/route.ts', import.meta.url), 'utf8');
  const exports = {};
  runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports, URL, require: name => deps[name] });
  return { ...exports, calls };
}
test('separate exact summaries include zero states and are not capped to the list limit', async () => {
  const api = setup();
  const data = await (await api.GET()).json();
  assert.equal(data.leadSummary.find(s => s.status === 'all').count, 800);
  assert.equal(data.consultationCount, 1200);
  assert.equal(data.consultationSummary.find(s => s.status === 'lost').count, 0);
  assert.equal(data.consultationSummary.length, Object.keys(crm.CONSULT_STATUSES).length + 1);
  assert.ok(api.calls.filter(c => c.head).every(c => c.limit === null));
});
test('summary queries require admin authentication', async () => {
  const api = setup(false);
  assert.equal((await api.GET()).status, 401);
  assert.equal(api.calls.length, 0);
});
test('count failures are surfaced instead of displaying fake zero counts', async () => {
  assert.equal((await setup(true, true).GET()).status, 503);
});

test('summary-only reads one exact count without downloading paused leads', async () => {
  const api = setup();
  const request = new Request('https://form.it.kr/api/admin/records?summary=1');
  assert.deepEqual(await (await api.GET(request)).json(), { consultationCount: 1200 });
  assert.equal(api.calls.length, 1);
  assert.equal(api.calls[0].table, 'consultations');
  assert.equal(api.calls[0].head, true);
  const blocked = setup(false);
  assert.equal((await blocked.GET(request)).status, 401); assert.equal(blocked.calls.length, 0);
  assert.equal((await setup(true, true).GET(request)).status, 503);
});
