import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import * as analytics from '../src/lib/analytics.ts';
import * as attribution from '../src/lib/attribution.ts';
import * as details from '../src/lib/trafficDetails.ts';

function harness(send=async()=>true) {
  let path='/',effect,cleanup; const calls=[],listeners=new Map(),intervals=new Map();
  const document={visibilityState:'visible',referrer:'https://naver.com/',
    addEventListener:(k,f)=>listeners.set(k,f),removeEventListener:k=>listeners.delete(k)};
  const navigator={doNotTrack:'0',globalPrivacyControl:false};
  const window={location:{href:'https://form.it.kr/'},addEventListener:(k,f)=>listeners.set(k,f),
    removeEventListener:k=>listeners.delete(k),setInterval:(f,ms)=>{intervals.set(1,{f,ms});return 1;},clearInterval:k=>intervals.delete(k)};
  const deps={react:{useEffect:f=>{effect=f;}},'next/navigation':{usePathname:()=>path},
    '@/lib/analytics':analytics,'@/lib/attribution':attribution,'@/lib/trafficDetails':details,
    '@/lib/trafficDelivery':{deliverTraffic:async body=>{calls.push(JSON.parse(body));return send(body);}}};
  const exports={};
  const code=ts.transpileModule(readFileSync(new URL('../src/components/VisitTracker.tsx',import.meta.url),'utf8'),
    {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  runInNewContext(code,{exports,document,navigator,window,require:name=>deps[name]});
  return {calls,listeners,intervals,document,navigator,mount:(next='/')=>{cleanup?.();path=next;
    window.location.href='https://form.it.kr'+next;exports.default();cleanup=effect();},stop:()=>cleanup?.()};
}
const settle=async()=>{for(let i=0;i<15;i++)await Promise.resolve();};
test('mount sends immediately; minute ticks and tab visibility do not duplicate a successful page',async()=>{
  const h=harness();h.mount();await settle();assert.equal(h.calls.length,1);
  h.listeners.get('visibilitychange')();h.listeners.get('online')();h.intervals.get(1).f();await settle();
  assert.equal(h.calls.length,1);assert.equal(h.intervals.get(1).ms,60000);h.stop();
  assert.equal(h.listeners.size,0);assert.equal(h.intervals.size,0);
});
test('visibility, DNT, GPC and private routes deliberately exclude events',async()=>{
  for(const variant of ['hidden','dnt','gpc','admin']) {
    const h=harness();
    if(variant==='hidden')h.document.visibilityState='hidden';
    if(variant==='dnt')h.navigator.doNotTrack='1';
    if(variant==='gpc')h.navigator.globalPrivacyControl=true;
    h.mount(variant==='admin'?'/admin':'/');await settle();assert.equal(h.calls.length,0);
    if(variant==='hidden'){h.document.visibilityState='visible';h.listeners.get('visibilitychange')();await settle();assert.equal(h.calls.length,1);}
    h.stop();
  }
});
test('online recovery resends failed pages without waiting for the minute interval',async()=>{
  let attempts=0;const h=harness(async()=>++attempts>1);h.mount('/consult');await settle();
  assert.equal(h.calls.length,1);h.listeners.get('online')();await settle();assert.equal(h.calls.length,2);
  h.listeners.get('online')();await settle();assert.equal(h.calls.length,2);h.stop();
});
test('new page events wait for the first response then send immediately in order',async()=>{
  let release;let first=true;
  const h=harness(async()=>{if(first){first=false;return new Promise(resolve=>{release=resolve;});}return true;});
  h.mount('/');await settle();h.mount('/consult');await settle();assert.equal(h.calls.length,1);
  release(true);await settle();assert.deepEqual(h.calls.map(call=>call.page),['/','/consult']);h.stop();
});
