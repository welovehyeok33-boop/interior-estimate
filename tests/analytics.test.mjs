import test from 'node:test';
import assert from 'node:assert/strict';
import { koreaDay, trafficKind, conversionRate } from '../src/lib/analytics.ts';

test('KST day rolls over exactly at 15:00 UTC, including year boundary', () => {
  assert.equal(koreaDay(new Date('2026-12-31T14:59:59.999Z')), '2026-12-31');
  assert.equal(koreaDay(new Date('2026-12-31T15:00:00.000Z')), '2027-01-01');
});
test('only public visitor routes count; admin, API and unknown routes are excluded', () => {
  for (const path of ['/admin','/api/admin/records','/partner/leads','/login','/consult/fake']) assert.equal(trafficKind(path), null);
  assert.equal(trafficKind('/'), 'visit');
  assert.equal(trafficKind('/blog/example'), 'visit');
  assert.equal(trafficKind('/consult/step4'), 'consult');
  assert.equal(trafficKind('/estimate/detail/step5'), 'engine');
});
test('no traffic has no conversion rate rather than a misleading zero', () => {
  assert.equal(conversionRate(0,0), null);
  assert.equal(conversionRate(1,3), 33.3);
  assert.equal(conversionRate(0,3), 0);
});
