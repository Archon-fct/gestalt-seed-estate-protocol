/* COSMOS_08: owner-image-preserving, continuous cosmic breathing.
   No personal data, camera, network, storage, external media, or input interception.
   Slow coherent star drift is decorative and independent of interface controls. */
(()=>{'use strict';
 const app=window.NexusApp,canvas=document.getElementById('cosmos');if(!app||!canvas)return;
 const ctx=canvas.getContext('2d',{alpha:true});if(!ctx){canvas.dataset.renderer='static';return;}
 const W=1536,H=1024,TAU=Math.PI*2;
 const low=matchMedia('(max-width:700px)').matches||Number(navigator.hardwareConcurrency||8)<=4;
 const density=low?92:190,worlds=Object.values(app.worlds);
 let seed=482913;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const motes=[];
 for(let i=0;i<density*2&&motes.length<density;i++){
  const x=random()*W,y=random()*H;
  // Preserve the six worlds, central typography and original bright geometry.
  if(worlds.some(w=>Math.hypot((x-w.x)*.92,(y-w.y)*1.06)<(w.title==='Nexus'?210:151)))continue;
  motes.push({x,y,r:.38+random()*1.03,depth:.25+random()*.75,angle:random()*TAU,
   phase:random()*TAU,glow:random()>.87,kind:random(),rate:.19+random()*.36});
 }
 const dpr=Math.min(devicePixelRatio||1,low?.7:1);
 canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
 let elapsed=0,last=0,raf=0,frames=0,lastRender=0;
 const glow=(x,y,r,color,alpha)=>{ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fillStyle=color;ctx.globalAlpha=alpha;ctx.fill();};
 function draw(){
  ctx.clearRect(0,0,W,H);ctx.globalCompositeOperation='screen';
  const t=elapsed,breath=.84+.16*Math.sin(t*.32);
  // Sparse dark-matter haze occupies negative space rather than painting over labels.
  for(let k=0;k<5;k++){
   const x=[112,1395,210,1330,775][k]+Math.sin(t*.11+k*2.3)*(5+k);
   const y=[240,285,770,794,963][k]+Math.cos(t*.09+k)*(4+k);
   const radius=[230,240,190,235,160][k];
   const gradient=ctx.createRadialGradient(x,y,0,x,y,radius);
   const col=k%2?'144,105,220':'79,166,206';
   gradient.addColorStop(0,'rgba('+col+','+(.037*breath).toFixed(4)+')');
   gradient.addColorStop(.48,'rgba('+col+',.010)');gradient.addColorStop(1,'rgba('+col+',0)');
   ctx.globalAlpha=1;ctx.fillStyle=gradient;ctx.fillRect(x-radius,y-radius,radius*2,radius*2);
  }
  for(const p of motes){
   const vx=Math.cos(p.angle+t*.075)*p.depth*5;
   const vy=Math.sin(p.angle+t*.065)*p.depth*4;
   const driftX=Math.sin(t*.17+p.phase)*p.depth*3.5;
   const driftY=Math.cos(t*.12+p.phase)*p.depth*2.5;
   const x=p.x+vx+driftX,y=p.y+vy+driftY;
   const twinkle=.68+.32*Math.sin(t*p.rate+p.phase);
   const alpha=(.14+.22*p.depth)*twinkle*breath;
   const color=p.kind<.38?'#b6d9ef':p.kind<.74?'#e8d8b6':'#b6a2e7';
   if(p.glow){glow(x,y,p.r*5,color,alpha*.035);}
   glow(x,y,p.r,color,alpha);
   if(p.glow&&p.depth>.7){ctx.strokeStyle=color;ctx.lineWidth=.42;ctx.globalAlpha=alpha*.21;
    ctx.beginPath();ctx.moveTo(x-p.r*4,y);ctx.lineTo(x+p.r*4,y);ctx.moveTo(x,y-p.r*4);ctx.lineTo(x,y+p.r*4);ctx.stroke();}
  }
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  canvas.dataset.frames=String(++frames);canvas.dataset.motion=app.state.still||document.hidden?'paused':'running';
  canvas.dataset.material='owner-image-preserving-cosmic-breath-v08';
 }
 function tick(now){raf=0;if(app.state.still||document.hidden){draw();return;}
  if(now-lastRender<33){raf=requestAnimationFrame(tick);return;}lastRender=now;
  const dt=last?Math.min(.065,Math.max(0,(now-last)/1000)):.033;last=now;elapsed+=dt;draw();
  raf=requestAnimationFrame(tick);
 }
 function refresh(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;
  if(app.state.still||document.hidden){draw();return;}raf=requestAnimationFrame(tick);
 }
 document.addEventListener('visibilitychange',refresh);
 window.addEventListener('nexus:motion',refresh);
 window.addEventListener('pagehide',()=>{if(raf)cancelAnimationFrame(raf);raf=0;});
 refresh();
})();