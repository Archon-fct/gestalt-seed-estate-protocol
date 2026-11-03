'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const {harness,fixture}=require('./tests/harness.cjs');
const s=fixture(1);s.submissions.contribution_text='hello';
const h=harness([s]),map=h.store;
(async()=>{
const first=await h.run();assert.equal(first.created.length,1);assert.equal(map.size,3);assert.equal(first.errors.length,0);
const item=map.get('GestaltStoneReview/'+s.id);assert.equal(item.data.textSha256,'2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');assert.equal(item.data.publicApproved,false);assert.equal(item.data.canonState,'PROVISIONAL');assert.equal(item.data.rightsState,'ACKNOWLEDGED_UNREVIEWED');assert.equal(item.data.reviewState,'PENDING_REVIEW');assert.ok(!('contact_email' in item.data));
item.data.reviewState='REVIEWING';
const second=await h.run();assert.equal(second.created.length,0);assert.equal(second.unchanged,1);assert.equal(map.size,3);assert.equal(item.data.reviewState,'REVIEWING');
s.revision='2';s.submissions.contribution_text='changed';const third=await h.run();assert.equal(third.sourceChanges.length,1);assert.equal(map.size,4);assert.equal(item.data.contributionText,'hello');assert.equal(item.data.reviewState,'REVIEWING');
const fourth=await h.run();assert.equal(fourth.sourceChanges.length,0);assert.equal(map.size,4);
s.status='PENDING';const fifth=await h.run();assert.equal(fifth.pending,1);assert.equal(fifth.created.length,0);
console.log('Registry regressions passed: insert, SHA-256, no duplicate import, steward decision preservation, source revision alert, no auto-publication, pending handling.');
if(process.env.RESULTS_PATH)fs.writeFileSync(process.env.RESULTS_PATH,JSON.stringify({passed:true,requests:h.requests.length,scenarios:7,networkCalls:0},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
