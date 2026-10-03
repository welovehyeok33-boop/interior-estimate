import test from 'node:test';
import assert from 'node:assert/strict';
import { maskIp, clientEnvironment, trafficMetadata } from '../src/lib/serverTrafficDetails.ts';
import { trackedPage, locationLabel } from '../src/lib/trafficDetails.ts';

test('IP masks never keep full v4/v6 or mapped v4, reject malformed IPs', () => {
  assert.equal(maskIp('203.0.113.98'), '203.0.*.*');
  assert.equal(maskIp('203.0.113.98, 10.0.0.1'), '203.0.*.*');
  assert.equal(maskIp('2001:db8:1234:5678:abcd:1234:5678:9999'), '2001:db8:1234:*:*:*:*:*');
  assert.equal(maskIp('2001:db8::1'), '2001:db8:0:*:*:*:*:*');
  assert.equal(maskIp('::ffff:192.0.2.128'), '192.0.*.*');
  assert.equal(maskIp('::ffff:c000:280'), '192.0.*.*');
  for (const value of [null, '', 'email@test.com','999.0.0.1','fe80::1%eth0','1.2.3.4:80']) assert.equal(maskIp(value), null);
});
test('only trusted Vercel headers supply geo and IP; no full UA or query retained', () => {
  const h = new Headers({ 'x-vercel-ip-country':'KR', 'x-vercel-ip-country-region':'11', 'x-vercel-ip-city':'%EC%84%9C%EC%9A%B8',
    'x-vercel-forwarded-for':'203.0.113.98', 'user-agent':'Mozilla/5.0 (Windows NT 10.0) Chrome/140.0 Safari/537.36' });
  assert.equal(trafficMetadata(h,false).country,null);
  assert.equal(trafficMetadata(h,false).ip_mask,null);
  const result=trafficMetadata(h,true);
  assert.equal(result.city,'서울'); assert.equal(result.os,'Windows'); assert.equal(result.device,'PC'); assert.equal(result.browser,'Chrome');
  assert.ok(!JSON.stringify(result).includes('203.0.113.98'));
  assert.ok(!JSON.stringify(result).includes('Mozilla'));
  h.set('x-vercel-ip-city','%ZZ'); assert.equal(trafficMetadata(h,true).city,null);
});
test('device and browser buckets prefer specific apps/browsers', () => {
  assert.equal(clientEnvironment('Mozilla Android Mobile Chrome/140 SamsungBrowser/28').browser,'Samsung Internet');
  assert.equal(clientEnvironment('Mozilla Android Mobile Chrome/140 EdgA/140').browser,'Edge');
  assert.equal(clientEnvironment('Mozilla iPhone CriOS/140 Safari/1').os,'iOS');
  assert.equal(clientEnvironment('Mozilla iPad Safari/1').device,'태블릿');
  assert.equal(clientEnvironment('Mozilla Android Chrome/140').device,'태블릿');
  assert.equal(clientEnvironment('Mozilla iPhone Safari/1 KAKAOTALK').browser,'카카오 인앱');
  assert.equal(clientEnvironment('').device,'확인 불가');
});
test('page tracking excludes admin, private paths and query strings', () => {
  assert.equal(trackedPage('/consult/step3'),'/consult/step3');
  assert.equal(trackedPage('/blog/arbitrary-private-slug'),'/blog');
  for(const p of ['/admin','/api/admin/records','/consult?phone=123','/consult/step8',null]) assert.equal(trackedPage(p),null);
  assert.equal(locationLabel({country:'KR',region:'11',city:null}),'대한민국 · 서울');
});
