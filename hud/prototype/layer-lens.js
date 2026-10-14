/* Archon layer lens — manual visual exploration, no sensing or persistence.
   Additive geometry only. Existing symbols, content and state remain authoritative. */
(()=>{'use strict';
const NS='http://www.w3.org/2000/svg';
function mount({target,after,label,color='#8cddd8'}){
 if(!target||!after||target.dataset.layerLens)return;
 target.dataset.layerLens='ready';
 const oldPosition=target.style.position;if(getComputedStyle(target).position==='static')target.style.position='relative';
 const art=document.createElementNS(NS,'svg');art.setAttribute('viewBox','0 0 300 300');art.setAttribute('aria-hidden','true');
 Object.assign(art.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',overflow:'hidden',zIndex:'0',color});
 const rings=[];for(let i=0;i<7;i++){const e=document.createElementNS(NS,'ellipse');e.setAttribute('fill','none');e.setAttribute('stroke','currentColor');e.setAttribute('stroke-width',i===3?'1.1':'.65');art.append(e);rings.push(e);}
 const axis=document.createElementNS(NS,'path');axis.setAttribute('fill','none');axis.setAttribute('stroke','currentColor');axis.setAttribute('stroke-width','.6');axis.setAttribute('opacity','.25');art.append(axis);target.append(art);
 const controls=document.createElement('details');controls.className='archon-layer-lens';
 controls.innerHTML='<summary></summary><div class="lens-controls"><label>Rotate layers <input type="range" min="-60" max="60" value="0" step="1"></label><label>Separate layers <input type="range" min="0" max="100" value="25" step="1"></label><button type="button">Reset view</button><small>Visual exploration · no measurements</small><button type="button" class="lens-close">Close layers</button></div>';
 controls.querySelector('summary').textContent=label+' · explore layers';after.after(controls);
 const [turn,spread]=controls.querySelectorAll('input');
 turn.setAttribute('aria-label',label+' layer rotation');spread.setAttribute('aria-label',label+' layer separation');
 function draw(){const a=Number(turn.value)*Math.PI/180,s=Number(spread.value)/100;
  const dx=Math.sin(a)*58*s,dy=24+62*s;
  rings.forEach((e,i)=>{const z=(i-3)/3;const x=150+dx*z,y=150+dy*z,r=82-Math.abs(z)*29;
   e.setAttribute('cx',x);e.setAttribute('cy',y);e.setAttribute('rx',r);e.setAttribute('ry',r*(.22+.18*Math.cos(a)));
   e.setAttribute('transform',`rotate(${Number(turn.value)*.28} ${x} ${y})`);e.setAttribute('opacity',String(.14+(1-Math.abs(z))*.23));
  });axis.setAttribute('d',`M ${150-dx} ${150-dy} Q ${150+dx*.6} 150 ${150+dx} ${150+dy}`);
  art.dataset.rotation=turn.value;art.dataset.separation=spread.value;
 }
 turn.addEventListener('input',draw);spread.addEventListener('input',draw);
 controls.querySelector('.lens-close').onclick=()=>{controls.open=false;controls.querySelector('summary').focus();};
 controls.querySelector('button').onclick=()=>{turn.value='0';spread.value='25';draw();};draw();
 // All movement is explicit input: no RAF, autoplay, transitions or hidden work.
 return {destroy(){art.remove();controls.remove();delete target.dataset.layerLens;target.style.position=oldPosition;}};
}
if(!document.getElementById('archon-layer-lens-style')){const style=document.createElement('style');style.id='archon-layer-lens-style';style.textContent=`.archon-layer-lens{position:relative;z-index:4;margin:12px 0;color:inherit;font:12px/1.5 system-ui,sans-serif}.archon-layer-lens summary{cursor:pointer;min-height:44px;display:flex;align-items:center;border-bottom:1px solid #8bcaca40;letter-spacing:.05em}.lens-controls{position:fixed;z-index:150;right:18px;bottom:78px;width:min(290px,calc(100vw - 36px));max-height:55vh;overflow:auto;display:grid;gap:4px;padding:14px;background:#08111af5;border:1px solid #8bcaca55;border-radius:14px;box-shadow:0 12px 40px #0008}.lens-controls label{display:grid;gap:2px}.lens-controls input{width:100%;min-height:44px;accent-color:#97d6d5}.lens-controls button{min-height:44px;background:#101923;color:#e5e8e5;border:1px solid #8bcaca55;border-radius:8px}.lens-controls small{opacity:.7}.archon-layer-lens :focus-visible{outline:2px solid #f1d597;outline-offset:3px}`;document.head.append(style);}
mount({target:document.querySelector('.field .body'),after:document.querySelector('.copy .journey'),label:'Aura Dynamics',color:'#91dfcc'});
mount({target:document.querySelector('.archive .core'),after:document.querySelector('.intro .actions'),label:'Gestalt',color:'#cfb3ee'});
mount({target:document.querySelector('.iris-shell'),after:document.querySelector('#iris-state'),label:'Nox iris',color:'#82dff2'});
mount({target:document.querySelector('.dnd-threshold'),after:document.querySelector('#dnd-profile-hud'),label:'Character aura',color:'#d9c4f1'});
})();
