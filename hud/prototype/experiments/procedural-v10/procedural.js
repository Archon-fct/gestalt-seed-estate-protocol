/* LIVING MATERIAL 10 — original procedural rendering, not image warp.
   Continuous membranes, cocoons, refracted filaments and coherent particles.
   No network, storage, camera or inference. Stillness preserves rich static art. */
(()=>{'use strict';
const app=window.NexusApp,canvas=document.getElementById('livingScene');if(!app||!canvas)return;
const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return;
const W=1536,H=1024,TAU=Math.PI*2,low=matchMedia('(max-width:720px)').matches||Number(navigator.hardwareConcurrency||8)<=4;
const scale=Math.min(low?.85:1.25,(window.devicePixelRatio||1));canvas.width=Math.round(W*scale);canvas.height=Math.round(H*scale);ctx.setTransform(scale,0,0,scale,0,0);
const nodes=[
{id:'aura',x:768,y:158,r:119,col:['#59f2d6','#f2daa0','#238e9a'],phase:0},
{id:'aureglossa',x:440,y:312,r:116,col:['#468fff','#b88bff','#23b4e6'],phase:1.7},
{id:'sessions',x:1096,y:310,r:114,col:['#eda85b','#ffe3a8','#a778b1'],phase:2.8},
{id:'workshops',x:438,y:630,r:116,col:['#e8a34d','#ffe2a1','#c47cc9'],phase:3.6},
{id:'gestalt',x:1092,y:630,r:116,col:['#9d75ff','#45dce7','#ce92ff'],phase:4.7},
{id:'journal',x:768,y:755,r:118,col:['#aa73ff','#568bf5','#df97f4'],phase:5.8}];
const core={x:768,y:476,r:154};let seed=912301;function rnd(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
const stars=Array.from({length:low?240:480},()=>({x:rnd()*W,y:rnd()*H,r:.35+rnd()*1.1,p:rnd()*TAU,v:.1+rnd()*.5,z:.3+rnd()*.7}));
const motes=Array.from({length:low?110:230},(_,i)=>({edge:i%6,phase:rnd(),lane:rnd()*2-1,r:.4+rnd()*1.2,speed:.018+rnd()*.038,depth:rnd()}));
let focus=Object.fromEntries(nodes.map(n=>[n.id,0])),time=0,last=0,frames=0,raf=0,lastFrame=0;
const lerp=(a,b,t)=>a+(b-a)*t;
function rgba(hex,a){const c=hex.replace('#','');return `rgba(${parseInt(c.slice(0,2),16)},${parseInt(c.slice(2,4),16)},${parseInt(c.slice(4,6),16)},${a})`;}
function glow(x,y,r,color,opacity=1){if(r<=0)return;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,rgba(color,.42*opacity));g.addColorStop(.14,rgba(color,.16*opacity));g.addColorStop(.45,rgba(color,.055*opacity));g.addColorStop(1,rgba(color,0));ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
function curve(p0,p1,p2,p3,t){const q=1-t;return {x:q*q*q*p0.x+3*q*q*t*p1.x+3*q*t*t*p2.x+t*t*t*p3.x,y:q*q*q*p0.y+3*q*q*t*p1.y+3*q*t*t*p2.y+t*t*t*p3.y};}

// AURIC_DEPTH_01 retained as the source contract; MATERIAL_02 replaces line-only
// rendering with deterministic volumetric textures and folded silk membranes.
// All caches are generated locally. No reference images or external assets.
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
function hash(x,y){let v=Math.imul(x,374761393)^Math.imul(y,668265263);v=Math.imul(v^(v>>>13),1274126177);return ((v^(v>>>16))>>>0)/4294967295;}
function noise(x,y){const a=Math.floor(x),b=Math.floor(y);let u=x-a,v=y-b;u=u*u*(3-2*u);v=v*v*(3-2*v);return lerp(lerp(hash(a,b),hash(a+1,b),u),lerp(hash(a,b+1),hash(a+1,b+1),u),v);}
function fbm(x,y){return noise(x,y)*.55+noise(x*2.03+17,y*2.03-13)*.27+noise(x*4.11-7,y*4.11+11)*.13+noise(x*8.21,y*8.21)*.05;}
function layer(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function mist(p,x,y,r,color,alpha=1){const g=p.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,rgba(color,.72*alpha));g.addColorStop(.09,rgba(color,.34*alpha));g.addColorStop(.32,rgba(color,.095*alpha));g.addColorStop(1,rgba(color,0));p.fillStyle=g;p.fillRect(x-r,y-r,r*2,r*2);}
function flare(p,x,y,r,color,alpha=1){
 p.save();p.globalCompositeOperation='screen';mist(p,x,y,r*5,color,alpha);
 const g=p.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,rgba('#fff8df',alpha));g.addColorStop(.12,rgba('#fff5d3',alpha*.8));g.addColorStop(.34,rgba(color,alpha*.45));g.addColorStop(1,rgba(color,0));p.fillStyle=g;p.fillRect(x-r,y-r,r*2,r*2);
 for(let j=0;j<2;j++){p.save();p.translate(x,y);p.rotate(j*Math.PI/2+.08);const ray=p.createLinearGradient(-r*3,0,r*3,0);ray.addColorStop(0,rgba(color,0));ray.addColorStop(.48,rgba(color,alpha*.13));ray.addColorStop(.5,rgba('#fffae8',alpha*.7));ray.addColorStop(.52,rgba(color,alpha*.13));ray.addColorStop(1,rgba(color,0));p.fillStyle=ray;p.fillRect(-r*3,-.4,r*6,.8);p.restore();}p.restore();
}
let volumeCache=null,webCache=null;const shellCache=new Map();
function makeVolumeCache(){
 const c=layer(768,512),p=c.getContext('2d');if(!p)return null;
 const data=p.createImageData(c.width,c.height),d=data.data;
 for(let y=0;y<512;y++)for(let x=0;x<768;x++){
  const X=x*2,Y=y*2,dx=(X-core.x)/650,dy=(Y-core.y)/540,a=Math.atan2(dy,dx),r=Math.hypot(dx,dy);
  const warp=fbm(dx*2+10,dy*2+30),v=fbm(dx*3+warp*3,dy*3-warp*2);
  const cloud=Math.pow(clamp(v*1.9-.43),3)*Math.exp(-Math.pow((r-.75)*2,2));
  const fold=Math.pow(.5+.5*Math.sin(a*4+r*9+warp*8),10)*cloud;
  const gold=clamp(Math.sin(a*3+r*4)*.6+.1),i=(y*768+x)*4;
  d[i]=4+cloud*27+fold*(gold?49:15);d[i+1]=7+cloud*34+fold*31;d[i+2]=13+cloud*53+fold*(gold?22:68);d[i+3]=255;
 }
 p.putImageData(data,0,0);return c;
}
function background(t){
 if(!volumeCache)volumeCache=makeVolumeCache();
 if(volumeCache)ctx.drawImage(volumeCache,0,0,W,H);else{ctx.fillStyle='#040710';ctx.fillRect(0,0,W,H);}
 for(const s of stars){const tw=.72+.28*Math.sin(t*s.v+s.p);ctx.globalAlpha=(.1+.37*s.z)*tw;ctx.fillStyle=s.z>.78?'#e8dbbd':'#869fb5';ctx.fillRect(s.x,s.y,s.r,s.r);}ctx.globalAlpha=1;
}
function spectralVolume(t){ctx.save();ctx.globalCompositeOperation='screen';mist(ctx,core.x,core.y,375,'#d6af71',.26);for(const n of nodes)mist(ctx,n.x,n.y,n.r*1.85,n.col[0],.07+.01*Math.sin(t*.3+n.phase));ctx.restore();}
function bridge(n,k,t){const dx=n.x-core.x,dy=n.y-core.y,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L,nx=-uy,ny=ux;
const a={x:core.x+ux*core.r*.61,y:core.y+uy*core.r*.61},b={x:n.x-ux*n.r*.82,y:n.y-uy*n.r*.82};const curl=Math.sin(k*2.1)*36,wave=Math.sin(t*.18+k*1.7)*3;
return {a,b,p1:{x:lerp(a.x,b.x,.33)+nx*(curl+wave),y:lerp(a.y,b.y,.33)+ny*(curl+wave)},p2:{x:lerp(a.x,b.x,.68)-nx*curl*.46,y:lerp(a.y,b.y,.68)-ny*curl*.46},nx,ny};}
// Render dense, nonuniform strands once. Their distribution creates broad folds
// and selective caustics instead of uniformly spaced wireframe ellipses.
function silk(p,x1,y1,x2,y2,bend,width,color,phase){
 const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L;
 const lanes=160,samples=64;
 for(let j=0;j<lanes;j++){
  const v=j/(lanes-1)-.5,fold=Math.sin(v*5.9+phase)*.65+v*.65,side=fold*width;
  const glint=Math.pow(.5+.5*Math.cos(v*13+phase),18);
  p.beginPath();
  for(let st=0;st<=samples;st++){
   const u=st/samples,envelope=Math.sin(Math.PI*u),swirl=Math.sin(u*TAU+phase)*bend*envelope;
   const gathered=Math.pow(Math.abs(Math.cos(u*Math.PI*1.35+phase*.15)),2)*.7+.12;
   const displace=side*(.35+.65*envelope)*gathered+swirl+Math.sin(u*12+fold*3+phase)*envelope*width*.1;
   const xx=lerp(x1,x2,u)+nx*displace,yy=lerp(y1,y2,u)+ny*displace;
   st?p.lineTo(xx,yy):p.moveTo(xx,yy);
  }
  const a=.008+glint*.11,g=p.createLinearGradient(x1,y1,x2,y2);
  g.addColorStop(0,rgba(color,.003));g.addColorStop(.2,rgba(color,a*.8));g.addColorStop(.5,rgba(glint>.7?'#ffecd0':color,a));g.addColorStop(.83,rgba(color,a*.75));g.addColorStop(1,rgba(color,.003));
  p.strokeStyle=g;p.lineWidth=glint>.7?.8:1.3;p.stroke();
 }
}
function makeWeb(){
 const c=layer(canvas.width,canvas.height),p=c.getContext('2d');if(!p)return null;p.scale(scale,scale);p.globalCompositeOperation='screen';
 // Perimeter membranes pass around the six existing anchors.
 const order=[0,2,4,5,3,1];
 for(let k=0;k<6;k++){
  const a=nodes[order[k]],b=nodes[order[(k+1)%6]],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len;
  silk(p,a.x+ux*a.r*.72,a.y+uy*a.r*.72,b.x-ux*b.r*.72,b.y-uy*b.r*.72,k%2?-78:75,105,'#e6c698',k*.5);
  silk(p,a.x-uy*a.r*.62,a.y+ux*a.r*.62,b.x-uy*b.r*.62,b.y+ux*b.r*.62,-85,105,'#729fb8',k*.7);
 }
 // Large flowing envelope embraces the field. It is material, not landscape.
 const paths=[[-130,700,490,65,-230,160,'#c5a78c'],[160,930,1310,845,-160,140,'#799aab'],[1070,90,1550,760,215,120,'#b1bbd2'],[340,180,1180,720,260,180,'#829fb5'],[80,550,1380,360,-145,155,'#d2b895'],[260,885,1250,90,-170,180,'#989bba']];
 for(let i=0;i<paths.length;i++)silk(p,...paths[i],i*.75);
 for(let k=0;k<6;k++){
  const n=nodes[k],tilt=n.phase*.45;
  for(let band=0;band<4;band++)for(let j=0;j<65;j++){
   const v=j/64,r=n.r*(1.04+v*.38),start=tilt+band*1.58,span=2.2;
   p.beginPath();
   for(let st=0;st<=70;st++){
    const a=start+st/70*span,bulge=1+.065*Math.sin(a*3+v*4+n.phase)+.08*Math.sin(a*2-v*2),xx=n.x+Math.cos(a)*r*bulge,yy=n.y+Math.sin(a)*r*bulge*.96;
    st?p.lineTo(xx,yy):p.moveTo(xx,yy);
   }
   const crest=Math.pow(.5+.5*Math.sin(v*10+band),16);
   p.strokeStyle=rgba(band%2?'#efd4ac':n.col[0],(.003+crest*.07)*(1-v*.6));p.lineWidth=crest>.5?.7:1.1;p.stroke();
  }
 }
 // Soft micro-granulation follows the surfaces, with empty intervals.
 for(let i=0;i<5000;i++){
  const a=rnd()*TAU,rr=210+rnd()*440,x=core.x+Math.cos(a)*rr*1.35,y=core.y+Math.sin(a)*rr*.92;
  if(y<90||y>960)continue;
  const q=fbm(x*.007,y*.007);if(q<.50)continue;
  p.fillStyle=rgba(i%4?'#c3bea9':'#a8d6e4',.10+rnd()*.45);const r=.22+rnd()*.72;p.fillRect(x,y,r,r);
 }
 for(const [x,y,r]of [[255,176,10],[603,370,9],[942,469,10],[201,587,8],[1258,497,10],[979,856,12],[373,820,9],[760,889,14],[1411,269,6]])flare(p,x,y,r,'#ffe1af',.95);
 return c;
}
function livingTissue(t){if(!webCache)webCache=makeWeb();if(webCache){ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=.94+.035*Math.sin(t*.22);ctx.drawImage(webCache,0,0,W,H);ctx.restore();}}
function relationalWeave(t){
 // Sparse live highlights travel on persistent curved surfaces.
 const order=[0,2,4,5,3,1];ctx.save();ctx.globalCompositeOperation='screen';
 for(let k=0;k<6;k++){const a=nodes[order[k]],b=nodes[order[(k+1)%6]],u=(t*.009+k*.167)%1;
 const p=curve(a,{x:a.x+(b.x-a.x)*.15,y:a.y+(b.y-a.y)*.55},{x:a.x+(b.x-a.x)*.85,y:a.y+(b.y-a.y)*.5},b,u);
 mist(ctx,p.x,p.y,24,'#f4d5a0',.11*Math.sin(Math.PI*u));}ctx.restore();
}
function membrane(n,k,t,strength){
 const {a,b,p1,p2,nx,ny}=bridge(n,k,t);ctx.save();ctx.globalCompositeOperation='screen';
 for(let j=0;j<(low?36:56);j++){
  const u=j/(low?35:55)-.5,side=Math.sin(u*5.5+k)*35+u*28,phase=.5+.5*Math.sin(u*13+n.phase);
  ctx.beginPath();ctx.moveTo(a.x+nx*side,a.y+ny*side);
  ctx.bezierCurveTo(p1.x+nx*side*.6,p1.y+ny*side*.6,p2.x-nx*side*.4,p2.y-ny*side*.4,b.x+nx*side*.7,b.y+ny*side*.7);
  ctx.strokeStyle=rgba(j%3?n.col[0]:'#ffe5b7',(.014+Math.pow(phase,8)*.048)*(1+strength*.7));ctx.lineWidth=1.3;ctx.stroke();
 }ctx.restore();
}
function makeShell(n){
 const size=low?288:384,c=layer(size,size),p=c.getContext('2d');if(!p)return null;
 const r=size*.399,cx=size/2,cy=size/2,data=p.createImageData(size,size),d=data.data,base=rgb(n.col[0]),light=rgb(n.col[1]);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const X=(x-cx)/r,Y=(y-cy)/r,rad=Math.hypot(X,Y);if(rad>1.23)continue;
  const z=Math.sqrt(Math.max(0,1-rad*rad)),ang=Math.atan2(Y,X),v=fbm(X*3+n.phase*3,Y*3+z*2+8);
  const turbulence=fbm(X*9+v*4+n.phase,Y*9-v*3),ribbon=Math.pow(.5+.5*Math.sin(ang*6+rad*12+v*12),16);
  const rim=Math.exp(-Math.pow((rad-(.948+.018*Math.sin(ang*5+n.phase)))/.033,2));
  const inner=clamp(1-rad),cloud=Math.pow(clamp(turbulence*1.8-.53),2.5)*clamp(1-rad*rad);
  const facing=clamp(-X*.5-Y*.6+.3),fresnel=Math.pow(clamp(rad),5);
  const caustic=.4+.6*Math.pow(.5+.5*Math.sin(ang*5+v*9),2);
  const glowRim=rim*(.10+facing*.63)*caustic,surface=ribbon*(.05+fresnel*.2)*clamp((1.09-rad)*12),volume=cloud*.4;
  const i=(y*size+x)*4;
  d[i]=3+base[0]*(volume+surface*.7)+light[0]*glowRim*.76;
  d[i+1]=6+base[1]*(volume+surface)+light[1]*glowRim*.78;
  d[i+2]=13+base[2]*(volume+surface*1.1)+light[2]*glowRim*.82;
  d[i+3]=rad<.97?244:Math.round(clamp((1.1-rad)/.13)*230);
 }
 p.putImageData(data,0,0);p.globalCompositeOperation='screen';
 // Two folded boundary veils, formed by dense uneven curves; no flat ring asset.
 for(let band=0;band<3;band++)for(let j=0;j<100;j++){
  const u=j/99,rr=r*(.86+u*.23),offset=n.phase+band*2.1;
  p.beginPath();
  for(let step=0;step<=92;step++){
   const a=step/92*TAU,warp=1+.038*Math.sin(a*3+offset)+.023*Math.sin(a*7+u*3),rx=rr*warp,ry=rr*(.91+.03*Math.sin(a*2+offset));
   const xx=cx+Math.cos(a)*rx,yy=cy+Math.sin(a)*ry;
   step?p.lineTo(xx,yy):p.moveTo(xx,yy);
  }
  const highlight=Math.pow(.5+.5*Math.sin(u*12+band*1.3),12);
  const rimLight=p.createLinearGradient(cx-r,cy-r,cx+r,cy+r);rimLight.addColorStop(0,rgba(n.col[0],.008+highlight*.035));rimLight.addColorStop(.3,rgba('#f6e4c4',.01+highlight*.033));rimLight.addColorStop(.5,rgba(n.col[band%3],.003));rimLight.addColorStop(.8,rgba(n.col[0],.006+highlight*.02));rimLight.addColorStop(1,rgba('#e7d4af',.003));p.strokeStyle=rimLight;p.lineWidth=.8;p.stroke();
 }
 // Curled translucent tongues skim the shell, with dark pockets between them.
 for(let k=0;k<7;k++)for(let j=0;j<28;j++){
  const lane=j/27,phase=k*TAU/7+n.phase,baseAngle=phase+(lane-.5)*.2;
  p.beginPath();
  for(let st=0;st<=48;st++){
   const u=st/48,a=baseAngle+u*2.65,rr=r*(.78+.16*Math.sin(u*3.1+lane*.8)+.05*Math.sin(a*4+lane));
   const xx=cx+Math.cos(a)*rr,yy=cy+Math.sin(a)*rr*.88;
   st?p.lineTo(xx,yy):p.moveTo(xx,yy);
  }
  const light=Math.pow(.5+.5*Math.sin(lane*9+k),8);
  p.strokeStyle=rgba(j%6===0?'#f8dcb0':n.col[k%3],.011+light*.026);p.lineWidth=.7;p.stroke();
 }
 // Surface granulation produces tiny bright folds rather than a uniform outline.
 for(let j=0;j<2800;j++){
  const a=rnd()*TAU,rad=.64+rnd()*.41,rr=rad*r;
  const w=fbm(Math.cos(a)*7+n.phase,Math.sin(a)*7+rad*4),crest=Math.pow(.5+.5*Math.sin(a*7+rad*16+w*8),8);
  if(crest<.35)continue;
  p.fillStyle=rgba(j%4===0?'#ffe7c2':n.col[0],crest*(.08+rnd()*.3));
  const px=cx+Math.cos(a)*rr,py=cy+Math.sin(a)*rr*.93,size=.2+rnd()*.7;p.fillRect(px,py,size,size);
 }
 for(let j=0;j<8;j++){
  const a=j*2.399+n.phase,rr=r*(.75+rnd()*.28);flare(p,cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.94,2+rnd()*3,j%2?n.col[0]:'#ffe6b6',.42+rnd()*.28);
 }
 for(let j=0;j<170;j++){const a=rnd()*TAU,rr=Math.sqrt(rnd())*r*.9;p.fillStyle=rgba(j%3?n.col[0]:'#ffeac6',.1+rnd()*.26);p.fillRect(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr,.35+rnd()*.7,.35+rnd()*.7);}
 return c;
}
function refractiveShell(n,t,f){
 let c=shellCache.get(n.id);if(!c){c=makeShell(n);if(c)shellCache.set(n.id,c);}if(!c)return;
 const size=n.r*2.51*(1+.007*Math.sin(t*.43+n.phase));ctx.save();ctx.globalCompositeOperation='source-over';ctx.drawImage(c,n.x-size/2,n.y-size/2,size,size);ctx.restore();
}
function auricDepth(n,t,f){ctx.save();ctx.globalCompositeOperation='screen';mist(ctx,n.x-n.r*.58,n.y-n.r*.42,n.r*.88,n.col[0],.13+f*.15);ctx.restore();}
function spectralLens(n,t,f){ctx.save();ctx.globalCompositeOperation='screen';for(let j=0;j<2;j++){const a=n.phase+j*2.5+Math.sin(t*.09+j)*.17;flare(ctx,n.x+Math.cos(a)*n.r*.97,n.y+Math.sin(a)*n.r*.93,4.5+j*1.2,j?n.col[0]:'#ffe6b2',.48+f*.3);}ctx.restore();}
function sphere(n,k,t,f){
 const x=n.x,y=n.y-n.r*.17;ctx.save();ctx.translate(x,y);ctx.globalCompositeOperation='screen';ctx.strokeStyle=rgba(n.col[1],.68+f*.2);ctx.lineWidth=.92;ctx.shadowColor=n.col[0];ctx.shadowBlur=9;
 if(n.id==='aura'){for(let j=0;j<5;j++){ctx.beginPath();ctx.ellipse(0,0,19+j*7,44-j*2,j*.63,0,TAU);ctx.stroke();}flare(ctx,0,12,10,'#ffe8b7',.92);}
 else if(n.id==='aureglossa'){
  // Preserve the existing audited symbol; no generated language/glyph substitution.
  ctx.beginPath();ctx.moveTo(0,-49);ctx.bezierCurveTo(-12,-18,18,18,0,51);ctx.moveTo(-27,-5);ctx.quadraticCurveTo(0,13,27,-5);ctx.moveTo(-22,21);ctx.quadraticCurveTo(0,38,22,21);ctx.stroke();
 }else if(n.id==='sessions'){for(let j=-2;j<=2;j++){ctx.save();ctx.rotate(j*.29);ctx.beginPath();ctx.moveTo(0,33);ctx.bezierCurveTo(-19,6,-15,-16,0,-47+Math.abs(j)*12);ctx.bezierCurveTo(15,-16,19,6,0,33);ctx.stroke();ctx.restore();}ctx.beginPath();ctx.ellipse(0,29,41,10,0,0,TAU);ctx.stroke();flare(ctx,0,6,9,'#ffdaad',.8);}
 else if(n.id==='workshops'){for(let j=0;j<3;j++){ctx.beginPath();ctx.ellipse(0,0,28+j*9,19+j*8,j*.7,0,TAU);ctx.stroke();}ctx.beginPath();ctx.moveTo(0,-46);ctx.lineTo(0,46);ctx.stroke();flare(ctx,0,0,7,'#ffe9b8',.75);}
 else if(n.id==='gestalt'){
  ctx.beginPath();ctx.moveTo(0,-52);ctx.lineTo(40,0);ctx.lineTo(0,52);ctx.lineTo(-40,0);ctx.closePath();ctx.moveTo(0,-52);ctx.lineTo(0,52);ctx.moveTo(-40,0);ctx.lineTo(40,0);ctx.moveTo(-24,-26);ctx.lineTo(24,26);ctx.moveTo(24,-26);ctx.lineTo(-24,26);ctx.stroke();flare(ctx,0,0,9,'#c8b3ff',.82);
 }else{
  for(let arm=0;arm<5;arm++)for(let j=0;j<4;j++){ctx.beginPath();for(let st=0;st<60;st++){const u=st/59,a=u*4.9+arm*TAU/5+j*.024,rr=4+u*43;const xx=Math.cos(a)*rr,yy=Math.sin(a)*rr*.72;st?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}ctx.strokeStyle=rgba(j%2?'#c2a3ff':'#e9c9ef',.11);ctx.stroke();}flare(ctx,0,0,9,'#dfc8ff',.88);
 }
 ctx.shadowBlur=0;ctx.restore();
 // Small luminous threshold below the embedded label is an affordance, not a status.
 const yy=n.y+n.r*.89;ctx.save();ctx.strokeStyle=rgba('#ffe4b9',.45+f*.3);ctx.lineWidth=.8;ctx.beginPath();ctx.arc(n.x,yy,6,0,TAU);ctx.moveTo(n.x,yy-4);ctx.lineTo(n.x,yy+4);ctx.moveTo(n.x-3,yy);ctx.lineTo(n.x+3,yy);ctx.stroke();ctx.restore();
}
function nexus(t){
 ctx.save();ctx.globalCompositeOperation='screen';const x=core.x,y=core.y,r=core.r;
 mist(ctx,x,y,r*1.62,'#efc988',.78);mist(ctx,x,y,r*.73,'#ffe9b8',.8);
 const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#fff0c6');g.addColorStop(.22,'rgba(255,223,169,.89)');g.addColorStop(.43,'rgba(219,174,111,.48)');g.addColorStop(.73,'rgba(191,164,125,.1)');g.addColorStop(1,'rgba(183,168,142,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
 for(let j=0;j<30;j++){const phase=j*.618,a=phase+t*.004;
  ctx.beginPath();ctx.ellipse(x,y,r*(.58+j*.013),r*(.28+j*.02),a,0,TAU);ctx.strokeStyle=rgba(j%3?'#e2c398':'#8db7d2',j%6===0?.25:.08);ctx.lineWidth=j%6===0?1.3:.6;ctx.stroke();
 }
 flare(ctx,x,y-r*.83,10,'#ffe7b2',.86);flare(ctx,x,y+r*.86,13,'#ffe0a6',.9);flare(ctx,x-r*.94,y,7,'#b3dfff',.66);flare(ctx,x+r*.94,y,7,'#c9c0fb',.66);ctx.restore();
}
function centralIris(t){ctx.save();ctx.globalCompositeOperation='screen';for(let k=0;k<12;k++){const a=k*TAU/12+t*.007;ctx.beginPath();ctx.ellipse(core.x,core.y,core.r*.83,core.r*.45,a,Math.PI*.2,Math.PI*1.6);ctx.strokeStyle=rgba(k%3?'#efd8b3':'#c1e5ef',.085);ctx.lineWidth=.65;ctx.stroke();}ctx.restore();}
function particles(t){ctx.save();ctx.globalCompositeOperation='screen';for(const p of motes){const n=nodes[p.edge],geo=bridge(n,p.edge,t),u=(p.phase+t*p.speed*.4)%1,q=curve(geo.a,geo.p1,geo.p2,geo.b,u),env=Math.sin(Math.PI*u),offset=p.lane*(8+env*24),x=q.x+geo.nx*offset,y=q.y+geo.ny*offset;ctx.globalAlpha=(.12+.42*p.depth)*env;ctx.fillStyle=p.depth>.55?'#f9e4c3':n.col[0];ctx.fillRect(x,y,p.r,p.r);}ctx.restore();}
function draw(){const t=time;ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';background(t);spectralVolume(t);livingTissue(t);relationalWeave(t);
 for(let k=0;k<6;k++)membrane(nodes[k],k,t,focus[nodes[k].id]||0);
 nexus(t);centralIris(t);particles(t);
 for(let k=0;k<6;k++){const n=nodes[k],f=focus[n.id]||0;refractiveShell(n,t,f);auricDepth(n,t,f);sphere(n,k,t,f);spectralLens(n,t,f);}
 canvas.dataset.material='procedural-living-constellation-v10';canvas.dataset.visualLayer='auric-depth-01';canvas.dataset.materialRevision='folded-volume-02';canvas.dataset.cachedVolume=volumeCache?'ready':'unsupported';canvas.dataset.frames=String(++frames);canvas.dataset.motion=app.state.still||document.hidden?'paused':'running';canvas.dataset.selected=app.state.selected||'';
}
function frame(now){raf=0;if(app.state.still||document.hidden){draw();return;}if(now-lastFrame<34){raf=requestAnimationFrame(frame);return;}const dt=last?Math.min(.08,Math.max(0,(now-last)/1000)):.033;last=now;lastFrame=now;time+=dt;
for(const n of nodes){const target=app.state.focus===n.id||app.state.selected===n.id?1:0;focus[n.id]+=(target-focus[n.id])*(1-Math.exp(-dt*2.8));}draw();raf=requestAnimationFrame(frame);}
function refresh(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;if(app.state.still||document.hidden){draw();return;}raf=requestAnimationFrame(frame);}
window.addEventListener('nexus:motion',refresh);window.addEventListener('nexus:focus',()=>{if(app.state.still)draw();});document.addEventListener('visibilitychange',refresh);window.addEventListener('pagehide',()=>{if(raf)cancelAnimationFrame(raf);raf=0;});
window.__LivingMaterial10={snapshot:()=>({frames,material:canvas.dataset.material,motion:canvas.dataset.motion,selected:canvas.dataset.selected,particles:motes.length,artBackplate:false})};refresh();
})();
