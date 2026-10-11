import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {test} from 'node:test';
const code=fs.readFileSync('wix/integration/living-nexus-page.js','utf8').replace("import wixLocationFrontend from 'wix-location-frontend';",'');
function fixture(query={}) {
 const attributes={},events={},calls=[];let changed;
 const element={setAttribute:(k,v)=>attributes[k]=v,on:(k,fn)=>events[k]=fn};
 const location={query,queryParams:{add:q=>{calls.push(['add',q]);Object.assign(location.query,q);changed();},remove:keys=>{calls.push(['remove',keys]);keys.forEach(k=>delete location.query[k]);changed();}},onChange:fn=>changed=fn};
 const $w=id=>{assert.equal(id,'#livingNexus');return element;};$w.onReady=fn=>fn();
 vm.runInNewContext(code,{$w,wixLocationFrontend:location});
 return {attributes,events,calls,location,changed:()=>changed()};
}
test('initial deep link selects the allowlisted world',()=>{const f=fixture({world:'aura'});assert.equal(f.attributes.world,'aura');assert.equal(f.attributes['route-base'],'https://www.archonsoulings.com/living-nexus');});
test('unknown and object-valued query cannot select another document',()=>{for(const world of ['__proto__','https://evil.example',{x:'aura'}])assert.equal(fixture({world}).attributes.world,'nexus');});
test('navigation changes only the world query and never uses event href',()=>{const f=fixture({campaign:'keep'});f.events['nexus-route']({detail:{world:'sessions',href:'https://evil.example'}});assert.equal(f.location.query.world,'sessions');assert.equal(f.location.query.campaign,'keep');assert.equal(f.attributes.world,'sessions');});
test('return removes only the world parameter',()=>{const f=fixture({world:'aura',campaign:'keep'});f.events['nexus-route']({detail:{world:'nexus'}});assert.equal(f.location.query.world,undefined);assert.equal(f.location.query.campaign,'keep');});
test('same world does not loop or add duplicate history',()=>{const f=fixture({world:'aura'});f.events['nexus-route']({detail:{world:'aura'}});assert.equal(f.calls.length,0);});
test('location change restores component route',()=>{const f=fixture();f.location.query.world='journal';f.changed();assert.equal(f.attributes.world,'journal');});
test('malformed route event is ignored',()=>{const f=fixture();for(const detail of [null,{}, {world:'__proto__'}, {world:[] }])f.events['nexus-route']({detail});assert.equal(f.calls.length,0);});
