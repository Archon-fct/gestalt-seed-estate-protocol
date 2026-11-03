'use strict';
// Independent adversarial assertions against the candidate's offline-only mock.
// This file does not edit candidate source or use any live Wix capability.
const assert=require('node:assert/strict');
const test=require('node:test');
const crypto=require('node:crypto');
const {harness,fixture,JOB}=require('./harness.cjs');
const reviews=h=>[...h.store.keys()].filter(k=>k.startsWith('GestaltStoneReview/'));
const events=h=>[...h.store.keys()].filter(k=>k.startsWith('GestaltStoneEvents/'));
const isItemCreate=(c,x)=>x.o.method==='POST'&&x.u.pathname==='/data/v2/items'&&x.o.body.dataCollectionId===c;
const isCheckpoint=x=>x.o.method==='PUT'&&x.o.body.dataCollectionId==='GestaltIntakeJobs';
const isJobRead=x=>x.o.method==='GET'&&x.u.pathname==='/data/v2/items/soul-stone-intake-v1';
const isSource=x=>x.o.method==='POST'&&x.u.pathname==='/forms/v4/submissions/namespace/query';

test('bounded calls resume only persisted cursor across separate function instances',async()=>{
 const h=harness([fixture(1),fixture(2),fixture(3),fixture(4),fixture(5)],{pageSize:2});
 const a=await h.run({singleRunner:true,maxPages:1});
 assert.equal(a.sweepComplete,false);assert.equal(a.pagesProcessed,1);assert.equal(h.job.cursor,'page-offset:2');
 const b=await h.run({singleRunner:true,maxPages:1});
 assert.equal(b.sweepComplete,false);assert.equal(b.created.length,2);assert.equal(h.job.cursor,'page-offset:4');
 const c=await h.run({singleRunner:true,maxPages:1});
 assert.equal(c.sweepComplete,true);assert.equal(c.snapshotComplete,false);assert.equal(h.job.state,'COMPLETE');
 assert.deepEqual(h.pages,[0,2,4]);assert.equal(reviews(h).length,5);assert.equal(events(h).length,5);
});

test('unknown successful receipt insertion blocks page then replays without duplicates',async()=>{
 const h=harness([fixture(1)]);h.failOnce(x=>isItemCreate('GestaltStoneEvents',x),{after:true});
 const a=await h.run();assert.equal(a.resumeBlocked,true);assert.equal(a.pagesProcessed,0);
 assert.equal(h.job.state,'READY');assert.equal(events(h).length,1);assert.equal(reviews(h).length,1);
 const b=await h.run();assert.equal(b.sweepComplete,true);assert.equal(b.errors.length,0);
 assert.equal(events(h).length,1);assert.equal(reviews(h).length,1);
});

test('unknown successful review insertion blocks page then repairs missing receipt',async()=>{
 const h=harness([fixture(1)]);h.failOnce(x=>isItemCreate('GestaltStoneReview',x),{after:true});
 const a=await h.run();assert.equal(a.resumeBlocked,true);assert.equal(h.job.state,'READY');
 assert.equal(reviews(h).length,1);assert.equal(events(h).length,0);
 const b=await h.run();assert.equal(b.sweepComplete,true);assert.equal(b.errors.length,0);
 assert.equal(events(h).length,1);assert.equal(reviews(h).length,1);
});

test('unknown successful checkpoint PUT is verified, without repeated PUT',async()=>{
 const h=harness([fixture(1)]);h.failOnce(isCheckpoint,{after:true});
 const a=await h.run();assert.equal(a.sweepComplete,true);assert.equal(a.errors.length,0);
 assert.equal(h.requests.filter(o=>o.method==='PUT').length,1);assert.equal(h.job.sequence,1);
});

test('definite failed checkpoint PUT does not claim completion or advance',async()=>{
 const h=harness([fixture(1)]);h.failOnce(isCheckpoint);
 const a=await h.run();assert.equal(a.sweepComplete,false);assert.equal(a.resumeBlocked,true);
 assert.equal(a.checkpointSequence,0);assert.equal(h.job.sequence,0);assert.equal(reviews(h).length,1);
 const b=await h.run();assert.equal(b.sweepComplete,true);assert.equal(b.created.length,0);
});

test('failed checkpoint readback leaves uncertain progress visible and next invocation resumes persisted page',async()=>{
 const h=harness([fixture(1),fixture(2)],{pageSize:1});let hasWritten=false,failRead=true;
 h.setIntercept(x=>{if(isCheckpoint(x))hasWritten=true;if(hasWritten&&failRead&&isJobRead(x)){failRead=false;throw Error('SYNTHETIC_READ_TIMEOUT');}});
 const a=await h.run({singleRunner:true,maxPages:1});assert.equal(a.resumeBlocked,true);assert.equal(a.pagesProcessed,0);
 assert.equal(h.job.cursor,'page-offset:1');assert.equal(a.checkpointSequence,0);
 const b=await h.run({singleRunner:true,maxPages:1});assert.equal(b.sweepComplete,true);assert.deepEqual(h.pages,[0,1]);
 assert.equal(reviews(h).length,2);
});

test('repeated opaque cursor across invocations blocks before second page row writes',async()=>{
 const h=harness([fixture(1),fixture(2),fixture(3)],{pageSize:1,transform:r=>{if(r.data.submissions[0].id===fixture(2).id)r.data.metadata.cursors.next='page-offset:1';return r;}});
 await h.run({singleRunner:true,maxPages:1});const a=await h.run({singleRunner:true,maxPages:1});
 assert.equal(a.resumeBlocked,true);assert.equal(a.errors[0].reason,'PAGINATION_CURSOR_INVALID_OR_REPEATED');
 assert.equal(reviews(h).length,1);assert.equal(h.job.sequence,1);
});

test('malformed page metadata blocks before any source-row write',async()=>{
 const h=harness([fixture(1)],{transform:r=>{r.data.metadata.count=2;return r;}});
 const a=await h.run();assert.equal(a.resumeBlocked,true);assert.equal(reviews(h).length,0);assert.equal(h.job.sequence,0);
});

test('explicit permission overrides block before source reads or writes',async()=>{
 const h=harness([fixture(1)],{intercept:({o,u})=>{
   if(u.pathname==='/wix-data/v1/permissions')return {data:{dataPermissions:{id:u.searchParams.get('dataCollectionId'),itemRead:'PRIVILEGED',itemInsert:'PRIVILEGED',itemUpdate:'PRIVILEGED',itemRemove:'PRIVILEGED',specialPermissions:[{id:'synthetic-role'}]}}};
 }});
 await assert.rejects(()=>h.run(),/COLLECTION_OVERRIDES_NOT_VERIFIED/);assert.equal(h.pages.length,0);assert.equal(h.writes,0);
});

test('invalid or mixed-generation checkpoint shape blocks before source query',async()=>{
 const h=harness([fixture(1),fixture(2)],{pageSize:1});await h.run({singleRunner:true,maxPages:1});
 h.job.cursorHashes=[];const n=h.pages.length;
 await assert.rejects(()=>h.run(),/CHECKPOINT_INVALID/);assert.equal(h.pages.length,n);
});

test('sweep-page limit survives across invocations and blocks before additional source query',async()=>{
 const h=harness([fixture(1),fixture(2)],{pageSize:1});await h.run({singleRunner:true,maxPages:1});
 const cursor=h.job.cursor;h.job.pagesInSweep=1000;
 h.job.cursorHashes=Array.from({length:999},(_,i)=>crypto.createHash('sha256').update('reviewer-'+i).digest('hex'));
 h.job.cursorHashes.push(crypto.createHash('sha256').update(cursor).digest('hex'));
 const n=h.pages.length,a=await h.run();assert.equal(a.resumeBlocked,true);assert.equal(a.errors[0].reason,'SWEEP_PAGE_LIMIT');assert.equal(h.pages.length,n);
});

test('source transport error is sanitized and does not expose returned cursor',async()=>{
 const h=harness([fixture(1),fixture(2)],{pageSize:1});await h.run({singleRunner:true,maxPages:1});
 h.failOnce(isSource,{message:'secret opaque cursor page-offset:1'});const a=await h.run();
 assert.equal(a.errors[0].reason,'SOURCE_QUERY_FAILED');assert.equal(JSON.stringify(a).includes('page-offset:'),false);
});

test('transformed review body blocks both first write and replay, not only the original POST',async()=>{
 const row=fixture(1);let changed=false;
 const h=harness([row],{intercept:({o,u,store})=>{
   const k='GestaltStoneReview/'+row.id;
   if(o.method==='GET'&&u.pathname.endsWith('/'+row.id)&&store.has(k)&&!changed){
     changed=true;store.get(k).data.contributionText='SYNTHETIC WRITE TRANSFORMATION';
   }
 }});
 const a=await h.run();assert.equal(a.sweepComplete,false);assert.equal(a.resumeBlocked,true);
 assert.equal(h.store.get('GestaltStoneReview/'+row.id).data.contributionText,'SYNTHETIC WRITE TRANSFORMATION');
 assert.notEqual(h.store.get('GestaltStoneReview/'+row.id).data.textSha256,crypto.createHash('sha256').update('SYNTHETIC WRITE TRANSFORMATION').digest('hex'));
 const b=await h.run();assert.equal(b.sweepComplete,false);assert.equal(b.resumeBlocked,true);
 assert.equal(h.job.sequence,0);assert.equal(events(h).length,0);
});

test('missing source status blocks rather than silently classifying pending and traversing',async()=>{
 const row=fixture(1);delete row.status;const h=harness([row]);const a=await h.run();
 assert.equal(a.sweepComplete,false);assert.equal(a.resumeBlocked,true);assert.equal(a.pending,0);assert.equal(reviews(h).length,0);
});

test('startup checkpoint transport rejection is sanitized before propagation',async()=>{
 const h=harness([fixture(1)]);h.failOnce(isJobRead,{message:'SYNTHETIC_PRIVATE_TRANSPORT_PAYLOAD'});
 await assert.rejects(()=>h.run(),e=>!String(e).includes('SYNTHETIC_PRIVATE_TRANSPORT_PAYLOAD')&&/^[A-Z][A-Z0-9_]+$/.test(e.message));
});

test('stored text integrity uses exact UTF-8, including combining text and unpaired surrogates',async()=>{
 for(const text of ['a'.repeat(63),'a'.repeat(64),'a'.repeat(65),'e\u0301 \u00e9 \ud83e\udd8b \ud800 \udc00\nExact text']){
  const row=fixture(1);row.submissions.contribution_text=text;const h=harness([row]);
  const a=await h.run();assert.equal(a.sweepComplete,true);
  assert.equal(h.store.get('GestaltStoneReview/'+row.id).data.textSha256,crypto.createHash('sha256').update(text,'utf8').digest('hex'));
 }
});
