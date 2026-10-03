import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import * as crm from '../src/lib/adminCrm.ts';
function setup(auth = true, exists = true) {
  const calls = [];
  const query = {};
  for (const method of ['select','eq','lte','not','ilike','order','update']) query[method] = (...args) => { calls.push([method,...args]); return query; };
  query.range = async (...args) => { calls.push(['range',...args]); return { data: [], count: 0 }; };
  query.maybeSingle = async () => ({ data: exists ? { id: 'ok' } : null });
  const deps = { '@/lib/adminCrm': crm, '@/lib/serverAuth': {
    isAdmin: async () => auth, sameOrigin: r => r.headers.get('origin') === new URL(r.url).origin,
    apiJson: (b,status=200) => Response.json(b,{status}),
  }, '@/lib/serverDb': { serverDb: () => ({ from: () => query }) } };
  const source = readFileSync(new URL('../src/app/api/admin/consultations/route.ts',import.meta.url),'utf8');
  const exports = {};
  runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,
    {exports,require:n=>deps[n],URL,Date});
  return { ...exports, calls };
}
const body = { id:'12345678-1234-4123-8123-123456789abc',status:'consulting',admin_note:'safe',next_contact_at:null,admin_version:0 };
const req = (value=body,origin='https://form.it.kr') => new Request('https://form.it.kr/api/admin/consultations',{method:'PATCH',headers:{origin},body:JSON.stringify(value)});
test('CRM APIs block anonymous users and cross-origin writes before DB',async()=>{
  const s=setup(false);
  assert.equal((await s.GET(new Request('https://form.it.kr/api/admin/consultations'))).status,401);
  assert.equal((await s.PATCH(req())).status,401);
  assert.equal((await s.PATCH(req(body,'https://other.test'))).status,403);
  assert.equal(s.calls.length,0);
});
test('CRM rejects malformed pages and writes, checks expected version',async()=>{
  const s=setup();
  assert.equal((await s.GET(new Request('https://form.it.kr/api/admin/consultations?page=-1'))).status,400);
  assert.equal((await s.PATCH(req({...body,status:'wrong'}))).status,400);
  assert.equal((await s.PATCH(req())).status,200);
  assert.ok(s.calls.some(c=>c[0]==='eq'&&c[1]==='admin_version'&&c[2]===0));
  assert.equal((await setup(true,false).PATCH(req())).status,409);
});
test('CRM uses server pagination and literal phone search',async()=>{
  const s=setup();
  assert.equal((await s.GET(new Request('https://form.it.kr/api/admin/consultations?page=2&q=010-1234&status=consulting&due=1'))).status,200);
  assert.ok(s.calls.some(c=>c[0]==='range'&&c[1]===25&&c[2]===49));
  assert.ok(s.calls.some(c=>c[0]==='ilike'&&c[1]==='phone'&&c[2]==='%0101234%'));
  assert.ok(s.calls.some(c=>c[0]==='not'&&c[1]==='status'));
});
