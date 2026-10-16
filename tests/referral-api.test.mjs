import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import * as referrals from '../src/lib/referralSites.ts';

function setup({ admin = true, token = false, upstreamFails = false, contactsFail = false } = {}) {
  const calls = [];
  const query = { gte(){return this;}, lte(){return this;}, in(){return this;}, order(){return this;}, range: async () => ({ error: contactsFail, data: [{ pages: ['/consult/step4'], traffic_daily: {source:'interiorfree'} }] }) };
  const deps = {
    '@/lib/serverAuth': {isAdmin: async()=>admin, apiJson:(b,s=200)=>Response.json(b,{status:s})},
    '@/lib/serverDb': {serverDb:()=>({rpc:async()=>{calls.push('db');return {data:{sources:[{source:'interiorfree',visitors:3,converted:1}]}};},from:()=>({select:()=>query})})},
    '@/lib/referralSites': referrals,
  };
  const source = readFileSync(new URL('../src/app/api/admin/referrals/route.ts',import.meta.url),'utf8');
  const output = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const exports={};
  runInNewContext(output,{exports,URL,AbortSignal,process:{env:{FORMIT_REFERRAL_TOKENS:token?JSON.stringify({interiorfree:'x'.repeat(40)}):'{}'}},require:n=>deps[n],fetch:async(url,opts)=>{
    calls.push({url:String(url),opts});
    if(upstreamFails) throw new Error('private upstream error');
    const {dates,from,to}=referrals.referralDates('today');
    return Response.json({version:1,source:'interiorfree',timezone:'Asia/Seoul',metric:'daily_unique_browser',from,to,coverage:'complete',days:dates.map(day=>({day,visitors:10,clickers:4}))});
  }});
  return {...exports,calls};
}
const request=(range='today')=>new Request('https://form.it.kr/api/admin/referrals?range='+range);
test('referrals reject unauthenticated and invalid requests before any data access',async()=>{
  const s=setup({admin:false,token:true});assert.equal((await s.GET(request())).status,401);assert.equal(s.calls.length,0);
  const a=setup();assert.equal((await a.GET(request('all'))).status,400);assert.equal(a.calls.length,0);
});
test('referrals combine daily aggregates with fixed private upstream and no token in response',async()=>{
  const s=setup({token:true});const r=await (await s.GET(request())).json();
  assert.equal(r.rows[0].external.visitors,10);assert.equal(r.rows[0].rate,30);assert.equal(r.rows[0].contacts,1);
  assert.equal(r.rows[1].external.status,'pending');assert.equal(r.rows[1].external.visitors,null);
  const f=s.calls.find(c=>typeof c==='object');assert.equal(new URL(f.url).hostname,'interiorfree.kr');assert.equal(f.opts.redirect,'error');assert.equal(f.opts.cache,'no-store');
  assert.ok(!JSON.stringify(r).includes('x'.repeat(40)));assert.ok(!JSON.stringify(r).includes('visitor_id'));
});
test('upstream or detail failure does not fabricate zeros or hide Formit arrivals',async()=>{
  const s=setup({token:true,upstreamFails:true,contactsFail:true});const r=await(await s.GET(request())).json();
  assert.equal(r.rows[0].external.status,'error');assert.equal(r.rows[0].arrivals,3);assert.equal(r.rows[0].rate,null);assert.equal(r.rows[0].contacts,null);
});
