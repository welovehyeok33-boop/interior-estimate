import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import * as crm from '../src/lib/adminCrm.ts';

test('contract rate uses period summary, not filtered rows, and handles empty/loading/error states', () => {
  for (const [total, contracts, loading, error, expected] of [[6, 2, false, '', '33.3%'], [4, 0, false, '', '0%'], [4, 4, false, '', '100%'], [0, 0, false, '', '—'], [6, 2, true, '', '—'], [6, 2, false, 'failed', '—']]) {
    const render = editorHarness(() => {}, [[], 0, [{ status: 'all', count: total }, { status: 'contracted', count: contracts }], '', { status: 'lost', page: 1, month: '2026-10', q: 'filtered' }, null, 0, loading, error], true);
    const card = find(render({ refresh: 0, onSaved: () => {} }), node => node.props?.['aria-label'] === '상담 계약률');
    assert.equal(find(card, node => node.type === 'strong').props.children, expected);
  }
});

test('editing offers four simple statuses while preserving historical values', () => {
  assert.deepEqual(crm.CONSULT_EDIT_STATUS_OPTIONS.map(([id]) => id), ['new', 'consulting', 'contracted', 'lost']);
  assert.ok(crm.CONSULT_STATUSES.closed);
  assert.ok(crm.CONSULT_STATUSES.quoted);
});

test('status counts move between contract and lost without changing total', () => {
  const counts = [{ status: 'all', count: 4 }, { status: 'contracted', count: 1 }, { status: 'lost', count: 0 }];
  const updated = crm.updateConsultationCounts(counts, 'contracted', 'lost');
  assert.deepEqual(updated.map(row => row.count), [4, 0, 1]);
  assert.equal(counts[1].count, 1);
  assert.equal(crm.updateConsultationCounts(updated, 'lost', 'lost'), updated);
});

function editorHarness(fetch, initial = [], root = false, runtime = {}) {
  const state = [...initial]; let cursor = 0;
  const jsx = (type, props, key) => ({ type, props, key });
  const palette = new Proxy({}, { get: () => ({}) });
  const exports = {};
  const source = readFileSync(new URL('../src/components/AdminConsultations.tsx', import.meta.url), 'utf8') + '\nexport { Editor };';
  const dependencies = {
    react: { useEffect: runtime.effect || (() => {}), useState: initial => { const i = cursor++; if (!(i in state)) state[i] = initial; return [state[i], value => { state[i] = typeof value === 'function' ? value(state[i]) : value; }]; } },
    'react/jsx-runtime': { jsx, jsxs: jsx },
    './EstimateLayout': { C: { primary: 'brand', admin: palette, consultStatus: palette } },
    './adminStyles': { consultStatusStyle: () => ({}), consultStatusBadge: () => ({}) },
    '@/lib/estimateRegion': { formatEstimateRegion: () => '' },
    '@/lib/adminCrm': crm,
    '@/lib/consultStore': { formatConsultBudget: () => '', formatConsultSchedule: () => '' },
    '@/lib/intakeValidation': { INDUSTRY_LABELS: {} },
  };
  runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText,
    { exports, require: name => dependencies[name] || {}, fetch, ...runtime.globals });
  return props => { cursor = 0; return (root ? exports.default : exports.Editor)(props); };
}
test('note and status edits stay local through waiting, collapse and reopen until save is clicked', async () => {
  const requests = [], effects = [], listeners = new Map(), timers = [];
  let item = { id: 'test', status: 'new', admin_note: 'original', phone: '01000000000', admin_version: 1 };
  const render = editorHarness(async (_url, options) => {
    const body = JSON.parse(options.body); requests.push(body);
    return { ok: true, json: async () => ({ item: { ...item, ...body, admin_version: 2 } }) };
  }, [], false, {
    effect: effect => effects.push(effect), globals: {
      window: { addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) },
      setTimeout: (fn, delay) => { timers.push({ fn, delay }); return 1; }, clearTimeout: () => {},
    },
  });
  const props = (hidden = false) => ({ item, hidden, onSaved: updated => { item = updated; } });
  let tree = render(props());
  find(tree, node => node.type === 'textarea').props.onChange({ target: { value: '작성 중인 메모' } });
  find(tree, node => node.type === 'select').props.onChange({ target: { value: 'consulting' } });
  tree = render(props());
  for (const effect of effects.splice(0)) effect();
  for (const timer of timers) timer.fn();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(timers.length, 0);
  assert.equal(requests.length, 0);
  assert.match(text(tree), /아직 저장하지 않은 변경 내용/);
  assert.doesNotMatch(text(tree), /1초 후 자동 저장/);
  const event = { preventDefault() { this.prevented = true; } };
  listeners.get('beforeunload')(event);
  assert.equal(event.prevented, true);
  tree = render(props(true));
  assert.equal(tree.props.hidden, true);
  assert.equal(find(tree, node => node.type === 'textarea').props.value, '작성 중인 메모');
  tree = render(props());
  assert.equal(tree.props.hidden, false);
  assert.equal(find(tree, node => node.type === 'select').props.value, 'consulting');
  assert.equal(requests.length, 0);
  await find(tree, node => node.type === 'button').props.onClick();
  assert.equal(requests.length, 1);
  assert.equal(requests[0].admin_note, '작성 중인 메모');
  assert.equal(requests[0].status, 'consulting');
  assert.equal(requests[0].admin_version, 1);
  assert.match(text(render(props())), /상담 내용을 저장했어요/);
});

test('save cannot run while a previous save or Korean composition is active', async () => {
  for (const [busy, composing] of [[true, false], [false, true]]) {
    let requests = 0;
    const render = editorHarness(() => { requests++; }, ['new', 'draft', busy, '', false, composing]);
    const button = find(render({ item: { status: 'new', admin_note: '', phone: '' }, onSaved: () => {} }), node => node.type === 'button');
    assert.equal(button.props.disabled, true);
    await button.props.onClick();
    assert.equal(requests, 0);
  }
});
function find(node, predicate) {
  if (!node || typeof node !== 'object') return;
  if (predicate(node)) return node;
  for (const child of [node.props?.children].flat(Infinity)) { const found = find(child, predicate); if (found) return found; }
}
function text(node) {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (!node || typeof node !== 'object') return '';
  return [node?.props?.children].flat(Infinity).map(child => text(child)).join('');
}

test('compact cards retain readable content, yellow borders, wrapping and the same expandable editor', () => {
  const item = { id: 'compact-fixture', name: '테스트 고객', region: '서울', building_type: 'commercial', commercial_type: 'unknown', area: 28, created_at: '2026-10-20T01:02:37Z', status: 'consulting', phone: '', admin_note: '', admin_version: 1 };
  const render = editorHarness(() => {}, [[item], 1, [{ status: 'all', count: 1 }], '', { status: 'all', page: 1, month: '', q: '' }, null, 0, false, ''], true);
  const props = { refresh: 0, onSaved: () => {} };
  const article = find(render(props), node => node.type === 'article');
  assert.equal(article.props.style.padding, '12px 16px');
  assert.equal(article.props.style.marginBottom, 8);
  assert.equal(article.props.style.borderColor, 'brand');
  const toggle = find(article, node => node.type === 'button');
  assert.equal(toggle.props.style.flexWrap, 'wrap');
  assert.equal(toggle.props.style.gap, '8px 16px');
  assert.equal(toggle.props['aria-expanded'], false);
  assert.match(text(toggle), /테스트 고객.*28평.*접수.*37.*희망 예산.*진행 중/);
  const heading = find(toggle, node => node.type === 'strong');
  assert.equal(heading.props.style.fontSize, 17);
  assert.ok(find(toggle, node => node.props?.style?.overflowWrap === 'anywhere'));
  const metadata = find(toggle, node => node.props?.style?.margin === '3px 0');
  assert.equal(metadata.props.style.flexWrap, 'wrap');
  assert.equal(metadata.props.style.fontSize, 13);
  toggle.props.onClick();
  const opened = find(render(props), node => node.type === 'article');
  assert.equal(find(opened, node => node.type === 'button').props['aria-expanded'], true);
  assert.equal(find(opened, node => node.type?.name === 'Editor').props.item, item);
  find(opened, node => node.type === 'button').props.onClick();
  const collapsed = find(render(props), node => node.type?.name === 'Editor');
  assert.equal(collapsed.props.hidden, true);
  assert.equal(collapsed.key, find(opened, node => node.type?.name === 'Editor').key);
});

test('switching between cards keeps separate editors mounted under stable consultation keys', () => {
  const first = { id: 'first', name: '첫 상담', status: 'new', phone: '', admin_note: 'first', admin_version: 1 };
  const second = { ...first, id: 'second', name: '둘째 상담', admin_note: 'second' };
  const render = editorHarness(() => {}, [[first, second], 2, [], '', { status: 'all', page: 1, month: '', q: '' }, 'first', 0, false, ''], true);
  const props = { refresh: 0, onSaved: () => {} };
  const editorFor = (tree, id) => find(tree, node => node.type?.name === 'Editor' && node.props.item.id === id);
  let tree = render(props);
  assert.equal(editorFor(tree, 'first').props.hidden, false);
  assert.equal(editorFor(tree, 'second').props.hidden, true);
  find(tree, node => node.type === 'article' && text(node).includes('둘째 상담')).props.children[0].props.onClick();
  tree = render(props);
  assert.equal(editorFor(tree, 'first').props.hidden, true);
  assert.equal(editorFor(tree, 'second').props.hidden, false);
  assert.equal(editorFor(tree, 'first').key, 'first');
  assert.equal(editorFor(tree, 'second').key, 'second');
});

test('save keeps editor mounted, uses returned version on second save, and shows inline success', async () => {
  const requests = [];
  let item = { id: 'test', status: 'lost', phone: '01000000000', admin_note: ' note ', next_contact_at: null, admin_version: 2 };
  const render = editorHarness(async (_url, options) => {
    const body = JSON.parse(options.body); requests.push(body);
    return { ok: true, json: async () => ({ item: { ...item, admin_note: body.admin_note.trim(), admin_version: body.admin_version + 1 } }) };
  });
  const props = () => ({ item, onSaved: updated => { item = updated; } });
  await find(render(props()), node => node.type === 'button').props.onClick();
  assert.equal(item.admin_version, 3);
  assert.equal(find(render(props()), node => node.props?.role === 'status').props.children, '상담 내용을 저장했어요.');
  await find(render(props()), node => node.type === 'button').props.onClick();
  assert.deepEqual(requests.map(row => row.admin_version), [2, 3]);
  assert.equal(requests[1].admin_note, 'note');
  assert.equal(Object.hasOwn(requests[1], 'next_contact_at'), false);
  assert.equal(find(render(props()), node => node.props?.type === 'datetime-local'), undefined);
});

test('omitted next contact preserves existing stored schedules even when closing a lead', () => {
  const patch = crm.crmPatch({ status: 'lost', admin_note: 'saved', admin_version: 2 });
  assert.ok(patch);
  assert.equal(Object.hasOwn(patch, 'next_contact_at'), false);
});
test('failed save preserves draft and does not call success callback', async () => {
  let called = false;
  const render = editorHarness(async () => ({ ok: false, json: async () => ({ error: '다른 화면에서 변경됐어요.' }) }));
  const props = { item: { id: 'test', status: 'contracted', phone: '', admin_note: 'keep draft', next_contact_at: null, admin_version: 2 }, onSaved: () => { called = true; } };
  await find(render(props), node => node.type === 'button').props.onClick();
  assert.equal(called, false);
  assert.equal(find(render(props), node => node.type === 'textarea').props.value, 'keep draft');
  assert.equal(find(render(props), node => node.props?.role === 'alert').props.children, '다른 화면에서 변경됐어요.');
});
test('list save retains the open editor and its key, without fetching or removing a filtered row', () => {
  const item = { id: 'test', name: 'fixture', status: 'contracted', phone: '', admin_note: '', next_contact_at: null, admin_version: 1 };
  const updated = { ...item, status: 'lost', admin_version: 2 };
  let fetches = 0, notification;
  const render = editorHarness(() => { fetches++; }, [[item], 1, [{ status: 'all', count: 1 }, { status: 'contracted', count: 1 }, { status: 'lost', count: 0 }], '', { status: 'contracted', page: 1, month: '', due: false, q: '' }, 'test', 0, false, ''], true);
  const props = { refresh: 0, onSaved: (before, after) => { notification = [before, after]; } };
  const editor = find(render(props), node => node.type?.name === 'Editor');
  editor.props.onSaved(updated);
  const retained = find(render(props), node => node.type?.name === 'Editor');
  assert.equal(retained.key, editor.key);
  assert.equal(retained.props.item.admin_version, 2);
  assert.equal(retained.props.item.status, 'lost');
  assert.equal(fetches, 0);
  assert.equal(notification[0], item);
  assert.equal(notification[1], updated);
});
