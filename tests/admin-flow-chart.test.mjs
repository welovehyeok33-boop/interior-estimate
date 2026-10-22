import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

function render(props, detailed = false) {
  const jsx=(type,props)=>({type,props}),exports={};
  const source=readFileSync(new URL('../src/components/AdminFlowChart.tsx',import.meta.url),'utf8');
  const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
  const deps={'react/jsx-runtime':{jsx,jsxs:jsx},'@/lib/features':{DETAIL_ESTIMATE_ENABLED:detailed},
    './EstimateLayout':{C:{primary:'gold',admin:{bg:'background',raised:'track',muted:'muted',chartAlt:'alternate'}}},'./adminStyles':{muted:{}}};
  runInNewContext(output,{exports,require:name=>deps[name]});
  return exports.default(props);
}
function all(node,predicate) {
  if(!node||typeof node!=='object')return[];
  return[...(predicate(node)?[node]:[]),...[node.props?.children].flat(Infinity).flatMap(child=>all(child,predicate))];
}
function text(node){if(typeof node==='string'||typeof node==='number')return String(node);return[node?.props?.children].flat(Infinity).map(child=>child&&typeof child==='object'?text(child):typeof child==='string'||typeof child==='number'?String(child):'').join('');}
const details={pages:['/consult','/consult/step2','/consult/step3','/consult/step4'].map((path,i)=>({path,visitors:[100,50,20,10][i],converted:99}))};
const bars=tree=>all(tree,n=>n.props?.['aria-hidden']==='true');

test('consultation flow appends actual applications as a fifth gold bar, separate from visit conversions',()=>{
  const tree=render({details,requests:4});
  const labels=all(tree,n=>n.type==='div'&&n.props.style?.minHeight===32).map(text);
  assert.deepEqual(labels,['1. 공간','2. 면적','3. 일정·예산','4. 연락처','5. 무료 견적 신청']);
  assert.deepEqual(all(tree,n=>n.type==='strong').map(text),['100회','50회','20회','10회','4건']);
  assert.equal(bars(tree).length,5);assert.equal(bars(tree)[4].props.children.props.style.height,'4%');
  assert.ok(bars(tree).every(node=>node.props.children.props.style.background==='gold'));
  assert.match(text(tree),/5단계는 선택 기간의 실제 접수 건수/);
});

test('zero applications draw an empty fifth track with 0건, not a minimum positive bar',()=>{
  const tree=render({details:{pages:[]},requests:0});
  assert.equal(text(all(tree,n=>n.type==='strong').at(-1)),'0건');
  assert.ok(bars(tree).every(node=>node.props.children.props.style.height==='0%'));
});

test('missing stage data stays unknown without hiding known application counts',()=>{
  const tree=render({details:undefined,requests:3});
  assert.deepEqual(all(tree,n=>n.type==='strong').map(text),['—','—','—','—','3건']);
  assert.equal(bars(tree)[4].props.children.props.style.height,'100%');
  assert.match(text(tree),/단계별 도달 기록을 확인할 수 없어요/);
  const missing=render({details,requests:null});
  assert.equal(text(all(missing,n=>n.type==='strong').at(-1)),'—');
  assert.equal(bars(missing)[4].props.children.props.style.height,'0%');
});

test('the shared bar scale includes applications even when their count exceeds tracked stages',()=>{
  const tree=render({details:{pages:[{path:'/consult/step4',visitors:1}]},requests:4});
  assert.equal(bars(tree)[3].props.children.props.style.height,'25%');
  assert.equal(bars(tree)[4].props.children.props.style.height,'100%');
});

test('five flexible columns align tracks below wrapped mobile labels without a forced chart width',()=>{
  const tree=render({details,requests:4});
  const grid=all(tree,n=>n.type==='div'&&n.props.style?.gridTemplateColumns==='repeat(5, minmax(0, 1fr))')[0];
  assert.ok(grid);assert.equal(grid.props.style.minWidth,undefined);
  for(const step of grid.props.children){assert.equal(step.props.style.flexDirection,'column');assert.equal(step.props.style.minWidth,0);}
  assert.ok(bars(tree).every(node=>node.props.style.marginTop==='auto'&&node.props.style.flexShrink===0));
});

test('disabled detail preview remains hidden; enabling it retains its five visit-only bars',()=>{
  assert.doesNotMatch(text(render({details,requests:1})),/상세견적/);
  const tree=render({details:{pages:[...details.pages,{path:'/estimate/detail/step5',visitors:2}]},requests:1},true);
  assert.equal(bars(tree).length,10);assert.match(text(tree),/상세견적/);
  assert.equal(text(all(tree,n=>n.type==='strong').at(-1)),'2회');
  assert.ok(bars(tree).slice(5).every(node=>node.props.children.props.style.background==='alternate'));
});
