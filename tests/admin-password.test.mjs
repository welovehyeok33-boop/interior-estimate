import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import * as crypto from 'node:crypto';
import ts from 'typescript';

// Load the actual server module with framework/DB dependencies stubbed out.
function auth(password, key = 'test-service-key') {
  const source = readFileSync(new URL('../src/lib/serverAuth.ts', import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  runInNewContext(compiled, {
    exports, process: { env: { ADMIN_PASSWORD: password, SUPABASE_SERVICE_ROLE_KEY: key } },
    require: name => name === 'node:crypto' ? crypto : {},
  });
  return exports;
}

test('short and long configured passwords match exactly', () => {
  for (const password of ['abcd', 'test-only-12!', 'x'.repeat(16), 'x'.repeat(200)]) {
    const module = auth(password);
    assert.equal(module.passwordMatches(password), true);
    assert.equal(module.passwordMatches('wrong'), false);
    assert.equal(module.passwordMatches(''), false);
  }
  assert.equal(auth(' abcd ').passwordMatches('abcd'), false);
});

test('missing, blank, oversized credentials and missing key remain blocked', () => {
  for (const password of [undefined, '', '   ', 'x'.repeat(201)]) {
    assert.throws(() => auth(password).passwordMatches('test'), /not configured/);
  }
  assert.throws(() => auth('abcd', '').passwordMatches('abcd'), /not configured/);
});
