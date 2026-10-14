import test from 'node:test';
import assert from 'node:assert/strict';
import { koreaDay, trafficKind, conversionRate, consultContactVisitors } from '../src/lib/analytics.ts';

test('contact metric uses only the final phone page and includes unsubmitted visits', () => {
  assert.equal(consultContactVisitors({ pages: [
    { path: '/consult', visitors: 20, converted: 2 },
    { path: '/consult/step2', visitors: 15, converted: 2 },
    { path: '/consult/step3', visitors: 10, converted: 2 },
    { path: '/consult/step4', visitors: 6, converted: 2 },
  ] }), 6);
  assert.equal(consultContactVisitors({ pages: [{ path: '/consult', visitors: 20 }] }), 0);
  assert.equal(consultContactVisitors({ pages: [] }), 0);
  assert.equal(consultContactVisitors(undefined), null);
  assert.equal(consultContactVisitors(null), null);
});

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
