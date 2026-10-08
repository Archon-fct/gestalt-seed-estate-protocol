/* Material continuity renderer. The approved image remains the actual art,
   while independently authored light transport is additive. No network calls. */
(()=>{'use strict';const app=window.NexusApp;if(!app)return;
const canvas=document.getElementById('filaments'),ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;
const W=1536,H=1024,C={x:768,y:474},worlds=app.worlds,ids=Object.keys(worlds).filter(x=>x!=='nexus');
const rgba=(hex,a)=>{const n=parseInt(hex.slice(1),16);return`rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x)};
const low=matchMedia('(max-width:650px)').matches||Number(navigator.hardwareConcurrency||8)<=4;
let phase=0,last=0,raf=0,frames=0,focusLevel={},lastPaint=0;ids.forEach(id=>focusLevel[id]=0);
function size(){const dpr=Math.min(devicePixelRatio||1,low?.65:1);canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);canvas.dataset.quality=low?'balanced':'high';}
function point(p0,p1,p2,p3,t){const u=1-t;return{x:u*u*u*p0.x+3*u*u*t*p1.x+3*u*t*t*p2.x+t*t*t*p3.x,y:u*u*u*p0.y+3*u*u*t*p1.y+3*u*t*t*p2.y+t*t*t*p3.y};}
function strands(w,id,index,focus){const dx=w.x-C.x,dy=w.y-C.y,L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L,ux=dx/L,uy=dy/L;
 const a={x:C.x+ux*114,y:C.y+uy*114},b={x:w.x-ux*116,y:w.y-uy*116};
 const count=low?8:19,light=w.color,flow=app.state.still?0:phase;
 for(let layer=0;layer<count;layer++){
  const f=layer/count,side=(f-.5)*(48+focus*26),wave=Math.sin(layer*1.94+index*.79+flow*.28)*5;
  const p1={x:a.x+dx*.27+nx*(side+wave+Math.sin(index+layer)*19),y:a.y+dy*.27+ny*(side+wave+Math.sin(index+layer)*19)};
  const p2={x:a.x+dx*.74-nx*(side*.62+wave),y:a.y+dy*.74-ny*(side*.62+wave)};
  const p3={x:b.x+nx*side*.09,y:b.y+ny*side*.09};
  const gradient=ctx.createLinearGradient(a.x,a.y,b.x,b.y);gradient.addColorStop(0,rgba('#f6dcb3',.9));gradient.addColorStop(.47,rgba(light,.96));gradient.addColorStop(1,rgba('#fff1d7',.8));
  ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.bezierCurveTo(p1.x,p1.y,p2.x,p2.y,p3.x,p3.y);
  ctx.lineWidth=layer%6===0?1.55:.65;ctx.globalAlpha=(layer%6===0?.18:.07)*(1+focus*1.35);ctx.strokeStyle=gradient;ctx.stroke();
  if(layer%3===0){for(let k=0;k<(low?1:3);k++){const t=((k+(layer%5)*.2)/3+flow*.035+index*.12)%1,p=point(a,p1,p2,p3,t);ctx.beginPath();ctx.arc(p.x,p.y,.9+(layer%4)*.22,0,Math.PI*2);ctx.globalAlpha=(.14+.22*focus)*Math.sin(Math.PI*t);ctx.fillStyle=layer%2?'#e8d9fb':light;ctx.fill();}}
  // A translucent living membrane between existing filaments; no flat discs.
  if(layer%5===0){const p1b={x:p1.x+nx*12,y:p1.y+ny*12},p2b={x:p2.x+nx*13,y:p2.y+ny*13};ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.bezierCurveTo(p1.x,p1.y,p2.x,p2.y,p3.x,p3.y);ctx.bezierCurveTo(p2b.x,p2b.y,p1b.x,p1b.y,a.x,a.y);ctx.closePath();ctx.globalAlpha=(.018+.015*focus);ctx.fillStyle=light;ctx.fill();}
 }
}
function halos(w,id,index,focus){const t=app.state.still?1.3:phase;const count=low?11:22;for(let k=0;k<count;k++){
 const angle=k*2.399963+index*.41,fold=Math.sin(k*1.47+index*.93+t*.27);
 const rad=122+focus*28+fold*12,ell=.75+.12*Math.sin(k*.38+index);
 ctx.beginPath();ctx.ellipse(w.x,w.y,rad*(.88+.09*Math.sin(k*.9)),rad*ell,angle*.27,angle*.15,angle*.15+.26+Math.abs(fold)*.23);
 ctx.globalAlpha=(.032+.044*focus)*(k%5===0?1.6:1);ctx.strokeStyle=k%3===0?'#fff2d4':w.color;ctx.lineWidth=k%6===0?1.2:.5;ctx.stroke();
 }
 if(focus>.015){const n=low?9:17;for(let k=0;k<n;k++){const a=k*2.39996+index,rad=128+(Math.sin(k*1.23+t*.22)*15);ctx.beginPath();ctx.moveTo(w.x+Math.cos(a)*110,w.y+Math.sin(a)*100);ctx.quadraticCurveTo(w.x+Math.cos(a+.2)*rad,w.y+Math.sin(a+.2)*rad,w.x+Math.cos(a+.4)*(rad+focus*38),w.y+Math.sin(a+.4)*(rad+focus*32));ctx.globalAlpha=.09*focus;ctx.strokeStyle=w.color;ctx.lineWidth=.7;ctx.stroke();}}
}
// v0.7 — anchored, cinematic living currents. These are deterministic
// filaments flowing through the APPROVED art, not a replacement composition.
// All curves keep their identity as a world is selected, opened and released.
function livingCurrents(){
 const frozen=app.state.still||document.hidden;
 const t=frozen?0:phase;
 const layers=low?3:6;
 const beads=low?3:7;
 ctx.save();ctx.globalCompositeOperation='screen';
 for(let i=0;i<ids.length;i++){
  const id=ids[i],w=worlds[id],f=focusLevel[id]||0;
  const dx=w.x-C.x,dy=w.y-C.y,L=Math.max(1,Math.hypot(dx,dy));
  const ux=dx/L,uy=dy/L,nx=-uy,ny=ux;
  const a={x:C.x+ux*111,y:C.y+uy*111};
  const b={x:w.x-ux*103,y:w.y-uy*103};
  for(let layer=0;layer<layers;layer++){
   const z=(layer+.5)/layers;
   const identity=i*1.93+layer*2.399963;
   const breath=Math.sin(identity+t*.32);
   const fold=Math.sin(identity*.7+t*.21);
   const span=(21+L*.09)*(z-.46);
   const width=(6+8*z)*(1+.25*breath)*(1+.48*f);
   const c1={x:a.x+dx*.28+nx*(span+breath*12),y:a.y+dy*.28+ny*(span+breath*12)};
   const c2={x:a.x+dx*.74-nx*(span*.7+fold*16),y:a.y+dy*.74-ny*(span*.7+fold*16)};
   const q1={x:c1.x+nx*width,y:c1.y+ny*width};
   const q2={x:c2.x+nx*width*.74,y:c2.y+ny*width*.74};
   const edge1=ctx.createLinearGradient(a.x,a.y,b.x,b.y);
   edge1.addColorStop(0,rgba('#ffe7ad',.55));
   edge1.addColorStop(.4,rgba(w.color,.65));
   edge1.addColorStop(1,rgba('#ffecc9',.48));
   // Translucent organic membrane with a luminous inner edge.
   ctx.beginPath();ctx.moveTo(a.x,a.y);
   ctx.bezierCurveTo(c1.x,c1.y,c2.x,c2.y,b.x,b.y);
   ctx.bezierCurveTo(q2.x,q2.y,q1.x,q1.y,a.x,a.y);
   ctx.closePath();ctx.fillStyle=w.color;ctx.globalAlpha=(.012+.016*z)*(1+.65*f);ctx.fill();
   ctx.beginPath();ctx.moveTo(a.x,a.y);
   ctx.bezierCurveTo(c1.x,c1.y,c2.x,c2.y,b.x,b.y);
   ctx.strokeStyle=edge1;ctx.globalAlpha=(.11+.055*z)*(1+f*.95);
   ctx.lineWidth=layer%3===0?1.25:.62;
   ctx.shadowColor=w.color;ctx.shadowBlur=low?2:7;ctx.stroke();
   ctx.shadowBlur=0;
   // Light is advected along the SAME curve. No reseeding on interaction.
   for(let k=0;k<beads;k++){
    const travel=(k/beads+i*.137+layer*.163+t*(.028+.006*z))%1;
    const q=point(a,c1,c2,b,travel);
    const envelope=Math.pow(Math.sin(Math.PI*travel),1.35);
    const radius=(.58+z*.8+f*.6)*envelope;
    if(radius<.08)continue;
    ctx.beginPath();ctx.arc(q.x,q.y,radius,0,Math.PI*2);
    ctx.globalAlpha=(.22+.2*f)*envelope;
    ctx.fillStyle=k%3===0?'#fff0c9':w.color;ctx.fill();
   }
  }
  // The chosen world's membrane expands and contracts without changing shape.
  if(f>.01){
   const count=low?6:11;
   for(let k=0;k<count;k++){
    const angle=(k*2.399963+i*.63),r=108+f*18+Math.sin(k*1.1+t*.39)*10;
    const a1=angle+t*.014;
    ctx.beginPath();ctx.ellipse(w.x,w.y,r*.9,r*.65,a1*.18,a1,a1+.17+f*.14);
    ctx.globalAlpha=.07*f;ctx.strokeStyle=k%3?'#f5dfbd':w.color;
    ctx.lineWidth=.65;ctx.stroke();
   }
  }
 }
 ctx.restore();
}
function render(){ctx.clearRect(0,0,W,H);ctx.save();ctx.globalCompositeOperation='screen';
 const focused=app.state.focus||app.state.gaze;
 ids.forEach((id,i)=>{const w=worlds[id],f=focusLevel[id];strands(w,id,i,f);halos(w,id,i,f);});
 livingCurrents();
 const central=ctx.createRadialGradient(C.x,C.y,20,C.x,C.y,230);central.addColorStop(0,'rgba(255,233,177,.055)');central.addColorStop(.4,'rgba(142,215,232,.025)');central.addColorStop(1,'rgba(110,150,235,0)');ctx.fillStyle=central;ctx.globalAlpha=1;ctx.fillRect(C.x-230,C.y-230,460,460);
 ctx.restore();canvas.dataset.frames=String(++frames);canvas.dataset.focus=focused||'';canvas.dataset.material='approved-image-plus-coherent-auric-membranes-v07';}
function tick(now){raf=0;if(!document.hidden&&!app.state.still&&now-lastPaint<(low?32:21)){raf=requestAnimationFrame(tick);return;}lastPaint=now;if(document.hidden||app.state.still){last=0;canvas.dataset.motion='paused';render();return;}const dt=last?Math.min(.075,(now-last)/1000):.033;last=now;phase+=dt;
 for(const id of ids){const target=(app.state.focus===id||app.state.selected===id||app.state.gaze===id)?1:0;focusLevel[id]+=(target-focusLevel[id])*(1-Math.exp(-dt*2.3));}
 render();canvas.dataset.motion='running';raf=requestAnimationFrame(tick);}
function refresh(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;if(app.state.still||document.hidden){canvas.dataset.motion='paused';render();}else raf=requestAnimationFrame(tick);}
size();refresh();window.addEventListener('nexus:motion',refresh);window.addEventListener('nexus:focus',refresh);document.addEventListener('visibilitychange',refresh);window.__NexusField={snapshot:()=>({frames,focus:canvas.dataset.focus,motion:canvas.dataset.motion,quality:canvas.dataset.quality,material:canvas.dataset.material})};
})();
