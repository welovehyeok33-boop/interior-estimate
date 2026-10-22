import test from 'node:test';
import assert from 'node:assert/strict';
import { parseStatsPeriod, statsMonth, statsQuery, validStatsMonth } from '../src/lib/adminStatsPeriod.ts';

const now = new Date('2026-10-22T03:00:00Z');
const month = value => parseStatsPeriod(new URLSearchParams({ range: 'month', month: value }), now);
test('calendar months handle all lengths, leap years and year boundaries without a rolling 30-day window', () => {
  for (const [value, last, length] of [['2026-08','31',31], ['2026-09','30',30], ['2024-02','29',29], ['2025-02','28',28], ['2025-12','31',31]]) {
    const period = month(value);
    assert.equal(period.from, value + '-01'); assert.equal(period.to, value + '-' + last);
    assert.equal(period.dates.length, length); assert.equal(new Set(period.dates).size, length);
    assert.equal(period.detailCoverage.complete, false);
    if (value < '2026-09') assert.equal(period.detailCoverage.from, null);
  }
});
test('current month ends today in Korea, with an exact midnight and year rollover', () => {
  assert.equal(month('2026-10').to, '2026-10-22'); assert.equal(month('2026-10').dates.length, 22);
  assert.equal(month('2026-10').detailCoverage.complete, true);
  const boundary = new Date('2026-12-31T15:00:00Z');
  assert.equal(statsMonth(boundary), '2027-01');
  const period = parseStatsPeriod(new URLSearchParams('range=month&month=2027-01'), boundary);
  assert.deepEqual(period.dates, ['2027-01-01']);
});
test('malformed, future, missing, duplicate and ambiguous period requests fail closed', () => {
  for (const value of ['', '2026-1', '2026-00', '2026-13', '2026-11', '1999-12', '2026-10-01', '../admin']) {
    assert.equal(validStatsMonth(value, now), false); assert.equal(month(value), null);
  }
  for (const query of ['range=all', 'range=month', 'range=7&month=2026-10', 'range=7&range=month', 'range=month&month=2026-10&month=2026-09']) assert.equal(parseStatsPeriod(new URLSearchParams(query), now), null);
});
test('presets and query strings retain their existing contract; partial detail retention stays explicit', () => {
  for (const [range, from, to, length] of [['today','2026-10-22','2026-10-22',1], ['yesterday','2026-10-21','2026-10-21',1], ['7','2026-10-16','2026-10-22',7], ['30','2026-09-23','2026-10-22',30]]) {
    const period = parseStatsPeriod(new URLSearchParams({ range }), now);
    assert.equal(period.from, from); assert.equal(period.to, to); assert.equal(period.dates.length, length); assert.equal(period.detailCoverage.complete, true);
    assert.equal(statsQuery(range,'2026-08'), 'range=' + range);
  }
  assert.equal(statsQuery('month','2026-08'), 'range=month&month=2026-08');
  const partial = month('2026-09').detailCoverage;
  assert.deepEqual(partial, { complete: false, from: '2026-09-23', to: '2026-09-30' });
  assert.equal(parseStatsPeriod(new URLSearchParams(), now).range, '7');
});
