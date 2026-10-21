import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import * as referrals from '../src/lib/referralSites.ts';

function setup({ admin = true, token = false, allTokens = false, upstreamFails = false, contactsFail = false, missingDays = 0 } = {}) {
  const calls = [];
  const counts = [];
  const query = () => {
    const entry = {}; counts.push(entry);
    return {
      select(columns, options){ entry.columns=columns; entry.options=options; return this; },
      gte(column,value){ entry.from=value; return this; }, lte(column,value){ entry.to=value; return this; },
      eq(column,value){ entry.filter=column; entry.source=value; return this; },
      contains(column,value){ entry.contains={column,value}; return this; },
      then(resolve){return Promise.resolve({error:contactsFail && entry.source==='interiorfree',count:entry.source==='interiorfree'?60001:0}).then(resolve);},
    };
  };
  const deps = {
    '@/lib/serverAuth': {isAdmin: async()=>admin, apiJson:(b,s=200)=>Response.json(b,{status:s})},
    '@/lib/serverDb': {serverDb:()=>({rpc:async()=>{calls.push('db');return {data:{sources:[{source:'interiorfree',visitors:3,converted:1}]}};},from:query})},
    '@/lib/referralSites': referrals,
  };
  const source = readFileSync(new URL('../src/app/api/admin/referrals/route.ts',import.meta.url),'utf8');
  const output = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const exports={};
  const tokens=allTokens?Object.fromEntries(referrals.REFERRAL_SITES.map(site=>[site.source,'x'.repeat(40)])):token?{interiorfree:'x'.repeat(40)}:{};
  runInNewContext(output,{exports,URL,AbortSignal,process:{env:{FORMIT_REFERRAL_TOKENS:JSON.stringify(tokens)}},require:n=>deps[n],fetch:async(url,opts)=>{
    calls.push({url:String(url),opts});
    if(upstreamFails) throw new Error('private upstream error');
    const from=new URL(url).searchParams.get('from'),to=new URL(url).searchParams.get('to');
    const dates=[];for(let stamp=Date.parse(from);stamp<=Date.parse(to);stamp+=86400000)dates.push(new Date(stamp).toISOString().slice(0,10));
    const source=referrals.REFERRAL_SITES.find(site=>site.host===new URL(url).hostname).source;
    return Response.json({version:1,source,timezone:'Asia/Seoul',metric:'daily_unique_browser',from,to,coverage:missingDays?'partial':'complete',days:dates.map((day,i)=>({day,visitors:i<missingDays?null:10,clickers:i<missingDays?null:4}))});
  }});
  return {...exports,calls,counts};
}
const request=(range='today')=>new Request('https://form.it.kr/api/admin/referrals?range='+range);
test('referrals reject unauthenticated and invalid requests before any data access',async()=>{
  const s=setup({admin:false,token:true});assert.equal((await s.GET(request())).status,401);assert.equal(s.calls.length,0);
  const a=setup();assert.equal((await a.GET(request('all'))).status,400);assert.equal(a.calls.length,0);
});
test('referrals combine daily aggregates with fixed private upstream and no token in response',async()=>{
  const s=setup({token:true});const r=await (await s.GET(request())).json();
  assert.equal(r.rows[0].external.visitors,10);assert.equal(r.rows[0].rate,30);assert.equal(r.rows[0].contacts,60001);
  assert.equal(s.counts.length,6);
  for (const c of s.counts) { assert.equal(c.options.head,true);assert.equal(c.options.count,'exact');assert.equal(c.filter,'traffic_daily.source');assert.equal(c.contains.column,'pages');assert.equal(c.contains.value[0],'/consult/step4');assert.equal(c.from,c.to); }
  assert.equal(r.rows[1].external.status,'pending');assert.equal(r.rows[1].external.visitors,null);
  const f=s.calls.find(c=>typeof c==='object');assert.equal(new URL(f.url).hostname,'interiorfree.kr');assert.equal(f.opts.redirect,'error');assert.equal(f.opts.cache,'no-store');
  assert.ok(!JSON.stringify(r).includes('x'.repeat(40)));assert.ok(!JSON.stringify(r).includes('visitor_id'));
});
test('upstream or detail failure does not fabricate zeros or hide Formit arrivals',async()=>{
  const s=setup({token:true,upstreamFails:true,contactsFail:true});const r=await(await s.GET(request())).json();
  assert.equal(r.rows[0].external.status,'error');assert.equal(r.rows[0].arrivals,3);assert.equal(r.rows[0].rate,null);assert.equal(r.rows[0].contacts,null);
  assert.equal(r.rows[1].contacts,0);
});

test('apartment and villa use their own allowlisted upstream and matching source',async()=>{
  const s=setup({allTokens:true});const r=await(await s.GET(request())).json();
  assert.equal(r.rows.length,6);
  for(const source of ['interiorhub_apt','interiorhub_villa']) {
    const row=r.rows.find(row=>row.source===source);
    assert.equal(row.external.status,'ready');assert.equal(row.external.visitors,10);
    assert.equal(new URL(row.link).searchParams.get('utm_source'),source);
    const upstream=s.calls.find(c=>typeof c==='object'&&new URL(c.url).hostname===row.host);
    assert.equal(new URL(upstream.url).pathname,'/wp-json/ih-admin/v1/formit-stats');
    assert.equal(upstream.opts.headers.Authorization,'Bearer '+'x'.repeat(40));
    assert.ok(s.counts.some(c=>c.source===source));
  }
  assert.ok(!JSON.stringify(r).includes('x'.repeat(40)));
});

test('seven and thirty day reports expose partial sums without creating misleading conversion rates',async()=>{
  for(const [range,days,missing] of [['7',7,2],['30',30,25]]) {
    const s=setup({token:true,missingDays:missing});const r=await(await s.GET(request(range))).json();
    const row=r.rows[0];assert.equal(row.external.status,'partial');assert.equal(row.external.visitors,null);
    assert.equal(row.external.recordedVisitors,(days-missing)*10);assert.equal(row.external.recordedClickers,(days-missing)*4);
    assert.equal(row.external.visitorDays,days-missing);assert.equal(row.external.totalDays,days);
    assert.equal(row.rate,null);assert.equal(row.arrivals,3);
    for(const c of s.counts) {assert.equal(c.from,r.from);assert.equal(c.to,r.to);}
    const upstream=new URL(s.calls.find(c=>typeof c==='object').url);
    assert.equal(upstream.searchParams.get('from'),r.from);assert.equal(upstream.searchParams.get('to'),r.to);
  }
});
