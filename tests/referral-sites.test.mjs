import test from 'node:test';
import assert from 'node:assert/strict';
import { REFERRAL_SITES, referralDates, referralLink, validateReferralStats, combineReferralStats, groupReferralRows, calculateReferralRate, summarizeReferralRows, referralTotalRate } from '../src/lib/referralSites.ts';
const dates = ['2026-10-15', '2026-10-16'];
const report = () => ({version:1,source:'interiorfree',timezone:'Asia/Seoul',metric:'daily_unique_browser',from:dates[0],to:dates[1],coverage:'complete',days:dates.map(day=>({day,visitors:10,clickers:2}))});

test('site footer sums only its four displayed metrics without mutating rows or adding rates',()=>{
  const rows=[{external:{status:'ready',visitors:10,recordedVisitors:10,visitorDays:2,totalDays:2},arrivals:3,contacts:2,converted:1},
    {external:{status:'ready',visitors:20,recordedVisitors:20,visitorDays:2,totalDays:2},arrivals:5,contacts:4,converted:2}];
  const before=JSON.stringify(rows),totals=summarizeReferralRows(rows);
  assert.equal(totals.length,4);assert.deepEqual(totals.map(item=>item.value),[30,8,6,3]);
  assert.ok(totals.every(item=>!item.partial&&item.knownSites===2&&item.totalSites===2));
  assert.equal(JSON.stringify(rows),before);
});

test('footer never labels a subset of sites as a full total and keeps missing dates, zero and unsafe totals distinct',()=>{
  const rows=[{external:{status:'partial',visitors:null,recordedVisitors:13},arrivals:2,contacts:null,converted:1},
    {external:{status:'error',visitors:null,recordedVisitors:null},arrivals:0,contacts:null,converted:0}];
  const totals=summarizeReferralRows(rows);
  assert.deepEqual(totals[0],{value:null,knownSites:1,totalSites:2,partial:true,periodComplete:false});
  assert.deepEqual(totals[2],{value:null,knownSites:0,totalSites:2,partial:true,periodComplete:false});
  assert.equal(totals[1].value,2);assert.equal(totals[1].partial,false);
  rows[0].external.recordedVisitors=0;assert.equal(summarizeReferralRows(rows)[0].value,null);
  rows[1].external={status:'partial',visitors:0,recordedVisitors:0};assert.equal(summarizeReferralRows(rows)[0].value,0);assert.equal(summarizeReferralRows(rows)[0].partial,true);
  assert.ok(summarizeReferralRows([]).every(item=>item.value===null));
  rows.forEach(row=>{row.arrivals=Number.MAX_SAFE_INTEGER;});assert.equal(summarizeReferralRows(rows)[1].value,null);
});

test('overall referral percentage divides displayed arrival totals by displayed visitor totals',()=>{
  const rows=[{external:{status:'partial',visitors:13,recordedVisitors:13,visitorDays:1,totalDays:1},arrivals:0,contacts:0,converted:0},
    {external:{status:'partial',visitors:14,recordedVisitors:14,visitorDays:1,totalDays:1},arrivals:4,contacts:3,converted:2}];
  const before=JSON.stringify(rows);assert.equal(referralTotalRate(summarizeReferralRows(rows)),14.8);assert.equal(JSON.stringify(rows),before);
  rows[0].external.visitors=100;rows[0].arrivals=50;rows[1].external.visitors=1;rows[1].arrivals=1;
  assert.equal(referralTotalRate(summarizeReferralRows(rows)),50.5); // Not the 75% unweighted average.
  rows.forEach(row=>{row.arrivals=0;});assert.equal(referralTotalRate(summarizeReferralRows(rows)),0);
  rows[0].external.visitors=0;rows[1].external.visitors=1;rows[1].arrivals=2;
  assert.equal(referralTotalRate(summarizeReferralRows(rows)),200); // No artificial 100% cap.
});

test('overall ratio cannot turn zero, missing or unsafe denominators into a percentage',()=>{
  const rows=[{external:{status:'error',visitors:null,recordedVisitors:null},arrivals:1,contacts:null,converted:0}];
  assert.equal(referralTotalRate(summarizeReferralRows(rows)),null);
  rows[0].external.recordedVisitors=0;assert.equal(referralTotalRate(summarizeReferralRows(rows)),null);
  assert.equal(referralTotalRate([]),null);
  for(const value of [null,-1,NaN,Number.MAX_SAFE_INTEGER+1])assert.equal(referralTotalRate([{value:1,periodComplete:true},{value,periodComplete:true}]),null);
  assert.equal(referralTotalRate([{value:Number.MAX_SAFE_INTEGER+1,periodComplete:true},{value:1,periodComplete:true}]),null);
});

test('missing sites or historical dates cannot inflate the overall rate while ongoing complete-day counts may be provisional',()=>{
  const rows=[{external:{status:'partial',visitors:13,recordedVisitors:13,visitorDays:7,totalDays:7},arrivals:0,contacts:0,converted:0},
    {external:{status:'partial',visitors:14,recordedVisitors:14,visitorDays:7,totalDays:7},arrivals:4,contacts:3,converted:2}];
  assert.equal(referralTotalRate(summarizeReferralRows(rows)),14.8);
  rows[1].external={...rows[1].external,status:'error',visitors:null,recordedVisitors:null,visitorDays:0};
  assert.equal(summarizeReferralRows(rows)[0].value,null);assert.equal(referralTotalRate(summarizeReferralRows(rows)),null); // Never 4/13 = 30.8%.
  rows[1].external={...rows[1].external,status:'partial',visitors:null,recordedVisitors:14,visitorDays:6};
  const partial=summarizeReferralRows(rows);assert.equal(partial[0].value,27);assert.equal(partial[0].periodComplete,false);assert.equal(referralTotalRate(partial),null);
});
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

test('calendar chunks combine known dates, preserve nulls and do not overflow or double count',()=>{
  const first=validateReferralStats(report(),'interiorfree',dates);
  const day='2026-10-17';const second=validateReferralStats({...report(),from:day,to:day,days:[{day,visitors:null,clickers:0}],coverage:'partial'},'interiorfree',[day]);
  const combined=combineReferralStats([first,second]);
  assert.equal(combined.totalDays,3);assert.equal(combined.visitors,null);assert.equal(combined.recordedVisitors,20);assert.equal(combined.visitorDays,2);
  assert.equal(combined.clickers,4);assert.equal(combined.partial,true);assert.deepEqual(combined.visitorDates,dates);
  assert.throws(()=>combineReferralStats([first,first]));assert.throws(()=>combineReferralStats([]));
  assert.throws(()=>combineReferralStats([{...first,recordedVisitors:Number.MAX_SAFE_INTEGER},second,{...first,visitorDates:['2026-10-18','2026-10-19']}]));
});
