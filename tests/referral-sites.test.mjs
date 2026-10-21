import test from 'node:test';
import assert from 'node:assert/strict';
import { REFERRAL_SITES, referralDates, referralLink, validateReferralStats } from '../src/lib/referralSites.ts';
const dates = ['2026-10-15', '2026-10-16'];
const report = () => ({version:1,source:'interiorfree',timezone:'Asia/Seoul',metric:'daily_unique_browser',from:dates[0],to:dates[1],coverage:'complete',days:dates.map(day=>({day,visitors:10,clickers:2}))});
test('period boundaries use Korean day and reject unsupported ranges',()=>{
  assert.equal(referralDates('today',new Date('2026-10-15T15:00:00Z')).from,'2026-10-16');
  assert.equal(referralDates('yesterday',new Date('2026-10-15T15:00:00Z')).to,'2026-10-15');
  assert.equal(referralDates('30').dates.length,30);
  assert.throws(()=>referralDates('999'));
});
test('four distinct safe source links retain destination',()=>{
  assert.equal(new Set(REFERRAL_SITES.map(s=>s.source)).size,4);
  for(const s of REFERRAL_SITES){const u=new URL(referralLink(s.source,s.destination));assert.equal(u.origin,'https://form.it.kr');assert.equal(u.searchParams.get('utm_source'),s.source);assert.equal(u.pathname,s.destination);}
});
test('complete daily aggregates sum but incomplete counts never become zero',()=>{
  assert.equal(validateReferralStats(report(),'interiorfree',dates).visitors,20);
  const r=report();r.days[0].visitors=null;assert.equal(validateReferralStats(r,'interiorfree',dates).visitors,null);
  r.days[0].visitors=0;r.days[1].visitors=0;assert.equal(validateReferralStats(r,'interiorfree',dates).visitors,0);
  r.coverage='partial';assert.equal(validateReferralStats(r,'interiorfree',dates).visitors,0);assert.equal(validateReferralStats(r,'interiorfree',dates).partial,true);
});
test('reject source mismatch, duplicate dates, negative counts and session metrics',()=>{
  assert.throws(()=>validateReferralStats(report(),'other',dates));
  const r=report();r.days[1].day=dates[0];assert.throws(()=>validateReferralStats(r,'interiorfree',dates));
  const n=report();n.days[0].visitors=-1;assert.throws(()=>validateReferralStats(n,'interiorfree',dates));
  const s=report();s.metric='sessions';assert.throws(()=>validateReferralStats(s,'interiorfree',dates));
});

test('missing dates preserve recorded totals and coverage separately from full-period totals',()=>{
  const r=report();r.days[0].visitors=null;r.days[0].clickers=null;r.coverage='partial';
  const stats=validateReferralStats(r,'interiorfree',dates);
  assert.equal(stats.visitors,null);assert.equal(stats.clickers,null);
  assert.equal(stats.recordedVisitors,10);assert.equal(stats.recordedClickers,2);
  assert.equal(stats.visitorDays,1);assert.equal(stats.clickerDays,1);assert.equal(stats.totalDays,2);
  r.days[1].visitors=0;r.days[1].clickers=0;
  const zero=validateReferralStats(r,'interiorfree',dates);
  assert.equal(zero.recordedVisitors,0);assert.equal(zero.recordedClickers,0);
  r.days[1].visitors=null;r.days[1].clickers=null;
  const missing=validateReferralStats(r,'interiorfree',dates);
  assert.equal(missing.recordedVisitors,null);assert.equal(missing.visitorDays,0);
});

test('missing click days prevent complete status even when visitor totals are complete',()=>{
  const r=report();r.days[0].clickers=null;
  const stats=validateReferralStats(r,'interiorfree',dates);
  assert.equal(stats.visitors,20);assert.equal(stats.recordedClickers,2);
  assert.equal(stats.partial,true);assert.equal(stats.visitorDays,2);assert.equal(stats.clickerDays,1);
});
