// Public decorative field. No model, sensors, private state, or network calls.
const TAU=Math.PI*2;
const rgba=(c,a)=>`rgba(${c},${Math.max(0,Math.min(1,a))})`;
export function paintField(ctx,w,h,t,{selected=-1,targets=[],aperture=.68}={}){
 const u=Math.min(w,h),cx=w/2,cy=h/2,r=u*.13;
 ctx.clearRect(0,0,w,h);ctx.save();ctx.lineCap='round';
 const line=(p,c,a,width=.7)=>{ctx.beginPath();p.forEach((q,i)=>i?ctx.lineTo(...q):ctx.moveTo(...q));ctx.strokeStyle=rgba(c,a);ctx.lineWidth=width;ctx.stroke();};
 const disk=(x,y,r,c)=>{ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fillStyle=c;ctx.fill();};
 const haze=(x,y,r,c,a)=>{const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,rgba(c,a));g.addColorStop(.45,rgba(c,a*.22));g.addColorStop(1,rgba(c,0));disk(x,y,r,g);};
 haze(cx,cy,u*.45,'100,132,225',.12);
 // A branching carrier field, with rolling dark ink and fine illuminated edges.
 for(let k=0;k<43;k++){
  const base=k*2.399,pts=[];
  for(let j=0;j<70;j++){const q=j/69,rr=u*(.07+q*(.22+.13*Math.sin(k*4)**2)),a=base+q*.9*Math.sin(t*.13+k)+.17*Math.sin(q*8-t*.3+k)*q;pts.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]);}
  line(pts,'1,3,9',.7,u*(.003+(k%4)*.0018));
  line(pts,k%3?'120,171,234':'184,147,224',.18+(k%4)*.06,u*.0013);
  if(k%3===0)line(pts,'195,214,239',.29,.55);
  const phase=(t*(.035+(k%5)*.003)+k*.173)%1,index=Math.floor(phase*65);
  const [x,y]=pts[index];haze(x,y,u*.012,'154,182,240',.20*Math.sin(phase*Math.PI));
 }
 // Three-dimensional membranes: genuine front/back passes and solid facets.
 const faces=[];
 for(let k=0;k<7;k++)for(let j=0;j<24;j++){
  const point=(s,side)=>{const a=k*2.399+t*.055*(k%2?-.7:1)+s*1.7,rr=u*(.23+(k%3)*.035+side*.012*Math.sin(s*Math.PI)),tilt=.4+(k%4)*.35;return{x:cx+Math.cos(a)*rr,y:cy+Math.sin(a)*rr*Math.cos(tilt),z:Math.sin(a)*Math.sin(tilt)};};
  const p=[point(j/24,-1),point((j+1)/24,-1),point((j+1)/24,1),point(j/24,1)];faces.push({p,z:p.reduce((a,b)=>a+b.z,0)/4,k,j});
 }
 faces.sort((a,b)=>a.z-b.z);
 const materials=front=>{for(const f of faces){if((f.z>=0)!==front)continue;const p=f.p.map(q=>[q.x,q.y]),a=(.16+.20*Math.abs(f.z))*(selected<0||f.k===selected%7?1:.55);ctx.beginPath();p.forEach((q,i)=>i?ctx.lineTo(...q):ctx.moveTo(...q));ctx.closePath();const g=ctx.createLinearGradient(...p[0],...p[2]);g.addColorStop(0,'rgba(4,8,21,.62)');g.addColorStop(.6,rgba('116,156,218',a));g.addColorStop(1,rgba('221,225,245',a*.7));ctx.fillStyle=g;ctx.fill();line([p[3],p[2]],f.k%3?'163,193,240':'197,159,230',a*2,.65);}};
 materials(false);
 const glass=ctx.createRadialGradient(cx-r*.22,cy-r*.25,0,cx,cy,r);glass.addColorStop(0,'#102038');glass.addColorStop(.3,'#02050c');glass.addColorStop(.73,'#010208');glass.addColorStop(.91,'#0b1631');glass.addColorStop(1,'#14284b');disk(cx,cy,r,glass);
 // Fixed limbus and individual radial folds; only the aperture recruits.
 for(let k=0;k<220;k++){const a=k/220*TAU,pts=[];for(let j=0;j<12;j++){const q=j/11,inner=aperture+.008*Math.sin(k*1.7+t*.43),rr=r*(inner+(1-inner)*q),b=a+.03*Math.sin(q*8+k)*Math.sin(q*Math.PI);pts.push([cx+Math.cos(b)*rr,cy+Math.sin(b)*rr]);}line(pts,k%5?'138,181,238':'223,210,238',.26+(k%3)*.08,.55);}
 for(let k=0;k<5;k++){const p=[];for(let j=0;j<=120;j++){const a=j/120*TAU,rr=r*(1+k*.035+.018*Math.sin(a*9+k-t*.2));p.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]);}line(p,k%2?'174,135,221':'171,203,240',.28,.7);}
 haze(cx-r*.3,cy-r*.38,r*.14,'215,238,255',.9);disk(cx-r*.3,cy-r*.38,r*.025,'#edf8ff');
 // Thin broken rings and metallic fragments have their own orbits.
 for(let k=0;k<3;k++){const p=[];for(let j=0;j<80;j++){const a=t*.035*(k%2?-1:1)+k*2+j/80*3.7;const rr=u*(.19+k*.035);p.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*(.8+k*.08)]);}line(p,'178,169,220',.20,.6);}
 for(let k=0;k<18;k++){const a=k*2.399+t*(k%2?-.05:.06),rr=u*(.25+(k%4)*.026),x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr*.85,l=u*(.004+(k%3)*.002);ctx.beginPath();ctx.moveTo(x-l,y);ctx.lineTo(x,y-l*2);ctx.lineTo(x+l,y);ctx.lineTo(x,y+l*2);ctx.closePath();ctx.fillStyle=rgba('140,171,215',.25);ctx.fill();line([[x-l,y],[x,y-l*2],[x+l,y]],'216,223,242',.46,.6);}
 materials(true);
 for(let k=0;k<targets.length;k++){const n=targets[k],dx=n.x-cx,dy=n.y-cy,len=Math.max(1,Math.hypot(dx,dy));if(len<r*1.3)continue;const p=[];for(let j=0;j<=40;j++){const q=j/40,bend=Math.sin(q*Math.PI)*u*.025*Math.sin(k+t*.2);p.push([cx+dx*q-dy/len*bend,cy+dy*q+dx/len*bend]);}const active=selected===k;line(p,active?'213,220,250':'133,162,204',active?.55:.09,active?1:.65);if(active){const j=Math.floor(((t*.14)%1)*36);line(p.slice(j,j+4),'232,234,255',.9,1.8);}}
 ctx.restore();
}
export function mountField(canvas,{targets=()=>[],selection=()=>-1,still=()=>false}={}){
 const ctx=canvas.getContext('2d');if(!ctx)return {refresh(){},destroy(){}};
 const media=matchMedia('(prefers-reduced-motion: reduce)');let frame=0,time=0,last=0,visible=true,dead=false,aperture=.68,velocity=0;
 const paused=()=>still()||media.matches||document.hidden;
 function draw(dt=0){const rect=canvas.getBoundingClientRect(),w=rect.width,h=rect.height,dpr=Math.min(devicePixelRatio||1,1.5);if(!w||!h)return;const bw=Math.round(w*dpr),bh=Math.round(h*dpr);if(canvas.width!==bw||canvas.height!==bh){canvas.width=bw;canvas.height=bh;}ctx.setTransform(dpr,0,0,dpr,0,0);if(dt){time+=dt;const target=selection()>=0?.61:.69;velocity+=((target-aperture)*15-velocity*6)*dt;aperture+=velocity*dt;}paintField(ctx,w,h,time,{selected:selection(),targets:targets(),aperture});}
 function tick(now){frame=0;if(dead||!visible||paused())return;if(!last||now-last>=1000/24){const dt=last?Math.min(.06,(now-last)/1000):0;last=now;draw(dt);}frame=requestAnimationFrame(tick);}
 function refresh(){cancelAnimationFrame(frame);frame=0;last=0;if(dead||document.hidden)return;draw();if(visible&&!paused())frame=requestAnimationFrame(tick);}
 const ro=new ResizeObserver(refresh),io=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);refresh();});ro.observe(canvas);io.observe(canvas);media.addEventListener('change',refresh);document.addEventListener('visibilitychange',refresh);window.addEventListener('pageshow',refresh);const stop=()=>{cancelAnimationFrame(frame);frame=0;last=0;};window.addEventListener('pagehide',stop);refresh();
 return {refresh,destroy(){dead=true;stop();ro.disconnect();io.disconnect();media.removeEventListener('change',refresh);document.removeEventListener('visibilitychange',refresh);window.removeEventListener('pageshow',refresh);window.removeEventListener('pagehide',stop);}};
}
