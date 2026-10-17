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
    './EstimateLayout': { C: { admin: palette, consultStatus: palette } },
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
test('autosave waits one second, skips unchanged/composing/failed drafts, and cancels pending timer', async () => {
  for (const [note, busy, error, composing, expected] of [['original', false, '', false, 0], ['edited', false, '', false, 1], ['edited', true, '', false, 0], ['edited', false, 'failed', false, 0], ['edited', false, '', true, 0]]) {
    const effects = [], timers = [], cleared = [], requests = [];
    const item = { id: 'test', status: 'new', admin_note: 'original', phone: '01000000000', admin_version: 1 };
    const render = editorHarness(async (_url, options) => { requests.push(JSON.parse(options.body)); return { ok: true, json: async () => ({ item: { ...item, admin_note: note, admin_version: 2 } }) }; }, ['new', note, busy, error, false, composing], false, {
      effect: effect => effects.push(effect), globals: { setTimeout: (fn, delay) => { timers.push({ fn, delay }); return 1; }, clearTimeout: id => cleared.push(id) },
    });
    render({ item, onSaved: () => {} });
    const cleanup = effects[0]();
    assert.equal(timers.length, expected);
    if (expected) {
      assert.equal(timers[0].delay, 1000);
      cleanup(); assert.deepEqual(cleared, [1]);
      timers[0].fn(); await new Promise(resolve => setImmediate(resolve));
      assert.equal(requests[0].admin_note, 'edited');
      assert.equal(requests[0].admin_version, 1);
    }
  }
});
function find(node, predicate) {
  if (!node || typeof node !== 'object') return;
  if (predicate(node)) return node;
  for (const child of [node.props?.children].flat(Infinity)) { const found = find(child, predicate); if (found) return found; }
}
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
