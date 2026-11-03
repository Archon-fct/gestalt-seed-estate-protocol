'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {harness,fixture,JOB}=require('./harness.cjs');
const rows=n=>Array.from({length:n},(_,i)=>fixture(i+1));
const review=(h,row)=>h.store.get('GestaltStoneReview/'+row.id);
const event=(h,row)=>h.store.get('GestaltStoneEvents/received-'+row.id);
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const sourceQuery=({u})=>u.pathname.endsWith('/submissions/namespace/query');
const put=({o})=>o.method==='PUT';
const reviewPost=({o})=>o.method==='POST'&&o.body.dataCollectionId==='GestaltStoneReview';
const eventPost=({o})=>o.method==='POST'&&o.body.dataCollectionId==='GestaltStoneEvents';

test('explicit bounded single-runner acknowledgement is required before any request',async()=>{
 const h=harness(rows(1));
 for(const opts of [null,[],{}, {singleRunner:false},{singleRunner:true,extra:1},{singleRunner:true,maxPages:0},{singleRunner:true,maxPages:21},{singleRunner:true,maxPages:1.5},{singleRunner:true,restartSweep:'yes'}]){
  await assert.rejects(()=>h.run(opts),/SINGLE_RUNNER_OPTIONS_REQUIRED/);
 }
 assert.equal(h.requests.length,0);assert.equal(h.writes,0);
});

test('2001 static confirmed rows persist a continuation and drain in two fresh invocations',async()=>{
 const r=rows(2001),h=harness(r);
 const first=await h.run();assert.equal(first.created.length,2000);assert.equal(first.pagesProcessed,20);
 assert.equal(first.sweepComplete,false);assert.equal(first.hasMore,true);assert.equal(h.job.cursor,'page-offset:2000');
 const second=await h.run();assert.equal(second.created.length,1);assert.equal(second.pagesProcessed,1);
 assert.equal(second.sweepComplete,true);assert.equal(second.snapshotComplete,false);assert.equal(second.hasMore,false);
 assert.equal(h.job.state,'COMPLETE');assert.equal(h.job.cursor,null);
 assert(r.every(x=>review(h,x)&&event(h,x)));assert.equal(h.store.size,4003);
 assert(!('nextCursor' in first),'raw cursor stays in private job, not result');
});

test('a 2000-row pending prefix cannot permanently starve the later confirmed row',async()=>{
 const r=rows(2001);r.slice(0,2000).forEach(x=>x.status='PENDING');const h=harness(r);
 const a=await h.run(),b=await h.run();assert.equal(a.pending,2000);assert.equal(b.created.length,1);
 assert(review(h,r.at(-1)));assert.equal(b.sweepComplete,true);
});

test('50-row pages progress beyond the first bounded batch',async()=>{
 const r=rows(1001),h=harness(r,{pageSize:50});
 assert.equal((await h.run()).created.length,1000);assert.equal(h.job.cursor,'page-offset:1000');
 assert.equal((await h.run()).created.length,1);assert(r.every(x=>review(h,x)));
});

test('completed sweeps restart to discover later confirmation without overwriting steward state',async()=>{
 const r=rows(2);r[0].status='PENDING';const h=harness(r);await h.run();
 review(h,r[1]).data.reviewState='REVIEWING';r[0].status='CONFIRMED';
 const b=await h.run();assert.equal(b.created.length,1);assert.equal(b.unchanged,1);assert.equal(b.generation,1);
 assert.equal(review(h,r[1]).data.reviewState,'REVIEWING');assert.equal(h.store.size,5);
});

test('missing job collection and privacy failures stop before source access or writes',async()=>{
 for(const mode of ['missing','legacy-public','privileged-public','override','missing-overrides']){
  const h=harness(rows(1),{intercept:({o,u})=>{
   if(mode==='missing'&&u.pathname.endsWith('/collections/GestaltIntakeJobs'))throw Error('404 COLLECTION_NOT_FOUND');
   if(mode==='legacy-public'&&u.pathname.includes('/collections/'))return {data:{collection:{permissions:{read:'ANYONE',insert:'ADMIN',update:'ADMIN',remove:'ADMIN'}}}};
   if(u.pathname==='/wix-data/v1/permissions'&&mode!=='missing'&&mode!=='legacy-public'){
    const p={id:u.searchParams.get('dataCollectionId'),itemRead:'PRIVILEGED',itemInsert:'PRIVILEGED',itemUpdate:'PRIVILEGED',itemRemove:'PRIVILEGED',specialPermissions:[]};
    if(mode==='privileged-public')p.itemRead='ANYONE';if(mode==='override')p.specialPermissions=[{userId:'SYNTHETIC',itemRead:'ALLOWED'}];
    if(mode==='missing-overrides')delete p.specialPermissions;return {data:{dataPermissions:p}};
   }
  }});
  await assert.rejects(()=>h.run());assert.equal(h.writes,0);assert.equal(h.pages.length,0);
 }
});

test('malformed checkpoint fails before Forms query, including unknown fields',async()=>{
 for(const edit of [j=>j.jobVersion=2,j=>j.configSha256='bad',j=>j.sequence=-1,j=>j.cursor='inconsistent',j=>j.unrecognized=true,j=>j.cursorHashes=['bad']]){
  const h=harness(rows(101));await h.run({singleRunner:true,maxPages:1});edit(h.job);
  const before=h.pages.length;await assert.rejects(()=>h.run(),/CHECKPOINT_INVALID/);assert.equal(h.pages.length,before);
 }
});

test('row validation failure retains page cursor; repaired retry is idempotent',async()=>{
 const r=rows(2);r[0].submissions.stone_title='';const h=harness(r);const a=await h.run();
 assert.equal(a.resumeBlocked,true);assert.equal(a.sweepComplete,false);assert.equal(h.job.state,'READY');assert(review(h,r[1]));
 r[0].submissions.stone_title='Repaired synthetic title';const b=await h.run();
 assert.equal(b.created.length,1);assert.equal(b.unchanged,1);assert.equal(b.sweepComplete,true);assert.equal(h.store.size,5);
});

test('source query failure preserves the last successfully checkpointed page',async()=>{
 const r=rows(201),h=harness(r);h.failOnce(({o})=>o.body?.query?.cursorPaging.cursor==='page-offset:100');
 const a=await h.run();assert.equal(a.pagesProcessed,1);assert.equal(a.resumeBlocked,true);assert.equal(h.job.cursor,'page-offset:100');
 const b=await h.run();assert.equal(b.created.length,101);assert.equal(b.pagesProcessed,2);assert.equal(b.sweepComplete,true);
});

test('review insert with lost response is replayed and missing receipt repaired',async()=>{
 const r=rows(1),h=harness(r);h.failOnce(reviewPost,{after:true});
 const a=await h.run();assert.equal(a.resumeBlocked,true);assert(review(h,r[0]));assert(!event(h,r[0]));assert.equal(h.job.sequence,0);
 const b=await h.run();assert.equal(b.created.length,0);assert.equal(b.unchanged,1);assert(event(h,r[0]));assert.equal(b.sweepComplete,true);
});

test('receipt failure before or after commit cannot advance prematurely or duplicate on retry',async()=>{
 for(const after of [false,true]){
  const r=rows(1),h=harness(r);h.failOnce(eventPost,{after});const a=await h.run();
  assert.equal(a.resumeBlocked,true);assert.equal(h.job.sequence,0);assert(review(h,r[0]));
  const b=await h.run();assert.equal(b.sweepComplete,true);assert.equal(h.store.size,3);assert(event(h,r[0]));
 }
});

test('existing conflicting receipt blocks checkpoint instead of being accepted as idempotent',async()=>{
 const r=rows(1),h=harness(r);await h.run();event(h,r[0]).data.details.textSha256='wrong';
 const a=await h.run();assert.equal(a.resumeBlocked,true);assert.equal(a.sweepComplete,false);assert.equal(a.errors[0].reason,'EVENT_ID_CONFLICT');
 assert.equal(h.job.state,'READY');
});

test('same-revision source-change event conflict is explicit and cannot advance',async()=>{
 const r=rows(1),h=harness(r);await h.run();r[0].submissions.contribution_text='First synthetic change';await h.run();
 r[0].submissions.contribution_text='Second synthetic change, same revision';const a=await h.run();
 assert.equal(a.resumeBlocked,true);assert.equal(a.errors[0].reason,'EVENT_ID_CONFLICT');assert.equal(h.job.state,'READY');
});

test('failed checkpoint write replays page but does not duplicate registry writes',async()=>{
 const r=rows(101),h=harness(r);h.failOnce(put);const a=await h.run();
 assert.equal(a.resumeBlocked,true);assert.equal(a.pagesProcessed,0);assert.equal(h.job.sequence,0);assert.equal(a.created.length,100);
 const b=await h.run();assert.equal(b.created.length,1);assert.equal(b.unchanged,100);assert.equal(b.sweepComplete,true);
});

test('lost checkpoint write response succeeds only after exact primary readback',async()=>{
 const h=harness(rows(101));h.failOnce(put,{after:true});
 const a=await h.run({singleRunner:true,maxPages:1});assert.equal(a.resumeBlocked,false);assert.equal(a.pagesProcessed,1);assert.equal(h.job.sequence,1);
 assert.equal((await h.run()).created.length,1);
});

test('uncertain checkpoint readback stops; next invocation reads durable state without blind retry',async()=>{
 const h=harness(rows(101));let committed=false,failed=false;
 h.setIntercept(({o,u})=>{
  if(o.method==='PUT')committed=true;
  else if(committed&&!failed&&o.method==='GET'&&u.pathname.endsWith('/soul-stone-intake-v1')){failed=true;throw Error('SYNTHETIC_READBACK_LOST');}
 });
 const a=await h.run();assert.equal(a.resumeBlocked,true);assert.equal(h.job.sequence,1);
 assert.equal(h.requests.filter(x=>x.method==='PUT').length,1);
 const b=await h.run();assert.equal(b.created.length,1);assert.equal(b.sweepComplete,true);
});

test('same sequence but different checkpoint contents fails exact readback',async()=>{
 const h=harness(rows(101));
 h.setIntercept(({o,store})=>{
  if(o.method==='PUT'){
   const changed=structuredClone(o.body.dataItem);changed.data.cursor='page-offset:99';changed.data.cursorHashes=[sha(changed.data.cursor)];
   store.set(JOB,changed);return {data:{dataItem:changed}};
  }
 });
 const a=await h.run();assert.equal(a.resumeBlocked,true);assert.equal(a.pagesProcessed,0);assert.equal(a.sweepComplete,false);
});

test('observed concurrent checkpoint change is not overwritten',async()=>{
 const h=harness(rows(101));let changed=false;
 h.setIntercept(({o,store})=>{
  if(o.method==='PUT'&&!changed){changed=true;store.get(JOB).data.sequence++;}
 });
 const a=await h.run();assert.equal(a.resumeBlocked,true);assert.equal(h.job.state,'READY');assert.equal(h.job.sequence,1);
});

test('malformed provider envelopes block before row writes or checkpoint advancement',async()=>{
 for(const edit of [r=>delete r.data.submissions,r=>r.data.submissions=null,r=>r.data.submissions=[null],r=>r.data.submissions=Array(101).fill(fixture(1)),
  r=>delete r.data.metadata,r=>r.data.metadata.hasNext='false',r=>r.data.metadata.count=2,r=>{r.data.metadata={hasNext:true,cursors:{}};},
  r=>{r.data.metadata={hasNext:true,cursors:{next:'x'.repeat(16001)}};}]){
  const h=harness(rows(1),{transform:r=>{edit(r);return r;}});const a=await h.run();
  assert.equal(a.resumeBlocked,true);assert.equal(a.sweepComplete,false);assert.equal(h.job.sequence,0);assert.equal(h.store.size,1);
 }
});

test('documented 16000-character opaque cursor is accepted without truncation',async()=>{
 const token='x'.repeat(16000),h=harness(rows(1),{transform:r=>({...r,data:{...r.data,metadata:{hasNext:true,cursors:{next:token}}}})});
 const a=await h.run({singleRunner:true,maxPages:1});assert.equal(a.errors.length,0);assert.equal(h.job.cursor,token);
 assert(!JSON.stringify(a).includes(token));
});

test('cursor cycle detection persists across independent bounded invocations',async()=>{
 const h=harness(rows(201),{transform:(r,{o})=>{
  if(o.body.query.cursorPaging.cursor==='page-offset:100')r.data.metadata.cursors.next='page-offset:100';return r;
 }});
 await h.run({singleRunner:true,maxPages:1});const before=h.store.size;
 const a=await h.run({singleRunner:true,maxPages:1});assert.equal(a.resumeBlocked,true);assert.equal(h.store.size,before);assert.equal(h.job.sequence,1);
});

test('expired or invalid cursor blocks until explicit restart, with no silent skipped interval',async()=>{
 const h=harness(rows(101));await h.run({singleRunner:true,maxPages:1});
 h.failOnce(sourceQuery);const a=await h.run();assert.equal(a.resumeBlocked,true);assert.equal(h.job.cursor,'page-offset:100');
 const b=await h.run({singleRunner:true,restartSweep:true});assert.equal(b.unchanged,100);assert.equal(b.created.length,1);assert.equal(b.generation,1);
});

test('persistent sweep budget fails closed instead of looping or claiming completion',async()=>{
 const h=harness(rows(101));await h.run({singleRunner:true,maxPages:1});
 const hashes=Array.from({length:999},(_,i)=>sha('synthetic-cursor-'+i));hashes.push(sha(h.job.cursor));
 h.job.pagesInSweep=1000;h.job.cursorHashes=hashes;const before=h.pages.length;
 const a=await h.run();assert.equal(a.resumeBlocked,true);assert.equal(a.errors[0].reason,'SWEEP_PAGE_LIMIT');assert.equal(a.sweepComplete,false);assert.equal(h.pages.length,before);
});

test('mutable offset-like insertion, deletion, and reordering require a fresh sweep',async()=>{
 for(const mutation of ['insert','delete','reorder']){
  const r=rows(101),h=harness(r);await h.run({singleRunner:true,maxPages:1});let missed;
  if(mutation==='insert'){missed=fixture(102);r.unshift(missed);}
  if(mutation==='delete'){missed=r.at(-1);r.shift();}
  if(mutation==='reorder'){missed=r.pop();r.unshift(missed);}
  const a=await h.run();assert.equal(a.sweepComplete,true);assert.equal(a.snapshotComplete,false);assert(!review(h,missed));
  const b=await h.run();assert.equal(b.sweepComplete,true);assert(r.every(x=>review(h,x)));
 }
});

test('transport error text does not leak into result diagnostics',async()=>{
 const h=harness(rows(1));h.failOnce(reviewPost,{message:'request failed containing FAKE_PRIVATE_PAYLOAD'});
 const a=await h.run();assert.equal(a.errors[0].reason,'WIX_REQUEST_FAILED');assert(!JSON.stringify(a).includes('FAKE_PRIVATE_PAYLOAD'));
});

test('job state is minimal, config-bound, and contains no submission payloads',async()=>{
 const r=rows(1),h=harness(r);await h.run();const j=JSON.stringify(h.job);
 for(const value of [r[0].id,r[0].submissions.creator_name,r[0].submissions.contribution_text])assert(!j.includes(value));
 assert.deepEqual(Object.keys(h.job).sort(),['configSha256','cursor','cursorHashes','generation','jobVersion','pagesInSweep','sequence','state']);
 assert(h.requests.filter(x=>x.method==='GET'&&x.url.includes('/items/')).every(x=>x.url.includes('consistentRead=true')));
});

test('missing or malformed status blocks rather than silently classifying a source row as pending',async()=>{
 for(const status of [undefined,null,{},'',42,'x'.repeat(101)]){
  const r=rows(1);r[0].status=status;const h=harness(r);const a=await h.run();
  assert.equal(a.resumeBlocked,true);assert.equal(a.pending,0);assert.equal(h.job.sequence,0);assert.equal(h.store.size,1);
 }
});

test('new review content must match the intended immutable fields on primary readback',async()=>{
 const r=rows(1),h=harness(r);let writes=0;
 h.setIntercept(({o,store})=>{
  if(reviewPost({o})){writes++;const item=structuredClone(o.body.dataItem);item.data.contributionText='Unexpected synthetic mutation';store.set(o.body.dataCollectionId+'/'+item.id,item);return {data:{dataItem:item}};}
 });
 const a=await h.run();assert.equal(writes,1);assert.equal(a.resumeBlocked,true);assert.equal(h.job.sequence,0);assert(!event(h,r[0]));
 assert.equal(a.errors[0].reason,'REVIEW_INTEGRITY_INVALID');
 const b=await h.run();assert.equal(b.resumeBlocked,true);assert.equal(h.job.sequence,0);assert(!event(h,r[0]));
});

test('startup transport errors are sanitized before surfacing',async()=>{
 for(const match of [({u})=>u.pathname.includes('/collections/'),({u})=>u.pathname.includes('/permissions'),({u})=>u.pathname.includes('/items/')]){
  const h=harness(rows(1));h.failOnce(match,{message:'FAKE_PRIVATE_REQUEST_BODY'});
  await assert.rejects(()=>h.run(),e=>e.message==='WIX_REQUEST_FAILED');assert.equal(h.pages.length,0);
 }
});
