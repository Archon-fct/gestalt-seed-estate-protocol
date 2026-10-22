/* Living Constellation Study 04 · kinetic auric continuity
   Source direction: approved six-world constellation and Oct 8 motion studies.
   Procedural Canvas only, not copied footage. Passive overlay, no storage,
   microphone, network, user inference, or functional navigation ownership.
   The original controls remain the only source of user intent.
*/
(()=>{
'use strict';
const stage=document.getElementById('space');
const nexus=stage?.querySelector('.nexus');
const nodes=Array.from(stage?.querySelectorAll(':scope > .node[data-id]')||[]);
if(!stage||!nexus||nodes.length!==6)return;
const canvas=document.createElement('canvas');
canvas.id='kineticField04'; canvas.className='kinetic-field-04';
canvas.setAttribute('aria-hidden','true'); canvas.setAttribute('role','presentation');
canvas.setAttribute('tabindex','-1');
stage.insertBefore(canvas,stage.querySelector('.nexus'));
const ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});
if(!ctx){canvas.remove();return;}
const palettes={
 aura:['#97e7c7','#d4f8db','#f5dfae'],
 aureglossa:['#72b9f0','#bca4ff','#f5e1c1'],
 services:['#f4c58a','#fff0ce','#a4dada'],
 gestalt:['#b39cfc','#e2c5ff','#b3e0ef'],
 workshops:['#f2c18a','#f2dcaa','#b9b6ee'],
 journal:['#afa0ef','#e0b9fc','#9edaf1']
};
const golden=['#f6e3b9','#a6e5d7','#b7a2ef'];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const TAU=Math.PI*2,lerp=(a,b,t)=>a+(b-a)*t,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
let w=1,h=1,dpr=1,ts=0,frame=0,raf=0,last=0,paintms=0;
let selected=null,hot=null,phase='idle',phaseAt=0,progress=0,hoverStrength=0;
let anchor=null,geometry={};
let lastPaintAt=0;
const low=()=>w<620||Number(navigator.hardwareConcurrency||8)<=4;
const still=()=>document.body.classList.contains('still')||reduced.matches;
const rect=(el)=>{const a=el.getBoundingClientRect(),b=stage.getBoundingClientRect();return{x:a.left-b.left+a.width*.5,y:a.top-b.top+a.height*.5,r:Math.max(a.width,a.height)*.5};};
const vec=(x,y)=>Math.hypot(x,y);
const cpos=(p0,p1,p2,p3,t)=>{const u=1-t;return{x:u*u*u*p0.x+3*u*u*t*p1.x+3*u*t*t*p2.x+t*t*t*p3.x,y:u*u*u*p0.y+3*u*u*t*p1.y+3*u*t*t*p2.y+t*t*t*p3.y};};
function size(){
 const b=stage.getBoundingClientRect();const nw=Math.max(1,Math.round(b.width)),nh=Math.max(1,Math.round(b.height));
 const nd=Math.min(low()?1:1.4,devicePixelRatio||1);
 if(nw===w&&nh===h&&dpr===nd)return;
 w=nw;h=nh;dpr=nd;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
 canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);
 canvas.dataset.quality=low()?'low':'full';
}
function geometryOf(){
 // Each endpoint is measured from the genuine HTML button geometry, not
 // a fabricated constellation diagram. Freeze the base anchor during crossing.
 const center=rect(nexus);
 const world=nodes.map(node=>({id:node.dataset.id,node,...rect(node)}));
 return{center,world};
}
function resetAnchors(){
 geometry=geometryOf();if(!anchor||phase==='idle')anchor=null;
}
function nowPhase(dt){
 if(phase==='unfold'){
  progress=smooth((performance.now()-phaseAt)/1250);
  if(progress>=1)phase='stable';
 }else if(phase==='reverse'){
  progress=1-smooth((performance.now()-phaseAt)/1160);
  if(progress<=0){phase='idle';selected=null;anchor=null;progress=0;}
 }
 hoverStrength=lerp(hoverStrength,hot?1:0,1-Math.exp(-dt*3.7));
 canvas.dataset.phase=phase;
 canvas.dataset.world=selected||hot||'';
 canvas.dataset.progress=progress.toFixed(3);
}
function choose(node){
 if(phase==='unfold'||phase==='stable'||phase==='reverse')return;
 hot=node.dataset.id;
 canvas.dataset.world=hot;
}
function unchoose(node){if(hot===node.dataset.id&&phase==='idle')hot=null;}
for(const node of nodes){
 node.addEventListener('pointerenter',()=>choose(node),{passive:true});
 node.addEventListener('focus',()=>choose(node),{passive:true});
 node.addEventListener('pointerleave',()=>unchoose(node),{passive:true});
 node.addEventListener('blur',()=>unchoose(node),{passive:true});
 node.addEventListener('click',()=>{
  // The legacy handler handles the journey and dialog; animation is a listener.
  selected=node.dataset.id;anchor={...rect(node)};phase='unfold';progress=0;phaseAt=performance.now();
  if(still()){phase='stable';progress=1;}
 });
}
function invertSmooth(v){let lo=0,hi=1;for(let i=0;i<13;i++){const mid=(lo+hi)/2;if(smooth(mid)<v)lo=mid;else hi=mid;}return(lo+hi)/2;}
const goBack=()=>{if(selected&&(phase==='stable'||phase==='unfold')){
 // Update elapsed progress BEFORE reversal, independent of a delayed rAF.
 nowPhase(0);const from=clamp(progress,0,1);
 if(still()){phase='idle';selected=null;anchor=null;progress=0;return;}
 phase='reverse';
 // Match the exact eased progress even for a rapid mid-unfold cancellation.
 phaseAt=performance.now()-invertSmooth(1-from)*1160;
}};
document.getElementById('back')?.addEventListener('click',goBack,{capture:true});
document.addEventListener('keydown',e=>{if(e.key==='Escape')goBack();},{capture:true});
const observer=new MutationObserver(()=>{
 if(still()||document.hidden){canvas.dataset.motion='paused';if(!document.hidden)render();}
});
observer.observe(document.body,{attributes:true,attributeFilter:['class']});
function begin(p0,p1,p2,p3,col,alpha,width,beads=false,t=0,seed=0){
 ctx.strokeStyle=col;ctx.globalAlpha=alpha;ctx.lineWidth=width;
 ctx.beginPath();ctx.moveTo(p0.x,p0.y);ctx.bezierCurveTo(p1.x,p1.y,p2.x,p2.y,p3.x,p3.y);ctx.stroke();
 if(beads){const k=((t*.10+seed*.618)%1+1)%1,pt=cpos(p0,p1,p2,p3,k);
  ctx.globalAlpha=Math.min(.85,alpha*1.6);ctx.fillStyle='#fff1cb';ctx.beginPath();ctx.arc(pt.x,pt.y,1.1,0,TAU);ctx.fill();
 }
}
function paintGlow(x,y,r,rgb,alpha){
 const g=ctx.createRadialGradient(x,y,0,x,y,r);
 g.addColorStop(0,`rgba(${rgb},${(alpha*.58).toFixed(3)})`);
 g.addColorStop(.28,`rgba(${rgb},${(alpha*.16).toFixed(3)})`);
 g.addColorStop(1,`rgba(${rgb},0)`);
 ctx.fillStyle=g;ctx.globalAlpha=1;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
}
function drawnHollow(x,y,r,colors,seed,energy,t){
 // Layered void/auric structure; arcs change shape without re-seeding geometry.
 // Deliberate open gaps keep the center legible; no opaque round disc is drawn.
 const layers=low()?23:38;
 paintGlow(x,y,r*2.05,seed===0?'237,215,172':'142,204,213',energy*.27);
 for(let i=0;i<layers;i++){
  const fi=i/layers,phi=seed*1.7+i*2.39996;
  const radius=r*(1.10+.27*Math.sin(phi*2.3)+.15*Math.sin(phi*1.1));
  const open=.32+.2*Math.sin(i*2.17+seed);
  const start=phi*.45;
  const sweep=(1.32+.54*Math.sin(i*1.72))*(.75+open);
  const tilt=(.8+.5*Math.sin(i*.43+seed));
  ctx.beginPath();
  const count=24;
  for(let j=0;j<=count;j++){
   const a=start+sweep*j/count;
   const corr=.92+.06*Math.sin(a*4+phi+.13*t)+.02*Math.cos(a*7-phi);
   const xx=x+Math.cos(a)*radius*corr;
   const yy=y+Math.sin(a)*radius*tilt*corr;
   if(j===0)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy);
  }
  ctx.globalAlpha=(.035+.060*(.5+.5*Math.sin(i*.71+seed)))*energy;
  ctx.strokeStyle=colors[i%colors.length];ctx.lineWidth=i%9===0?1.2:.53;ctx.stroke();
 }
}
function strands(core,item,t,e,fraction,idx){
 // Source/target points stay attached to the same HTML worlds through every
 // state. Coalescence and opening change these actual paths, not replace them.
 const dx=item.x-core.x,dy=item.y-core.y,L=Math.max(1,Math.hypot(dx,dy)),nx=-dy/L,ny=dx/L;
 const u={x:dx/L,y:dy/L};
 const a={x:core.x+u.x*core.r*.85,y:core.y+u.y*core.r*.85};
 const b={x:item.x-u.x*item.r*.68,y:item.y-u.y*item.r*.68};
 const n=low()?12:25;
 const colors=palettes[item.id]||golden;
 const focus=e;
 const active=selected===item.id;
 const spread=(12+Math.min(48,L*.09))*(1+focus*.58);
 const grad=ctx.createLinearGradient(a.x,a.y,b.x,b.y);
 grad.addColorStop(0,'#f7e1ba');grad.addColorStop(.35,colors[1]);grad.addColorStop(.77,colors[0]);grad.addColorStop(1,colors[2]);
 for(let k=0;k<n;k++){
  const q=(k+.5)/n-.5;
  const ph=idx*1.61+k*2.39996;
  const normal=q*spread*1.95;
  const oscillation=(still()?0:Math.sin(t*.62+ph))*spread*.11;
  const gather=smooth(fraction);
  // selected strands concentrate toward a single threshold, then fan out
  // while remaining in one continuous curve.
  const narrow=1-gather*.67;
  const taper=1-gather*.32;
  const p1={x:a.x+dx*.27+nx*((normal+oscillation)*narrow+Math.sin(ph)*18),
            y:a.y+dy*.27+ny*((normal+oscillation)*narrow+Math.sin(ph)*18)};
  const p2={x:a.x+dx*.75+nx*((-normal*.61+oscillation)*narrow-Math.sin(ph*.7)*14),
            y:a.y+dy*.75+ny*((-normal*.61+oscillation)*narrow-Math.sin(ph*.7)*14)};
  const p3={x:b.x+nx*normal*.14*taper,y:b.y+ny*normal*.14*taper};
  const alpha=(k%11===0?.23:.075)*(1+focus*.95);
  begin(a,p1,p2,p3,k%8===0?'#ffe9bc':grad,alpha,k%9===0?1.25:.7,k%3===0,t,k/n+idx);
  if(focus>.1&&k%4===0){const s=.46+.18*Math.sin(ph*.61+t*.25);const p=cpos(a,p1,p2,p3,s);
   ctx.fillStyle=colors[k%colors.length];ctx.globalAlpha=(.18+.1*Math.sin(t*.8+ph))*focus;
   ctx.beginPath();ctx.arc(p.x,p.y,1+2*focus,0,TAU);ctx.fill();
  }
 }
 // A smaller branching network is revealed only by deliberate selection.
 if(focus>.05){
  for(let j=0;j<(low()?5:13);j++){
    const f=.26+j*.041,twist=Math.sin(t*.28+j*2.43)*11;
    const q=cpos(a,{x:a.x+dx*.34+nx*(spread*.22),y:a.y+dy*.34+ny*(spread*.22)},
                   {x:a.x+dx*.71-nx*(spread*.1),y:a.y+dy*.71-ny*(spread*.1)},b,f);
    const tail={x:q.x+nx*(20+twist)*(j%2?-1:1),y:q.y+ny*(20+twist)*(j%2?-1:1)};
    ctx.strokeStyle=colors[(j+1)%colors.length];ctx.globalAlpha=.12*focus;ctx.lineWidth=.68;
    ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.quadraticCurveTo((q.x+tail.x)/2+u.x*12,(q.y+tail.y)/2+u.y*12,tail.x,tail.y);ctx.stroke();
  }
 }
}
function bloomWorld(item,t,intensity,opening){
 // Field 02's toroidal strand vocabulary is retained as procedural geometry,
 // newly projected around actual world locations, expanding during entry.
 const colors=palettes[item.id];const n=low()?17:36;
 const radius=item.r*(1.2+opening*.65);
 paintGlow(item.x,item.y,radius*1.55,item.id==='aura'?'112,224,183':'160,154,209',intensity*.15);
 for(let i=0;i<n;i++){
  const ph=i*2.39996+4.63,osc=3+(i%6)*.61;
  const base=.92+.17*Math.sin(i*.63);
  const start=ph*.51;
  const points=26;
  ctx.beginPath();
  for(let j=0;j<=points;j++){
   const a=start+j/points*(2.25+.7*Math.sin(i*.9));
   const fold=.07*Math.sin(a*osc+ph+(still()?0:t*.48));
   const r=radius*(base+fold+.08*Math.cos(a*2+ph*.7));
   const x=item.x+Math.cos(a)*r;
   const y=item.y+Math.sin(a)*r*(.7+.18*Math.sin(ph));
   if(!j)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  }
  ctx.globalAlpha=(.035+.05*intensity)*(i%5===0?2:1);ctx.lineWidth=i%11===0?1.4:.55;
  ctx.strokeStyle=colors[i%3];ctx.stroke();
 }
}
function render(){
 const start=performance.now();size();if(!w||!h)return;
 const g=(phase==='unfold'||phase==='stable'||phase==='reverse')?geometry:{...geometryOf()};
 if(!g.center||!g.world)return;
 ctx.clearRect(0,0,w,h);ctx.save();ctx.globalCompositeOperation='screen';
 const q=progress,open=smooth(clamp((q-.15)/.85,0,1));
 const core=g.center;
 const energyTime=still()?2.5:ts;
 drawnHollow(core.x,core.y,core.r*1.18,golden,0,.67,energyTime);
 // A small quantity of far-field particles; avoid a generic particle storm.
 for(let i=0;i<(low()?35:78);i++){
   const angle=i*2.39996323,dist=1.8+Math.sqrt(i/120)*3.3;
   const xx=core.x+Math.cos(angle)*core.r*dist,yy=core.y+Math.sin(angle)*core.r*dist*.77;
   if(xx<0||xx>w||yy<0||yy>h)continue;
   ctx.fillStyle=i%3===0?'#d7c4f1':i%3===1?'#b2e2e5':'#f7d9a3';
   ctx.globalAlpha=.06+.05*Math.sin(i+energyTime*.13);
   ctx.beginPath();ctx.arc(xx,yy,.5+(i%9===0?.8:0),0,TAU);ctx.fill();
 }
 const world=g.world;
 for(let i=0;i<world.length;i++){
  const item={...world[i]};const isChosen=selected===item.id;
  const activeFocus=(isChosen?Math.max(hoverStrength,.80):hot===item.id?hoverStrength:0);
  const recommended=item.node.matches('.recommended,.search-hit,.resonant');
  const focus=clamp(activeFocus+(recommended?.28:0),0,1);
  if(isChosen&&anchor){
   // Continuously approach the original dimensional anchor as light unfolds.
   // Geometry never teleports or changes world identity.
   item.x=lerp(anchor.x,core.x+Math.min(w*.12,125),open*.46);
   item.y=lerp(anchor.y,core.y,open*.24);
   item.r=lerp(anchor.r,core.r*.80,open);
  }
  drawnHollow(item.x,item.y,item.r*.97,palettes[item.id],i+1,.66+focus*.20,energyTime);
  strands(core,item,energyTime,focus,isChosen?open:focus*.2,i);
  bloomWorld(item,energyTime,.42+focus*.48,isChosen?open:0);
 }
 ctx.restore();frame++;paintms=performance.now()-start;
 canvas.dataset.frames=String(frame);canvas.dataset.lastPaintMs=paintms.toFixed(1);
}
function tick(now){
 raf=0;
 if(document.hidden||still()){last=0;canvas.dataset.motion='paused';render();return;}
 const delta=last?Math.min(.11,(now-last)/1000):.033;last=now;ts+=delta;
 nowPhase(delta);
 const interval=low()?76:38;
 if(now-lastPaintAt>=interval){lastPaintAt=now;render();}
 canvas.dataset.motion='running';raf=requestAnimationFrame(tick);
}
function refresh(){
 if(document.hidden||still()){cancelAnimationFrame(raf);raf=0;last=0;canvas.dataset.motion='paused';render();return;}
 if(!raf){last=0;canvas.dataset.motion='running';raf=requestAnimationFrame(tick);}
}
document.addEventListener('visibilitychange',refresh);
reduced.addEventListener?.('change',refresh);
window.addEventListener('resize',()=>{resetAnchors();render();},{passive:true});
if('ResizeObserver' in window){const r=new ResizeObserver(()=>{size();resetAnchors();});r.observe(stage);}
window.__livingKinetic04=Object.freeze({snapshot:()=>{nowPhase(0);render();return{phase,selected,hot,progress,frame,paintms,motion:canvas.dataset.motion,quality:canvas.dataset.quality,worlds:nodes.length,engine:'Canvas2D selection-anchored continuous filaments',source:'Oct 8 approved visual + motion observations'};},
 freeze:()=>{document.body.classList.add('still');refresh();},resume:()=>{document.body.classList.remove('still');refresh();}});
size();resetAnchors();refresh();
})();
