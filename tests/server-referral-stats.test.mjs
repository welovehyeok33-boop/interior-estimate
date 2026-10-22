import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import * as crypto from 'node:crypto';
import ts from 'typescript';
import * as referrals from '../src/lib/referralSites.ts';

const source=readFileSync(new URL('../src/lib/serverReferralStats.ts',import.meta.url),'utf8');
const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const loaderModule={};
runInNewContext(output,{exports:loaderModule,URL,AbortSignal,Date,setTimeout,fetch,require:n=>({'server-only':{},'node:crypto':crypto,'./referralSites':referrals})[n]});
const token='a'.repeat(64), dates=['2026-10-21','2026-10-22'];
function response(url,visitors=10) {
  const u=new URL(url),from=u.searchParams.get('from'),to=u.searchParams.get('to');
  const days=[];for(let n=Date.parse(from);n<=Date.parse(to);n+=86400000)days.push({day:new Date(n).toISOString().slice(0,10),visitors,clickers:0});
  return Response.json({version:1,source:referrals.REFERRAL_SITES.find(s=>s.host===u.hostname).source,
    timezone:'Asia/Seoul',metric:'daily_unique_browser',from,to,coverage:'partial',days,dateUpdatedAt:'2026-10-22T07:00:00Z'});
}
const timeout=()=>Object.assign(new Error('private failure'),{name:'TimeoutError'});

test('20-second requests retry one transient failure while preserving private fixed URLs and response validation',async()=>{
  const calls=[],limits=[],pauses=[];
  const load=loaderModule.createReferralStatsLoader({request:async(url,options)=>{calls.push({url,options});if(calls.length===1)throw timeout();return response(url);},
    signal:ms=>{limits.push(ms);return AbortSignal.timeout(ms);},pause:async ms=>{pauses.push(ms);}});
  const result=await load('interiorhub_villa',dates,token);
  assert.equal(result.status,'partial');assert.equal(result.visitors,20);assert.equal(calls.length,2);
  assert.deepEqual(limits,[20000,20000]);assert.deepEqual(pauses,[250]);
  assert.ok(calls.every(call=>call.url.hostname==='villa.interiorhub.kr'&&call.url.pathname==='/wp-json/ih-admin/v1/formit-stats'));
  assert.ok(calls.every(call=>call.options.cache==='no-store'&&call.options.redirect==='error'&&call.options.headers.Authorization==='Bearer '+token));
  assert.ok(!JSON.stringify(result).includes(token));assert.ok(!JSON.stringify(result).includes('private failure'));
});

test('fresh cache and concurrent requests deduplicate by source, exact dates and credential without exposing mutable arrays',async()=>{
  let calls=0,clock=Date.parse('2026-10-22T07:00:00Z');
  const load=loaderModule.createReferralStatsLoader({now:()=>clock,request:async url=>{calls++;return response(url);}});
  const [a,b]=await Promise.all([load('interiorfree',dates,token),load('interiorfree',dates,token)]);
  assert.equal(calls,1);assert.equal(a.cached,false);assert.equal(b.cached,false);
  a.visitorDates.length=0;assert.equal(b.visitorDates.length,2);
  const cached=await load('interiorfree',dates,token);assert.equal(cached.cached,true);assert.equal(cached.visitorDates.length,2);assert.equal(calls,1);
  assert.equal(cached.fetchedAt,'2026-10-22T07:00:00.000Z');
  await load('interiorfree',dates,'b'.repeat(64));await load('interiorhub_apt',dates,token);await load('interiorfree',[dates[1]],token);assert.equal(calls,4);
  clock+=60000;assert.equal((await load('interiorfree',dates,token)).cached,false);assert.equal(calls,5);
  assert.equal((await load('interiorfree',dates,null)).status,'pending');assert.equal(calls,5);
});

test('expired success never survives a failed refresh and failed results are not cached',async()=>{
  let clock=0,calls=0,fail=false;
  const load=loaderModule.createReferralStatsLoader({now:()=>clock,pause:async()=>{},request:async url=>{calls++;if(fail)throw timeout();return response(url);}});
  assert.equal((await load('interiorfree',dates,token)).visitors,20);
  clock=60001;fail=true;const bad=await load('interiorfree',dates,token);
  assert.equal(bad.status,'error');assert.equal(bad.issue,'timeout');assert.equal(bad.visitors,null);assert.equal(bad.recordedVisitors,null);assert.equal(bad.fetchedAt,undefined);assert.equal(calls,3);
  fail=false;assert.equal((await load('interiorfree',dates,token)).status,'partial');assert.equal(calls,4);
});

test('auth, malformed, mismatched and oversized reports fail closed without retries or caching',async()=>{
  for(const result of [()=>Response.json({}, {status:401}),()=>Response.json({}, {status:403}),()=>new Response('x'),()=>new Response('x'.repeat(32001)),()=>Response.json({version:1,source:'wrong'})]) {
    let calls=0;const load=loaderModule.createReferralStatsLoader({request:async()=>{calls++;return result();},pause:async()=>{throw new Error('Must not retry');}});
    const bad=await load('interiorhub_office',dates,token);
    assert.equal(bad.status,'error');assert.equal(calls,1);assert.equal(bad.recordedVisitors,null);assert.ok(['auth','invalid'].includes(bad.issue));
    await load('interiorhub_office',dates,token);assert.equal(calls,2);
  }
});

test('network and transient HTTP failures retry once, permanent errors do not',async()=>{
  for(const code of [429,500,502,503,504,400]) {
    let calls=0;const load=loaderModule.createReferralStatsLoader({request:async()=>{calls++;return new Response('',{status:code});},pause:async()=>{}});
    assert.equal((await load('interiorfree',dates,token)).status,'error');assert.equal(calls,code===400?1:2);
  }
  let calls=0;const load=loaderModule.createReferralStatsLoader({request:async url=>{if(++calls===1)throw new TypeError('private network message');return response(url);},pause:async()=>{}});
  assert.equal((await load('interiorfree',dates,token)).visitors,20);assert.equal(calls,2);
});

test('calendar-month chunks are sequential and share one 45-second retry budget',async()=>{
  const month=Array.from({length:31},(_,i)=>'2026-10-'+String(i+1).padStart(2,'0'));
  let calls=0,clock=0;const limits=[];
  const load=loaderModule.createReferralStatsLoader({now:()=>clock,signal:ms=>{limits.push(ms);return AbortSignal.timeout(ms);},pause:async ms=>{clock+=ms;},
    request:async url=>{calls++;if(calls===1){clock+=20000;throw timeout();}if(calls===2){clock+=20000;return response(url);}clock+=4750;throw timeout();}});
  const result=await load('interiorhub_academy',month,token);
  assert.equal(result.status,'error');assert.equal(result.issue,'timeout');assert.equal(result.recordedVisitors,null);assert.equal(result.totalDays,31);
  assert.equal(calls,3);assert.deepEqual(limits,[20000,20000,4750]);assert.equal(clock,45000);
  let active=0,maxActive=0;const ranges=[];
  const healthy=loaderModule.createReferralStatsLoader({request:async url=>{active++;maxActive=Math.max(maxActive,active);ranges.push(String(url));await Promise.resolve();active--;return response(url);}});
  const ok=await healthy('interiorhub_apt',month,token);
  assert.equal(ok.visitors,310);assert.equal(ok.totalDays,31);assert.equal(ranges.length,2);assert.equal(maxActive,1);
});

test('one failing source cannot erase other sources, invalid source/dates never fetch, and caches are bounded',async()=>{
  let calls=0;
  const load=loaderModule.createReferralStatsLoader({request:async url=>{calls++;return new URL(url).hostname==='villa.interiorhub.kr'?new Response('',{status:503}):response(url);},pause:async()=>{}});
  const rows=await Promise.all(referrals.REFERRAL_SITES.map(site=>load(site.source,dates,token)));
  assert.equal(rows.filter(row=>row.status==='error').length,1);assert.equal(rows[0].visitors,20);
  const before=calls;
  for(const [s,d] of [['unknown',dates],['interiorfree',[]],['interiorfree',['2026-10-20','2026-10-22']],['interiorfree',['bad']]])assert.equal((await load(s,d,token)).issue,'invalid');
  assert.equal(calls,before);
  let reads=0;const bounded=loaderModule.createReferralStatsLoader({now:()=>0,request:async url=>{reads++;return response(url);}});
  for(let i=0;i<65;i++)await bounded('interiorfree',[new Date(Date.UTC(2026,0,1+i)).toISOString().slice(0,10)],token);
  await bounded('interiorfree',['2026-01-01'],token);assert.equal(reads,66);
});
