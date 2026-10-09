/* LIVING MATERIAL 10 — original procedural rendering, not image warp.
   Continuous membranes, cocoons, refracted filaments and coherent particles.
   No network, storage, camera or inference. Stillness preserves rich static art. */
(()=>{'use strict';
const app=window.NexusApp,canvas=document.getElementById('livingScene');if(!app||!canvas)return;
const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return;
const W=1536,H=1024,TAU=Math.PI*2,low=matchMedia('(max-width:720px)').matches||Number(navigator.hardwareConcurrency||8)<=4;
const scale=Math.min(low?.85:1.25,(window.devicePixelRatio||1));canvas.width=Math.round(W*scale);canvas.height=Math.round(H*scale);ctx.setTransform(scale,0,0,scale,0,0);
const nodes=[
{id:'aura',x:768,y:158,r:119,col:['#b2fff1','#e9d4a5','#63a8a8'],phase:0},
{id:'aureglossa',x:440,y:312,r:116,col:['#7baefa','#c1a0fc','#9ee0ff'],phase:1.7},
{id:'sessions',x:1096,y:310,r:114,col:['#ffd3a6','#fff2cb','#be7d9e'],phase:2.8},
{id:'workshops',x:438,y:630,r:116,col:['#f6c587','#fce5b5','#e0a0cb'],phase:3.6},
{id:'gestalt',x:1092,y:630,r:116,col:['#c4a2ff','#8ce5ef','#f4c5b9'],phase:4.7},
{id:'journal',x:768,y:755,r:118,col:['#c5a4ff','#99b5ff','#e6c2d7'],phase:5.8}];
const core={x:768,y:476,r:154};let seed=912301;function rnd(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
const stars=Array.from({length:low?240:480},()=>({x:rnd()*W,y:rnd()*H,r:.35+rnd()*1.1,p:rnd()*TAU,v:.1+rnd()*.5,z:.3+rnd()*.7}));
const motes=Array.from({length:low?110:230},(_,i)=>({edge:i%6,phase:rnd(),lane:rnd()*2-1,r:.4+rnd()*1.2,speed:.018+rnd()*.038,depth:rnd()}));
let focus=Object.fromEntries(nodes.map(n=>[n.id,0])),time=0,last=0,frames=0,raf=0,lastFrame=0;
const lerp=(a,b,t)=>a+(b-a)*t;
function rgba(hex,a){const c=hex.replace('#','');return `rgba(${parseInt(c.slice(0,2),16)},${parseInt(c.slice(2,4),16)},${parseInt(c.slice(4,6),16)},${a})`;}
function glow(x,y,r,color,opacity=1){if(r<=0)return;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,rgba(color,.42*opacity));g.addColorStop(.14,rgba(color,.16*opacity));g.addColorStop(.45,rgba(color,.055*opacity));g.addColorStop(1,rgba(color,0));ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
function curve(p0,p1,p2,p3,t){const q=1-t;return {x:q*q*q*p0.x+3*q*q*t*p1.x+3*q*t*t*p2.x+t*t*t*p3.x,y:q*q*q*p0.y+3*q*q*t*p1.y+3*q*t*t*p2.y+t*t*t*p3.y};}
function background(t){
ctx.fillStyle='#040710';ctx.fillRect(0,0,W,H);const g=ctx.createRadialGradient(780,480,20,780,480,910);g.addColorStop(0,'#182338');g.addColorStop(.35,'#0d1727');g.addColorStop(.74,'#080e1b');g.addColorStop(1,'#03060d');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
for(let k=0;k<9;k++){const x=[40,1480,650,980,120,1370,420,1150,760][k],y=[120,140,100,80,840,840,950,920,500][k];glow(x+Math.sin(t*.09+k*1.4)*8,y,160+(k%3)*70,k%3===0?'#9c83e1':k%3===1?'#3b8fb8':'#c99b6c',.30);}
for(const s of stars){const tw=.57+.43*Math.sin(t*s.v+s.p);ctx.globalAlpha=(.16+.48*s.z)*tw;ctx.fillStyle=s.z>.65?'#e7e6df':'#92b3d5';ctx.beginPath();ctx.arc(s.x+Math.sin(t*.06+s.p)*s.z*2,s.y+Math.cos(t*.05+s.p)*s.z*2,s.r,0,TAU);ctx.fill();}ctx.globalAlpha=1;
for(let i=0;i<12;i++){const a=i*TAU/12+.18,r=480+Math.sin(i*2.1)*75;ctx.beginPath();ctx.ellipse(core.x+Math.cos(a)*r*.75,core.y+Math.sin(a)*r*.55,150,420,a,0,TAU);ctx.strokeStyle=rgba(i%2?'#9b91bd':'#83b5c3',.035);ctx.lineWidth=1.2;ctx.stroke();}
}
function bridge(n,k,t){const dx=n.x-core.x,dy=n.y-core.y,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L,nx=-uy,ny=ux;
const a={x:core.x+ux*core.r*.76,y:core.y+uy*core.r*.76},b={x:n.x-ux*n.r*.69,y:n.y-uy*n.r*.69};const curl=Math.sin(k*2.1)*44,wave=Math.sin(t*.27+k*1.7)*9;
return {a,b,p1:{x:lerp(a.x,b.x,.33)+nx*(curl+wave),y:lerp(a.y,b.y,.33)+ny*(curl+wave)},p2:{x:lerp(a.x,b.x,.68)-nx*(curl*.46-wave*.6),y:lerp(a.y,b.y,.68)-ny*(curl*.46-wave*.6)},nx,ny};}
function membrane(n,k,t,strength){const {a,b,p1,p2,nx,ny}=bridge(n,k,t);
for(let layer=0;layer<(low?4:7);layer++){
 const z=layer/(low?4:7),samples=low?20:30,upper=[],lower=[],width=15+z*30+strength*16;
 for(let i=0;i<=samples;i++){const u=i/samples,p=curve(a,p1,p2,b,u),env=Math.pow(Math.sin(Math.PI*u),.85),flutter=Math.sin(u*12+t*.36+k+layer*1.42)*env*(2+z*5),side=width*env*(.36+z*.7)+flutter;
 upper.push({x:p.x+nx*side,y:p.y+ny*side});lower.push({x:p.x-nx*side*.87,y:p.y-ny*side*.87});}
 ctx.beginPath();ctx.moveTo(upper[0].x,upper[0].y);for(let i=1;i<upper.length;i++)ctx.lineTo(upper[i].x,upper[i].y);for(let i=lower.length-1;i>=0;i--)ctx.lineTo(lower[i].x,lower[i].y);ctx.closePath();
 const grad=ctx.createLinearGradient(a.x+nx*35,a.y+ny*35,b.x-nx*35,b.y-ny*35);grad.addColorStop(0,rgba('#f8dcaf',.005));grad.addColorStop(.27,rgba(n.col[layer%3],.082+strength*.025));grad.addColorStop(.72,rgba('#8dbce0',.075));grad.addColorStop(1,rgba('#f6d3a0',.004));ctx.fillStyle=grad;ctx.fill();
 if(layer%2===0){ctx.beginPath();ctx.moveTo(upper[0].x,upper[0].y);for(let i=1;i<upper.length;i++)ctx.lineTo(upper[i].x,upper[i].y);ctx.strokeStyle=rgba(n.col[layer%3],(.40+strength*.22)*(1-z*.4));ctx.lineWidth=.6+(layer===0?.7:0);ctx.stroke();}
 }
 for(let lane=0;lane<(low?9:17);lane++){const phase=lane*2.39996+k*1.17,offset=(lane-8)*2.9,curl=Math.sin(t*.29+phase)*3;
 ctx.beginPath();ctx.moveTo(a.x+nx*offset*.4,a.y+ny*offset*.4);ctx.bezierCurveTo(p1.x+nx*(offset+curl),p1.y+ny*(offset+curl),p2.x-nx*(offset*.6),p2.y-ny*(offset*.6),b.x+nx*offset*.5,b.y+ny*offset*.5);
 ctx.lineWidth=lane%5===0?1.4:.72;ctx.strokeStyle=rgba(lane%3===0?'#fff2d4':n.col[lane%3],(.16+(lane%5===0?.36:.08))*(1+strength*.7));ctx.stroke();}
 for(let j=0;j<5;j++){const u=(j/5+t*.026+k*.13)%1,p=curve(a,p1,p2,b,u),amp=Math.sin(Math.PI*u);glow(p.x,p.y,8+amp*10,j%2?'#b2d8ff':'#f5d1a1',.15*amp*(1+strength));}
}
// Living tissue: a network of folded, translucent filaments fills the space
// between worlds. These shapes are persistent material, not background wallpaper.
function livingTissue(t){
 const all=[...nodes, {id:'nexus',x:core.x,y:core.y,r:core.r,col:['#fff2cf','#a4d4ef','#d2b1f3'],phase:2.4}];
 for(let i=0;i<all.length;i++){
  const a=all[i],b=all[(i+1)%6],h=Math.hypot(a.x-b.x,a.y-b.y),nx=(a.y-b.y)/h,ny=(b.x-a.x)/h;
  for(let lane=0;lane<14;lane++){
   const side=(lane-6.5)*8,phase=lane*1.618+i*.73;
   const bend=(30+lane*2.3)*Math.sin(phase)+Math.sin(t*.24+phase)*6;
   const p0={x:a.x+nx*side*.18,y:a.y+ny*side*.18},p3={x:b.x+nx*side*.18,y:b.y+ny*side*.18};
   const p1={x:lerp(a.x,b.x,.30)+nx*(bend+side),y:lerp(a.y,b.y,.30)+ny*(bend+side)};
   const p2={x:lerp(a.x,b.x,.72)-nx*(bend*.7-side*.5),y:lerp(a.y,b.y,.72)-ny*(bend*.7-side*.5)};
   ctx.beginPath();ctx.moveTo(p0.x,p0.y);ctx.bezierCurveTo(p1.x,p1.y,p2.x,p2.y,p3.x,p3.y);
   ctx.strokeStyle=rgba(lane%5===0?'#ffeac4':lane%2?'#b5a2eb':'#84b9db',lane%5===0?.24:.105);
   ctx.lineWidth=lane%5===0?1.4:.85;ctx.stroke();
   if(lane%4===0){const q=curve(p0,p1,p2,p3,(.5+Math.sin(t*.045+phase)*.2));glow(q.x,q.y,15,lane%2?'#dfb8f3':'#a9d9f4',.25);}
  }
 }
 // Fine peripheral tendrils grow from each cocoon into the dark field.
 for(let k=0;k<nodes.length;k++){
  const n=nodes[k];
  for(let j=0;j<24;j++){
   const angle=j*TAU/24+n.phase,rr=n.r*(.85+.12*Math.sin(j*2.8));
   const x0=n.x+Math.cos(angle)*rr,y0=n.y+Math.sin(angle)*rr;
   const reach=75+34*Math.sin(j*1.9+k*2.1),turn=.28*Math.sin(j*1.3+t*.13);
   const x3=n.x+Math.cos(angle+turn)*(rr+reach),y3=n.y+Math.sin(angle+turn)*(rr+reach);
   ctx.beginPath();ctx.moveTo(x0,y0);
   ctx.bezierCurveTo(x0+Math.cos(angle+.5)*reach*.4,y0+Math.sin(angle+.5)*reach*.4,x3-Math.cos(angle-.45)*reach*.5,y3-Math.sin(angle-.45)*reach*.5,x3,y3);
   ctx.strokeStyle=rgba(j%4===0?'#f5ddbc':n.col[j%3],j%4===0?.30:.16);ctx.lineWidth=j%5===0?1.1:.65;ctx.stroke();
  }
 }
}
function sphere(n,k,t,f){const x=n.x,y=n.y,r=n.r,R=r*(1+.014*Math.sin(t*.41+n.phase));
const base=ctx.createRadialGradient(x-R*.23,y-R*.27,R*.03,x,y,R*1.15);base.addColorStop(0,rgba(n.col[0],.18));base.addColorStop(.35,rgba(n.col[2],.18));base.addColorStop(.69,'rgba(27,44,73,.32)');base.addColorStop(.89,'rgba(12,23,44,.21)');base.addColorStop(1,'rgba(5,8,18,0)');ctx.beginPath();ctx.arc(x,y,R*1.07,0,TAU);ctx.fillStyle=base;ctx.fill();glow(x,y,R*1.9,n.col[0],.45+f*.18);
for(let j=0;j<8;j++){ctx.beginPath();ctx.ellipse(x,y,R*(.71+j*.036),R*(.46+j*.064),.24+j*.32+n.phase*.13,0,TAU);ctx.strokeStyle=rgba(j%3===0?'#ffe9bd':n.col[j%3],.075+(j%3===0?.11:0)+f*.045);ctx.lineWidth=j%3===0?1.1:.5;ctx.stroke();}
for(let j=0;j<14;j++){const a=j*TAU/14+n.phase*.3,rr=R*(.71+.18*Math.sin(j*1.72)),x0=x+Math.cos(a)*rr,y0=y+Math.sin(a)*rr;ctx.beginPath();ctx.moveTo(x0,y0);ctx.quadraticCurveTo(x+Math.cos(a+.35)*R*.29,y+Math.sin(a+.35)*R*.24,x+Math.cos(a+.8)*R*.28,y+Math.sin(a+.8)*R*.27);ctx.strokeStyle=rgba(j%2?n.col[0]:'#ffe5b2',.09+f*.12);ctx.lineWidth=.8;ctx.stroke();}
for(let layer=0;layer<5;layer++){
 const radius=R*(1.02+layer*.055),pts=90;
 ctx.beginPath();
 for(let j=0;j<=pts;j++){
  const a=j*TAU/pts;
  const organic=1+.045*Math.sin(a*7+layer*1.6+t*.15)+.025*Math.sin(a*13-layer*.7+t*.12);
  const rx=radius*organic,ry=radius*organic*(.93+.03*Math.sin(layer*1.8));
  const px=x+Math.cos(a)*rx,py=y+Math.sin(a)*ry;
  j?ctx.lineTo(px,py):ctx.moveTo(px,py);
 }
 ctx.closePath();ctx.strokeStyle=rgba(layer%2?'#a3d9ee':n.col[layer%3],.29-layer*.015+f*.08);ctx.lineWidth=layer%2?1.1:.7;ctx.stroke();
}
const rim=ctx.createLinearGradient(x-R,y-R,x+R,y+R);rim.addColorStop(0,rgba(n.col[0],.05));rim.addColorStop(.25,rgba('#fff4d4',.67));rim.addColorStop(.5,rgba(n.col[1],.21));rim.addColorStop(.75,rgba(n.col[0],.44));rim.addColorStop(1,rgba('#fff1ce',.18));ctx.beginPath();ctx.arc(x,y,R*.92,0,TAU);ctx.lineWidth=1.8;ctx.strokeStyle=rim;ctx.shadowColor=n.col[0];ctx.shadowBlur=15+f*22;ctx.stroke();ctx.shadowBlur=0;
for(let j=0;j<5;j++){const a=t*.045*(j%2?-1:1)+j*TAU/5+n.phase;glow(x+Math.cos(a)*R*.94,y+Math.sin(a)*R*.94,9+(j%2)*5,j%2?'#fff0c9':n.col[0],.25+f*.18);}
ctx.save();ctx.translate(x,y-R*.17);ctx.strokeStyle=rgba(n.col[0],.54+f*.18);ctx.lineWidth=1.35;
if(n.id==='aura'){for(let j=0;j<4;j++){ctx.beginPath();ctx.ellipse(0,0,20+j*9,47-j*5,j*.58,0,TAU);ctx.stroke();}glow(0,0,28,'#fff3c9',.9);}
else if(n.id==='aureglossa'){ctx.beginPath();ctx.moveTo(0,-49);ctx.bezierCurveTo(-12,-18,18,18,0,51);ctx.moveTo(-27,-5);ctx.quadraticCurveTo(0,13,27,-5);ctx.moveTo(-22,21);ctx.quadraticCurveTo(0,38,22,21);ctx.stroke();}
else if(n.id==='sessions'){for(let j=0;j<3;j++){ctx.beginPath();ctx.moveTo(0,-42+j*15);ctx.bezierCurveTo(-39,-10+j*7,-35,23+j*7,0,42-j*4);ctx.bezierCurveTo(35,23+j*7,39,-10+j*7,0,-42+j*15);ctx.stroke();}glow(0,4,18,'#fff2c8',.7);}
else if(n.id==='workshops'){for(let j=0;j<3;j++){ctx.beginPath();ctx.ellipse(0,0,28+j*11,17+j*10,j*.7,0,TAU);ctx.stroke();}glow(0,0,20,'#f9d1a6',.65);}
else if(n.id==='gestalt'){ctx.beginPath();for(let j=0;j<6;j++){const a=-Math.PI/2+j*TAU/6,p={x:Math.cos(a)*45,y:Math.sin(a)*45};j?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y);}ctx.closePath();ctx.moveTo(0,-45);ctx.lineTo(0,45);ctx.moveTo(-39,-23);ctx.lineTo(39,23);ctx.moveTo(-39,23);ctx.lineTo(39,-23);ctx.stroke();glow(0,0,23,'#c4a2ff',.85);}
else{for(let j=0;j<3;j++){ctx.beginPath();ctx.arc(0,0,12+j*12,j*.5,TAU-j*.25);ctx.stroke();}glow(0,0,18,'#d7aaff',.65);}
ctx.restore();}
function nexus(t){const x=core.x,y=core.y,r=core.r,breath=1+.018*Math.sin(t*.38);glow(x,y,285,'#e7c59b',.52);glow(x,y,200,'#fff4d4',.45);glow(x,y,115,'#fff2ce',.66);
const g=ctx.createRadialGradient(x,y,4,x,y,r*breath);g.addColorStop(0,'#f5d9a4');g.addColorStop(.13,'#e2c99b');g.addColorStop(.33,'#9cbdd3');g.addColorStop(.62,'rgba(96,136,180,.27)');g.addColorStop(1,'rgba(50,77,125,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r*breath,0,TAU);ctx.fill();
for(let j=0;j<19;j++){const a=j*TAU/19,rad=r*(.62+.24*Math.sin(j*2.3));ctx.beginPath();ctx.moveTo(x+Math.cos(a)*rad,y+Math.sin(a)*rad);ctx.bezierCurveTo(x+Math.cos(a+1.7)*rad*.6,y+Math.sin(a+1.7)*rad*.6,x+Math.cos(a-1.1)*rad*.75,y+Math.sin(a-1.1)*rad*.75,x+Math.cos(a+.6)*rad,y+Math.sin(a+.6)*rad);ctx.strokeStyle=rgba(j%3===0?'#fff2d7':j%2?'#8dc6e3':'#c3a2ef',.10+(j%3===0?.16:0));ctx.lineWidth=.6;ctx.stroke();}
for(let j=0;j<12;j++){ctx.beginPath();ctx.ellipse(x,y,r*(.64+j*.024),r*(.30+j*.042),j*.32+t*.003,0,TAU);ctx.strokeStyle=rgba(j%3===0?'#fff3d5':'#a2c4dc',.10+(j%3===0?.18:0));ctx.lineWidth=j%3===0?1.4:.6;ctx.stroke();}
for(let j=0;j<6;j++){const a=j*TAU/6,rr=105;glow(x+Math.cos(a)*rr,y+Math.sin(a)*rr,15,'#f9e5bd',.38);}glow(x,y,58,'#fff4d3',.65);
}
function particles(t){for(const p of motes){const n=nodes[p.edge],geo=bridge(n,p.edge,t),u=(p.phase+t*p.speed)%1,q=curve(geo.a,geo.p1,geo.p2,geo.b,u),env=Math.sin(Math.PI*u),offset=p.lane*(8+env*20),x=q.x+geo.nx*offset,y=q.y+geo.ny*offset;ctx.globalAlpha=(.18+.38*p.depth)*env;ctx.fillStyle=p.depth>.55?'#f9e4c3':n.col[0];ctx.beginPath();ctx.arc(x,y,p.r,0,TAU);ctx.fill();if(p.depth>.89)glow(x,y,9,n.col[0],.12*env);}ctx.globalAlpha=1;}
function draw(){const t=time;ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';background(t);ctx.globalCompositeOperation='screen';
// Organic material spans the same world positions as the functional hit targets.
livingTissue(t);
for(let k=0;k<nodes.length;k++){const n=nodes[k],f=focus[n.id]||0;membrane(n,k,t,f);}
particles(t);nexus(t);
for(let k=0;k<nodes.length;k++)sphere(nodes[k],k,t,focus[nodes[k].id]||0);
// Subtle connected nerve filaments and micro-stars around the outer web.
for(let j=0;j<35;j++){const a=j*TAU/35,rad=250+90*Math.sin(j*2.4),x=core.x+Math.cos(a)*rad*1.62,y=core.y+Math.sin(a)*rad*1.2;glow(x,y,4+(j%5)*2,j%3?'#b8c8e2':'#ffe6bd',.12);}
canvas.dataset.material='procedural-living-constellation-v10';canvas.dataset.frames=String(++frames);canvas.dataset.motion=app.state.still||document.hidden?'paused':'running';canvas.dataset.selected=app.state.selected||'';
}
function frame(now){raf=0;if(app.state.still||document.hidden){draw();return;}if(now-lastFrame<34){raf=requestAnimationFrame(frame);return;}const dt=last?Math.min(.08,Math.max(0,(now-last)/1000)):.033;last=now;lastFrame=now;time+=dt;
for(const n of nodes){const target=app.state.focus===n.id||app.state.selected===n.id?1:0;focus[n.id]+=(target-focus[n.id])*(1-Math.exp(-dt*2.8));}draw();raf=requestAnimationFrame(frame);}
function refresh(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;if(app.state.still||document.hidden){draw();return;}raf=requestAnimationFrame(frame);}
window.addEventListener('nexus:motion',refresh);window.addEventListener('nexus:focus',()=>{if(app.state.still)draw();});document.addEventListener('visibilitychange',refresh);window.addEventListener('pagehide',()=>{if(raf)cancelAnimationFrame(raf);raf=0;});
window.__LivingMaterial10={snapshot:()=>({frames,material:canvas.dataset.material,motion:canvas.dataset.motion,selected:canvas.dataset.selected,particles:motes.length,artBackplate:false})};refresh();
})();
