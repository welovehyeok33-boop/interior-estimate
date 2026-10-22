import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import * as referrals from '../src/lib/referralSites.ts';

function setup({ admin = true, token = false, allTokens = false, upstreamFails = false, contactsFail = false, missingDays = 0, missingClickDays = 0, inProgress = false, upstreamVisitors = 10, matchedArrivals = 1, rateCountFails = false } = {}) {
  const calls = [];
  const counts = [];
  const query = table => {
    const entry = {table}; counts.push(entry);
    return {
      select(columns, options){ entry.columns=columns; entry.options=options; return this; },
      gte(column,value){ entry.from=value; return this; }, lte(column,value){ entry.to=value; return this; },
      eq(column,value){ entry.filter=column; entry.source=value; return this; },
      contains(column,value){ entry.contains={column,value}; return this; },
      in(column,value){ entry.in={column,value}; return this; },
      then(resolve){return Promise.resolve(table==='traffic_daily'?{error:rateCountFails,count:matchedArrivals}:{error:contactsFail && entry.source==='interiorfree',count:entry.source==='interiorfree'?60001:0}).then(resolve);},
    };
  };
  const deps = {
    '@/lib/serverAuth': {isAdmin: async()=>admin, apiJson:(b,s=200)=>Response.json(b,{status:s})},
    '@/lib/serverDb': {serverDb:()=>({rpc:async()=>{calls.push('db');return {data:{sources:[{source:'interiorfree',visitors:3,converted:1},{source:'buildhyeok_apt',visitors:2,converted:1}]}};},from:query})},
    '@/lib/referralSites': referrals,
  };
  const source = readFileSync(new URL('../src/app/api/admin/referrals/route.ts',import.meta.url),'utf8');
  const output = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const exports={};
  const tokens=allTokens?{...Object.fromEntries(referrals.REFERRAL_SITES.map(site=>[site.source,'x'.repeat(40)])),buildhyeok_apt:'x'.repeat(40)}:token?{interiorfree:'x'.repeat(40)}:{};
  runInNewContext(output,{exports,URL,AbortSignal,process:{env:{FORMIT_REFERRAL_TOKENS:JSON.stringify(tokens)}},require:n=>deps[n],fetch:async(url,opts)=>{
    calls.push({url:String(url),opts});
    if(upstreamFails) throw new Error('private upstream error');
    const from=new URL(url).searchParams.get('from'),to=new URL(url).searchParams.get('to');
    const dates=[];for(let stamp=Date.parse(from);stamp<=Date.parse(to);stamp+=86400000)dates.push(new Date(stamp).toISOString().slice(0,10));
    const source=referrals.REFERRAL_SITES.find(site=>site.host===new URL(url).hostname).source;
    return Response.json({version:1,source,timezone:'Asia/Seoul',metric:'daily_unique_browser',from,to,coverage:missingDays||missingClickDays||inProgress?'partial':'complete',days:dates.map((day,i)=>({day,visitors:i<missingDays?null:upstreamVisitors,clickers:i<Math.max(missingDays,missingClickDays)?null:4}))});
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
  assert.equal(r.rows[0].rateBasis.state,'ready');assert.equal(r.rows[0].rateBasis.arrivals,3);assert.equal(r.rows[0].rateBasis.visitors,10);
  assert.equal(s.counts.length,5);
  for (const c of s.counts) { assert.equal(c.options.head,true);assert.equal(c.options.count,'exact');assert.equal(c.filter,'traffic_daily.source');assert.equal(c.contains.column,'pages');assert.equal(c.contains.value[0],'/consult/step4');assert.equal(c.from,c.to); }
  assert.equal(r.rows[1].external.status,'pending');assert.equal(r.rows[1].external.visitors,null);
  assert.equal(r.rows[1].rateBasis.state,'not_connected');
  const f=s.calls.find(c=>typeof c==='object');assert.equal(new URL(f.url).hostname,'interiorfree.kr');assert.equal(f.opts.redirect,'error');assert.equal(f.opts.cache,'no-store');
  assert.ok(!JSON.stringify(r).includes('x'.repeat(40)));assert.ok(!JSON.stringify(r).includes('visitor_id'));
});
test('upstream or detail failure does not fabricate zeros or hide Formit arrivals',async()=>{
  const s=setup({token:true,upstreamFails:true,contactsFail:true});const r=await(await s.GET(request())).json();
  assert.equal(r.rows[0].external.status,'error');assert.equal(r.rows[0].arrivals,3);assert.equal(r.rows[0].rate,null);assert.equal(r.rows[0].contacts,null);
  assert.equal(r.rows[0].rateBasis.state,'unavailable');
  assert.equal(r.rows[1].contacts,0);
});

test('apartment and villa use their own allowlisted upstream and matching source',async()=>{
  const s=setup({allTokens:true});const r=await(await s.GET(request())).json();
  assert.equal(r.rows.length,5);
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

test('retired source history and an old token do not add a row or upstream/count queries',async()=>{
  const s=setup({allTokens:true});const r=await(await s.GET(request())).json();
  assert.deepEqual(r.rows.map(row=>row.source),referrals.REFERRAL_SITES.map(site=>site.source));
  assert.equal(s.calls.filter(call=>typeof call==='object').length,5);
  assert.ok(!s.calls.some(call=>typeof call==='object'&&new URL(call.url).hostname==='apt.buildhyeok.com'));
  assert.ok(!s.counts.some(count=>count.source==='buildhyeok_apt'));
  assert.equal(s.counts.length,5);
  assert.equal(r.rows[0].arrivals,3);assert.equal(r.rows[0].converted,1);
});

test('seven and thirty day ratios compare only matching known visitor dates with exact HEAD counts',async()=>{
  for(const [range,days,missing] of [['7',7,2],['30',30,25]]) {
    const s=setup({token:true,missingDays:missing});const r=await(await s.GET(request(range))).json();
    const row=r.rows[0];assert.equal(row.external.status,'partial');assert.equal(row.external.visitors,null);
    assert.equal(row.external.recordedVisitors,(days-missing)*10);assert.equal(row.external.recordedClickers,(days-missing)*4);
    assert.equal(row.external.visitorDays,days-missing);assert.equal(row.external.totalDays,days);
    assert.equal(row.rate,2);assert.equal(row.arrivals,3);
    assert.deepEqual(row.rateBasis,{state:'provisional',arrivals:1,visitors:50,days:5,totalDays:days});
    const rateCount=s.counts.filter(c=>c.table==='traffic_daily');assert.equal(rateCount.length,1);
    assert.equal(rateCount[0].filter,'source');assert.equal(rateCount[0].source,'interiorfree');
    assert.equal(rateCount[0].columns,'day');assert.equal(rateCount[0].options.head,true);assert.equal(rateCount[0].options.count,'exact');
    assert.equal(rateCount[0].in.column,'day');
    assert.deepEqual(rateCount[0].in.value,referrals.referralDates(range).dates.slice(missing));
    for(const c of s.counts) {assert.equal(c.from,r.from);assert.equal(c.to,r.to);}
    const upstream=new URL(s.calls.find(c=>typeof c==='object').url);
    assert.equal(upstream.searchParams.get('from'),r.from);assert.equal(upstream.searchParams.get('to'),r.to);
  }
});

test('ongoing today and missing click logs do not block traffic-based ratios or add count queries',async()=>{
  const today=setup({token:true,inProgress:true});const row=(await(await today.GET(request())).json()).rows[0];
  assert.equal(row.rate,30);assert.equal(row.rateBasis.state,'provisional');assert.equal(today.counts.length,5);
  const clicks=setup({token:true,missingClickDays:1});const c=(await(await clicks.GET(request('7'))).json()).rows[0];
  assert.equal(c.rate,4.3);assert.equal(c.rateBasis.visitors,70);assert.equal(c.rateBasis.arrivals,3);assert.equal(clicks.counts.length,5);
});

test('zero arrivals produce zero percent, while zero visitors, missing data and count errors remain distinct',async()=>{
  const all=setup({allTokens:true});const other=(await(await all.GET(request())).json()).rows[1];
  assert.equal(other.rate,0);assert.equal(other.rateBasis.state,'ready');
  const zero=setup({token:true,upstreamVisitors:0});const z=(await(await zero.GET(request())).json()).rows[0];
  assert.equal(z.rate,null);assert.equal(z.rateBasis.state,'no_visitors');
  const empty=setup({token:true,missingDays:1});const e=(await(await empty.GET(request())).json()).rows[0];
  assert.equal(e.rate,null);assert.equal(e.rateBasis.state,'no_data');assert.equal(empty.counts.length,5);
  assert.equal(e.external.visitors,null);assert.equal(e.external.recordedVisitors,null);assert.equal(e.external.visitorDays,0);
  const failed=setup({token:true,missingDays:2,rateCountFails:true});const f=(await(await failed.GET(request('7'))).json()).rows[0];
  assert.equal(f.arrivals,3);assert.equal(f.external.recordedVisitors,50);assert.equal(f.rate,null);assert.equal(f.rateBasis.state,'unavailable');
});
