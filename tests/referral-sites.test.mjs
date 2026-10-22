import test from 'node:test';
import assert from 'node:assert/strict';
import { REFERRAL_SITES, referralDates, referralLink, validateReferralStats, groupReferralRows, calculateReferralRate } from '../src/lib/referralSites.ts';
const dates = ['2026-10-15', '2026-10-16'];
const report = () => ({version:1,source:'interiorfree',timezone:'Asia/Seoul',metric:'daily_unique_browser',from:dates[0],to:dates[1],coverage:'complete',days:dates.map(day=>({day,visitors:10,clickers:2}))});
test('period boundaries use Korean day and reject unsupported ranges',()=>{
  assert.equal(referralDates('today',new Date('2026-10-15T15:00:00Z')).from,'2026-10-16');
  assert.equal(referralDates('yesterday',new Date('2026-10-15T15:00:00Z')).to,'2026-10-15');
  assert.equal(referralDates('30').dates.length,30);
  assert.throws(()=>referralDates('999'));
});
test('five active safe source links retain destination and exclude the retired apartment guide',()=>{
  assert.equal(new Set(REFERRAL_SITES.map(s=>s.source)).size,5);
  assert.ok(!REFERRAL_SITES.some(s=>s.source==='buildhyeok_apt'||s.host==='apt.buildhyeok.com'));
  for(const s of REFERRAL_SITES){const u=new URL(referralLink(s.source,s.destination));assert.equal(u.origin,'https://form.it.kr');assert.equal(u.searchParams.get('utm_source'),s.source);assert.equal(u.pathname,s.destination);}
});

test('display groups keep Interiorfree first and the four HUB sites together without changing API order',()=>{
  const rows=REFERRAL_SITES.map(site=>({...site}));
  const before=rows.map(row=>row.source);const groups=groupReferralRows(rows);
  assert.deepEqual(groups.map(group=>group.id),['interiorfree','interiorhub']);
  assert.equal(groups[0].rows[0].source,'interiorfree');
  assert.deepEqual(groups[1].rows.map(row=>row.source),['interiorhub_office','interiorhub_academy','interiorhub_apt','interiorhub_villa']);
  assert.equal(groups.length,2);
  assert.deepEqual(rows.map(row=>row.source),before);
  assert.deepEqual(groupReferralRows([]),[]);
  assert.equal(groupReferralRows([{source:'other',host:'fakeinteriorhub.kr'}])[0].id,'other');
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
  assert.deepEqual(stats.visitorDates,[dates[1]]);
  r.days[1].visitors=0;r.days[1].clickers=0;
  const zero=validateReferralStats(r,'interiorfree',dates);
  assert.equal(zero.recordedVisitors,0);assert.equal(zero.recordedClickers,0);
  r.days[1].visitors=null;r.days[1].clickers=null;
  const missing=validateReferralStats(r,'interiorfree',dates);
  assert.equal(missing.recordedVisitors,null);assert.equal(missing.visitorDays,0);
  assert.deepEqual(missing.visitorDates,[]);
});

test('rate uses site traffic, not clickers, permits provisional values and does not clamp above 100 percent',()=>{
  const raw=report();raw.days.forEach(day=>{day.clickers=null;});
  const stats={...validateReferralStats(raw,'interiorfree',dates),status:'partial'};
  assert.equal(calculateReferralRate(stats,4).rate,20);
  assert.equal(calculateReferralRate(stats,4).rateBasis.state,'provisional');
  assert.equal(calculateReferralRate(stats,0).rate,0);
  assert.equal(calculateReferralRate(stats,30).rate,150);
  assert.equal(calculateReferralRate(stats,null).rateBasis.state,'unavailable');
  assert.equal(calculateReferralRate(stats,-1).rateBasis.state,'unavailable');
});

test('missing click days prevent complete status even when visitor totals are complete',()=>{
  const r=report();r.days[0].clickers=null;
  const stats=validateReferralStats(r,'interiorfree',dates);
  assert.equal(stats.visitors,20);assert.equal(stats.recordedClickers,2);
  assert.equal(stats.partial,true);assert.equal(stats.visitorDays,2);assert.equal(stats.clickerDays,1);
});
