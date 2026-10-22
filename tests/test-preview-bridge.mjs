import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import vm from 'node:vm';
const root = new URL('../', import.meta.url);
const html = readFileSync(new URL('hud/preview/index.html', root), 'utf8');
const pageSource = readFileSync(new URL('wix/living-threshold-preview-page.js', root), 'utf8')
  .replace(/^import .*;\n/gm, '');
const formId = '292fd420-6097-4980-a1da-ee6398f78981';
const nonce = '11111111-2222-4333-8444-555555555555';
const requestId = '22222222-2222-4333-8444-555555555555';
const good = {ok:true,verified:true,formId,status:'CONFIRMED',stewardship:'PROVISIONAL',receiptId:requestId};
let passed=0;
async function test(name,fn){await fn();passed++;console.log('PASS',name)}
const receiptFunction = html.slice(html.indexOf('function validReceipt('),html.indexOf('function handleMessage('));
const receiptContext={FORM_ID:formId};vm.createContext(receiptContext);vm.runInContext(receiptFunction,receiptContext);
for(const [name,edit] of [['verified',{}],['pending',{status:'PENDING'}],['no id',{receiptId:''}],['unverified',{verified:false}],['wrong form',{formId:'other'}],['not provisional',{stewardship:'ACCEPTED'}],['truthy only',{ok:'true'}]]){
  await test('receipt predicate '+name,()=>assert.equal(Boolean(receiptContext.validReceipt({...good,...edit})),name==='verified'));
}
function host(mode='ok'){
  let onMessage;const sent=[],calls=[];
  const htmlElement={onMessage:fn=>onMessage=fn,postMessage:async data=>sent.push(data)};
  const $w=()=>htmlElement;$w.onReady=fn=>fn();
  const sandbox={$w,Map,previewCapabilities:async()=>{if(mode==='denied')throw new Error('denied');return {protocol:'archon-living-hud-v1',mode:'admin-preview',formId}},
  submitPreviewStone:async values=>{calls.push(values);if(mode==='throws')throw new Error('internal');return mode==='validation'?{ok:false,kind:'validation',attempted:false}:good}};
  vm.createContext(sandbox);vm.runInContext(pageSource,sandbox);
  return{send:data=>onMessage({data}),sent,calls};
}
const hello={protocol:'archon-living-hud-v1',nonce,type:'hello'};
const submit={...hello,type:'submit',requestId,values:{synthetic:'test'}};
await test('authorized handshake',async()=>{const h=host();await h.send(hello);assert.equal(h.sent[0].type,'ready')});
await test('unauthorized caller gets no ready or write',async()=>{const h=host('denied');await h.send(hello);await h.send(submit);assert.equal(h.sent.length,0);assert.equal(h.calls.length,0)});
await test('malformed nonce ignored',async()=>{const h=host();await h.send({...hello,nonce:'wrong'});assert.equal(h.sent.length,0)});
await test('different nonce cannot take over page session',async()=>{const h=host();await h.send(hello);await h.send({...submit,nonce:requestId});assert.equal(h.calls.length,0)});
await test('duplicate request reuses cached response without new write',async()=>{const h=host();await h.send(hello);await h.send(submit);await h.send(submit);assert.equal(h.calls.length,1);assert.equal(h.sent.filter(x=>x.type==='result').length,2)});
await test('second request blocked after attempt',async()=>{const h=host();await h.send(submit);await h.send({...submit,requestId:'33333333-2222-4333-8444-555555555555'});assert.equal(h.calls.length,1)});
await test('validation correction permitted',async()=>{const h=host('validation');await h.send(submit);await h.send({...submit,requestId:'33333333-2222-4333-8444-555555555555'});assert.equal(h.calls.length,2)});
await test('host exception unverified and write remains locked',async()=>{const h=host('throws');await h.send(submit);await h.send({...submit,requestId:'33333333-2222-4333-8444-555555555555'});assert.equal(h.calls.length,1);assert.equal(h.sent[0].result.kind,'unverified');assert.equal(JSON.stringify(h.sent).includes('internal'),false)});
console.log(`${passed} bridge/receipt checks passed. Host and backend are isolated mocks.`);
