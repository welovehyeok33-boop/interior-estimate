import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { referralVisitorTrend } from '../src/lib/referralTrend.ts';

const fixture=()=>({from:'2026-10-01',to:'2026-10-05',rows:[
  {source:'interiorfree',name:'인테리어프리',arrivals:999,external:{status:'partial',dailyVisitors:[10,null,0,20,2].map((visitors,i)=>({day:`2026-10-0${i+1}`,visitors}))}},
  {source:'interiorhub_office',name:'오피스 인테리어',arrivals:1000,external:{status:'partial',dailyVisitors:[5,null,0,null,5].map((visitors,i)=>({day:`2026-10-0${i+1}`,visitors}))}},
]});

test('visitor trends use actual upstream calendar days, distinguish missing/partial/zero, and exclude Formit arrivals',()=>{
  const report=fixture(),before=JSON.stringify(report);
  const days=referralVisitorTrend(report);
  assert.deepEqual(days.map(day=>day.visitors),[15,null,0,20,7]);
  assert.deepEqual(days.map(day=>day.knownSites),[2,0,2,1,2]);
  assert.ok(days.every(day=>day.totalSites===2));
  assert.deepEqual(referralVisitorTrend(report,'interiorfree').map(day=>day.visitors),[10,null,0,20,2]);
  assert.equal(JSON.stringify(report),before);
  report.rows[1].external.status='error';
  assert.deepEqual(referralVisitorTrend(report).map(day=>day.visitors),[10,null,0,20,2]);
  assert.ok(referralVisitorTrend(report).every(day=>day.knownSites<=1));
  report.rows[0].external.dailyVisitors=undefined;
  assert.ok(referralVisitorTrend(report).every(day=>day.visitors===null));
});

test('31-day months and single-day periods retain their exact boundaries without interpolating missing dates',()=>{
  const report=fixture();report.from='2026-01-01';report.to='2026-01-31';
  const days=referralVisitorTrend(report);assert.equal(days.length,31);assert.equal(days.at(-1).day,'2026-01-31');assert.ok(days.every(day=>day.visitors===null));
  report.from=report.to='2026-10-03';assert.deepEqual(referralVisitorTrend(report).map(day=>day.visitors),[0]);
  report.to='2026-12-31';assert.deepEqual(referralVisitorTrend(report),[]);
});

test('invalid or overflowing counts cannot silently become measured daily totals',()=>{
  const report=fixture();report.rows.forEach(row=>{row.external.dailyVisitors=[{day:'2026-10-01',visitors:Number.MAX_SAFE_INTEGER}];});
  assert.equal(referralVisitorTrend(report)[0].visitors,null);
  for(const visitors of [-1,NaN,1.5,Number.MAX_SAFE_INTEGER+1]) {
    report.rows.forEach(row=>{row.external.dailyVisitors[0].visitors=visitors;});
    assert.equal(referralVisitorTrend(report)[0].visitors,null);
  }
});

function harness(report=fixture()) {
  const state=[];let cursor=0,requests=0;
  const jsx=(type,props,key)=>({type,props,key}),exports={};
  const source=readFileSync(new URL('../src/components/ReferralVisitorChart.tsx',import.meta.url),'utf8');
  const deps={react:{useState:initial=>{const i=cursor++;if(!(i in state))state[i]=initial;return[state[i],value=>{state[i]=value;}];}},
    'react/jsx-runtime':{jsx,jsxs:jsx},'@/lib/referralTrend':{referralVisitorTrend},
    './EstimateLayout':{C:{primary:'gold',admin:{line:'line',text:'text',chart:'chart',surface:'surface',accentBg:'accent'}}},'./adminStyles':{action:{},muted:{}}};
  runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText,
    {exports,require:name=>deps[name],fetch:()=>{requests++;throw new Error('Chart must reuse loaded data');}});
  return{report,state,requests:()=>requests,render:()=>{cursor=0;return exports.default({report});}};
}
function all(node,predicate) {if(!node||typeof node!=='object')return[];return[...(predicate(node)?[node]:[]),...[node.props?.children].flat(Infinity).flatMap(child=>all(child,predicate))];}
function text(node) {if(typeof node==='string'||typeof node==='number')return String(node);if(!node||typeof node!=='object')return'';return[node.props?.children].flat(Infinity).map(text).join('');}

test('chart shows known totals, leaves null gaps unconnected, and changes sites without fetching',()=>{
  const h=harness();let tree=h.render();
  assert.match(text(tree),/42명/);assert.match(text(tree),/2026\.10\.05 · 7명/);assert.match(text(tree),/확인된 기록/);
  const segments=all(tree,node=>node.type==='line'&&node.props.strokeWidth===3);
  assert.equal(segments.length,2);assert.ok(segments.every(segment=>segment.props.strokeDasharray==='5 5'));
  assert.ok(segments.every(segment=>segment.props.x1>=360)); // No line across the missing second day.
  const sites=all(tree,node=>node.type==='div'&&node.props['aria-label']==='그래프 사이트 선택')[0];
  all(sites,node=>node.type==='button'&&text(node)==='오피스')[0].props.onClick();tree=h.render();
  assert.match(text(tree),/10명/);assert.match(text(tree),/2026\.10\.05 · 5명/);assert.equal(h.requests(),0);
  assert.equal(all(tree,node=>node.type==='button'&&text(node)==='오피스')[0].props['aria-pressed'],true);
});

test('mouse, touch and keyboard date selection expose exact counts and collection coverage',()=>{
  const h=harness();let tree=h.render();
  const group=()=>all(tree,node=>node.props?.['aria-label']==='날짜별 방문자 선택')[0];
  const buttons=()=>all(group(),node=>node.type==='button');
  assert.equal(buttons().filter(button=>button.props.tabIndex===0).length,1);
  buttons()[3].props.onPointerEnter();tree=h.render();assert.match(text(tree),/2026\.10\.04 · 20명.*1\/2곳 수집 · 부분 집계/);
  buttons()[1].props.onClick();tree=h.render();assert.match(text(tree),/2026\.10\.02 · 미수집/);
  let focused=-1,prevented=false;
  buttons()[1].props.onKeyDown({key:'End',preventDefault(){prevented=true;},currentTarget:{parentElement:{querySelectorAll(){return Array.from({length:5},(_,i)=>({focus(){focused=i;}}));}}}});
  assert.equal(prevented,true);assert.equal(focused,4);
  buttons()[2].props.onFocus();tree=h.render();assert.match(text(tree),/2026\.10\.03 · 0명/);
});

test('real zeroes and a single day are graphed, while unavailable data has an explicit empty state',()=>{
  const report=fixture();report.from=report.to='2026-10-03';const h=harness(report);let tree=h.render();
  assert.match(text(tree),/방문 합계0명/);assert.doesNotMatch(text(tree),/수집된 방문 기록이 없어요/);
  assert.equal(all(tree,node=>node.props?.['aria-label']?.startsWith('2026-10-03 0명')).length,1);
  assert.equal(all(tree,node=>node.type==='line'&&node.props.strokeWidth===3).length,0);
  report.rows.forEach(row=>{row.external.status='error';});tree=h.render();
  assert.match(text(tree),/선택 기간에 수집된 방문 기록이 없어요/);assert.match(text(tree),/미수집/);
});
