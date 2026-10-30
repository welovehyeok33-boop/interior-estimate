import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { REFERRAL_SITES, referralLink, groupReferralRows, summarizeReferralRows, referralTotalRate, REFERRAL_RATE_LABELS, REFERRAL_ISSUE_LABELS } from '../src/lib/referralSites.ts';
import * as periods from '../src/lib/adminStatsPeriod.ts';
import { readReferralReport } from '../src/lib/readReferralReport.ts';

function harness(responseFactory) {
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
    '@/lib/referralSites':{groupReferralRows,summarizeReferralRows,referralTotalRate,REFERRAL_RATE_LABELS,REFERRAL_ISSUE_LABELS},
    '@/lib/adminStatsPeriod':periods,
    './ReferralVisitorChart':{default:'visitor-chart'},
    '@/lib/readReferralReport':{readReferralReport},
    './EstimateLayout':{C:{primary:'gold',admin:{line:'line',accentBg:'accent',totalBg:'total-accent',bg:'background',text:'text'}}},
    './adminStyles':{action:{},goldAction:{},muted:{},panel:{},field:{}}};
  const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
  runInNewContext(output,{exports,Error,AbortController,navigator:{clipboard:{writeText:async value=>copied.push(value)}},fetch:async(url,options)=>{requests.push({url,options});return responseFactory?responseFactory(report):{ok:true,json:async()=>report};},require:name=>deps[name]});
  return{state,effects,requests,copied,report,render:()=>{cursor=0;effects.length=0;return exports.default({refresh:0});}};
}
function all(node,predicate) {
  if(!node||typeof node!=='object')return[];
  return[...(predicate(node)?[node]:[]),...[node.props?.children].flat(Infinity).flatMap(child=>all(child,predicate))];
}
function text(node){if(typeof node==='string'||typeof node==='number')return String(node);return[node?.props?.children].flat(Infinity).map(child=>child&&typeof child==='object'?text(child):typeof child==='string'||typeof child==='number'?String(child):'').join('');}

const siteRows=tree=>all(tree,n=>n.type==='tr'&&n.props?.['aria-label']);
test('visitor exclusion is labelled while actual Formit arrivals and quote completions remain visible',()=>{
  const h=harness(),tree=h.render();
  assert.match(text(tree),/출처 확인 방문만 집계/);assert.match(text(tree),/직접접속·출처 확인 불가는 제외/);
  const rows=siteRows(tree),office=all(rows[1],n=>n.type==='td');
  assert.equal(text(office[0]),'3명');assert.equal(text(office[1]),'2명');
  assert.match(text(tree),/폼잇에 실제 수집된 기록 기준/);
});
test('daily visitor chart shares the exact loaded report without adding another data request',()=>{
  const h=harness();const chart=all(h.render(),node=>node.type==='visitor-chart')[0];
  assert.equal(chart.props.report,h.report);assert.equal(h.requests.length,0);
  h.state[0]='30';assert.equal(all(h.render(),node=>node.type==='visitor-chart').length,0);
});

test('only seven and thirty day presets show the graph; today, yesterday and calendar months keep the table',()=>{
  const h=harness();
  for(const range of ['7','30','today','yesterday','month']) {
    h.state[0]=range;h.state[5]=range==='month'?'2000-01':'';
    h.state[2]={key:range==='month'?'month:2000-01:0:0':`${range}:0:0`,report:h.report,error:''};
    assert.equal(all(h.render(),node=>node.type==='visitor-chart').length,['7','30'].includes(range)?1:0);
    assert.equal(siteRows(h.render()).length,5);
  }
});

test('partial streamed results remain visible while other sites load, with unknown totals instead of zero',()=>{
  const h=harness();h.state[2].pending=true;h.report.rows[1].external.status='loading';h.report.rows[1].external.visitors=null;h.report.rows[1].external.recordedVisitors=null;
  h.report.rows[1].arrivals=h.report.rows[1].contacts=h.report.rows[1].converted=null;h.report.rows[1].rateBasis.state='loading';
  const tree=h.render();assert.equal(tree.props['aria-busy'],true);assert.equal(siteRows(tree).length,5);
  assert.match(text(tree),/4\/5곳 확인 중/);assert.match(text(siteRows(tree)[0]),/10명/);assert.match(text(siteRows(tree)[1]),/조회 중/);
  assert.equal(text(all(siteRows(tree)[1],node=>node.type==='strong')[0]),'—');
  assert.equal(text(all(all(tree,node=>node.type==='tfoot')[0],node=>node.type==='strong')[0]),'—');
});

test('a broken stream retains received numbers and changes unfinished rows to an explicit error',async()=>{
  const h=harness(report=>{
    report.rows[1].external={...report.rows[1].external,status:'loading',visitors:null,recordedVisitors:null};
    report.rows[1].arrivals=report.rows[1].contacts=report.rows[1].converted=null;
    return new Response(JSON.stringify({type:'start',report})+'\n'+JSON.stringify({type:'row',row:report.rows[0]})+'\n',{headers:{'Content-Type':'application/x-ndjson'}});
  });
  h.render();h.effects[0]();await new Promise(resolve=>setImmediate(resolve));
  const tree=h.render();assert.equal(tree.props['aria-busy'],false);assert.match(text(tree),/일부 사이트 집계를 받지 못/);
  assert.match(text(siteRows(tree)[0]),/10명/);assert.match(text(siteRows(tree)[1]),/연결 확인 필요/);
  assert.doesNotMatch(text(siteRows(tree)[1]),/조회 중/);assert.equal(text(all(siteRows(tree)[1],node=>node.type==='strong')[0]),'—');
});
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
  assert.equal(all(tree,n=>n.type==='input'&&n.props.readOnly).length,0);
});

test('unknown and partial data remain distinct from zero with coverage available',()=>{
  const h=harness(),rows=siteRows(h.render());
  assert.match(text(rows[0]),/0명/);
  const visits=all(rows[1],n=>n.type==='td')[0];
  assert.equal(text(visits),'3명');assert.equal(all(visits,n=>n.type==='span').length,0);
  assert.match(visits.props.title,/방문 기록 5\/7일/);
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
  assert.equal(all(h.render(),n=>n.type==='input'&&n.props.readOnly).length,0);
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
    assert.equal(all(expanded,n=>n.type==='td'&&n.props.colSpan===headings.length)[0].props.colSpan,headings.length);
  }
});

test('period changes and refresh retain cancellable no-store reads',()=>{
  const h=harness();let tree=h.render();
  all(tree,n=>n.type==='button'&&text(n)==='최근 30일')[0].props.onClick();
  tree=h.render();const cancel=h.effects[0]();
  assert.equal(h.requests[0].url,'/api/admin/referrals?range=30&stream=1');
  assert.equal(h.requests[0].options.cache,'no-store');cancel();assert.equal(h.requests[0].options.signal.aborted,true);
  all(tree,n=>n.type==='button'&&text(n)==='새로고침')[0].props.onClick();
  assert.equal(h.state[1],1);
});

test('referral month picker follows the presets and its month participates in loading, reads and refresh',async()=>{
  const h=harness();let tree=h.render();
  const input=()=>all(tree,n=>n.type==='input'&&n.props.type==='month')[0];
  assert.equal(input().props['aria-label'],'유입처 조회 월 선택');assert.equal(input().props.min,'2000-01');
  input().props.onChange({target:{value:'2000-01'}});tree=h.render();
  assert.equal(input().props.value,'2000-01');assert.equal(tree.props['aria-busy'],true);assert.equal(siteRows(tree).length,0);
  const cancel=h.effects[0]();assert.equal(h.requests[0].url,'/api/admin/referrals?range=month&month=2000-01&stream=1');
  await new Promise(resolve=>setImmediate(resolve));tree=h.render();assert.equal(tree.props['aria-busy'],false);
  input().props.onChange({target:{value:'2000-02'}});tree=h.render();assert.equal(siteRows(tree).length,0);assert.equal(tree.props['aria-busy'],true);
  cancel();assert.equal(h.requests[0].options.signal.aborted,true);
  all(tree,n=>n.type==='button'&&text(n)==='최근 30일')[0].props.onClick();tree=h.render();h.effects[0]();
  assert.equal(h.requests.at(-1).url,'/api/admin/referrals?range=30&stream=1');assert.equal(input().props.value,'');
  input().props.onChange({target:{value:'2000-02'}});tree=h.render();
  input().props.onChange({target:{value:''}});tree=h.render();assert.equal(h.state[0],'7');
});

test('unretained monthly contact totals stay unknown while site traffic and arrivals remain visible',()=>{
  const h=harness();h.report.detailCoverage={complete:false,from:null,to:null};h.report.rows.forEach(row=>{row.contacts=null;});
  const tree=h.render();assert.match(text(tree),/연락처 도착은 —로 표시/);
  const first=siteRows(tree)[0];assert.equal(text(all(first,n=>n.type==='strong')[0]),'10명');
  assert.equal(text(all(first,n=>n.type==='strong')[1]),'0명');assert.equal(text(all(first,n=>n.type==='strong')[2]),'—');
});

test('a compact yellow footer shows four totals and their weighted ratio without numeric sublabels',()=>{
  const h=harness(),tree=h.render(),footer=all(tree,n=>n.type==='tfoot')[0];
  assert.equal(footer.props['aria-label'],'전체 유입처 합계');assert.match(text(footer),/총합.*5곳/);
  const metrics=all(footer,n=>n.type==='strong');assert.deepEqual(metrics.map(text),['—','2명','—','0명','—']);
  assert.doesNotMatch(text(footer),/부분 합계/);
  const metricCells=all(footer,n=>n.type==='td');
  assert.match(metricCells[0].props.title,/3\/5곳만 확인/);assert.match(metricCells[2].props.title,/4\/5곳만 확인/);
  assert.match(metricCells[4].props.title,/합계가 없거나 0명/);
  assert.ok(metricCells.every(cell=>all(cell,n=>n.type==='span').length===0));
  const cells=all(footer,n=>n.type==='th'||n.type==='td');assert.equal(cells.reduce((sum,n)=>sum+(n.props.colSpan||1),0),7);
  assert.ok(cells.every(n=>n.props.style.background==='total-accent'));
  assert.ok(cells.every(n=>n.props.style.padding==='8px 12px'));
  assert.match(text(tree),/사이트 간 중복 방문자는 제거하지 않습니다/);
  h.report.rows.forEach(row=>{row.contacts=null;});
  assert.equal(text(all(all(h.render(),n=>n.type==='tfoot')[0],n=>n.type==='strong')[2]),'—');
  h.state[0]='30';assert.equal(all(h.render(),n=>n.type==='tfoot').length,0);
});

test('footer ratio stays unknown for missing or zero visitor totals, but zero arrivals remain 0 percent',()=>{
  const h=harness();
  const rate=()=>text(all(all(h.render(),n=>n.type==='tfoot')[0],n=>n.type==='strong').at(-1));
  h.report.rows.forEach(row=>{row.external.visitors=0;row.external.recordedVisitors=0;});assert.equal(rate(),'—');
  h.report.rows.forEach(row=>{row.external.visitors=null;row.external.recordedVisitors=null;});assert.equal(rate(),'—');
  h.report.rows.forEach(row=>{row.arrivals=0;row.external={...row.external,status:'partial',visitors:0,recordedVisitors:0,visitorDays:7,totalDays:7};});
  h.report.rows[0].external.visitors=27;assert.equal(rate(),'0%');
  h.report.rows[1].arrivals=4;assert.equal(rate(),'14.8%');
  const footer=all(h.render(),n=>n.type==='tfoot')[0];assert.match(all(footer,n=>n.type==='td')[4].props.title,/폼잇 유입 합계 4명 ÷ 확인된 사이트 방문 합계 27명/);
  h.report.rows[1].external={...h.report.rows[1].external,visitors:null,recordedVisitors:0,visitorDays:6};
  assert.equal(rate(),'14.8%');assert.match(text(all(h.render(),n=>n.type==='tfoot')[0]),/확인된 합계/);
  assert.match(all(all(h.render(),n=>n.type==='tfoot')[0],n=>n.type==='td')[4].props.title,/확인된 기록 기준의 참고 비율/);
  assert.match(text(h.render()),/폼잇 유입 합계 ÷ 확인된 사이트 방문 합계 × 100/);
  h.report.rows[1].external.status='error';assert.equal(rate(),'—');
});

test('upstream delay details and a cached fetch timestamp never add numeric visitor sublabels',()=>{
  const h=harness(),row=h.report.rows[2];row.external.issue='timeout';row.external.fetchedAt='2026-10-22T07:00:00Z';row.external.cached=true;
  let tree=h.render();all(siteRows(tree)[2],n=>n.type==='button')[0].props.onClick();tree=h.render();
  assert.match(text(tree),/응답이 지연/);assert.match(text(tree),/원본 조회/);assert.match(text(tree),/1분 이내 캐시/);
  assert.equal(all(all(siteRows(tree)[2],n=>n.type==='td')[0],n=>n.type==='span').length,0);
});

test('footer color is admin-scoped, theme-aware and flat in both modes',()=>{
  const theme=readFileSync(new URL('../src/components/AdminTheme.tsx',import.meta.url),'utf8');
  const colors=readFileSync(new URL('../src/components/EstimateLayout.tsx',import.meta.url),'utf8');
  assert.match(theme,/'--admin-total-bg': dark \? '#4A3D15' : '#FFEB99'/);
  assert.match(colors,/totalBg: "var\(--admin-total-bg, #FFEB99\)"/);
});
