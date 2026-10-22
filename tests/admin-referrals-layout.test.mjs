import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { REFERRAL_SITES, referralLink, groupReferralRows, REFERRAL_RATE_LABELS } from '../src/lib/referralSites.ts';

function harness() {
  const report={from:'2026-10-16',to:'2026-10-22',updatedAt:'2026-10-21T15:00:00Z',rows:REFERRAL_SITES.map((site,i)=>({
    ...site,link:referralLink(site.source,site.destination),arrivals:i===1?2:0,contacts:i===2?null:0,converted:0,rate:i===0?0:i===1?33.3:null,
    rateBasis:{state:['ready','provisional','unavailable','no_visitors','not_connected'][i],arrivals:i===0?0:i===1?1:null,visitors:i===0?10:i===1?3:i===3?0:null,days:i===0?7:i===1?5:i===3?1:0,totalDays:7},
    external:{status:['ready','partial','error','partial','pending'][i],visitors:i===0?10:null,clickers:i===0?4:null,
      recordedVisitors:i===1?3:i===3?0:null,recordedClickers:i===1?1:null,visitorDays:i===0?7:i===1?5:i===3?1:0,clickerDays:i===0?7:i===1?5:0,totalDays:7,updatedAt:'2026-10-21T15:00:00Z'},
  }))};
  const state=['7',0,{key:'7:0:0',report,error:''},''],effects=[],requests=[],copied=[];let cursor=0;
  const jsx=(type,props)=>({type,props});const exports={};
  const source=readFileSync(new URL('../src/components/AdminReferralSites.tsx',import.meta.url),'utf8');
  const deps={react:{useState:initial=>{const i=cursor++;if(!(i in state))state[i]=initial;return[state[i],value=>{state[i]=typeof value==='function'?value(state[i]):value;}];},useEffect:fn=>effects.push(fn)},
    'react/jsx-runtime':{jsx,jsxs:jsx},'@tabler/icons-react':{IconCopy:'copy-icon',IconExternalLink:'external-icon',IconChevronDown:'chevron-icon'},
    '@/lib/referralSites':{groupReferralRows,REFERRAL_RATE_LABELS},
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

const siteRows=tree=>all(tree,n=>n.type==='tr'&&n.props?.['aria-label']);
test('five active sites use one table row each in two ordered groups with details closed',()=>{
  const h=harness(),tree=h.render();
  const wrapper=all(tree,n=>n.props?.['aria-label']==='사이트별 유입 요약')[0];
  assert.equal(wrapper.props.style.overflowX,'auto');assert.equal(wrapper.props.tabIndex,0);
  assert.equal(all(tree,n=>n.type==='table').length,1);
  assert.deepEqual(all(tree,n=>n.type==='tbody').map(n=>n.props['aria-label']),['인테리어프리','Interior HUB']);
  const rows=siteRows(tree);assert.equal(rows.length,5);
  assert.deepEqual(rows.map(row=>row.props['aria-label']),['인테리어프리','오피스 인테리어','학원 인테리어','아파트 인테리어','빌라 인테리어']);
  assert.doesNotMatch(text(tree),/아파트 길잡이|기타 유입처/);
  for(const row of rows) {
    assert.equal(all(row,n=>n.type==='strong').length,5);
    assert.equal(all(row,n=>n.type==='td').length,6);
    const button=all(row,n=>n.type==='button')[0];assert.equal(button.props['aria-expanded'],false);
    assert.equal(all(row,n=>n.type==='a')[0].props.rel,'noopener noreferrer');
  }
  assert.equal(all(tree,n=>n.type==='input').length,0);
});

test('unknown and partial data remain distinct from zero with coverage available',()=>{
  const h=harness(),rows=siteRows(h.render());
  assert.match(text(rows[0]),/0명/);
  assert.match(text(rows[1]),/3명.*부분 · 5\/7일/);
  assert.equal(text(all(rows[2],n=>n.type==='strong')[0]),'—');
  assert.match(text(rows[2]),/연결 확인 필요/);assert.match(text(rows.at(-1)),/연결 대기/);
  all(rows[1],n=>n.type==='button')[0].props.onClick();
  assert.match(text(h.render()),/방문 기록 5\/7일 · 미수집 날짜를 0명으로 간주하지 않습니다/);
  all(siteRows(h.render())[2],n=>n.type==='button')[0].props.onClick();
  assert.match(text(h.render()),/사이트 통계를 확인할 수 없습니다/);
});

test('traffic ratio, provisional date coverage and unavailable reasons replace generic waiting',()=>{
  const h=harness(),tree=h.render(),rows=siteRows(tree);
  assert.match(text(tree),/폼잇 유입자 ÷ 해당 사이트 방문자 × 100/);
  assert.match(text(rows[0]),/0%/);assert.match(text(rows[1]),/33\.3%잠정 · 5\/7일/);
  assert.match(text(rows[2]),/조회 오류/);assert.match(text(rows[3]),/방문 없음/);assert.match(text(rows[4]),/연결 대기/);
  assert.ok(!text(tree).includes('계산 대기'));
  all(rows[1],n=>n.type==='button')[0].props.onClick();
  assert.match(text(h.render()),/폼잇 유입 1명 ÷ 사이트 방문 3명 × 100 = 33\.3%/);
});

test('missing Interiorfree visitor data stays unknown instead of being shown as zero',()=>{
  const h=harness(),row=h.report.rows[0];
  row.external={...row.external,status:'partial',visitors:null,recordedVisitors:null,visitorDays:0,clickers:null,recordedClickers:null,clickerDays:0};
  row.rate=null;row.rateBasis={state:'no_data',arrivals:null,visitors:null,days:0,totalDays:7};
  const entry=siteRows(h.render())[0];
  assert.equal(text(all(entry,n=>n.type==='strong')[0]),'—');
  assert.match(text(entry),/데이터 부족/);
  all(entry,n=>n.type==='button')[0].props.onClick();
  assert.match(text(h.render()),/방문 기록 0\/7일 · 미수집 날짜를 0명으로 간주하지 않습니다/);
});

test('link copy still uses the individual site URL and reports success',async()=>{
  const h=harness(),tree=h.render();const row=siteRows(tree).find(row=>row.props['aria-label']==='빌라 인테리어');
  all(row,n=>n.type==='button')[0].props.onClick();
  const detail=all(h.render(),n=>n.props?.id==='referral-detail-interiorhub_villa')[0];
  assert.equal(all(detail,n=>n.type==='td')[0].props.colSpan,7);
  assert.equal(all(detail,n=>n.type==='input')[0].props.readOnly,true);
  await all(detail,n=>n.type==='button')[0].props.onClick();
  assert.equal(h.copied[0],h.report.rows.at(-1).link);
  assert.match(text(h.render()),/링크를 복사했어요/);
  all(siteRows(h.render()).find(row=>row.props['aria-label']==='빌라 인테리어'),n=>n.type==='button')[0].props.onClick();
  assert.equal(all(h.render(),n=>n.type==='input').length,0);
});

test('click metrics are hidden while seven-column summaries and details stay aligned',()=>{
  const h=harness(),tree=h.render();
  const headings=all(tree,n=>n.type==='th'&&n.props.scope==='col').map(text);
  assert.deepEqual(headings,['사이트','사이트 방문','폼잇 유입','연락처 도착','신청 완료 방문','유입 비율','상세']);
  for(const heading of all(tree,n=>n.type==='th'&&n.props.scope==='rowgroup'))assert.equal(heading.props.colSpan,headings.length);
  assert.equal(all(tree,n=>n.type==='table')[0].props.style.minWidth,780);
  for(const row of siteRows(tree)) {
    all(row,n=>n.type==='button')[0].props.onClick();
    const expanded=h.render();
    assert.doesNotMatch(text(expanded),/버튼 클릭|클릭 기록/);
    assert.equal(all(expanded,n=>n.type==='td'&&n.props.colSpan)[0].props.colSpan,headings.length);
  }
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
