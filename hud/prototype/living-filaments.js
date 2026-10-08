// Decorative living-field filaments. Uses real DOM positions, never intercepts controls.
const stage=document.querySelector('#space');
const ns='http://www.w3.org/2000/svg';
const svg=document.createElementNS(ns,'svg');
svg.classList.add('living-filaments');
svg.setAttribute('aria-hidden','true');
stage.insertBefore(svg,stage.querySelector('.nerve-field'));
const colors={aura:'#83e3d0',aureglossa:'#7eaeff',services:'#f4c68a',workshops:'#e5b67b',gestalt:'#b59cff',journal:'#c5a2ff'};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function path(d,klass,color,opacity){
 const el=document.createElementNS(ns,'path');
 el.setAttribute('d',d);el.setAttribute('class',klass);
 el.setAttribute('stroke',color);el.setAttribute('opacity',String(opacity));
 return el;
}
function redraw(){
 const bounds=stage.getBoundingClientRect(),w=bounds.width,h=bounds.height;
 svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
 const center=stage.querySelector('.nexus').getBoundingClientRect();
 const cx=center.left-bounds.left+center.width/2,cy=center.top-bounds.top+center.height/2;
 const frag=document.createDocumentFragment();
 for(const [index,node] of [...stage.querySelectorAll('.node')].entries()){
   const rect=node.getBoundingClientRect(),x=rect.left-bounds.left+rect.width/2,y=rect.top-bounds.top+rect.height/2;
   const dx=x-cx,dy=y-cy,dist=Math.hypot(dx,dy)||1,nx=-dy/dist,ny=dx/dist;
   const tone=colors[node.dataset.id]||'#e5c68a';
   for(let j=-3;j<=3;j++){
     const sway=j*12,controlX=(cx+x)/2+nx*(sway+Math.sin(index*2+j)*18),controlY=(cy+y)/2+ny*(sway+Math.cos(index+j)*14);
     const d=`M ${cx+nx*j*3} ${cy+ny*j*3} Q ${controlX} ${controlY} ${x+nx*j*2} ${y+ny*j*2}`;
     frag.appendChild(path(d,j%2===0?'membrane':'stream',j%2===0?'#f7d9a4':tone,j===0?.7:.34));
   }
   const d=`M ${cx} ${cy} Q ${(cx+x)/2+nx*25} ${(cy+y)/2+ny*25} ${x} ${y}`;
   frag.appendChild(path(d,'pulse',tone,.7));
   for(let k=0;k<3;k++){
     const rx=rect.width*(.57+k*.11),ry=rect.height*(.54+k*.1);
     const ell=document.createElementNS(ns,'ellipse');
     ell.setAttribute('cx',x);ell.setAttribute('cy',y);ell.setAttribute('rx',rx);ell.setAttribute('ry',ry);
     ell.setAttribute('class','halo');ell.setAttribute('stroke',k===0?tone:'#f4d5a3');
     frag.appendChild(ell);
   }
 }
 // Two large field membranes unite the whole constellation.
 for(let k=0;k<3;k++){
   const ellipse=document.createElementNS(ns,'ellipse');
   ellipse.setAttribute('cx',cx);ellipse.setAttribute('cy',cy);
   ellipse.setAttribute('rx',Math.min(w*.43,600)+k*13);
   ellipse.setAttribute('ry',Math.min(h*.38,380)+k*11);
   ellipse.setAttribute('class','halo');ellipse.setAttribute('stroke',k%2?'#80b9da':'#dfb77c');
   ellipse.setAttribute('opacity',String(.15-k*.03));
   frag.appendChild(ellipse);
 }
 svg.replaceChildren(frag);
}
let scheduled=false;
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;redraw()})}
window.addEventListener('resize',schedule,{passive:true});
if('ResizeObserver' in window)new ResizeObserver(schedule).observe(stage);
schedule();
