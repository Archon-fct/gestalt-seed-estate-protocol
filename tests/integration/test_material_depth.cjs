'use strict';
// Local same-code Canvas tests. This is not browser, Safari or owner acceptance.
const {createCanvas,Image}=require('@napi-rs/canvas');
const fs=require('fs'),vm=require('vm'),path=require('path'),crypto=require('crypto'),assert=require('assert');
const root=path.resolve(__dirname,'../..'),source=fs.readFileSync(path.join(root,'hud/prototype/experiments/procedural-v10/procedural.js'),'utf8');
async function run(low){
 const main=createCanvas(1536,1024);main.dataset={};const listeners={},pending=new Map(),offscreen=[];let next=0;
 const state={still:true,selected:null,focus:null};
 const sandbox={console,Math,Map,Set,Object,Array,Number,String,parseInt,performance,Uint8ClampedArray,
 window:{NexusApp:{state},devicePixelRatio:2,addEventListener:(name,fn)=>listeners[name]=fn},
 document:{getElementById:()=>main,createElement:tag=>{if(tag==='img')return new Image();const c=createCanvas(1,1);offscreen.push(c);return c;},hidden:false,addEventListener:(name,fn)=>listeners[name]=fn},
 navigator:{hardwareConcurrency:low?4:8},matchMedia:()=>({matches:low}),
 cancelAnimationFrame:id=>pending.delete(id),requestAnimationFrame:fn=>{pending.set(++next,fn);return next;}};
 vm.createContext(sandbox);
 vm.runInContext(fs.readFileSync(path.join(root,'hud/prototype/experiments/procedural-v10/material-atlas.js'),'utf8'),sandbox);
 const start=performance.now();vm.runInContext(source,sandbox);await new Promise(resolve=>setTimeout(resolve,90));
 const initialMs=performance.now()-start,snapshot=()=>sandbox.window.__LivingMaterial10.snapshot();
 const digest=()=>crypto.createHash('sha256').update(Buffer.from(main.getContext('2d').getImageData(0,0,main.width,main.height).data)).digest('hex');
 assert.equal(snapshot().materialRevision,'auric-material-06');assert.equal(snapshot().motion,'paused');assert.equal(snapshot().cachedSurfaces,6);assert.equal(snapshot().coreCached,true);
 assert.equal(pending.size,0);assert.equal(main.dataset.materialAtlas,'ready');
 assert.equal(snapshot().particles,low?110:230);assert.equal(main.width,low?1306:1920);
 const initial=digest(),caches=offscreen.length,frames=snapshot().frames;
 fs.writeFileSync(path.join(__dirname,'still-first.png'),main.toBuffer('image/png'));listeners['nexus:motion']();fs.writeFileSync(path.join(__dirname,'still-repeat.png'),main.toBuffer('image/png'));assert.equal(digest(),initial,'Stillness must retain identical complete pixels');assert.equal(snapshot().frames,frames+1);assert.equal(offscreen.length,caches,'Cached redraw must not allocate surfaces');assert.equal(pending.size,0);
 state.focus='aura';listeners['nexus:focus']();assert.notEqual(digest(),initial,'Explicit focus must respond in Stillness');assert.equal(pending.size,0,'Focus must not restart ornamental motion');
 state.focus=null;listeners['nexus:focus']();assert.equal(digest(),initial,'Returning focus must preserve the original material');
 state.still=false;listeners['nexus:motion']();assert.equal(pending.size,1);let item=[...pending][0];pending.delete(item[0]);const frameStart=performance.now();item[1](100);const drawMs=performance.now()-frameStart;
 assert.equal(snapshot().motion,'running');assert.equal(pending.size,1);assert.notEqual(digest(),initial,'Running material must advance');assert.equal(offscreen.length,caches);
 sandbox.document.hidden=true;listeners.visibilitychange();assert.equal(pending.size,0);assert.equal(snapshot().motion,'paused');
 sandbox.document.hidden=false;state.still=true;listeners.visibilitychange();assert.equal(pending.size,0);assert.equal(snapshot().motion,'paused');
 listeners.pagehide();assert.equal(pending.size,0);
 return {quality:low?'bounded-mobile':'desktop',status:'PASS',assertions:24,initialMs:Math.round(initialMs),warmDrawMs:Math.round(drawMs),offscreenCaches:caches,cachedBytes:offscreen.reduce((a,c)=>a+c.width*c.height*4,0),canvas:{width:main.width,height:main.height},snapshot:snapshot()};
}
(async()=>{const results=[];for(const low of [false,true]){const r=await run(low);results.push(r);console.log(JSON.stringify(r));}const report={scope:'Same renderer code using Skia Canvas; not a browser/Safari/owner acceptance result',sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),results};fs.writeFileSync(path.join(__dirname,'test-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));})().catch(e=>{console.error(e);process.exitCode=1;});
