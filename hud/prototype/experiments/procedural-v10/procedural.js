/* LIVING MATERIAL 10 — responsive procedural field with generated world materials.
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
// All caches are generated locally. No reference-image wallpaper or external requests. Generated individual world materials are bundled locally.
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
let volumeCache=null,webCache=null;const shellCache=new Map(),atlasShellCache=new Map();
// Individual material sprites, not a pre-rendered interface or full-scene artwork.
// All text, audited symbols, input, journeys, particles and light remain live.
let atlasReady=false;const atlas=document.createElement('img');atlas.decoding='async';
atlas.onload=()=>{atlasReady=atlas.naturalWidth===1536&&atlas.naturalHeight===1024;refresh();};
atlas.onerror=()=>{atlasReady=false;refresh();};
if(typeof window.__NEXUS_MATERIAL_ATLAS_DATA==='string'&&window.__NEXUS_MATERIAL_ATLAS_DATA.startsWith('data:image/webp;base64,'))atlas.src=window.__NEXUS_MATERIAL_ATLAS_DATA;

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
// A ruled, folded sheet: adjacent fibres retain their order and read as one
// translucent material. All high-density geometry is rasterized only once.
function silk(p,x1,y1,x2,y2,bend,width,color,phase){
 const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L;
 const lanes=low?94:156,samples=68;
 const point=(u,v)=>{
  const env=Math.sin(Math.PI*u),gather=Math.pow(env,.62);
  const bow=Math.sin(Math.PI*u)*bend+Math.sin(u*TAU+phase)*bend*.12*env;
  const fold=Math.sin(u*TAU*.65+v*2.3+phase)*width*.16*env;
  const cross=v*width*gather+fold+bow;
  return {x:lerp(x1,x2,u)+nx*cross,y:lerp(y1,y2,u)+ny*cross};
 };
 p.save();
 // Broad but faint transmitted light sits behind the individually resolved fibres.
 p.beginPath();for(let k=0;k<=samples;k++){const q=point(k/samples,-.5);k?p.lineTo(q.x,q.y):p.moveTo(q.x,q.y);}
 for(let k=samples;k>=0;k--){const q=point(k/samples,.5);p.lineTo(q.x,q.y);}p.closePath();
 const wash=p.createLinearGradient(x1,y1,x2,y2);wash.addColorStop(0,rgba(color,0));wash.addColorStop(.09,rgba(color,0));wash.addColorStop(.3,rgba(color,.035));wash.addColorStop(.7,rgba('#bdd7e6',.045));wash.addColorStop(.91,rgba(color,0));wash.addColorStop(1,rgba(color,0));p.fillStyle=wash;p.fill();
 for(let j=0;j<lanes;j++){
  const v=j/(lanes-1)-.5,crest=Math.pow(.5+.5*Math.sin(v*16+phase),14);
  p.beginPath();for(let k=0;k<=samples;k++){const q=point(k/samples,v);k?p.lineTo(q.x,q.y):p.moveTo(q.x,q.y);}
  const brightness=.062+crest*.28+(j%17===0?.12:0),g=p.createLinearGradient(x1,y1,x2,y2);
  g.addColorStop(0,rgba(color,0));g.addColorStop(.08,rgba(color,.002));g.addColorStop(.17,rgba(color,brightness*.6));g.addColorStop(.5,rgba(crest>.4?'#f6e9cb':color,brightness));g.addColorStop(.83,rgba(color,brightness*.65));g.addColorStop(.92,rgba(color,.002));g.addColorStop(1,rgba(color,0));
  p.strokeStyle=g;p.lineWidth=j%17===0?.72:.43;p.stroke();
 }
 // Oblique cross-fibres reveal the sheet's curvature without a regular wire grid.
 p.lineWidth=.35;p.strokeStyle=rgba('#d5e9f1',.055);
 for(let k=3;k<34;k++){p.beginPath();for(let j=0;j<=24;j++){const v=j/24-.5,u=k/36+v*.055,q=point(u,v);j?p.lineTo(q.x,q.y):p.moveTo(q.x,q.y);}p.stroke();}
 p.restore();
}
function makeWeb(){
 const c=layer(canvas.width,canvas.height),p=c.getContext('2d');if(!p)return null;p.scale(scale,scale);p.globalCompositeOperation='screen';
 // Persistent broad tissue joins the existing world surfaces to the Meeting Field.
 // Bake fine strands once; the live layer only carries restrained highlights.
 for(let k=0;k<nodes.length;k++){
  const n=nodes[k],dx=n.x-core.x,dy=n.y-core.y,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L;
  for(const side of [-1,1]){
   const nx=-uy*side,ny=ux*side;
   silk(p,core.x+ux*core.r*.52+nx*core.r*.46,core.y+uy*core.r*.52+ny*core.r*.46,
     n.x-ux*n.r*.62+nx*n.r*.52,n.y-uy*n.r*.62+ny*n.r*.52,
     side*(28+k%2*9),102,'#e8c898',k*.43+side*.21);
   silk(p,core.x+ux*core.r*.72+nx*core.r*.32,core.y+uy*core.r*.72+ny*core.r*.32,
     n.x-ux*n.r*.70+nx*n.r*.38,n.y-uy*n.r*.70+ny*n.r*.38,
     side*22,62,n.col[0],k*.43+side*.21);
  }
 }
 // Light gathers where real shared membranes meet. Each junction is tied
 // to the existing world and core coordinates, never to decorative random state.
 for(const n of nodes){
  const dx=n.x-core.x,dy=n.y-core.y,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L;
  const a={x:core.x+ux*core.r*1.01,y:core.y+uy*core.r*1.01},b={x:n.x-ux*n.r*1.02,y:n.y-uy*n.r*1.02};
  const x=(a.x+b.x)/2,y=(a.y+b.y)/2;
  mist(p,x,y,55,n.col[0],.17);flare(p,x,y,8.5,'#ffe6b6',.88);
  flare(p,b.x-uy*14,b.y+ux*14,3.2,n.col[0],.50);
 }
 // Perimeter membranes pass around the six existing anchors.
 const order=[0,2,4,5,3,1];
 for(let k=0;k<6;k++){
  const a=nodes[order[k]],b=nodes[order[(k+1)%6]],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len;
  silk(p,a.x+ux*a.r*.72,a.y+uy*a.r*.72,b.x-ux*b.r*.72,b.y-uy*b.r*.72,k%2?-78:75,105,'#e6c698',k*.5);
  silk(p,a.x-uy*a.r*.62,a.y+ux*a.r*.62,b.x-uy*b.r*.62,b.y+ux*b.r*.62,-85,105,'#729fb8',k*.7);
 }
 // Large flowing envelope embraces the field. It is material, not landscape.
 const paths=[[-120,730,615,34,-195,164,'#b3cde4'],[208,982,1325,842,-88,168,'#aec9e3'],[948,16,1600,744,188,154,'#b9d6ed'],[-80,370,454,868,154,145,'#9cb6d5'],[1100,178,1590,375,-96,120,'#cbbfa9'],[207,184,1090,938,240,135,'#899cbd']];
 for(let i=0;i<paths.length;i++){p.globalAlpha=.30;silk(p,...paths[i],i*.75);}p.globalAlpha=1;
 for(let k=0;k<6;k++){
  const n=nodes[k],tilt=n.phase*.45;
  for(let band=0;band<3;band++)for(let j=0;j<45;j++){
   const v=j/44,r=n.r*(1.05+v*.32),start=tilt+band*1.58,span=2.2;
   p.beginPath();
   for(let st=0;st<=70;st++){
    const a=start+st/70*span,bulge=1+.065*Math.sin(a*3+v*4+n.phase)+.08*Math.sin(a*2-v*2),xx=n.x+Math.cos(a)*r*bulge,yy=n.y+Math.sin(a)*r*bulge*.96;
    st?p.lineTo(xx,yy):p.moveTo(xx,yy);
   }
   const crest=Math.pow(.5+.5*Math.sin(v*10+band),16);
   p.strokeStyle=rgba(band%2?'#efd4ac':n.col[0],(.012+crest*.075)*(1-v*.6));p.lineWidth=crest>.5?.7:1.1;p.stroke();
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
// MATERIAL_06: spherical cavities sit within the shared cloth. Their broad
// transmitted colour, narrow caustics and fine mesh are separate depth layers.
function makeShell(n){
 let grainSeed=91230+Math.round(n.phase*1000);const grain=()=>{grainSeed=(Math.imul(grainSeed,1664525)+1013904223)>>>0;return grainSeed/4294967296;};
 const size=low?288:384,c=layer(size,size),p=c.getContext('2d');if(!p)return null;
 const r=size*.399,cx=size/2,cy=size/2,data=p.createImageData(size,size),d=data.data,base=rgb(n.col[0]),light=rgb(n.col[1]);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const X=(x-cx)/r,Y=(y-cy)/r,rad=Math.hypot(X,Y);if(rad>1.2)continue;
  const a=Math.atan2(Y,X),edge=1+.008*Math.sin(a*5+n.phase)+.005*Math.cos(a*9),q=rad/edge;
  const z=Math.sqrt(Math.max(0,1-q*q)),v=fbm(X*4+n.phase*3,Y*4+z*2+8);
  const turbulence=fbm(X*11+v*3+n.phase,Y*11-v*2);
  const facing=clamp(-X*.52-Y*.52+.32),fresnel=Math.pow(clamp(q),6);
  const cloud=Math.pow(clamp(turbulence*1.8-.64),2)*clamp(1-q*q)*.20;
  const body=Math.exp(-Math.pow((q-.90)/.13,2))*(.14+.32*facing);
  const lip=Math.exp(-Math.pow((q-.976)/.014,2));
  const caustic=.24+.76*Math.pow(.5+.5*Math.sin(a*4+v*9+n.phase),3);
  const pearl=lip*(.30+facing*1.25)*caustic;
  const colour=cloud+body+fresnel*.018;
  const i=(y*size+x)*4;
  d[i]=2+base[0]*colour+light[0]*pearl*.87;
  d[i+1]=5+base[1]*colour+light[1]*pearl*.91;
  d[i+2]=11+base[2]*colour+light[2]*pearl;
  d[i+3]=q<.98?255:Math.round(clamp((1.12-q)/.14)*245);
 }
 p.putImageData(data,0,0);p.globalCompositeOperation='screen';
 // Membrane fibres follow the spherical surface rather than a stack of rings.
 for(let band=0;band<3;band++)for(let j=0;j<58;j++){
  const v=j/57,offset=n.phase+band*2.09,start=offset-.5,span=2.65;
  p.beginPath();
  for(let st=0;st<=96;st++){
   const u=st/96,a=start+u*span,rr=r*(.905+v*.15+.017*Math.sin(a*4+v*2+n.phase));
   const xx=cx+Math.cos(a)*rr,yy=cy+Math.sin(a)*rr;
   st?p.lineTo(xx,yy):p.moveTo(xx,yy);
  }
  const crest=Math.pow(.5+.5*Math.sin(v*10+band*1.2),10);
  p.strokeStyle=rgba(j%8===0?'#f9edcf':n.col[band%3],.022+crest*.15);p.lineWidth=crest>.5?.62:.38;p.stroke();
 }
 // Irregular triangular membrane mesh projected onto a curved surface.
 const rows=11,cols=24,points=[];
 for(let row=0;row<=rows;row++){
  const lat=(row/rows-.5)*Math.PI;
  for(let col=0;col<cols;col++){
   const lon=(col+(row%2)*.5)/cols*TAU+n.phase*.12,lat2=lat+.025*Math.sin(col*2.7+row);
   const X=Math.cos(lat2)*Math.sin(lon),Y=Math.sin(lat2),Z=Math.cos(lat2)*Math.cos(lon);
   points.push({x:cx+X*r*.90,y:cy+Y*r*.90,z:Z});
  }
 }
 p.lineWidth=.42;
 for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
  const a=points[row*cols+col];if(a.z<-.08)continue;
  for(const idx of [row*cols+(col+1)%cols,(row+1)*cols+col,(row+1)*cols+(col+1)%cols]){
   const b=points[idx];if(b.z<-.08)continue;
   const lum=.035+Math.pow(1-clamp((a.z+b.z)/2),2)*.08;
   p.strokeStyle=rgba(n.col[0],lum);p.beginPath();p.moveTo(a.x,a.y);p.lineTo(b.x,b.y);p.stroke();
  }
  if(row%2===0&&col%3===0){p.fillStyle=rgba('#d9f6ee',.2+a.z*.20);p.fillRect(a.x-.55,a.y-.55,1.1,1.1);}
 }
 for(let j=0;j<1800;j++){
  const a=grain()*TAU,q=.80+grain()*.27,rr=q*r,crest=Math.pow(.5+.5*Math.sin(a*7+q*19+n.phase),5);
  if(crest<.35)continue;p.fillStyle=rgba(j%3?n.col[0]:'#ffecd1',crest*(.16+grain()*.38));
  const size=.25+grain()*.62;p.fillRect(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr,size,size);
 }
 for(let j=0;j<7;j++){const a=j*2.399+n.phase,rr=r*(.93+grain()*.055);flare(p,cx+Math.cos(a)*rr,cy+Math.sin(a)*rr,1.8+grain()*2.2,j%2?n.col[0]:'#ffe8bd',.45+grain()*.3);}
 return c;
}
function makeAtlasShell(n){
 const size=low?288:384,c=layer(size,size),p=c.getContext('2d'),r=size*.399,cx=size/2,cy=size/2;
 const i=nodes.indexOf(n),draw=r*2.74;
 p.drawImage(atlas,(i%3)*512,Math.floor(i/3)*512,512,512,cx-draw/2,cy-draw/2,draw,draw);
 p.globalCompositeOperation='destination-in';const mask=p.createRadialGradient(cx,cy,0,cx,cy,r*1.09);
 mask.addColorStop(0,'rgba(0,0,0,.04)');mask.addColorStop(.52,'rgba(0,0,0,.09)');mask.addColorStop(.74,'rgba(0,0,0,.4)');mask.addColorStop(.88,'rgba(0,0,0,.87)');mask.addColorStop(.94,'rgba(0,0,0,.57)');mask.addColorStop(1,'rgba(0,0,0,0)');
 p.fillStyle=mask;p.fillRect(0,0,size,size);return c;
}
function refractiveShell(n,t,f){
 let c=shellCache.get(n.id);if(!c){c=makeShell(n);if(c)shellCache.set(n.id,c);}if(!c)return;
 const breath=1+.004*Math.sin(t*.43+n.phase),size=n.r*2.51*breath;
 ctx.save();ctx.globalCompositeOperation='source-over';ctx.drawImage(c,n.x-size/2,n.y-size/2,size,size);
 if(atlasReady){let a=atlasShellCache.get(n.id);if(!a){a=makeAtlasShell(n);atlasShellCache.set(n.id,a);}ctx.globalCompositeOperation='screen';ctx.drawImage(a,n.x-size/2,n.y-size/2,size,size);ctx.globalCompositeOperation='source-over';}
 // Localized readable dark pocket, not a flat label plate.
 const shade=ctx.createRadialGradient(n.x,n.y+n.r*.18,n.r*.12,n.x,n.y+n.r*.10,n.r*.90);
 shade.addColorStop(0,'rgba(2,5,13,.40)');shade.addColorStop(.58,'rgba(2,5,13,.24)');shade.addColorStop(1,'rgba(2,5,13,0)');ctx.fillStyle=shade;ctx.fillRect(n.x-n.r,n.y-n.r,n.r*2,n.r*2);
 ctx.globalCompositeOperation='screen';mist(ctx,n.x-n.r*.65,n.y-n.r*.49,n.r*.46,n.col[0],.10+f*.23);ctx.restore();
}
// MATERIAL_05: an inner polyhedral volume, separate from the orb silhouette.
// Fixed topology, depth-sorted faces and bounded motion keep the six identities intact.
const phi=(1+Math.sqrt(5))/2;
const crystalVertices=[];
for(const a of [-1,1])for(const b of [-phi,phi]){
 crystalVertices.push([0,a,b],[a,b,0],[b,0,a]);
}
const crystalEdges=[];
for(let a=0;a<12;a++)for(let b=a+1;b<12;b++){
 if(Math.abs(Math.hypot(...crystalVertices[a].map((v,i)=>v-crystalVertices[b][i]))-2)<.001)crystalEdges.push([a,b]);
}
function innerCrystal(n,t,f){
 const angle=n.phase*.41+Math.sin(t*.075+n.phase)*.14,ca=Math.cos(angle),sa=Math.sin(angle),tilt=.32;
 const points=crystalVertices.map(([x,y,z])=>{
  const xx=x*ca+z*sa,zz=z*ca-x*sa,yy=y*Math.cos(tilt)-zz*Math.sin(tilt),depth=y*Math.sin(tilt)+zz*Math.cos(tilt);
  const perspective=1/(1-depth*.065),size=n.r*.36;
  return {x:n.x+xx*size*perspective,y:n.y-n.r*.19+yy*size*perspective,z:depth};
 });
 ctx.save();ctx.beginPath();ctx.arc(n.x,n.y,n.r*.88,0,TAU);ctx.clip();
 // Keep the lower inscription band free of luminous geometry.
 ctx.beginPath();ctx.rect(n.x-n.r,n.y-n.r,n.r*2,n.r*1.38);ctx.clip();ctx.globalCompositeOperation='screen';
 for(const [a,b] of crystalEdges.slice().sort((u,v)=>(points[u[0]].z+points[u[1]].z)-(points[v[0]].z+points[v[1]].z))){
  const p=points[a],q=points[b],depth=clamp((p.z+q.z+4)/8);
  ctx.strokeStyle=rgba(depth>.55?'#ffe4b5':n.col[0],.025+depth*.075+f*.12);ctx.lineWidth=.45+depth*.55;
  ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();
 }
 for(const p of points)if(p.z>.4)flare(ctx,p.x,p.y,1.4+p.z*.45,n.col[1],.12+f*.16);
 ctx.restore();
}
function auricDepth(n,t,f){ctx.save();ctx.globalCompositeOperation='screen';mist(ctx,n.x-n.r*.58,n.y-n.r*.42,n.r*.88,n.col[0],.13+f*.15);ctx.restore();innerCrystal(n,t,f);}
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
let coreCache=null;
function makeCore(){
 const size=low?400:560,c=layer(size,size),p=c.getContext('2d'),r=size*.375,x=size/2,y=size/2;
 const g=p.createRadialGradient(x-r*.06,y-r*.06,0,x,y,r*1.14);
 g.addColorStop(0,'rgba(255,242,193,.94)');g.addColorStop(.18,'rgba(250,220,165,.85)');g.addColorStop(.45,'rgba(219,171,107,.61)');g.addColorStop(.69,'rgba(129,162,177,.40)');g.addColorStop(.82,'rgba(70,127,162,.30)');g.addColorStop(.91,'rgba(150,211,228,.24)');g.addColorStop(.943,'rgba(230,239,218,.16)');g.addColorStop(.97,'rgba(185,225,226,.05)');g.addColorStop(1,'rgba(126,168,203,0)');
 p.fillStyle=g;p.fillRect(0,0,size,size);p.globalCompositeOperation='screen';
 for(let band=0;band<4;band++)for(let j=0;j<76;j++){
  const v=j/75,start=band*TAU/4-.6;p.beginPath();
  for(let st=0;st<=100;st++){const a=start+st/100*2.6,rr=r*(.80+v*.27+.017*Math.sin(a*4+v*3)),xx=x+Math.cos(a)*rr,yy=y+Math.sin(a)*rr;st?p.lineTo(xx,yy):p.moveTo(xx,yy);}
  const crest=Math.pow(.5+.5*Math.sin(v*12+band),12);p.strokeStyle=rgba(j%4?'#d7e9e4':'#ffe6b1',.022+crest*.28);p.lineWidth=.55;p.stroke();
 }
 // Three interleaved surface folds give the sphere an uneven refractive lip.
 for(let j=0;j<100;j++){
  const v=j/99;p.beginPath();
  for(let st=0;st<=180;st++){const a=st/180*TAU,rr=r*(.91+v*.075+.012*Math.sin(a*5+v*2.4));const xx=x+Math.cos(a)*rr,yy=y+Math.sin(a)*rr;st?p.lineTo(xx,yy):p.moveTo(xx,yy);}
  const crest=Math.pow(.5+.5*Math.sin(v*14),8);p.strokeStyle=rgba(j%3?'#e8d4a7':'#a3e3f0',.012+crest*.105);p.lineWidth=.45;p.stroke();
 }
 // Selective edge caustics leave dark intervals between bright folds.
 for(let k=0;k<8;k++){
  const phase=k*2.399,rr=r*(.93+.04*Math.sin(k));
  mist(p,x+Math.cos(phase)*rr,y+Math.sin(phase)*rr,r*.23,k%3?'#ffd793':'#7ad6fa',.36);
  flare(p,x+Math.cos(phase)*rr,y+Math.sin(phase)*rr,2.5,k%3?'#ffe4b4':'#acf0ff',.56);
 }
 // A curved, depth-attenuated mesh resolves the translucent central body.
 const mesh=[],rows=10,cols=26;
 for(let row=0;row<=rows;row++)for(let col=0;col<cols;col++){
  const lat=(row/rows-.5)*Math.PI,lon=(col+(row%2)*.5)/cols*TAU+.17;
  const z=Math.cos(lat)*Math.cos(lon);mesh.push({x:x+Math.cos(lat)*Math.sin(lon)*r*.88,y:y+Math.sin(lat)*r*.88,z});
 }
 for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
  const a=mesh[row*cols+col];if(a.z<0)continue;
  for(const idx of [row*cols+(col+1)%cols,(row+1)*cols+col,(row+1)*cols+(col+1)%cols]){
   const b=mesh[idx];if(b.z<0)continue;const side=1-(a.z+b.z)/2;
   p.globalCompositeOperation=side<.35?'source-over':'screen';p.strokeStyle=rgba(side<.35?'#897c61':(col%3?'#ffe5b2':'#b3e8f3'),side<.35?.20:.10+side*.20);p.lineWidth=.54;p.beginPath();p.moveTo(a.x,a.y);p.lineTo(b.x,b.y);p.stroke();
  }
  if(col%4===0&&row%2===0){p.fillStyle=rgba('#fff2d4',.46);p.fillRect(a.x-.65,a.y-.65,1.3,1.3);}
 }
 p.globalCompositeOperation='screen';
 // Crossing laminae give the core a translucent body rather than a light spot.
 for(let j=0;j<26;j++){p.beginPath();p.ellipse(x,y,r*.95,r*(.18+j*.026),j*.398,0,TAU);p.strokeStyle=rgba(j%3?'#f5d79d':'#9bd9ee',j%5===0?.25:.095);p.lineWidth=j%5===0?.8:.45;p.stroke();}
 for(let j=0;j<1000;j++){const a=rnd()*TAU,rr=r*(.68+rnd()*.37),q=.3+rnd()*.6;p.fillStyle=rgba(j%3?'#fff0c9':'#b3edff',.08+rnd()*.24);p.fillRect(x+Math.cos(a)*rr,y+Math.sin(a)*rr,q,q);}
 return c;
}
function nexus(t){
 ctx.save();ctx.globalCompositeOperation='screen';const x=core.x,y=core.y,r=core.r;
 mist(ctx,x,y,r*1.75,'#efc988',.52);if(!coreCache)coreCache=makeCore();
 const size=r*2.67*(1+.003*Math.sin(t*.32));ctx.drawImage(coreCache,x-size/2,y-size/2,size,size);
 flare(ctx,x,y-r*1.04,12,'#ffe7b2',.9);flare(ctx,x,y+r*1.04,13,'#ffe0a6',.94);flare(ctx,x-r*1.02,y,8,'#b3dfff',.74);flare(ctx,x+r*1.02,y,8,'#c9c0fb',.74);ctx.restore();
}
function centralIris(t){ctx.save();ctx.globalCompositeOperation='screen';for(let k=0;k<12;k++){const a=k*TAU/12+t*.007;ctx.beginPath();ctx.ellipse(core.x,core.y,core.r*.83,core.r*.45,a,Math.PI*.2,Math.PI*1.6);ctx.strokeStyle=rgba(k%3?'#efd8b3':'#c1e5ef',.085);ctx.lineWidth=.65;ctx.stroke();}ctx.restore();}
function particles(t){ctx.save();ctx.globalCompositeOperation='screen';for(const p of motes){const n=nodes[p.edge],geo=bridge(n,p.edge,t),u=(p.phase+t*p.speed*.4)%1,q=curve(geo.a,geo.p1,geo.p2,geo.b,u),env=Math.sin(Math.PI*u),offset=p.lane*(8+env*24),x=q.x+geo.nx*offset,y=q.y+geo.ny*offset;ctx.globalAlpha=(.12+.42*p.depth)*env;ctx.fillStyle=p.depth>.55?'#f9e4c3':n.col[0];ctx.fillRect(x,y,p.r,p.r);}ctx.restore();}
function draw(){if(app.state.still)for(const n of nodes)focus[n.id]=app.state.focus===n.id||app.state.selected===n.id?1:0;const t=time;ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.fillStyle='#040710';ctx.fillRect(0,0,W+1,H+1);background(t);spectralVolume(t);livingTissue(t);relationalWeave(t);
 for(let k=0;k<6;k++)membrane(nodes[k],k,t,focus[nodes[k].id]||0);
 nexus(t);centralIris(t);particles(t);
 for(let k=0;k<6;k++){const n=nodes[k],f=focus[n.id]||0;refractiveShell(n,t,f);auricDepth(n,t,f);sphere(n,k,t,f);spectralLens(n,t,f);}
 canvas.dataset.material='procedural-living-constellation-v10';canvas.dataset.visualLayer='auric-depth-01';canvas.dataset.materialRevision='auric-material-06';canvas.dataset.materialAtlas=atlasReady?'ready':'procedural-fallback';canvas.dataset.cachedVolume=volumeCache?'ready':'unsupported';canvas.dataset.frames=String(++frames);canvas.dataset.motion=app.state.still||document.hidden?'paused':'running';canvas.dataset.selected=app.state.selected||'';
}
function frame(now){raf=0;if(app.state.still||document.hidden){draw();return;}if(now-lastFrame<34){raf=requestAnimationFrame(frame);return;}const dt=last?Math.min(.08,Math.max(0,(now-last)/1000)):.033;last=now;lastFrame=now;time+=dt;
for(const n of nodes){const target=app.state.focus===n.id||app.state.selected===n.id?1:0;focus[n.id]+=(target-focus[n.id])*(1-Math.exp(-dt*2.8));}draw();raf=requestAnimationFrame(frame);}
function refresh(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;if(app.state.still||document.hidden){draw();return;}raf=requestAnimationFrame(frame);}
window.addEventListener('nexus:motion',refresh);window.addEventListener('nexus:focus',()=>{if(app.state.still)draw();});document.addEventListener('visibilitychange',refresh);window.addEventListener('pagehide',()=>{if(raf)cancelAnimationFrame(raf);raf=0;});
window.__LivingMaterial10={snapshot:()=>({frames,material:canvas.dataset.material,motion:canvas.dataset.motion,selected:canvas.dataset.selected,particles:motes.length,artBackplate:false,materialRevision:canvas.dataset.materialRevision,cachedSurfaces:shellCache.size,coreCached:!!coreCache})};refresh();
})();
