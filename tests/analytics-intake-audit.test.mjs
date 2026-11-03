import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import * as attribution from '../src/lib/attribution.ts';
import * as details from '../src/lib/trafficDetails.ts';
import * as analytics from '../src/lib/analytics.ts';

function setup(options={}) {
  const calls=[];let identities=0;
  const deps={
    '@/lib/serverAuth':{sameOrigin:r=>r.headers.get('origin')===new URL(r.url).origin,
      isAdmin:async()=>!!options.admin,apiJson:(body,status=200)=>Response.json(body,{status})},
    '@/lib/serverAnalytics':{isTrafficExcluded:async()=>!!options.excluded,trafficBucket:()=> 'bucket',
      visitorIdentity:async()=>{identities++;return {day:'2026-11-03',visitor:'anonymous-daily-id'};}},
    '@/lib/serverDb':{serverDb:()=>({rpc:async(name,args)=>{calls.push({name,args});
      if(options.fail===name)return {error:'unavailable'};
      return {data:name==='consume_request_limit'?!options.limited:null,error:null};}})},
    '@/lib/attribution':attribution,'@/lib/trafficDetails':details,'@/lib/analytics':analytics,
    '@/lib/serverTrafficDetails':{trafficMetadata:()=>({device:'PC',browser:'Chrome',os:'Windows'})},
  };
  const exports={};
  const code=ts.transpileModule(readFileSync(new URL('../src/app/api/analytics/route.ts',import.meta.url),'utf8'),
    {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  runInNewContext(code,{exports,URL,process:{env:{VERCEL_ENV:options.env||'production'}},require:name=>deps[name]});
  return {...exports,calls,identities:()=>identities};
}
const event={kind:'consult',page:'/consult',attribution:{source:'interiorhub_apt',medium:'referral',landing:'/consult'}};
const request=(body=event,headers={})=>new Request('https://form.it.kr/api/analytics',
  {method:'POST',headers:{origin:'https://form.it.kr','user-agent':'Chrome',...headers},body:JSON.stringify(body)});

test('accepted visits await immediate DB recording before returning success',async()=>{
  const s=setup();const response=await s.POST(request());assert.deepEqual(await response.json(),{ok:true});
  assert.deepEqual(s.calls.map(c=>c.name),['consume_request_limit','record_traffic_v3']);
  assert.equal(s.calls[1].args.p_page,'/consult');assert.equal(s.identities(),1);
});
test('storage and limiter failures return retryable failures instead of silent success',async()=>{
  for(const fail of ['consume_request_limit','record_traffic_v3']) {
    const s=setup({fail});assert.equal((await s.POST(request())).status,503);
  }
  const limited=setup({limited:true});assert.equal((await limited.POST(request())).status,429);
  assert.equal(limited.identities(),0);
});
test('admin, opt-out, preview, privacy signals and known bots skip without recording',async()=>{
  for(const [options,headers] of [[{admin:true},{}],[{excluded:true},{}],[{env:'preview'},{}],
    [{},{dnt:'1'}],[{}, {'sec-gpc':'1'}],[{}, {'user-agent':'ExampleBot/1'}]]) {
    const s=setup(options);assert.deepEqual(await (await s.POST(request(event,headers))).json(),{skipped:true});
    assert.equal(s.calls.length,0);assert.equal(s.identities(),0);
  }
});
test('foreign origin, invalid page and unregistered source cannot write traffic',async()=>{
  for(const [body,headers,status] of [[event,{origin:'https://other.example'},403],
    [{...event,page:'/admin'}, {},400],
    [{...event,attribution:{source:'adqcfyfuues_bkz'}},{},200]]) {
    const s=setup();assert.equal((await s.POST(request(body,headers))).status,status);
    assert.equal(s.calls.length,0);assert.equal(s.identities(),0);
  }
});
