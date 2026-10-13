import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import * as crm from '../src/lib/adminCrm.ts';

test('status counts move between contract and lost without changing total', () => {
  const counts = [{ status: 'all', count: 4 }, { status: 'contracted', count: 1 }, { status: 'lost', count: 0 }];
  const updated = crm.updateConsultationCounts(counts, 'contracted', 'lost');
  assert.deepEqual(updated.map(row => row.count), [4, 0, 1]);
  assert.equal(counts[1].count, 1);
  assert.equal(crm.updateConsultationCounts(updated, 'lost', 'lost'), updated);
});

function editorHarness(fetch, initial = [], root = false) {
  const state = [...initial]; let cursor = 0;
  const jsx = (type, props, key) => ({ type, props, key });
  const palette = new Proxy({}, { get: () => ({}) });
  const exports = {};
  const source = readFileSync(new URL('../src/components/AdminConsultations.tsx', import.meta.url), 'utf8') + '\nexport { Editor };';
  const dependencies = {
    react: { useEffect: () => {}, useState: initial => { const i = cursor++; if (!(i in state)) state[i] = initial; return [state[i], value => { state[i] = typeof value === 'function' ? value(state[i]) : value; }]; } },
    'react/jsx-runtime': { jsx, jsxs: jsx },
    './EstimateLayout': { C: { admin: palette, consultStatus: palette } },
    './adminStyles': { consultStatusStyle: () => ({}), consultStatusBadge: () => ({}) },
    '@/lib/estimateRegion': { formatEstimateRegion: () => '' },
    '@/lib/adminCrm': crm,
    '@/lib/consultStore': { formatConsultBudget: () => '', formatConsultSchedule: () => '' },
    '@/lib/intakeValidation': { INDUSTRY_LABELS: {} },
  };
  runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText,
    { exports, require: name => dependencies[name] || {}, fetch });
  return props => { cursor = 0; return (root ? exports.default : exports.Editor)(props); };
}
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
