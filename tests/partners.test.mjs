import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import * as partners from '../src/lib/partners.ts';
const valid={company:'테스트 업체',contact:'홍길동',phone:'010-1234-5678',regions:['서울'],specialties:['오피스'],budget:'상담 후 결정',portfolio:'https://example.com/work',intro:'공간과 고객을 생각하는 인테리어 업체입니다.',agreed:true,consentVersion:partners.PARTNER_CONSENT_VERSION,submissionId:'12345678-1234-4123-8123-123456789abc'};
function setup({admin=true,allowed=true,exists=true,duplicate=false}={}) {
 const calls=[]; const query={};
 for(const method of ['delete','lt','gt','select','order','eq','update']) query[method]=(...args)=>{calls.push([method,...args]);return query;};
 query.then=resolve=>Promise.resolve({error:null}).then(resolve);
 query.range=async(...args)=>{calls.push(['range',...args]);return{data:[],count:0,error:null};};
 query.insert=async value=>{calls.push(['insert',value]);return{error:duplicate?{code:'23505'}:null};};
 query.maybeSingle=async()=>({data:exists?{id:valid.submissionId}:null,error:null});
 const deps={'@/lib/partners':partners,'@/lib/serverDb':{serverDb:()=>({from:table=>{calls.push(['from',table]);return query;}})},'@/lib/serverAuth':{isAdmin:async()=>admin,sameOrigin:r=>r.headers.get('origin')===new URL(r.url).origin,rateLimit:async(r,kind,limit)=>{calls.push(['rate',kind,limit]);return allowed;},apiJson:(b,status=200)=>Response.json(b,{status})}};
 const load=path=>{const exports={};runInNewContext(ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:n=>deps[n],URL,Date});return exports;};
 return{public:load('../src/app/api/partners/route.ts'),admin:load('../src/app/api/admin/partners/route.ts'),calls};
}
const req=(body=valid,origin='https://form.it.kr')=>new Request('https://form.it.kr/api/partners',{method:'POST',headers:{origin},body:JSON.stringify(body)});
test('partner validation requires real consent, bounded allowed selections, safe URLs and a retry identity',()=>{
 assert.equal(partners.validatePartner(valid),null);
 for(const patch of [{agreed:false},{consentVersion:'old'},{regions:[]},{regions:['서울','서울']},{specialties:['injected']},{portfolio:'javascript:alert(1)'},{portfolio:'https://user:secret@example.com'},{submissionId:'invalid'},{intro:'short'},{phone:'1234'},{company:'x'.repeat(101)}]) assert.ok(partners.validatePartner({...valid,...patch}),JSON.stringify(patch));
 assert.equal(partners.validatePartner({...valid,portfolio:''}),null);
});
test('public intake denies cross-origin, invalid and rate-limited submissions without inserts',async()=>{
 const s=setup(); assert.equal((await s.public.POST(req(valid,'https://other.test'))).status,403);assert.equal(s.calls.length,0);
 assert.equal((await s.public.POST(req({...valid,agreed:false}))).status,400);assert.equal(s.calls.length,0);
 const limited=setup({allowed:false});assert.equal((await limited.public.POST(req())).status,429);assert.ok(!limited.calls.some(c=>c[0]==='insert'));
});
test('public intake allowlists fields and handles retry duplicates without touching consumer consultations or SMS',async()=>{
 for(const duplicate of [false,true]){
 const s=setup({duplicate});assert.equal((await s.public.POST(req({...valid,status:'approved',admin_note:'injection'}))).status,200);
 const record=s.calls.find(c=>c[0]==='insert')[1];assert.equal(record.phone,'01012345678');assert.equal(record.status,undefined);assert.equal(record.admin_note,undefined);assert.ok(s.calls.filter(c=>c[0]==='from').every(c=>c[1]==='partner_applications'));assert.ok(s.calls.some(c=>c[0]==='rate'&&c[1]==='partner'));
 }
});
const patch={id:valid.submissionId,status:'reviewing',admin_note:'검토 메모',admin_version:0};
const adminReq=(body=patch,origin='https://form.it.kr')=>new Request('https://form.it.kr/api/admin/partners',{method:'PATCH',headers:{origin},body:JSON.stringify(body)});
test('admin data requires auth and same-origin writes, paginates and hides expired records',async()=>{
 const s=setup({admin:false});assert.equal((await s.admin.GET(new Request('https://form.it.kr/api/admin/partners'))).status,401);assert.equal((await s.admin.PATCH(adminReq())).status,401);assert.equal(s.calls.length,0);
 const a=setup();assert.equal((await a.admin.PATCH(adminReq(patch,'https://other.test'))).status,403);assert.equal(a.calls.length,0);
 assert.equal((await a.admin.GET(new Request('https://form.it.kr/api/admin/partners?page=2'))).status,200);assert.ok(a.calls.some(c=>c[0]==='range'&&c[1]===25&&c[2]===49));assert.ok(a.calls.some(c=>c[0]==='gt'&&c[1]==='expires_at'));
});
test('admin manual save checks expected version, never overwrites stale notes, rejects invalid state',async()=>{
 const s=setup();assert.equal((await s.admin.PATCH(adminReq())).status,200);assert.ok(s.calls.some(c=>c[0]==='eq'&&c[1]==='admin_version'&&c[2]===0));assert.ok(s.calls.some(c=>c[0]==='update'&&c[1].admin_version===1));assert.equal((await setup({exists:false}).admin.PATCH(adminReq())).status,409);
 for(const value of [null,{...patch,status:'bad'},{...patch,admin_version:-1},{...patch,admin_note:'x'.repeat(4001)}]) assert.equal((await s.admin.PATCH(adminReq(value))).status,400);
});
