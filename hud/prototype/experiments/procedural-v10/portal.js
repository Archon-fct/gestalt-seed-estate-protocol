/* Reversible dimensional crossing, v09. Never changes booking/payment links. */
(()=>{'use strict';
 const app=window.NexusApp;if(!app)return;
 const veil=document.createElement('div');veil.id='crossing';veil.setAttribute('aria-hidden','true');
 veil.innerHTML='<div class="crossing-iris"></div><div class="crossing-rays"></div><div class="crossing-title" id="crossingTitle"></div>';
 document.querySelector('.app').appendChild(veil);
 const reduce=matchMedia('(prefers-reduced-motion:reduce)');
 let busy=false;
 function go(link){if(busy)return;busy=true;
  const url=new URL(link.href,location.href);
  if(!url.searchParams.has('from'))url.searchParams.set('from','cinematic-v10');
  if(reduce.matches||app.state.still){location.assign(url.href);return;}
  const title=document.getElementById('panelTitle')?.textContent||'A living world';
  document.getElementById('crossingTitle').textContent=title;
  veil.classList.add('crossing-active');
  // A bounded, cancellable transition; no loading spinner or fake inference.
  window.setTimeout(()=>location.assign(url.href),720);
 }
 document.addEventListener('click',e=>{
  if(e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0)return;
  const link=e.target.closest?.('#panelActions a[href]');if(!link)return;
  const u=new URL(link.href,location.href);
  if(!u.pathname.endsWith('.html')||u.pathname.includes('booking-calendar')||!u.hostname.includes('wix-site-host.com'))return;
  e.preventDefault();go(link);
 },true);
 window.addEventListener('pageshow',()=>{busy=false;veil.classList.remove('crossing-active')});
})();
