import test from 'node:test';
import assert from 'node:assert/strict';
import { captureAttribution, normalizeAttribution, campaignToken, landingGroup } from '../src/lib/attribution.ts';
import { crmPatch, fromKstInput, kstInput } from '../src/lib/adminCrm.ts';

test('campaign identifiers take precedence, exclude URL queries and normalize', () => {
  assert.deepEqual(captureAttribution('https://form.it.kr/consult?utm_source=Instagram&utm_medium=social&utm_campaign=fall_26&phone=01012345678', 'https://google.com/search?q=private'),
    { source: 'instagram', medium: 'social', campaign: 'fall_26', landing: '/consult' });
  for (const token of ['a01012345678', 'a@b.com', '한글', 'a b', 'x'.repeat(65), null]) assert.equal(campaignToken(token), '');
});
test('referrers use exact domain boundaries and ignore internal traffic', () => {
  assert.equal(captureAttribution('https://form.it.kr/', 'https://search.naver.com/').source, 'naver');
  assert.equal(captureAttribution('https://form.it.kr/', 'https://naver.com.attacker.test/').source, 'other');
  for (const ref of ['', 'invalid', 'javascript:alert(1)', 'https://form.it.kr/consult', 'https://interior-estimate-rouge.vercel.app/'])
    assert.equal(captureAttribution('https://form.it.kr/', ref).source, 'direct');
});
test('server sanitizes metadata and groups article paths', () => {
  assert.equal(normalizeAttribution(null), null);
  assert.equal(landingGroup('/blog/private-slug'), '/blog');
  assert.deepEqual(normalizeAttribution({ source: 'bad email@test', medium: {}, campaign: 'ok', landing: '/private/user' }),
    { source: 'direct', medium: '', campaign: 'ok', landing: 'unknown' });
});
const patch = { status: 'consulting', admin_note: ' 메모 ', next_contact_at: null, admin_version: 0 };
test('CRM accepts only permitted fields, version and valid dates', () => {
  assert.deepEqual(crmPatch({ ...patch, phone: 'tamper' }), { status: 'consulting', admin_note: '메모', next_contact_at: null, admin_version: 1 });
  for (const invalid of [{ status: 'admin' }, { status: '__proto__' }, { admin_note: 'x'.repeat(4001) }, { admin_version: -1 }, { admin_version: 1.5 }, { next_contact_at: '2026-02-30T00:00:00.000Z' }])
    assert.equal(crmPatch({ ...patch, ...invalid }), null);
});
test('follow-up dates round-trip as KST regardless of device timezone', () => {
  assert.equal(fromKstInput('2026-10-03T09:30'), '2026-10-03T00:30:00.000Z');
  assert.equal(kstInput('2026-10-03T00:30:00.000Z'), '2026-10-03T09:30');
  assert.equal(fromKstInput(''), null);
  assert.throws(() => fromKstInput('not-a-date'));
});
