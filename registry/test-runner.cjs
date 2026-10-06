const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/reconcile-intake.wix.js','utf8');
const map=new Map(); let requests=0;
const s={id:'12345678-1234-4567-8123-123456789abc',formId:'292fd420-6097-4980-a1da-ee6398f78981',status:'CONFIRMED',revision:'1',createdDate:'2026-10-06T00:00:00Z',submissions:{stone_title:'Example',creator_name:'Fixture',contribution_text:'hello',contribution_type:'Words / writing',why_preserve:'Test',rights_terms_48eb_v06:true}};
const wix={request:async(o)=>{requests++;assert.equal(o.siteId,'f7d5451f-9488-4d3f-bbba-96f6f5279118');
 if(o.url.includes('/collections/'))return {data:{collection:{permissions:{read:'ADMIN',insert:'ADMIN',update:'ADMIN',remove:'ADMIN'}}}};
 if(o.url.includes('/submissions/namespace/query')) return {data:{submissions:[s],metadata:{hasNext:false}}};
 if(o.method==='GET') {const u=new URL(o.url),key=u.searchParams.get('dataCollectionId')+'/'+decodeURIComponent(u.pathname.split('/').pop()); if(!map.has(key))throw Error('404 ITEM_NOT_FOUND');return {data:{dataItem:map.get(key)}};}
 if(o.method==='POST'){const b=o.body,key=b.dataCollectionId+'/'+b.dataItem.id;if(map.has(key))throw Error('DUPLICATE_KEY');const item=structuredClone(b.dataItem);map.set(key,item);return {data:{dataItem:item}};}
 throw Error('Unexpected request');}};
(async()=>{const run=vm.runInNewContext('('+source+')',{wix,Date,console});
const first=await run();assert.equal(first.created.length,1);assert.equal(map.size,2);assert.equal(first.errors.length,0);
const item=map.get('GestaltStoneReview/'+s.id);assert.equal(item.data.textSha256,'2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');assert.equal(item.data.publicApproved,false);assert.equal(item.data.canonState,'PROVISIONAL');assert.equal(item.data.rightsState,'ACKNOWLEDGED_UNREVIEWED');assert.equal(item.data.reviewState,'PENDING_REVIEW');assert.ok(!('contact_email' in item.data));
item.data.reviewState='REVIEWING';
const second=await run();assert.equal(second.created.length,0);assert.equal(second.unchanged,1);assert.equal(map.size,2);assert.equal(item.data.reviewState,'REVIEWING');
s.revision='2';s.submissions.contribution_text='changed';const third=await run();assert.equal(third.sourceChanges.length,1);assert.equal(map.size,3);assert.equal(item.data.contributionText,'hello');assert.equal(item.data.reviewState,'REVIEWING');
const fourth=await run();assert.equal(fourth.sourceChanges.length,0);assert.equal(map.size,3);
s.status='PENDING';const fifth=await run();assert.equal(fifth.pending,1);assert.equal(fifth.created.length,0);
console.log('Registry tests passed: insert, UTF-8 hash, no duplicate import, decision preservation, source revision alert, no auto-publication, pending handling.');
if(process.env.RESULTS_PATH) fs.writeFileSync(process.env.RESULTS_PATH,JSON.stringify({passed:true,requests,scenarios:7},null,2));
})().catch(e=>{console.error(e);process.exit(1)});
