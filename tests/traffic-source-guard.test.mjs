import test from 'node:test';
import assert from 'node:assert/strict';
import { hasUnrecognizedTrafficSource } from '../src/lib/attribution.ts';

test('randomized and injection-like acquisition values cannot become visitors', () => {
  for (const source of ['adqcfyfuues_bkz', '<script>alert(1)</script>', 'naver.com.evil', {}, 123]) {
    assert.equal(hasUnrecognizedTrafficSource({ source }), true);
  }
});
test('existing sources, newly supplied interiorpick links and unattributed visits remain countable', () => {
  for (const source of ['direct', 'naver', 'google', 'other', 'interiorfree', 'interiorhub_office',
    'interiorhub_academy', 'interiorhub_apt', 'interiorhub_villa', 'interiorpick', 'NAVER', '', null]) {
    assert.equal(hasUnrecognizedTrafficSource({ source }), false);
  }
  assert.equal(hasUnrecognizedTrafficSource(undefined), false);
});
