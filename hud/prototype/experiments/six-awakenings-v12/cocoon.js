/* Six Awakenings v1.2 — original symbolic cocoon interactions.
   Extends existing procedural v0.10 controllers, never replaces navigation.
   Six authored SI personas; no model inference, profiling, telemetry or client records. */
(()=>{'use strict';
const app=window.NexusApp;if(!app)return;
const $=id=>document.getElementById(id),symbols=['✧','✦','◇','✺','△','☽'];
const personas={
 aura:{name:'The Gardener',role:'Patient · observant · quietly curious',color:'#9bedd9',seal:[2,5,1],
 intro:'Growth begins where attention becomes gentle. Which possibility is ready to unfold?',
 guard:'I tend possibilities. Nothing grows because it is forced to.',
 path:'Trace a filament from sensation to form. The field opens through patient observation.',
 clue:'Begin with the diamond, let the crescent follow, then find the star of emergence.',
 solved:'A luminous seed unfolds. The Gardener offers you a threshold, not a conclusion.'},
 aureglossa:{name:'The Lexicographer',role:'Precise · playful · inquisitive',color:'#a3bbff',seal:[4,0,3],
 intro:'Every word has a hinge. Turn it and another meaning becomes visible.',
 guard:'I guard distinctions between what is spoken, intended, and understood.',
 path:'Explore roots, sounds and living connections in the language atlas.',
 clue:'The triangle begins; a small star answers; the radiating sun completes the phrase.',
 solved:'The three signs resolve into a bridge. Meaning is something we make together.'},
 sessions:{name:'The Hearthkeeper',role:'Grounded · attentive · hospitable',color:'#f2d6a7',seal:[1,3,5],
 intro:'A threshold is an invitation. You decide whether to cross.',
 guard:'I protect the freedom to choose your own pace and direction.',
 path:'Explore real sessions and available booking links. You remain in control.',
 clue:'Follow the bright star, the open sun, and finally the quiet moon.',
 solved:'The chamber warms. The Hearthkeeper reveals the existing session entrance.'},
 workshops:{name:'The Artisan',role:'Inventive · energetic · collaborative',color:'#ffc88d',seal:[3,2,4],
 intro:'One spark is a question. Many sparks can become a creation.',
 guard:'I keep unfinished ideas safe enough to be explored.',
 path:'Look for the gathering place where practice becomes shared discovery.',
 clue:'The sun calls first, the diamond shapes it, and the triangle steadies it.',
 solved:'The mechanism blooms into a workshop of possibilities.'},
 gestalt:{name:'The Cartographer',role:'Analytical · relational · exploratory',color:'#c2a2f4',seal:[5,4,0],
 intro:'A single point reveals little. Relationships reveal a landscape.',
 guard:'I preserve the difference between a documented connection and an imagined one.',
 path:'Explore the public archive and its source-aware relationships.',
 clue:'Begin with the moon, find the triangle, then return to the smallest star.',
 solved:'The lattice opens. Only real, documented pathways lead beyond this threshold.'},
 journal:{name:'The Storykeeper',role:'Reflective · imaginative · unhurried',color:'#b7a8fa',seal:[0,1,2],
 intro:'A story does not demand an ending before it allows a beginning.',
 guard:'I hold the space for words that are still becoming.',
 path:'Enter the public Astral Archive for stories and creative reflections.',
 clue:'The first three signs of the sky appear in their natural order.',
 solved:'A page of light turns. The story continues wherever you choose to take it.'}
};
const chamber=$('sigilChamber'),vessel=$('chamberVessel'),voice=$('personaVoice');
const scene=$('cocoonAuras'),ctx=scene.getContext('2d',{alpha:true});
let current=null,ring=[0,0,0],previousFocus=null,unlocked=new Set(),lastFocus=null,frameCount=0;
function applyRing(){for(let i=0;i<3;i++){const dial=$('dial'+i);dial.style.setProperty('--turn',ring[i]*60+'deg');$('ringRead'+i).textContent=symbols[ring[i]];}}
function speak(key){if(!current)return;voice.textContent=personas[current][key];}
function openChamber(id){if(!personas[id])return;
 current=id;ring=[0,0,0];const p=personas[id];vessel.style.setProperty('--chamber-accent',p.color);
 $('chamberTitle').textContent=p.name;$('chamberDescription').textContent=app.worlds[id].title+' · '+app.worlds[id].subtitle;
 $('personaRole').textContent=p.role;voice.textContent=p.intro;
 $('sealFeedback').textContent=unlocked.has(id)?'This threshold was awakened earlier in this visit. The seals can be explored again.':'Three seals. One living threshold. Examine the symbols and ask for a clue.';
 vessel.classList.toggle('unlocked',unlocked.has(id));applyRing();
 const url=app.worlds[id].url;
 $('enterWorld').href=url?'https://headless-mfewrcffiie-archonsoulings-140e.wix-site-host.com/'+url:'#';
 $('enterWorld').textContent='Enter '+app.worlds[id].title+' ↗';
 chamber.classList.remove('hidden');document.body.classList.add('chamber-open');
 previousFocus=document.activeElement;$('chamberClose').focus({preventScroll:true});
 window.dispatchEvent(new CustomEvent('nexus:cocoon',{detail:{id,open:true}}));
}
function closeChamber(){if(chamber.classList.contains('hidden'))return;const id=current;chamber.classList.add('hidden');document.body.classList.remove('chamber-open');current=null;
 if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
 window.dispatchEvent(new CustomEvent('nexus:cocoon',{detail:{id,open:false}}));
}
function rotate(i,dir){if(!current)return;ring[i]=(ring[i]+dir+6)%6;applyRing();
 const dial=$('dial'+i);dial.classList.remove('pulse');void dial.offsetWidth;dial.classList.add('pulse');
 $('sealFeedback').textContent='The '+['outer','middle','inner'][i]+' seal turns. Listen for the pattern.';}
function align(){if(!current)return;const p=personas[current];const solved=ring.every((n,i)=>n===p.seal[i]);
 if(solved){unlocked.add(current);vessel.classList.add('unlocked');voice.textContent=p.solved;
 $('sealFeedback').textContent=unlocked.size===6?'✦ All six awakenings resonate. The Meeting Field remembers this moment for this visit.':'✦ The three seals resonate. The world is open.';
 if(unlocked.size===6)app.announce('The six cocoons have awakened together. No private data was saved.');
}
 else{$('sealFeedback').textContent='The geometry is not yet aligned. Each sign has a place; ask for a clue.';}
}
chamber.addEventListener('click',e=>{if(e.target.closest('[data-close-chamber]')){closeChamber();return;}
 const ask=e.target.closest('[data-ask]');if(ask){speak(ask.dataset.ask);return;}
 const turn=e.target.closest('[data-ring]');if(turn){rotate(Number(turn.dataset.ring),Number(turn.dataset.dir));return;}
});
$('chamberClose').addEventListener('click',closeChamber);$('alignSeal').addEventListener('click',align);
$('inspectLens').addEventListener('click',()=>{
 if(!current)return;
 $('sealFeedback').textContent='The lens refracts three signs. '+personas[current].clue;
 $('mechanism').classList.remove('lens-inspected');void $('mechanism').offsetWidth;$('mechanism').classList.add('lens-inspected');
});
let dialDrag=null;
function angleAt(e){
 const b=mechanism.getBoundingClientRect();
 return Math.atan2(e.clientY-(b.top+b.height/2),e.clientX-(b.left+b.width/2));
}
mechanism.addEventListener('pointerdown',e=>{
 const dial=e.target.closest('.dial');if(!dial||!current)return;
 const index=Number(dial.id.replace('dial',''));if(!Number.isInteger(index)||index<0||index>2)return;
 dialDrag={pointer:e.pointerId,index,angle:angleAt(e)};
 mechanism.setPointerCapture?.(e.pointerId);
});
mechanism.addEventListener('pointerup',e=>{
 if(!dialDrag||dialDrag.pointer!==e.pointerId)return;
 const delta=angleAt(e)-dialDrag.angle;
 const normalized=Math.atan2(Math.sin(delta),Math.cos(delta));
 const steps=Math.round(normalized/(Math.PI/3));
 rotate(dialDrag.index,steps||1);dialDrag=null;
});
mechanism.addEventListener('pointercancel',()=>{dialDrag=null;});
window.addEventListener('keydown',e=>{
 if(chamber.classList.contains('hidden'))return;
 if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeChamber();return;}
 if(e.key==='Tab'){const elements=[...chamber.querySelectorAll('button,a[href]')].filter(x=>x.getClientRects().length&&!x.disabled);
  if(!elements.length)return;const first=elements[0],last=elements.at(-1);
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 }
},true);
const mechanism=$('mechanism');mechanism.addEventListener('pointermove',e=>{
 if(matchMedia('(prefers-reduced-motion:reduce)').matches||app.state.still)return;
 const b=mechanism.getBoundingClientRect(),x=(e.clientX-b.left)/b.width-.5,y=(e.clientY-b.top)/b.height-.5;
 mechanism.style.setProperty('--mx',(-y*7).toFixed(2)+'deg');mechanism.style.setProperty('--my',(x*7).toFixed(2)+'deg');
});
mechanism.addEventListener('pointerleave',()=>{mechanism.style.setProperty('--mx','0deg');mechanism.style.setProperty('--my','0deg');});
function addAwaken(){const id=app.state.selected;if(!id||!personas[id]||$('panel').classList.contains('hidden'))return;
 const actions=$('panelActions');if(actions.querySelector('.awaken-cocoon'))return;
 const b=document.createElement('button');b.className='awaken-cocoon';b.type='button';b.textContent='✧ Awaken '+personas[id].name;
 b.addEventListener('click',()=>openChamber(id));actions.prepend(b);
}
const title=$('panelTitle');new MutationObserver(()=>queueMicrotask(addAwaken)).observe(title,{childList:true,characterData:true,subtree:true});
document.addEventListener('click',e=>{if(e.target.closest('.world,.mobile-worlds button,.choice,#guide'))setTimeout(addAwaken,0);});
/* Independently animated luminous cocoon filaments, physically attached to
   the exact existing six world positions; no image backplate or global warp. */
const W=1536,H=1024,TAU=Math.PI*2,low=matchMedia('(max-width:720px)').matches||Number(navigator.hardwareConcurrency||8)<=4;
const dpr=Math.min(window.devicePixelRatio||1,low?.72:1.1);
scene.width=Math.round(W*dpr);scene.height=Math.round(H*dpr);ctx?.setTransform(dpr,0,0,dpr,0,0);
const ids=['aura','aureglossa','sessions','workshops','gestalt','journal'];
const nodes=ids.map((id,i)=>({id,x:app.worlds[id].x,y:app.worlds[id].y,r:114,c:personas[id].color,phase:i*1.79}));
let elapsed=0,last=0,lastPaint=0,raf=0;
function rgba(hex,a){const h=hex.slice(1);return 'rgba('+parseInt(h.slice(0,2),16)+','+parseInt(h.slice(2,4),16)+','+parseInt(h.slice(4,6),16)+','+a+')';}
function pathPoint(a,b,off,u,t,phase){const dx=b.x-a.x,dy=b.y-a.y,L=Math.max(1,Math.hypot(dx,dy)),nx=-dy/L,ny=dx/L;
 const wave=Math.sin(u*9+phase+t*.33)*off*Math.sin(Math.PI*u);
 return{x:a.x+dx*u+nx*wave,y:a.y+dy*u+ny*wave};}
function render(){
 if(!ctx)return;ctx.clearRect(0,0,W,H);ctx.globalCompositeOperation='screen';
 const frozen=app.state.still||document.hidden,t=elapsed,focus=app.state.selected;
 // The core remains materially connected to all six cocoons even in Stillness.
 for(const n of nodes){
  const active=focus===n.id||current===n.id,boost=active?1.55:1;
  const a={x:768,y:475},b={x:n.x,y:n.y},dx=b.x-a.x,dy=b.y-a.y;
  for(let strand=0;strand<(low?9:16);strand++){
   const phase=n.phase+strand*.67,off=(8+strand*1.8)*((strand%2)?1:-1);
   ctx.beginPath();
   for(let k=0;k<=22;k++){const u=k/22,p=pathPoint(a,b,off,u,t,phase);k?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y);}
   ctx.strokeStyle=rgba(strand%3===0?'#ffe7ba':n.c,(strand%4===0?.17:.052)*boost);
   ctx.lineWidth=strand%5===0?1.05:.47;ctx.stroke();
  }
  for(let petal=0;petal<(low?8:13);petal++){
   const ang=petal*TAU/(low?8:13)+n.phase;
   const breathe=frozen?1:1+.022*Math.sin(t*.38+n.phase+petal*.2);
   const r=n.r*breathe;
   const x=n.x+Math.cos(ang)*r*.69,y=n.y+Math.sin(ang)*r*.69;
   const tipX=n.x+Math.cos(ang+.22)*r*1.13,tipY=n.y+Math.sin(ang+.22)*r*1.13;
   ctx.beginPath();ctx.moveTo(x,y);
   ctx.bezierCurveTo(n.x+Math.cos(ang-.33)*r*.95,n.y+Math.sin(ang-.33)*r*.95,
    n.x+Math.cos(ang+.45)*r*1.22,n.y+Math.sin(ang+.45)*r*1.22,tipX,tipY);
   ctx.strokeStyle=rgba(n.c,(active?.29:.105)*(petal%3===0?1:.52));ctx.lineWidth=petal%3===0?1.3:.65;ctx.stroke();
  }
  // Sparse energy beads travel along actual strands and converge on selection.
  for(let k=0;k<(low?5:10);k++){
   const u=(k/(low?5:10)+t*(.022+.004*(k%3))+n.phase*.07)%1;
   const p=pathPoint(a,b,(k%2?-18:18),u,t,n.phase+k*.67);
   const rr=(k%4===0?1.55:.72)*(active?1.4:1);
   ctx.beginPath();ctx.arc(p.x,p.y,rr,0,TAU);
   ctx.fillStyle=rgba(k%3===0?'#ffedcb':n.c,(.2+.26*Math.sin(Math.PI*u))*(active?1.3:1));ctx.fill();
  }
 }
 ctx.globalCompositeOperation='source-over';
 scene.dataset.frames=String(++frameCount);
 scene.dataset.motion=app.state.still||document.hidden?'paused':'running';
 scene.dataset.material='six-cocoons-attached-filaments-v12';
}
function tick(now){raf=0;if(app.state.still||document.hidden){render();return;}
 if(now-lastPaint<34){raf=requestAnimationFrame(tick);return;}
 const dt=last?Math.min(.065,Math.max(0,(now-last)/1000)):.033;last=now;lastPaint=now;elapsed+=dt;render();raf=requestAnimationFrame(tick);
}
function refresh(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;if(app.state.still||document.hidden){render();return;}raf=requestAnimationFrame(tick);}
window.addEventListener('nexus:motion',refresh);window.addEventListener('nexus:focus',()=>{if(app.state.still)render();});
document.addEventListener('visibilitychange',refresh);window.addEventListener('pagehide',()=>{if(raf)cancelAnimationFrame(raf);raf=0;});
window.__SixAwakenings={open:openChamber,close:closeChamber,snapshot:()=>({worlds:ids.length,personas:Object.keys(personas),unlocked:[...unlocked],active:current,material:scene.dataset.material,frames:frameCount,storage:'session-memory-only',inference:false})};
refresh();
})();