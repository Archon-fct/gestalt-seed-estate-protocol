const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync(__dirname+'/archon-living-nexus.js','utf8');
const adapter=source.slice(source.indexOf('  const ROUTES = Object.freeze'),source.lastIndexOf('})();'));
function fixture(){
 let Type; const nodes=[]; let disposed=0, silenced=0;
 const doc={getAnimations:()=>[],querySelector:()=>null};
 const create=()=>({style:{},dataset:{},contentDocument:doc,contentWindow:{__nexusDispose(){disposed++},__nexusSilence(){silenced++}},setAttribute(){},remove(){const i=nodes.indexOf(this);if(i>=0)nodes.splice(i,1)},animate(){return this.animation={cancel(){this.cancelled=true}}}});
 vm.runInNewContext(adapter,{HTMLElement:class{},customElements:{get:()=>null,define:(n,t)=>Type=t},DOCUMENTS:{nexus:'n',aura:'a',gestalt:'g'},BUILD:{version:'test'},document:{createElement:create},setTimeout:()=>1,clearTimeout(){},CustomEvent:class{}});
 const el=Object.create(Type.prototype);
 Object.assign(el,{live:true,still:false,reduce:{matches:false},paused:false,dataset:{},sequence:0,pendingWorld:'nexus',shadowRoot:{activeElement:null,querySelector:s=>s==='.view'?{append:f=>nodes.push(f)}:null},closeNavigation(){},closeJourney(){},sync(){},syncLinks(){},remember(){},say(s){this.notice=s},dispatchEvent(){}});
 return {el,nodes,get disposed(){return disposed},get silenced(){return silenced}};
}
test('keeps outgoing pixels, stops its runtime, and removes only after readiness and blend',()=>{
 const f=fixture(),e=f.el;e.renderWorld('nexus');e.frameReady(e.frame.contentWindow);const first=e.frame;
 e.renderWorld('aura');assert.equal(f.nodes.length,2);assert.equal(e.outgoing,first);assert.equal(first.inert,true);assert.equal(f.disposed,1);assert.equal(e.frame.style.opacity,undefined);
 e.frameReady(e.frame.contentWindow);assert.equal(e.frame.style.opacity,'1');assert.equal(f.nodes.length,2);first.animation.onfinish();assert.equal(f.nodes.length,1);assert.equal(e.outgoing,null);
});
test('rapid selection retains last visible world and rejects stale readiness',()=>{
 const {el:e,nodes}=fixture();e.renderWorld('nexus');e.frameReady(e.frame.contentWindow);const visible=e.frame;
 e.renderWorld('aura');const stale=e.frame;e.renderWorld('gestalt');e.frameReady(stale.contentWindow);
 assert.equal(e.dataset.ready,'false');assert.equal(e.outgoing,visible);assert.equal(nodes.length,2);assert.equal(e.pendingWorld,'gestalt');
});
test('Stillness and system reduced motion skip transition without blocking navigation',()=>{
 for(const system of [true,false]){const {el:e,nodes}=fixture();e.renderWorld('nexus');e.frameReady(e.frame.contentWindow);e.reduce.matches=system;e.still=!system;e.renderWorld('aura');e.frameReady(e.frame.contentWindow);assert.equal(nodes.length,1);assert.equal(e.frame.inert,false);}
});
test('Stillness during a blend removes the old layer immediately and silences',()=>{
 const f=fixture(),e=f.el;e.renderWorld('nexus');e.frameReady(e.frame.contentWindow);e.renderWorld('aura');e.frameReady(e.frame.contentWindow);e.setStill(true);assert.equal(f.nodes.length,1);assert.equal(f.silenced,1);
});
test('disposal removes both frames and cancels the blend',()=>{
 const {el:e,nodes}=fixture();e.renderWorld('nexus');e.frameReady(e.frame.contentWindow);e.renderWorld('aura');e.frameReady(e.frame.contentWindow);e.disposeFrame();assert.equal(nodes.length,0);assert.equal(e.frame,null);
});
