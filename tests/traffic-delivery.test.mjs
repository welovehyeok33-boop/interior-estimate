import test from 'node:test';
import assert from 'node:assert/strict';
import { deliverTraffic } from '../src/lib/trafficDelivery.ts';

test('first visit sends immediately, without a minute or batch delay', async () => {
  let calls=0;
  const pending=deliverTraffic('{}',async (url,options)=>{
    calls++; assert.equal(url,'/api/analytics'); assert.equal(options.credentials,'same-origin');
    assert.equal(options.keepalive,true); assert.equal(options.body,'{}'); return new Response('{}');
  });
  assert.equal(calls,1); assert.equal(await pending,true);
});
test('transient HTTP and network failures recover in the same delivery with the same body',async()=>{
  for(const status of [408,429,500,503,'network']) {
    let calls=0; const delays=[];
    const result=await deliverTraffic('{"page":"/consult"}',async(_url,options)=>{
      assert.equal(options.body,'{"page":"/consult"}'); calls++;
      if(calls===1) {if(status==='network') throw Error('offline'); return new Response('',{status});}
      return new Response('{}');
    },100,async ms=>{delays.push(ms);});
    assert.equal(result,true); assert.equal(calls,2); assert.deepEqual(delays,[500]);
  }
});
test('stalled fetches abort and release the queue within a finite budget',async()=>{
  const signals=[];
  assert.equal(await deliverTraffic('{}',async(_url,options)=>{
    signals.push(options.signal); return new Promise(()=>{});
  },5,async()=>{}),false);
  assert.equal(signals.length,2); assert.ok(signals.every(signal=>signal.aborted));
});
test('excluded visits and permanent errors are never retried',async()=>{
  for(const status of [200,400,403,413]) {
    let calls=0;
    assert.equal(await deliverTraffic('{}',async()=>{calls++;return new Response('{"skipped":true}',{status});},100,
      async()=>assert.fail('permanent responses must not retry')),true);
    assert.equal(calls,1);
  }
});
test('persistent failures have bounded attempts and leave the event eligible for later recovery',async()=>{
  let calls=0;
  assert.equal(await deliverTraffic('{}',async()=>{calls++;throw Error('offline');},100,async()=>{}),false);
  assert.equal(calls,2);
});
