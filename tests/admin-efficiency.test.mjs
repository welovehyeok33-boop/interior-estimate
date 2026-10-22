import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import * as analytics from '../src/lib/analytics.ts';

function harness(path, authenticated = false) {
  const state=[], effects=[], requests=[]; let cursor=0;
  const jsx=(type,props)=>({type,props});
  const palette=new Proxy({}, {get:()=>({})});
  const deps={
    react:{useState:initial=>{const i=cursor++;if(!(i in state))state[i]=authenticated&&i===0?true:initial;return[state[i],value=>{state[i]=typeof value==='function'?value(state[i]):value;}];},useEffect:fn=>effects.push(fn),useCallback:fn=>fn},
    'react/jsx-runtime':{jsx,jsxs:jsx},
    '@/lib/analytics':analytics,'@/lib/features':{DETAIL_ESTIMATE_ENABLED:false},
    '@/lib/attribution':{SOURCE_LABELS:{}},
    'framer-motion':{motion:{},AnimatePresence:'animate'},
    '@/components/AdminConsultations':{default:'consultations'},
    '@/components/AdminTraffic':{default:'traffic'},
  };
  const colors={C:{admin:palette,consultStatus:palette}};
  deps['./EstimateLayout']=colors;deps['@/components/EstimateLayout']=colors;
  const output=ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
  const exports={};
  runInNewContext(output,{exports,AbortController,fetch:async(url,options)=>{requests.push({url,options});return{ok:true,status:200,json:async()=>({consultationCount:4})};},require:name=>deps[name]||{}});
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
