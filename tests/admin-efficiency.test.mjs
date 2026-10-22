import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import * as analytics from '../src/lib/analytics.ts';
import * as periods from '../src/lib/adminStatsPeriod.ts';

function harness(path, authenticated = false, body = {consultationCount:4}) {
  const state=[], effects=[], requests=[]; let cursor=0;
  const jsx=(type,props)=>({type,props});
  const palette=new Proxy({}, {get:()=>({})});
  const deps={
    react:{useState:initial=>{const i=cursor++;if(!(i in state))state[i]=authenticated&&i===0?true:initial;return[state[i],value=>{state[i]=typeof value==='function'?value(state[i]):value;}];},useEffect:fn=>effects.push(fn),useCallback:fn=>fn},
    'react/jsx-runtime':{jsx,jsxs:jsx},
    '@/lib/analytics':analytics,'@/lib/features':{DETAIL_ESTIMATE_ENABLED:false},
    '@/lib/adminStatsPeriod':periods,
    '@/lib/attribution':{SOURCE_LABELS:{}},
    'framer-motion':{motion:{},AnimatePresence:'animate'},
    '@/components/AdminConsultations':{default:'consultations'},
    '@/components/AdminTraffic':{default:'traffic'},
    './AdminFlowChart':{default:'flow-chart'},
  };
  const colors={C:{admin:palette,consultStatus:palette}};
  deps['./EstimateLayout']=colors;deps['@/components/EstimateLayout']=colors;
  const output=ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
  const exports={};
  runInNewContext(output,{exports,AbortController,fetch:async(url,options)=>{requests.push({url,options});return{ok:true,status:200,json:async()=>body};},require:name=>deps[name]||{}});
  return {state,effects,requests,render:props=>{cursor=0;effects.length=0;return exports.default(props);}};
}
function find(node,predicate){
  if(!node||typeof node!=='object')return;
  if(predicate(node))return node;
  for(const child of [node.props?.children].flat(Infinity)){const found=find(child,predicate);if(found)return found;}
}
test('hidden traffic avoids reads and active reads can be cancelled',async()=>{
  const h=harness('../src/components/AdminTraffic.tsx');
  h.render({refresh:0,view:'overview',active:false});assert.equal(h.effects[0](),undefined);assert.equal(h.requests.length,0);
  h.render({refresh:0,view:'overview',active:true});const cleanup=h.effects[0]();assert.equal(h.requests.length,1);
  cleanup();assert.equal(h.requests[0].options.signal.aborted,true);
});
test('initial admin load does not refresh traffic twice; consultation mounts lazily and remains mounted',async()=>{
  const h=harness('../src/app/admin/page.tsx',true);
  let tree=h.render({});
  assert.equal(find(tree,n=>n.type==='consultations'),undefined);
  h.effects[1]();await new Promise(resolve=>setImmediate(resolve));
  assert.equal(h.requests[0].url,'/api/admin/records?summary=1');assert.equal(h.state[1],0);
  const consult=find(tree,n=>n.type==='button'&&n.props['aria-controls']==='admin-consult');consult.props.onClick();
  tree=h.render({});assert.ok(find(tree,n=>n.type==='consultations'));
  find(tree,n=>n.type==='button'&&n.props['aria-controls']==='admin-traffic').props.onClick();
  tree=h.render({});assert.ok(find(tree,n=>n.type==='consultations'));
});

test('admin tabs place referral management second and retain their original panel bindings',()=>{
  const h=harness('../src/app/admin/page.tsx',true);
  let tree=h.render({});
  const nav=()=>find(tree,n=>n.type==='nav'&&n.props['aria-label']==='관리자 카테고리');
  let buttons=nav().props.children;
  assert.deepEqual(Array.from(buttons,button=>button.props.children[0]),['대시보드','유입처 관리','유입 트래픽','상담 관리']);
  assert.equal(nav().props.style.flexWrap,'wrap');
  assert.equal(buttons[1].props['aria-controls'],'admin-referrals');
  assert.equal(buttons[2].props['aria-controls'],'admin-traffic');
  buttons[1].props.onClick();tree=h.render({});
  assert.ok(find(tree,n=>n.props?.id==='admin-referrals'));
  assert.equal(find(tree,n=>n.type==='traffic').props.active,false);
  assert.equal(nav().props.children[1].props['aria-pressed'],true);
  buttons=nav().props.children;buttons[2].props.onClick();tree=h.render({});
  assert.equal(find(tree,n=>n.props?.id==='admin-referrals'),undefined);
  assert.equal(find(tree,n=>n.type==='traffic').props.view,'sources');
  assert.equal(find(tree,n=>n.type==='traffic').props.active,true);
  assert.equal(nav().props.children[2].props['aria-pressed'],true);
});

test('dashboard month field follows 30 days and uses cancellable month queries, refresh and preset reset',()=>{
  const h=harness('../src/components/AdminTraffic.tsx');
  const props={refresh:0,view:'overview',active:true};let tree=h.render(props);
  const input=()=>find(tree,n=>n.type==='input'&&n.props.type==='month');
  assert.equal(input().props['aria-label'],'통계 조회 월 선택');assert.equal(input().props.min,'2000-01');
  input().props.onChange({target:{value:'2000-01'}});tree=h.render(props);
  assert.equal(input().props.value,'2000-01');
  const cancel=h.effects[0]();assert.equal(h.requests[0].url,'/api/admin/analytics?range=month&month=2000-01');
  assert.equal(h.requests[0].options.cache,'no-store');cancel();assert.equal(h.requests[0].options.signal.aborted,true);
  const before=h.state[0];input().props.onChange({target:{value:'2999-01'}});assert.equal(h.state[0],before);
  find(tree,n=>n.type==='button'&&n.props.children==='새로고침').props.onClick();tree=h.render(props);
  assert.equal(input().props.value,'2000-01');assert.equal(h.state[5],1);
  find(tree,n=>n.type==='button'&&n.props.children==='최근 30일').props.onClick();tree=h.render(props);h.effects[0]();
  assert.equal(h.requests.at(-1).url,'/api/admin/analytics?range=30');assert.equal(input().props.value,'');
});

test('expired monthly contact records show unknown without hiding preserved visit/application metrics',async()=>{
  const body={from:'2000-01-01',to:'2000-01-31',startedAt:'2000-01-01T00:00:00Z',updatedAt:'2026-10-22T00:00:00Z',
    days:[{day:'2000-01-01',visitors:8,requests:2,converted:2,consult_starts:4,engine_starts:0}],
    sources:[{source:'naver',visitors:8,converted:2}],landings:[],details:{pages:[]},detailCoverage:{complete:false,from:null,to:null}};
  const h=harness('../src/components/AdminTraffic.tsx',false,body),props={refresh:0,view:'overview',active:true};
  let tree=h.render(props);h.effects[0]();await new Promise(resolve=>setImmediate(resolve));tree=h.render(props);
  const metric=label=>find(tree,n=>n.type==='div'&&n.props?.children?.[0]?.props?.children===label)?.props.children[1].props.children;
  assert.equal(metric('상담 입력 진입'),'—');assert.equal(metric('외부 유입'),'8명');assert.equal(metric('무료 견적 신청'),'2건');assert.equal(metric('신청 전환율'),'25%');
  assert.ok(find(tree,n=>n.type==='p'&&JSON.stringify(n.props.children).includes('30일 보관 기한')));
  const chart=find(tree,n=>n.type==='flow-chart');assert.equal(chart.props.requests,2);assert.equal(chart.props.details,undefined);
});

test('the fifth flow bar uses the same selected-date application total as the summary card',async()=>{
  const body={from:'2026-10-15',to:'2026-10-16',startedAt:'2026-10-01T00:00:00Z',updatedAt:'2026-10-22T00:00:00Z',
    totalRequests:999,days:[{day:'2026-10-14',visitors:9,requests:99,converted:8,consult_starts:8,engine_starts:0},
      {day:'2026-10-15',visitors:4,requests:2,converted:1,consult_starts:3,engine_starts:0},
      {day:'2026-10-16',visitors:3,requests:1,converted:0,consult_starts:2,engine_starts:0}],sources:[],landings:[],details:{pages:[]}};
  const h=harness('../src/components/AdminTraffic.tsx',false,body),props={refresh:0,view:'overview',active:true};
  h.render(props);h.effects[0]();await new Promise(resolve=>setImmediate(resolve));const tree=h.render(props);
  const chart=find(tree,n=>n.type==='flow-chart');assert.equal(chart.props.requests,3);assert.equal(chart.props.details,body.details);
  const card=find(tree,n=>n.type==='div'&&n.props?.children?.[0]?.props?.children==='무료 견적 신청');
  assert.equal(card.props.children[1].props.children,'3건');
});
