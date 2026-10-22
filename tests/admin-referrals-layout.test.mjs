import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { REFERRAL_SITES, referralLink } from '../src/lib/referralSites.ts';

function harness() {
  const report={from:'2026-10-16',to:'2026-10-22',updatedAt:'2026-10-21T15:00:00Z',rows:REFERRAL_SITES.map((site,i)=>({
    ...site,link:referralLink(site.source,site.destination),arrivals:0,contacts:i===2?null:0,converted:0,rate:i===0?0:null,
    external:{status:['ready','partial','error','pending','partial','partial'][i],visitors:i===0?10:null,clickers:i===0?4:null,
      recordedVisitors:i===1?3:null,recordedClickers:i===1?1:null,visitorDays:i===1?5:0,clickerDays:i===1?5:0,totalDays:7,updatedAt:'2026-10-21T15:00:00Z'},
  }))};
  const state=['7',0,{key:'7:0:0',report,error:''},''],effects=[],requests=[],copied=[];let cursor=0;
  const jsx=(type,props)=>({type,props});const exports={};
  const source=readFileSync(new URL('../src/components/AdminReferralSites.tsx',import.meta.url),'utf8');
  const deps={react:{useState:initial=>{const i=cursor++;if(!(i in state))state[i]=initial;return[state[i],value=>{state[i]=typeof value==='function'?value(state[i]):value;}];},useEffect:fn=>effects.push(fn)},
    'react/jsx-runtime':{jsx,jsxs:jsx},'@tabler/icons-react':{IconCopy:'copy-icon',IconExternalLink:'external-icon'},
    './EstimateLayout':{C:{admin:{line:'line',accentBg:'accent',bg:'background',text:'text'}}},
    './adminStyles':{action:{},goldAction:{},muted:{},panel:{},field:{}}};
  const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
  runInNewContext(output,{exports,AbortController,navigator:{clipboard:{writeText:async value=>copied.push(value)}},fetch:async(url,options)=>{requests.push({url,options});return{ok:true,json:async()=>report};},require:name=>deps[name]});
  return{state,effects,requests,copied,report,render:()=>{cursor=0;effects.length=0;return exports.default({refresh:0});}};
}
function all(node,predicate) {
  if(!node||typeof node!=='object')return[];
  return[...(predicate(node)?[node]:[]),...[node.props?.children].flat(Infinity).flatMap(child=>all(child,predicate))];
}
function text(node){if(typeof node==='string'||typeof node==='number')return String(node);return[node?.props?.children].flat(Infinity).map(child=>child&&typeof child==='object'?text(child):typeof child==='string'||typeof child==='number'?String(child):'').join('');}

test('six compact cards use a responsive grid and keep details collapsed',()=>{
  const h=harness(),tree=h.render();
  const grid=all(tree,n=>n.props?.['aria-label']==='사이트별 유입 요약')[0];
  assert.match(grid.props.style.gridTemplateColumns,/auto-fit.*min\(100%, 340px\)/);
  const cards=all(tree,n=>n.type==='article');assert.equal(cards.length,6);
  for(const card of cards) {
    assert.equal(all(card,n=>n.type==='strong').length,5);
    const details=all(card,n=>n.type==='details')[0];assert.equal(details.props.open,undefined);
    assert.match(text(details),/집계 상세 · 홍보 링크/);
    const input=all(details,n=>n.type==='input')[0];assert.equal(input.props.readOnly,true);
    assert.equal(all(card,n=>n.type==='a')[0].props.rel,'noopener noreferrer');
  }
});

test('unknown and partial data remain distinct from zero with coverage available',()=>{
  const cards=all(harness().render(),n=>n.type==='article');
  assert.match(text(cards[0]),/0명/);
  assert.match(text(cards[1]),/3명.*부분 합계 · 5\/7일/);
  assert.match(text(cards[1]),/방문 기록 5\/7일 · 클릭 기록 5\/7일/);
  assert.equal(text(all(cards[2],n=>n.type==='strong')[0]),'—');
  assert.match(text(cards[2]),/연결 확인 필요/);assert.match(text(cards[3]),/연결 대기/);
  assert.match(text(cards[2]),/사이트 통계를 확인할 수 없습니다/);
});

test('link copy still uses the individual site URL and reports success',async()=>{
  const h=harness(),tree=h.render();const card=all(tree,n=>n.type==='article').at(-1);
  await all(card,n=>n.type==='button')[0].props.onClick();
  assert.equal(h.copied[0],h.report.rows.at(-1).link);
  assert.match(text(h.render()),/링크를 복사했어요/);
});

test('period changes and refresh retain cancellable no-store reads',()=>{
  const h=harness();let tree=h.render();
  all(tree,n=>n.type==='button'&&text(n)==='최근 30일')[0].props.onClick();
  tree=h.render();const cancel=h.effects[0]();
  assert.equal(h.requests[0].url,'/api/admin/referrals?range=30');
  assert.equal(h.requests[0].options.cache,'no-store');cancel();assert.equal(h.requests[0].options.signal.aborted,true);
  all(tree,n=>n.type==='button'&&text(n)==='새로고침')[0].props.onClick();
  assert.equal(h.state[1],1);
});
