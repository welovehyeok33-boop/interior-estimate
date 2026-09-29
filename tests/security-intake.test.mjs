import test from 'node:test';
import assert from 'node:assert/strict';
import { validateConsult, validPhone, validArea, validBudget, consultStage, CONSENT_VERSION } from '../src/lib/intakeValidation.ts';
import { signSession, validSession } from '../src/lib/sessionToken.ts';

const input = { region: 'local', regionDetail: '부산', buildingType: 'commercial', commercialType: 'food', commercialSub: '카페', spaceDescription: '테이크아웃 매장', area: 30, schedule: 'undecided', budget: 'unknown', name: '검증용', phone: '010-1234-5678', agreed: true, consentVersion: CONSENT_VERSION, submissionId: 'd7c73c82-c9d5-4d68-b8d1-40d788639156' };
test('complete commercial and residential applications pass', () => {
  assert.equal(validateConsult(input), null);
  assert.equal(validateConsult({...input, buildingType: 'residential', residentialGrade: 'standard'}), null);
  assert.equal(validateConsult({...input, commercialType: 'unknown', commercialSub: ''}), null);
});
test('incomplete stages redirect to the missing stage', () => {
  assert.equal(consultStage({}), '/consult');
  assert.equal(consultStage({...input, area: undefined}), '/consult/step2');
  assert.equal(consultStage({...input, budget: undefined}), '/consult/step3');
});
test('invalid contact, enum, consent and oversized descriptions fail', () => {
  for (const patch of [{phone:'12345678901'}, {name:' '}, {agreed:false}, {consentVersion:'old'}, {commercialSub:'invalid'}, {area:Infinity}, {budget:'-500'}, {submissionId:'bad'}, {spaceDescription:'x'.repeat(201)}]) assert.ok(validateConsult({...input,...patch}));
  for (const value of [null, [], 1]) assert.ok(validateConsult(value));
});
test('area, phone and budget boundaries', () => {
  assert.equal(validPhone('010-1234-5678'), true);
  assert.equal(validPhone('02-123-4567'), true);
  assert.equal(validPhone('abcdefghijk'), false);
  for (const v of [0, -1, NaN, Infinity, 10000, '30']) assert.equal(validArea(v), false);
  for (const v of ['unknown','500','10000']) assert.equal(validBudget(v), true);
  for (const v of ['0','501','10001',500]) assert.equal(validBudget(v), false);
});
test('signed sessions expire and reject tampering or wrong secrets', () => {
  const now = 1790000000000;
  const token = signSession(now + 10000, 'test-only-secret');
  assert.equal(validSession(token,'test-only-secret',now), true);
  assert.equal(validSession(token,'wrong-secret',now), false);
  assert.equal(validSession(token,'test-only-secret',now+10000), false);
  assert.equal(validSession(token.slice(0,-1)+'z','test-only-secret',now), false);
  assert.equal(validSession(signSession(now+9*3600000,'test-only-secret'),'test-only-secret',now), false);
});
