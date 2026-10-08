/* Living Nexus: chromatic fluid volume v0.6
   Owner-supplied reference direction: IMG_2740…IMG_2744.
   Purely decorative, procedural Canvas layer. No image redistribution.
   Canvas is beneath the tested six-world HTML controls and SVG. It captures
   no input, uses no remote resources, stores nothing, and never infers identity.
*/
(()=>{
"use strict";
const stage=document.querySelector("#space");
const nexus=stage?.querySelector(".nexus");
const worlds=Array.from(stage?.querySelectorAll(":scope>.node[data-id]")||[]);
if(!stage||!nexus||worlds.length!==6)return;

const canvas=document.createElement("canvas");
canvas.id="livingChroma";
canvas.className="living-chroma-canvas";
canvas.setAttribute("aria-hidden","true");
canvas.setAttribute("role","presentation");
canvas.setAttribute("tabindex","-1");
stage.insertBefore(canvas,stage.firstChild);
const c=canvas.getContext("2d",{alpha:true,desynchronized:true});
if(!c){canvas.remove();return;}

const colors={
 aura:["#66ffe4","#bbfff0","#64b3ff"],
 aureglossa:["#78bdff","#f0a3f7","#75e4ee"],
 services:["#ffd6a3","#f0b074","#ba95ff"],
 gestalt:["#d2a5ff","#8894ff","#f2b2f3"],
 journal:["#a493ff","#64c8fb","#ecc6ff"],
 workshops:["#ffcb8d","#88f6c2","#eeaaff"]
};
const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
let w=1,h=1,dpr=1,active=false,handle=0,lastPaint=0,hasFrame=false,elapsed=0;
const lowBudget=()=>{
  const small=window.innerWidth<=650;
  const weak=Number(navigator.hardwareConcurrency||8)<=4;
  return small||weak;
};
const still=()=>document.body.classList.contains("still")||reduced.matches;
const center=(el,base)=>{
  const a=el.getBoundingClientRect(),b=base.getBoundingClientRect();
  return{x:a.left-b.left+a.width*.5,y:a.top-b.top+a.height*.5,r:Math.max(a.width,a.height)*.5};
};
function resize(){
  const rect=stage.getBoundingClientRect();
  const nextW=Math.max(1,Math.round(rect.width)),nextH=Math.max(1,Math.round(rect.height));
  const nextDpr=Math.min(lowBudget()?1:1.55,window.devicePixelRatio||1);
  if(w!==nextW||h!==nextH||nextDpr!==dpr){
    w=nextW;h=nextH;dpr=nextDpr;
    canvas.width=Math.ceil(w*dpr);canvas.height=Math.ceil(h*dpr);
    canvas.style.width=w+"px";canvas.style.height=h+"px";
    c.setTransform(dpr,0,0,dpr,0,0);
    canvas.dataset.quality=lowBudget()?"low":"full";
    hasFrame=false;
  }
}
function curve(a,b,bend,offset,seed,time){
 const dx=b.x-a.x,dy=b.y-a.y,len=Math.max(1,Math.hypot(dx,dy));
 const nx=-dy/len,ny=dx/len;
 const oscillation=Math.sin(time*.39+seed*1.77)*Math.min(15,len*.033);
 const eddy=Math.cos(time*.25-seed*1.15)*Math.min(9,len*.024);
 const p0={x:a.x+nx*offset,y:a.y+ny*offset},p3={x:b.x+nx*offset*.48,y:b.y+ny*offset*.48};
 return[
  p0,
  {x:a.x+dx*.27+nx*(bend+offset+oscillation),y:a.y+dy*.27+ny*(bend+offset+oscillation)},
  {x:a.x+dx*.71+nx*(-bend*.78+offset*.44+eddy),y:a.y+dy*.71+ny*(-bend*.78+offset*.44+eddy)},
  p3
 ];
}
function at(p,t){
 const u=1-t;
 return{x:u*u*u*p[0].x+3*u*u*t*p[1].x+3*u*t*t*p[2].x+t*t*t*p[3].x,
        y:u*u*u*p[0].y+3*u*u*t*p[1].y+3*u*t*t*p[2].y+t*t*t*p[3].y};
}
function tangent(p,t){
 const u=1-t;
 return{x:3*u*u*(p[1].x-p[0].x)+6*u*t*(p[2].x-p[1].x)+3*t*t*(p[3].x-p[2].x),
        y:3*u*u*(p[1].y-p[0].y)+6*u*t*(p[2].y-p[1].y)+3*t*t*(p[3].y-p[2].y)};
}
function palette(p,cs){
 const grad=c.createLinearGradient(p[0].x,p[0].y,p[3].x,p[3].y);
 grad.addColorStop(0,cs[0]);grad.addColorStop(.27,cs[1]);
 grad.addColorStop(.51,"#fff5dd");grad.addColorStop(.73,cs[2]);grad.addColorStop(1,cs[0]);
 return grad;
}
function silk(p,width,seed,time,cs,opacity){
 const grad=palette(p,cs);
 const sides=[[],[]];
 for(let j=0;j<=26;j++){
   const t=j/26,pt=at(p,t),tan=tangent(p,t),m=Math.max(1,Math.hypot(tan.x,tan.y));
   const k=Math.pow(Math.sin(Math.PI*t),.82)*(.72+.17*Math.sin(2*Math.PI*t+seed+time*.22)+.08*Math.cos(5*Math.PI*t+seed));
   sides[0].push({x:pt.x-tan.y/m*width*k,y:pt.y+tan.x/m*width*k});
   sides[1].push({x:pt.x+tan.y/m*width*k,y:pt.y-tan.x/m*width*k});
 }
 c.beginPath();c.moveTo(sides[0][0].x,sides[0][0].y);
 sides[0].slice(1).forEach(pt=>c.lineTo(pt.x,pt.y));
 sides[1].reverse().forEach(pt=>c.lineTo(pt.x,pt.y));
 c.closePath();
 c.globalAlpha=opacity;
 c.fillStyle=grad;
 c.shadowColor=cs[0];c.shadowBlur=width*.9;
 c.fill();
 c.shadowBlur=0;
}
function gleam(p,cs,alpha,time,seed){
 const g=palette(p,cs);
 c.beginPath();c.moveTo(p[0].x,p[0].y);
 c.bezierCurveTo(p[1].x,p[1].y,p[2].x,p[2].y,p[3].x,p[3].y);
 c.globalAlpha=alpha;
 c.strokeStyle=g;c.lineWidth=.7;
 c.shadowBlur=4;c.shadowColor=cs[1];c.stroke();c.shadowBlur=0;
 const t=.22+.55*(.5+.5*Math.sin(time*.31+seed));
 const spot=at(p,t);
 c.beginPath();c.arc(spot.x,spot.y,1.6,0,Math.PI*2);
 c.globalAlpha=alpha*.73;c.fillStyle=cs[1];c.fill();
}
function blossom(core,t){
 // Luminous organ/held nucleus: spectral folds behind the real Nexus controls.
 // Drawn as wisps, not an anatomical image or fabricated Aureglossa.
 const radius=Math.min(126,Math.max(66,core.r*1.1));
 for(let i=0;i<7;i++){
   const a=i*Math.PI*2/7+t*.035;
   const p0={x:core.x+Math.cos(a)*radius*1.7,y:core.y+Math.sin(a)*radius*1.45};
   const p3={x:core.x+Math.cos(a+.85)*radius*.43,y:core.y+Math.sin(a+.85)*radius*.48};
   const p=curve(p0,p3,Math.sin(a*1.9)*radius*.54,0,i+17,t);
   const cs=i%3===0?["#72e9e3","#f5dfb4","#d7a3f4"]:
            i%3===1?["#bd94ff","#f8c8ca","#7ce8e4"]:
                     ["#f0bc89","#9cf0c9","#999dff"];
   silk(p,radius*.135,i,t,cs,.065);
   gleam(p,cs,.24,t,i);
 }
}
function particles(core,world,t){
 // Sparse crystalline facets; neither pictographic text nor faux script.
 const target=lowBudget()?8:18;
 for(let i=0;i<target;i++){
   const a=i*2.399963+t*.005,rad=100+Math.sqrt(i/target)*Math.min(w*.34,420);
   const x=core.x+Math.cos(a)*rad,y=core.y+Math.sin(a)*rad*.82;
   if(x<8||x>w-8||y<16||y>h-20)continue;
   const size=1.3+(i%4)*.75;
   c.globalAlpha=.11+.06*Math.sin(t*.31+i);
   c.fillStyle= i%4===0?"#f1dca9":i%4===1?"#9ce9e1":i%4===2?"#c6b6ff":"#ec8ccf";
   c.beginPath();c.moveTo(x,y-size*1.5);c.lineTo(x+size*.65,y);
   c.lineTo(x,y+size*1.55);c.lineTo(x-size*.6,y);c.closePath();c.fill();
 }
}
function paint(time){
 resize();
 const core=center(nexus,stage);
 const world=worlds.map(node=>({...center(node,stage),id:node.dataset.id,node}));
 c.clearRect(0,0,w,h);
 c.save();
 c.globalCompositeOperation="lighter";
 // 3 sheets per functional relationship, under all HTML and SVG hit targets.
 for(let i=0;i<world.length;i++){
   const item=world[i],dx=item.x-core.x,dy=item.y-core.y,len=Math.max(1,Math.hypot(dx,dy));
   const nx=dx/len,ny=dy/len;
   const a={x:core.x+nx*core.r*.84,y:core.y+ny*core.r*.84};
   const b={x:item.x-nx*item.r*.82,y:item.y-ny*item.r*.82};
   const cs=colors[item.id]||colors.aura;
   const bright=item.node.matches(".resonant,.recommended,.search-hit");
   const dim=item.node.matches(".deemphasized,.search-dim");
   const emphasis=dim?.31:bright?1.5:1;
   for(let layer=0;layer<(lowBudget()?2:3);layer++){
     const bend=(layer-1)*25+Math.sin(i*1.3)*39;
     const p=curve(a,b,bend,(layer-1)*4,i*2.12+layer,time);
     silk(p,layer===1?22:12,i+layer*2,time,cs,(layer===1?.115:.065)*emphasis);
     gleam(p,cs,(layer===1?.25:.12)*emphasis,time,i*3+layer);
   }
 }
 blossom(core,time);
 particles(core,world,time);
 c.restore();
}
function loop(now){
 handle=0;
 if(document.hidden||still()){active=false;paint(3.7);hasFrame=true;return;}
 const interval=lowBudget()?92:66;
 if(now-lastPaint>=interval){
   elapsed=Math.min(86400,elapsed+Math.min(.21,(now-lastPaint)/1000));
   lastPaint=now;paint(elapsed);hasFrame=true;
 }
 active=true;handle=requestAnimationFrame(loop);
}
function refresh(){
 if(document.hidden){if(handle)cancelAnimationFrame(handle);handle=0;active=false;return;}
 if(still()){
   if(handle)cancelAnimationFrame(handle);handle=0;active=false;
   paint(3.7);hasFrame=true;return;
 }
 if(!active){lastPaint=0;active=true;handle=requestAnimationFrame(loop);}
}
const bodyObserver=new MutationObserver(refresh);
bodyObserver.observe(document.body,{attributes:true,attributeFilter:["class"]});
const visualObserver=new MutationObserver(()=>{
 if(still()&&!document.hidden){paint(3.7);hasFrame=true;}
});
visualObserver.observe(stage,{attributes:true,attributeFilter:["class"]});
for(const node of worlds)visualObserver.observe(node,{attributes:true,attributeFilter:["class"]});
const sizeObserver=window.ResizeObserver?new ResizeObserver(()=>{resize();if(still())paint(3.7);}):null;
sizeObserver?.observe(stage);
window.addEventListener("resize",()=>{resize();if(still())paint(3.7);},{passive:true});
document.addEventListener("visibilitychange",refresh);
reduced.addEventListener?.("change",refresh);
refresh();
})();
