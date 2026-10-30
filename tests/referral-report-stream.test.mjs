import test from 'node:test';
import assert from 'node:assert/strict';
import { readReferralReport } from '../src/lib/readReferralReport.ts';

const report=()=>({from:'2026-10-30',to:'2026-10-30',updatedAt:'2026-10-30T01:00:00Z',rows:[{source:'interiorfree',name:'인테리어프리',external:{status:'loading'},arrivals:null}]});
const row=()=>({source:'interiorfree',name:'인테리어프리',external:{status:'ready',dailyVisitors:[{day:'2026-10-30',visitors:0}]},arrivals:0});
const events=()=>[{type:'start',report:report()},{type:'row',row:row()},{type:'done',updatedAt:'2026-10-30T01:00:02Z'}];
const ndjson=values=>values.map(value=>JSON.stringify(value)).join('\n')+'\n';
const response=values=>new Response(ndjson(values),{headers:{'Content-Type':'application/x-ndjson'}});

test('incremental reader handles split UTF-8 characters and multiple messages, preserves zero and marks completion last',async()=>{
  const bytes=new TextEncoder().encode(ndjson(events()));
  const body=new ReadableStream({start(controller){for(let i=0;i<bytes.length;i+=3)controller.enqueue(bytes.slice(i,i+3));controller.close();}});
  const updates=[];await readReferralReport(new Response(body,{headers:{'Content-Type':'application/x-ndjson'}}),(report,pending)=>updates.push({report,pending}),new AbortController().signal);
  assert.deepEqual(updates.map(update=>update.pending),[true,true,false]);assert.equal(updates[0].report.rows[0].arrivals,null);
  assert.equal(updates[1].report.rows[0].arrivals,0);assert.equal(updates.at(-1).report.rows[0].name,'인테리어프리');
  assert.equal(updates.at(-1).report.updatedAt,'2026-10-30T01:00:02Z');
});

test('legacy JSON and server errors remain supported',async()=>{
  const updates=[];await readReferralReport(Response.json(report()),(report,pending)=>updates.push(pending),new AbortController().signal);
  assert.deepEqual(updates,[false]);
  await assert.rejects(readReferralReport(Response.json({error:'로그인이 필요합니다.'},{status:401}),()=>{},new AbortController().signal),/로그인이 필요/);
});

test('truncated, duplicate, unknown and oversized streams fail rather than claiming complete totals',async()=>{
  const valid=events();
  for(const values of [[valid[0],valid[1]],[valid[0],valid[1],valid[1],valid[2]],[valid[0],{type:'row',row:{source:'unexpected'}},valid[2]],[valid[2]],[valid[0],{type:'error'}]]) {
    let completed=false;
    await assert.rejects(readReferralReport(response(values),(_report,pending)=>{if(!pending)completed=true;},new AbortController().signal));
    assert.equal(completed,false);
  }
  await assert.rejects(readReferralReport(new Response('x'.repeat(128001),{headers:{'Content-Type':'application/x-ndjson'}}),()=>{},new AbortController().signal),/너무 큽니다/);
});

test('aborting a period change cancels the reader and prevents later updates',async()=>{
  const abort=new AbortController();let cancelled=false,updates=0;
  const body=new ReadableStream({start(controller){controller.enqueue(new TextEncoder().encode(ndjson(events())));},cancel(){cancelled=true;}});
  await readReferralReport(new Response(body,{headers:{'Content-Type':'application/x-ndjson'}}),()=>{updates++;abort.abort();},abort.signal);
  assert.equal(updates,1);assert.equal(cancelled,true);
});
