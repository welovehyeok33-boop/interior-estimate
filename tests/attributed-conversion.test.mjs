import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
const exports = {};
runInNewContext(ts.transpileModule(readFileSync(new URL('../src/lib/analytics.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports });
test('exclude unknown sources from both numerator and denominator', () => {
  const result = exports.attributedConversion([
    { source: 'direct', visitors: 100, converted: 20 },
    { source: null, visitors: 40, converted: 4 },
    { source: 'unknown', visitors: 10, converted: 2 },
    { source: 'naver', visitors: 20, converted: 2 },
    { source: 'instagram', visitors: 30, converted: 3 },
  ]);
  assert.equal(result.visitors, 50);
  assert.equal(result.converted, 5);
  assert.equal(result.rate, 10);
});
test('no attributed visitors is unavailable, not zero percent', () => {
  assert.equal(exports.attributedConversion([]).rate, null);
  assert.equal(exports.attributedConversion([{ source: 'direct', visitors: 10, converted: 1 }]).rate, null);
});
