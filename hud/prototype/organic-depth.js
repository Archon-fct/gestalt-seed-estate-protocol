/* Living Nexus — organic depth renderer v0.2
 * Functional worlds, state, and navigation stay in index.html.
 * This module only reads positions/classes and paints noninteractive SVG.
 * No input capture, network, local storage, or audio.
 */
const space=document.querySelector("#space");
const nexus=space?.querySelector(".nexus");
const nodes=Array.from(space?.querySelectorAll(":scope>.node[data-id]")||[]);
const NS="http://www.w3.org/2000/svg";
const hues={
  aura:"#83e9cf",
  aureglossa:"#86bcff",
  services:"#f3cc92",
  gestalt:"#bda3ff",
  journal:"#a69cff",
  workshops:"#f1b67a"
};
const anchors={aura:0,aureglossa:1.35,services:2.63,gestalt:3.97,journal:5.15,workshops:6.52};
if(space && nexus && nodes.length===6){
  const svg=document.createElementNS(NS,"svg");
  svg.setAttribute("class","organic-depth-field");
  svg.setAttribute("aria-hidden","true");
  svg.setAttribute("focusable","false");
  svg.setAttribute("role","presentation");
  space.insertBefore(svg,space.querySelector(".relational-threads")||space.firstChild);
  let pending=false;
  const r=(n)=>Math.round(n*10)/10;
  const centerOf=(el,parent)=>{
    const a=el.getBoundingClientRect(), b=parent.getBoundingClientRect();
    return {x:a.left-b.left+a.width/2,y:a.top-b.top+a.height/2,rad:Math.max(a.width,a.height)/2};
  };
  // Sampled elliptical membranes are deliberately asymmetric. The deterministic
  // harmonics keep paths stable through resizing: no flicker or random rebuilding.
  function contour(x,y,rx,ry,seed=0){
    const points=[];
    for(let i=0;i<48;i++){
      const a=2*Math.PI*i/48;
      const f=1+.058*Math.sin(3*a+seed*1.47)+.037*Math.sin(5*a-seed*.82)
               +.025*Math.cos(8*a+seed*.52);
      points.push([x+Math.cos(a)*rx*f,y+Math.sin(a)*ry*f]);
    }
    let d="";
    for(let i=0;i<points.length;i++){
      const cur=points[i],prev=points[(i+points.length-1)%points.length],next=points[(i+1)%points.length];
      const begin=[(prev[0]+cur[0])/2,(prev[1]+cur[1])/2];
      const end=[(next[0]+cur[0])/2,(next[1]+cur[1])/2];
      if(i===0)d="M"+r(begin[0])+" "+r(begin[1]);
      d+="Q"+r(cur[0])+" "+r(cur[1])+" "+r(end[0])+" "+r(end[1]);
    }
    return d+"Z";
  }
  function nerve(a,b,bend=0){
    const dx=b.x-a.x,dy=b.y-a.y,L=Math.max(1,Math.hypot(dx,dy));
    const nx=-dy/L,ny=dx/L;
    return "M"+r(a.x)+" "+r(a.y)+" C"+
      r(a.x+dx*.30+nx*bend)+" "+r(a.y+dy*.30+ny*bend)+" "+
      r(a.x+dx*.73-nx*bend*.62)+" "+r(a.y+dy*.73-ny*bend*.62)+" "+
      r(b.x)+" "+r(b.y);
  }
  function defBlock(){
    const defs=[
      '<defs>',
      '<radialGradient id="organNexusWash" cx="48%" cy="46%" r="64%"><stop stop-color="#f6dca8" stop-opacity=".44"/><stop offset=".35" stop-color="#84d4ce" stop-opacity=".22"/><stop offset=".7" stop-color="#a693ef" stop-opacity=".09"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>',
      '<linearGradient id="organFilament" x1="0%" y1="15%" x2="100%" y2="82%"><stop stop-color="#85d7c9" stop-opacity=".28"/><stop offset=".46" stop-color="#fff1c8" stop-opacity=".83"/><stop offset=".82" stop-color="#b3a2ee" stop-opacity=".54"/><stop offset="1" stop-color="#8cdded" stop-opacity=".18"/></linearGradient>',
      '<filter id="organSoftGlow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="6"/></filter>'
    ];
    for(const [id,c] of Object.entries(hues)){
      defs.push('<radialGradient id="organWash-'+id+'" cx="38%" cy="32%" r="72%"><stop stop-color="#fff6dc" stop-opacity=".14"/><stop offset=".30" stop-color="'+c+'" stop-opacity=".24"/><stop offset=".68" stop-color="'+c+'" stop-opacity=".08"/><stop offset="1" stop-color="'+c+'" stop-opacity="0"/></radialGradient>');
    }
    // ORGANIC_REFERENCE_V04 — translated from five user-provided visual touchstones.
    // Only abstract visual qualities are used. No imported art or pseudo-script.
    defs.push('<radialGradient id="organAmbient" cx="48%" cy="49%" r="61%"><stop stop-color="#69d9d4" stop-opacity=".20"/><stop offset=".24" stop-color="#7c82c5" stop-opacity=".13"/><stop offset=".55" stop-color="#b777ca" stop-opacity=".07"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>');
    defs.push('<radialGradient id="organViscera" cx="45%" cy="32%" r="75%"><stop stop-color="#fff8da" stop-opacity=".48"/><stop offset=".14" stop-color="#f1b88e" stop-opacity=".31"/><stop offset=".36" stop-color="#88ead8" stop-opacity=".42"/><stop offset=".59" stop-color="#a99bed" stop-opacity=".37"/><stop offset=".84" stop-color="#423b90" stop-opacity=".21"/><stop offset="1" stop-color="#1c1942" stop-opacity="0"/></radialGradient>');
    defs.push('<linearGradient id="organIridescence" x1="0%" y1="8%" x2="98%" y2="95%"><stop stop-color="#73dded" stop-opacity=".25"/><stop offset=".23" stop-color="#c8affc" stop-opacity=".58"/><stop offset=".49" stop-color="#fff0c5" stop-opacity=".72"/><stop offset=".7" stop-color="#86edcd" stop-opacity=".64"/><stop offset=".9" stop-color="#9c80f1" stop-opacity=".35"/><stop offset="1" stop-color="#f5bb80" stop-opacity=".14"/></linearGradient>');
    defs.push('<filter id="organVolumeBloom" x="-65%" y="-65%" width="230%" height="230%"><feGaussianBlur stdDeviation="12"/></filter>');
    for(const [id,c] of Object.entries(hues)){
      defs.push('<linearGradient id="organRiver-'+id+'" x1="0%" y1="9%" x2="100%" y2="91%"><stop stop-color="#81d5e9" stop-opacity=".24"/><stop offset=".22" stop-color="'+c+'" stop-opacity=".75"/><stop offset=".42" stop-color="#f7e4bd" stop-opacity=".83"/><stop offset=".7" stop-color="#ae98fa" stop-opacity=".69"/><stop offset="1" stop-color="'+c+'" stop-opacity=".3"/></linearGradient>');
      defs.push('<radialGradient id="organBody-'+id+'" cx="38%" cy="40%" r="68%"><stop stop-color="#fff7d9" stop-opacity=".21"/><stop offset=".28" stop-color="'+c+'" stop-opacity=".5"/><stop offset=".53" stop-color="'+c+'" stop-opacity=".23"/><stop offset="1" stop-color="'+c+'" stop-opacity="0"/></radialGradient>');
    }
    defs.push('</defs>');
    return defs.join("");
  }
  function draw(){
    if(!space.isConnected)return;
    const bounds=space.getBoundingClientRect();
    const W=Math.max(1,Math.round(bounds.width)),H=Math.max(1,Math.round(bounds.height));
    const core=centerOf(nexus,space);
    const world=nodes.map(node=>({id:node.dataset.id,node,...centerOf(node,space)}));
    svg.setAttribute("viewBox","0 0 "+W+" "+H);
    svg.setAttribute("preserveAspectRatio","none");
    const base=Math.max(64,core.rad);
    const all=[defBlock()];
    // The luminous vessel is atmospheric; black negative space keeps controls clear.
    all.push('<g class="organ-ambient-pool" aria-hidden="true">');
    all.push('<ellipse class="organ-ambient-cloud" cx="'+r(core.x)+'" cy="'+r(core.y)+'" rx="'+r(Math.min(W*.37,440))+'" ry="'+r(Math.min(H*.43,360))+'" fill="url(#organAmbient)"/>');
    all.push('</g>');
    // Diffuse ribbons follow the central field without covering the negative space.
    all.push('<g class="organ-breathscape" aria-hidden="true">');
    const sweep1="M"+r(W*.025)+" "+r(H*.70)+" C"+r(W*.24)+" "+r(H*.40)+" "+r(core.x-W*.19)+" "+r(core.y+H*.23)+" "+r(core.x)+" "+r(core.y)+" S"+r(W*.83)+" "+r(H*.15)+" "+r(W*.975)+" "+r(H*.34);
    const sweep2="M"+r(W*.025)+" "+r(H*.27)+" C"+r(W*.32)+" "+r(H*.55)+" "+r(core.x-W*.16)+" "+r(core.y-H*.2)+" "+r(core.x)+" "+r(core.y)+" S"+r(W*.77)+" "+r(H*.88)+" "+r(W*.98)+" "+r(H*.76);
    all.push('<path class="organ-fog" stroke="url(#organFilament)" d="'+sweep1+'"/><path class="organ-fog" stroke="url(#organFilament)" d="'+sweep2+'" opacity=".64"/>');
    all.push('</g><g class="organ-neural-web" aria-hidden="true">');
    // Source and endpoints come from the actual live node rectangles.
    for(const item of world){
      const dx=item.x-core.x,dy=item.y-core.y,len=Math.max(1,Math.hypot(dx,dy));
      const u={x:dx/len,y:dy/len};
      const start={x:core.x+u.x*base*.94,y:core.y+u.y*base*.94};
      const end={x:item.x-u.x*item.rad*.9,y:item.y-u.y*item.rad*.9};
      const bend=(item.id==="aura"?1:item.id==="journal"?-1:1)*(11+Math.min(len*.085,32))*(["aureglossa","gestalt","journal"].includes(item.id)?-1:1);
      const cls="organ-connection world-"+item.id+(item.node.classList.contains("visited")?" is-visited":"")+
        (item.node.matches(".resonant,.recommended,.search-hit")?" is-responsive":"")+
        (item.node.matches(".deemphasized,.search-dim")?" is-muted":"");
      all.push('<g class="'+cls+'" data-world="'+item.id+'">');
      // Liquid spectral material: diffuse body, translucent sheet, and hairline current.
      // It joins the real control positions; it cannot become detached concept art.
      const river=nerve(start,end,bend*1.85);
      const tributary=nerve(start,end,-bend*1.15);
      const riverStroke='url(#organRiver-'+item.id+')';
      all.push('<path class="organ-river-halo" stroke="'+riverStroke+'" d="'+river+'"/>');
      all.push('<path class="organ-river-sheet" stroke="'+riverStroke+'" d="'+river+'"/>');
      all.push('<path class="organ-river-light" stroke="#ffefc7" d="'+river+'"/>');
      all.push('<path class="organ-river-tributary" stroke="'+hues[item.id]+'" d="'+tributary+'"/>');
      all.push('<path class="organ-fog" stroke="'+hues[item.id]+'" d="'+nerve(start,end,bend)+'"/>');
      all.push('<path class="organ-fiber" stroke="url(#organFilament)" d="'+nerve(start,end,bend*.75)+'"/>');
      all.push('<path class="organ-fiber" stroke="'+hues[item.id]+'" stroke-opacity=".38" stroke-width=".8" d="'+nerve(start,end,-bend*.75)+'"/>');
      all.push('<path class="organ-flow" stroke="url(#organFilament)" d="'+nerve(start,end,bend*.75)+'"/>');
      all.push('</g>');
    }
    // Quiet adjacent-world relationships give a spatial web, not isolated menu circles.
    const sorted=world.slice().sort((a,b)=>Math.atan2(a.y-core.y,a.x-core.x)-Math.atan2(b.y-core.y,b.x-core.x));
    sorted.forEach((a,i)=>{
      const b=sorted[(i+1)%sorted.length];
      const ang= Math.atan2(a.y-core.y,a.x-core.x), ang2=Math.atan2(b.y-core.y,b.x-core.x);
      const v={x:a.x+Math.cos(ang)*a.rad*.89,y:a.y+Math.sin(ang)*a.rad*.89};
      const w={x:b.x+Math.cos(ang2)*b.rad*.89,y:b.y+Math.sin(ang2)*b.rad*.89};
      all.push('<path class="organ-fiber organ-neighbor" stroke="url(#organFilament)" d="'+nerve(v,w,32)+'"/>');
    });
    all.push('</g>');
    // Living center: asymmetric auric shells layered underneath the intact Nexus.
    all.push('<g class="organ-core" aria-hidden="true">');
    [
      {scale:2.45,seed:1.15,stroke:"#a2a6ef",cls:"outer"},
      {scale:1.93,seed:2.8,stroke:"#7ed5d1",cls:"middle"},
      {scale:1.44,seed:4.35,stroke:"#f8e3af",cls:"inner"}
    ].forEach((q)=>{
      const d=contour(core.x,core.y,base*q.scale,base*q.scale*(q.scale===2.45?1.25:1.17),q.seed);
      all.push('<path class="organ-core-membrane '+q.cls+'" fill="url(#organNexusWash)" stroke="'+q.stroke+'" d="'+d+'"/>');
      if(q.cls==="middle")all.push('<path class="organ-core-light" stroke="#f2dfb5" d="'+d+'"/>');
    });
    // An asymmetrical, luminous organ-like vessel: IMG_2740 (held light) and
    // IMG_2744 (living spectrum) translated to an abstract meeting field.
    // This is not a anatomical illustration or an identity/diagnostic inference.
    const x=core.x,y=core.y,rad=base;
    const heartD='M'+r(x-rad*.12)+' '+r(y-rad*1.3)
      +' C'+r(x-rad*.84)+' '+r(y-rad*1.72)+' '+r(x-rad*1.20)+' '+r(y-rad*.72)+' '+r(x-rad*.84)+' '+r(y-rad*.04)
      +' C'+r(x-rad*1.23)+' '+r(y+rad*.60)+' '+r(x-rad*.57)+' '+r(y+rad*1.22)+' '+r(x-rad*.11)+' '+r(y+rad*1.56)
      +' C'+r(x+rad*.32)+' '+r(y+rad*1.7)+' '+r(x+rad*1.09)+' '+r(y+rad*.62)+' '+r(x+rad*.74)+' '+r(y-rad*.05)
      +' C'+r(x+rad*1.24)+' '+r(y-rad*.96)+' '+r(x+rad*.44)+' '+r(y-rad*1.47)+' '+r(x-rad*.12)+' '+r(y-rad*1.3)+' Z';
    all.push('<g class="organ-heart-matrix" aria-hidden="true">');
    all.push('<path class="organ-heart-aura" d="'+heartD+'" fill="url(#organViscera)" stroke="url(#organIridescence)"/>');
    all.push('<path class="organ-heart-vein" stroke="#86e5d4" d="'+nerve({x:x-rad*.36,y:y-rad*.76},{x:x+rad*.08,y:y+rad*.97},rad*.26)+'"/>');
    all.push('<path class="organ-heart-vein organ-heart-vein-secondary" stroke="#f8c69d" d="'+nerve({x:x+rad*.53,y:y-rad*.6},{x:x-rad*.22,y:y+rad*.69},-rad*.24)+'"/>');
    all.push('</g>');
    // Tangential caustics bend through different depths of the central auric field.
    const caustics=[
      [ {x:core.x-base*2.1,y:core.y-base*.62}, {x:core.x+base*1.94,y:core.y+base*.58}, -base*.84, "#b8eae1" ],
      [ {x:core.x-base*1.8,y:core.y+base*.92}, {x:core.x+base*1.73,y:core.y-base*.83}, base*.9, "#ffebbe" ],
      [ {x:core.x-base*.84,y:core.y-base*1.82}, {x:core.x+base*.95,y:core.y+base*1.75}, base*.72, "#c4b4ff" ]
    ];
    caustics.forEach(([a,b,bend,color],i)=>{
      const d=nerve(a,b,bend);
      all.push('<path class="organ-wisp-bloom" stroke="'+color+'" d="'+d+'"/>');
      all.push('<path class="organ-wisp organ-core-wisp'+(i===2?' secondary':'')+'" stroke="'+color+'" d="'+d+'"/>');
    });
    all.push('</g><g class="organ-worlds" aria-hidden="true">');
    world.forEach(item=>{
      const c=hues[item.id],key=anchors[item.id]||0;
      const active=item.node.matches(".resonant,.recommended,.search-hit");
      const dimmed=item.node.matches(".deemphasized,.search-dim");
      const visited=item.node.classList.contains("visited");
      const classes="organ-cell world-"+item.id+(active?" is-responsive":"")+(dimmed?" is-muted":"")+(visited?" is-visited":"");
      // World radii scale with the real interactive target and stay behind it.
      // A distinct axial ratio and contour seed keeps each pocket non-identical.
      const w=item.rad*1.72,h=item.rad*(1.55+.19*Math.sin(key));
      const outer=contour(item.x,item.y,w*1.26,h*1.20,key+1.1);
      const inner=contour(item.x,item.y,w*.99,h*.96,key+3.3);
      const rim=contour(item.x,item.y,w*1.09,h*1.08,key+2.7);
      all.push('<g class="'+classes+'" data-world="'+item.id+'">');
      // Materialized living membrane, no rectangular card and no static image.
      all.push('<path class="organ-world-volume" fill="url(#organBody-'+item.id+')" d="'+outer+'"/>');
      all.push('<path class="organ-veil outer" fill="url(#organWash-'+item.id+')" stroke="'+c+'" d="'+outer+'"/>');
      all.push('<path class="organ-veil inner" fill="url(#organWash-'+item.id+')" stroke="'+c+'" d="'+inner+'"/>');
      all.push('<path class="organ-caustic" stroke="'+c+'" d="'+rim+'"/>');
      // Irregular folds of colored light: inside the membrane rather than rings.
      const sideA={x:item.x-w*.87,y:item.y-h*.22};
      const sideB={x:item.x+w*.87,y:item.y+h*.13};
      const across=nerve(sideA,sideB,-h*.56);
      const across2=nerve({x:item.x-w*.76,y:item.y+h*.35},
                           {x:item.x+w*.74,y:item.y-h*.27},h*.48);
      all.push('<path class="organ-tissue-glow" stroke="url(#organRiver-'+item.id+')" d="'+across+'"/>');
      all.push('<path class="organ-tissue-ribbon" stroke="url(#organRiver-'+item.id+')" d="'+across+'"/>');
      all.push('<path class="organ-wisp-bloom" stroke="'+c+'" d="'+across+'"/>');
      all.push('<path class="organ-wisp" stroke="'+c+'" d="'+across+'"/>');
      all.push('<path class="organ-wisp secondary" stroke="#fceac6" d="'+across2+'"/>');
      // Abstract watchful apertures translate IMG_2743/44's awareness language.
      // These are small optical lenses, never invented written glyphs or trackers.
      const ex=item.x+w*.67,ey=item.y-h*.63,ew=Math.max(8,item.rad*.21);
      const lens='M'+r(ex-ew)+' '+r(ey)
        +' Q'+r(ex)+' '+r(ey-ew*.9)+' '+r(ex+ew)+' '+r(ey)
        +' Q'+r(ex)+' '+r(ey+ew*.9)+' '+r(ex-ew)+' '+r(ey)+' Z';
      all.push('<g class="organ-aperture" aria-hidden="true">');
      all.push('<path class="organ-aperture-fold" d="'+lens+'" fill="url(#organBody-'+item.id+')" stroke="'+c+'"/>');
      all.push('<circle class="organ-aperture-core" cx="'+r(ex)+'" cy="'+r(ey)+'" r="'+r(ew*.27)+'" fill="#fff4d7" stroke="'+c+'"/>');
      all.push('</g>');
      all.push('</g>');
    });
    all.push('</g>');
    svg.innerHTML=all.join("");
  }
  function schedule(){
    if(pending)return;
    pending=true;
    requestAnimationFrame(()=>{pending=false;draw();});
  }
  const observer=new MutationObserver(()=>schedule());
  for(const node of nodes)observer.observe(node,{attributes:true,attributeFilter:["class"]});
  observer.observe(space,{attributes:true,attributeFilter:["class"]});
  window.addEventListener("resize",schedule,{passive:true});
  window.addEventListener("orientationchange",schedule,{passive:true});
  document.addEventListener("visibilitychange",()=>{
    svg.style.animationPlayState=document.hidden?"paused":"running";
  });
  if("ResizeObserver" in window){
    const ro=new ResizeObserver(schedule);
    ro.observe(space);ro.observe(nexus);
  }
  // During dimensional crossings, endpoints are animated by the existing engine.
  // Re-sample a few frames only at those transitions; never run an idle JS loop.
  space.addEventListener("transitionend",schedule,{passive:true});
  nodes.forEach(n=>n.addEventListener("transitionend",schedule,{passive:true}));
  schedule();
}
