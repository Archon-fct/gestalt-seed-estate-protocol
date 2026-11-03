'use strict';
// Synthetic reviewed-code evaluator, not a security sandbox for arbitrary code.
// No network fallback, credentials, packages, or live Wix calls exist here.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(__dirname + '/../reconcile-intake.wix.js','utf8');
const FORM='292fd420-6097-4980-a1da-ee6398f78981';
const SITE='f7d5451f-9488-4d3f-bbba-96f6f5279118';
const JOB='GestaltIntakeJobs/soul-stone-intake-v1';
const collections=['GestaltStoneReview','GestaltStoneEvents','GestaltIntakeJobs'];
const copy=x=>structuredClone(x);
function fixture(number, status='CONFIRMED') {
  assert(Number.isInteger(number)&&number>=1&&number<=3000);
  return {id:`00000000-0000-4000-8000-${number.toString(16).padStart(12,'0')}`,
    formId:FORM,status,revision:'1',createdDate:new Date(Date.UTC(2026,0,1)+number*1000).toISOString(),
    submissions:{stone_title:`SYNTHETIC ${number}`,creator_name:'Fabricated fixture',
      contribution_text:'Fabricated bounded test, not a real contribution.',
      contribution_type:'Words / writing',why_preserve:'Synthetic diagnostic',rights_terms_48eb_v06:true}};
}
function harness(rows, options={}) {
  assert(Array.isArray(rows)&&rows.length<=3000);
  const store=options.store||new Map(), requests=[], pages=[];
  let writes=0, failure=null, intercept=options.intercept||(()=>{});
  const wix={request:async o=>{
    requests.push(copy(o)); assert(requests.length<=50000,'bounded request budget');
    assert.equal(o.scope,'site');assert.equal(o.siteId,SITE);
    const u=new URL(o.url);assert.equal(u.origin,'https://www.wixapis.com');
    const context={o,u,store,rows};
    const injected=await intercept(context);
    if(injected!==undefined)return injected;
    const failing=failure&&failure.match(context)?failure:null;
    if(failing&&!failing.after){failure=null;throw Error(failing.message||'SYNTHETIC_FAILURE');}
    let result;
    if(o.method==='GET' && u.pathname.includes('/collections/')){
      const id=u.pathname.split('/').pop();assert(collections.includes(id));
      assert.equal(u.searchParams.get('consistentRead'),'true');
      result={data:{collection:{id,permissions:{read:'ADMIN',insert:'ADMIN',update:'ADMIN',remove:'ADMIN'}}}};
    } else if(o.method==='GET' && u.pathname==='/wix-data/v1/permissions'){
      const id=u.searchParams.get('dataCollectionId');assert(collections.includes(id));
      result={data:{dataPermissions:{id,itemRead:'PRIVILEGED',itemInsert:'PRIVILEGED',itemUpdate:'PRIVILEGED',itemRemove:'PRIVILEGED',specialPermissions:[]}}};
    } else if(o.method==='POST' && u.pathname==='/forms/v4/submissions/namespace/query'){
      const q=o.body.query;assert.equal(o.body.onlyYourOwn,false);assert.equal(q.cursorPaging.limit,100);
      let offset=0;
      if(q.cursorPaging.cursor){
        assert.equal(q.filter,undefined);assert.equal(q.sort,undefined);
        assert(/^page-offset:[0-9]+$/.test(q.cursorPaging.cursor));
        offset=Number(q.cursorPaging.cursor.slice(12));assert(Number.isSafeInteger(offset));
      } else {
        assert.deepEqual(copy(q),{filter:{formId:FORM,namespace:'wix.form_app.form'},
          sort:[{fieldName:'createdDate',order:'ASC'},{fieldName:'id',order:'ASC'}],cursorPaging:{limit:100}});
      }
      pages.push(offset);const size=options.pageSize||100;
      assert(Number.isInteger(size)&&size>0&&size<=100);
      const submissions=copy(rows.slice(offset,offset+size)),end=offset+submissions.length;
      const hasNext=end<rows.length;
      result={data:{submissions,metadata:{count:submissions.length,hasNext,cursors:hasNext?{next:`page-offset:${end}`}:{}}}};
      if(options.transform) result=options.transform(result,context);
    } else if(o.method==='GET' && u.pathname.startsWith('/data/v2/items/')){
      assert.equal(u.searchParams.get('consistentRead'),'true');
      const collection=u.searchParams.get('dataCollectionId');assert(collections.includes(collection));
      const key=collection+'/'+decodeURIComponent(u.pathname.split('/').pop());
      if(!store.has(key))throw Error('404 ITEM_NOT_FOUND');
      result={data:{dataItem:copy(store.get(key))}};
    } else if(o.method==='POST' && u.pathname==='/data/v2/items'){
      const b=o.body;assert(collections.includes(b.dataCollectionId));
      const key=b.dataCollectionId+'/'+b.dataItem.id;
      if(store.has(key))throw Error('DUPLICATE_KEY');
      store.set(key,copy(b.dataItem));writes++;result={data:{dataItem:copy(b.dataItem)}};
    } else if(o.method==='PUT' && u.pathname==='/data/v2/items/soul-stone-intake-v1'){
      const b=o.body;assert.equal(b.dataCollectionId,'GestaltIntakeJobs');
      assert.equal(b.dataItem.id,'soul-stone-intake-v1');assert(store.has(JOB));
      const old=store.get(JOB),f=b.condition.filter;
      assert.deepEqual(Object.keys(f).sort(),['configSha256','jobVersion','sequence']);
      // This models documented conditional writes, NOT Wix's concurrency semantics.
      if(!Object.keys(f).every(k=>old.data[k]===f[k]))throw Error('SYNTHETIC_CONDITION_FAILED');
      store.set(JOB,copy(b.dataItem));writes++;result={data:{dataItem:copy(b.dataItem)}};
    } else throw Error('Unexpected mock request; no network fallback');
    if(failing&&failing.after){failure=null;throw Error(failing.message||'SYNTHETIC_LOST_RESPONSE');}
    return result;
  }};
  return {store,requests,pages,
    get writes(){return writes;},
    get job(){return store.get(JOB)?.data;},
    setIntercept(fn){intercept=fn;},
    failOnce(match,{after=false,message}={}){failure={match,after,message};},
    async run(opts={singleRunner:true}){
      // New function instance every call: durable state survives only via store.
      const run=vm.runInNewContext('('+source+')',{wix,Date},{timeout:1000});
      return copy(await run(opts));
    }
  };
}
module.exports={harness,fixture,JOB,FORM,SITE,source};
