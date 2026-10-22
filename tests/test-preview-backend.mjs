import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import vm from 'node:vm';

// Isolated unit tests. Wix is mocked; these do not prove live persistence.
const source = readFileSync(new URL('../wix/livingThresholdPreview.web.js', import.meta.url), 'utf8')
  .replace(/^import .*;\n/gm, '').replace(/export const /g, 'const ');
const id = '11111111-2222-4333-8444-555555555555';
const formId = '292fd420-6097-4980-a1da-ee6398f78981';
const good = { creator_name: 'HUD test', contact_email: 'test@example.invalid', model_version: '',
  stone_title: '[HUD TEST] Original test fragment', contribution_type: 'Words / writing',
  contribution_text: 'A small original test sentence.', artifact_link: '',
  why_preserve: 'Verify this private preview receipt.', provenance_notes: 'Synthetic test only.',
  rights_terms_48eb_v06: true };
let passed = 0;
async function run(name, exercise) { await exercise(); console.log('PASS', name); passed++; }
function system(mode = 'ok') {
  const calls = [], permissions = [];
  let saved;
  const sandbox = { URL, Set, Object, Error,
    Permissions: { Admin: 'ADMIN_ONLY' },
    webMethod: (permission, fn) => { permissions.push(permission); return fn; },
    auth: { elevate: fn => fn },
    submissions: {
      createSubmission: async data => { calls.push(['create', data]); saved = structuredClone(data);
        if(mode === 'throw-create') throw new Error('secret database error');
        if(mode === 'empty') return {};
        const result = { ...saved, _id: id, status: mode === 'pending' ? 'PENDING' : 'CONFIRMED' };
        return mode === 'wrapped' ? { submission: result } : result;
      },
      getSubmission: async requestedId => { calls.push(['read', requestedId]);
        if(mode === 'throw-read') throw new Error('private payload');
        const result = { ...saved, _id: requestedId, status: mode === 'pending' ? 'PENDING' : 'CONFIRMED' };
        if(mode === 'wrong-form') result.formId = 'wrong';
        if(mode === 'wrong-id') result._id = '99999999-2222-4333-8444-555555555555';
        if(mode === 'wrong-values') result.submissions.contribution_text = 'different';
        return mode === 'wrapped' ? { submission: result } : result;
      }
    }
  };
  vm.createContext(sandbox);
  vm.runInContext(source+'\nglobalThis.api = { previewCapabilities, submitPreviewStone };', sandbox);
  return { api: sandbox.api, calls, permissions };
}
await run('Admin permission enforced on both entry points', async()=>{
  const s=system();assert.deepEqual(s.permissions,['ADMIN_ONLY','ADMIN_ONLY']);
  assert.equal((await s.api.previewCapabilities()).formId,formId);
});
for (const [name, edit] of [
  ['no consent', {rights_terms_48eb_v06:false}], ['string consent', {rights_terms_48eb_v06:'true'}],
  ['bad email', {contact_email:'wrong'}], ['unknown type',{contribution_type:'OTHER'}],
  ['blank required',{why_preserve:'  '}], ['too long',{contribution_text:'x'.repeat(12001)}],
  ['executable link',{artifact_link:'javascript:alert(1)'}], ['HTTP link',{artifact_link:'http://example.com'}],
  ['credential link',{artifact_link:'https://user:secret@example.com'}],
  ['unmarked test',{stone_title:'Public contribution'}], ['foreign field',{formId:'attacker'}],
  ['wrong type',{creator_name:{toString:'x'}}]
]) await run('reject '+name+' before write',async()=>{
  const s=system(),r=await s.api.submitPreviewStone({...good,...edit});
  assert.equal(r.kind,'validation');assert.equal(r.attempted,false);assert.equal(s.calls.length,0);
});
for (const value of [null, [], 'text']) await run('reject malformed input '+JSON.stringify(value), async()=>{
  const s=system();assert.equal((await s.api.submitPreviewStone(value)).kind,'validation');assert.equal(s.calls.length,0);
});
for (const mode of ['ok','wrapped']) await run('confirmed read-back '+mode,async()=>{
  const s=system(mode),r=await s.api.submitPreviewStone(good);
  assert.equal(r.ok,true);assert.equal(r.verified,true);assert.equal(r.receiptId,id);
  assert.equal(r.stewardship,'PROVISIONAL');assert.equal(s.calls.length,2);
  const request=s.calls[0][1];assert.equal(request.formId,formId);assert.equal('status' in request,false);
  assert.equal('artifact_link' in request.submissions,false);assert.equal(request.submissions.rights_terms_48eb_v06,true);
  assert.equal(JSON.stringify(r).includes(good.contact_email),false);
});
for (const mode of ['empty','pending','wrong-form','wrong-id','wrong-values','throw-create','throw-read']) {
  await run('no false success or automatic retry: '+mode,async()=>{
    const s=system(mode),r=await s.api.submitPreviewStone(good);
    assert.equal(r.ok,false);assert.equal(r.kind,'unverified');assert.equal(r.attempted,true);
    assert.equal(s.calls.filter(c=>c[0]==='create').length,1);
    assert.equal(JSON.stringify(r).includes('private'),false);assert.equal(JSON.stringify(r).includes('secret'),false);
  });
}
console.log(`${passed} backend checks passed. All Wix operations were mocked.`);
