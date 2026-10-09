/* Living Pocket Material v0.1 — the same field flows through public pocket worlds.
   Purely visual, no persistent storage, network, camera, microphone, user profiling
   or imported owner artwork. Original page controllers retain all interactions.
   Reduced motion/Stillness and hidden-tab motion cap are mandatory. */
(()=>{
'use strict';
const paths={
  'aura-dynamics.html':'aura', 'living-tongue.html':'tongue',
  'inner-sanctum.html':'sanctum','convergence.html':'convergence',
  'living-archive.html':'archive','astral-journal.html':'journal',
  'living-threshold.html':'threshold'
};
const page=window.__livingPocketTestPath||location.pathname.split('/').pop();const kind=paths[page];if(!kind)return;
const palettes={
 aura:['#79ebd1','#c5fff0','#80b7f7','#f9daa6'],
 tongue:['#efd9a0','#92d7e5','#ad9df1','#eff6d9'],
 sanctum:['#ffe1a6','#8ddbd3','#d3c2f3','#f9f1db'],
 convergence:['#f0d5a0','#78e5d0','#c5acf1','#fff3d8'],
 archive:['#bb9dff','#78cadf','#eacda5','#ecdef9'],
 journal:['#ad98e9','#9bdce9','#d8bfef','#e5d8b7'],
 threshold:['#f4d9a5','#81e8d7','#a497e9','#f6f0d4']
};
const choices={
 aura:'.journey [data-step], .field [data-layer]',
 tongue:'.tongue .word',sanctum:'.paths .path',
 convergence:'.field .gate',archive:'.archive .stone',
 journal:'.archive .fragment',threshold:'.portal, .stage-nav [data-stage]'
};
const originSelectors={aura:'.field .body',tongue:'.tongue .core',sanctum:'.sanctum',convergence:'.field .core',archive:'.archive .core',journal:'.archive .orbit',threshold:'.portal'};
const primary=document.querySelector(originSelectors[kind])||document.querySelector('main');
const candidates=[...document.querySelectorAll(choices[kind]||'button')];
if(!primary||!candidates.length)return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const canvas=document.createElement('canvas');canvas.className='living-pocket-material';canvas.id='livingPocketMaterial';
canvas.setAttribute('aria-hidden','true');canvas.setAttribute('role','presentation');canvas.setAttribute('tabindex','-1');
document.body.insertBefore(canvas,document.body.firstChild);
const ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});if(!ctx){canvas.remove();return;}
const p=palettes[kind],twoPI=2*Math.PI;
const rand=x=>{let n=Math.sin(x*126.2437+37.7)*43758.5453;return n-Math.floor(n)};
const screenPoint=el=>{const b=el.getBoundingClientRect();return{x:b.x+b.width/2,y:b.y+b.height/2,r:Math.max(30,Math.min(b.width,b.height)*.38)}};
let w=0,h=0,dpr=1,raf=0,last=0,time=0,frozen=false,aim=null,focus=0,paintCount=0;
const maxParticles=()=>w<680?19:w<1050?31:46;
const maxThreads=()=>w<680?34:w<1050?48:68;
function resize(){let W=Math.max(1,innerWidth),H=Math.max(1,innerHeight),D=Math.min(w<680?1.2:1.6,devicePixelRatio||1);if(W!==w||H!==h||D!==dpr){w=W;h=H;dpr=D;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);canvas.dataset.quality=w<680?'mobile':'full';}}
const still=()=>reduce.matches||document.body.classList.contains('still');
function center(){const v=screenPoint(primary);return{x:Math.max(w*.12,Math.min(w*.88,v.x)),y:Math.max(h*.12,Math.min(h*.88,v.y)),r:Math.min(Math.min(w,h)*.29,Math.max(80,v.r))};}
function curve(a,b,curveBend,phase){let dx=b.x-a.x,dy=b.y-a.y,L=Math.max(1,Math.hypot(dx,dy));let nx=-dy/L,ny=dx/L;const drift=Math.sin(time*.2+phase)*Math.min(10,L*.028);return[{x:a.x,y:a.y},{x:a.x+dx*.29+nx*(curveBend+drift),y:a.y+dy*.29+ny*(curveBend+drift)},{x:a.x+dx*.72-nx*curveBend*.6,y:a.y+dy*.72-ny*curveBend*.6},{x:b.x,y:b.y}];}
function at(a,t){const u=1-t;return {x:u*u*u*a[0].x+3*u*u*t*a[1].x+3*u*t*t*a[2].x+t*t*t*a[3].x,y:u*u*u*a[0].y+3*u*u*t*a[1].y+3*u*t*t*a[2].y+t*t*t*a[3].y};}
function stroke(pts,color,alpha,width,glow){ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.shadowBlur=glow;ctx.shadowColor=color;ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);ctx.bezierCurveTo(pts[1].x,pts[1].y,pts[2].x,pts[2].y,pts[3].x,pts[3].y);ctx.stroke();ctx.shadowBlur=0;}
function bloom(center,r,color,alpha){const g=ctx.createRadialGradient(center.x,center.y,1,center.x,center.y,r);g.addColorStop(0,color+'32');g.addColorStop(.23,color+'14');g.addColorStop(1,color+'00');ctx.globalAlpha=alpha;ctx.fillStyle=g;ctx.beginPath();ctx.arc(center.x,center.y,r,0,twoPI);ctx.fill();}
function paint(){resize();ctx.clearRect(0,0,w,h);const core=center();const short=Math.min(w,h),r=Math.min(short*.27,Math.max(83,core.r*.90));const active=aim&&document.contains(aim)?screenPoint(aim):null;
ctx.save();ctx.globalCompositeOperation='screen';
bloom(core,r*1.9,p[0],.54);bloom({x:core.x-r*.14,y:core.y+r*.12},r*1.6,p[2],.39);
// Irregular filaments recur at different scales and link to the original world anchor.
for(let i=0;i<maxThreads();i++){
 const seed=i*1.74+2,theta=rand(seed)*twoPI;
 const az=theta+Math.sin(seed*.47+time*.17)*.17;
 const spread=.6+rand(seed+2)*1.36;const endRadius=r*spread;
 const start={x:core.x+Math.cos(theta)*r*(.16+rand(seed+4)*.23),y:core.y+Math.sin(theta)*r*(.19+rand(seed+7)*.18)};
 const end={x:core.x+Math.cos(az)*endRadius*(1+.14*Math.cos(theta*3+time*.14)),y:core.y+Math.sin(az)*endRadius*(.66+.12*Math.sin(seed*.7))};
 const c=curve(start,end,(rand(seed+8)-.5)*r*.58,seed);
 const alpha=(.18+.24*rand(seed+3))*(1+.32*Math.sin(time*.3+seed));
 stroke(c,p[i%4],alpha,i%9===0?1.55:.9,i%8===0?7:0);
 if(i%4===0){const a=at(c,.21+.62*rand(seed+5));bloom(a,8+rand(seed+1)*16,p[i%4],.13);}
}
// Scale-separated fibers are retained; local selection gathers a few strands, not the whole background.
if(active){const a=core,b=active,dist=Math.hypot(b.x-a.x,b.y-a.y);for(let i=0;i<17;i++){
 const ang=(i-8)*.19;const start={x:a.x+Math.cos(ang)*r*.18,y:a.y+Math.sin(ang)*r*.18};
 const end={x:b.x+Math.cos(i*2.1)*active.r*.85,y:b.y+Math.sin(i*1.7)*active.r*.7};
 const c=curve(start,end,(i-8)*Math.min(5.8,dist*.025),i*.7);
 stroke(c,p[i%4],focus*(i%4===0?.32:.12),i%3===0?1.1:.57,4);
 }
 bloom(active,Math.max(55,active.r*2.15),p[0],focus*.32);
}
// Star seeds have position-dependent phases, not a grid or reseeded particle storm.
const dots=maxParticles();for(let i=0;i<dots;i++){const k=i*3.421+71,x=core.x+(rand(k)*2-1)*r*2.95,y=core.y+(rand(k+1)*2-1)*r*2.48;
 if(x<0||x>w||y<0||y>h)continue;
 const z=.5+rand(k+3)*1.3,opacity=(.18+.31*rand(k+2))*(.83+.17*Math.sin(time*.16+k));
 ctx.globalAlpha=opacity;ctx.fillStyle=p[(i+1)%4];ctx.beginPath();ctx.arc(x,y,z,0,twoPI);ctx.fill();
}
ctx.restore();paintCount++;canvas.dataset.frames=String(paintCount);
}
function tick(t){raf=0;if(document.hidden||still()){canvas.dataset.motion='paused';return;}if(t-last>= (w<680?70:45)){time+=Math.min(.08,last?(t-last)/1000:.016);last=t;focus+=(Number(Boolean(aim))-focus)*.16;paint();}canvas.dataset.motion='running';raf=requestAnimationFrame(tick);}
function refresh(){if(raf){cancelAnimationFrame(raf);raf=0;}if(document.hidden){canvas.dataset.motion='paused';return;}if(still()){canvas.dataset.motion='paused';paint();return;}canvas.dataset.motion='running';last=0;raf=requestAnimationFrame(tick);}
function targetOf(n){return n instanceof Element?candidates.find(x=>x===n||x.contains(n)):null;}
document.addEventListener('pointerover',e=>{const t=targetOf(e.target);if(t){aim=t;if(still()){focus=1;paint();}}});
document.addEventListener('pointerout',e=>{const t=targetOf(e.target);if(t&&!(t.contains(e.relatedTarget))){aim=null;if(still()){focus=0;paint();}}});
document.addEventListener('focusin',e=>{const t=targetOf(e.target);if(t){aim=t;if(still()){focus=1;paint();}}});
document.addEventListener('focusout',e=>{const t=targetOf(e.target);if(t){aim=null;if(still()){focus=0;paint();}}});
document.addEventListener('visibilitychange',refresh);window.addEventListener('resize',refresh,{passive:true});reduce.addEventListener?.('change',refresh);
const observe=new MutationObserver(()=>{if(still())paint();else if(!raf)refresh();});observe.observe(document.body,{attributes:true,attributeFilter:['class']});
refresh();
})();