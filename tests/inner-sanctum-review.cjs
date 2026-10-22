/* DOM simulation only: this suite does not render CSS or exercise Wix's backend. */
const { JSDOM } = require(process.env.JSDOM_PATH || 'jsdom');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(process.env.SANCTUM_SOURCE || path.join(root, 'wix/inner-sanctum-packages-live.js'), 'utf8');
const names = ['Package of 10', 'Package of 20', 'Familiar #1', 'Familiar #2', 'Speciality Familiar'];
const amounts = ['1,800', '3,500', '49.99', '99', '199'];
// Minimal public Wix data-hook contract. Values observed on the live site 2026-10-21.
const markup = names.map((name, i) => `<li data-hook="plan"><h2 data-hook="plan-title">${name}</h2><span data-hook="price-currency">$</span><span data-hook="price-amount">${amounts[i]}</span><span data-hook="plan-recurrence">${i > 1 ? 'Every month' : '&nbsp;'}</span><div data-hook="plan-tagline">Fixture description ${i}</div><ul><li data-hook="benefit">Fixture benefit ${i}</li></ul><button data-hook="plan-cta" aria-disabled="false">Select</button></li>`).join('');
function fixture({ route = '/pricing-plans/plans-pricing', publicScope = true, before } = {}) {
  const dom = new JSDOM(`<!doctype html><html class="${publicScope ? 'as-public' : ''}"><head></head><body><header><a id="nav" href="/services">Sessions</a></header><div id="as-public-banner">Native banner</div><main id="PAGES_CONTAINER"><ul>${markup}</ul></main><footer id="site-footer">Footer</footer></body></html>`, {url:'https://fixture.invalid'+route, runScripts:'outside-only', pretendToBeVisual:true});
  const w = dom.window, d = w.document;
  const calls = Array(5).fill(0), intervals = [], timers = new Map(), mediaListeners = [];
  let sequence=0;
  const media = {matches:false, addEventListener:(_,fn)=>mediaListeners.push(fn)};
  w.matchMedia=()=>media;
  w.setInterval=fn=>{intervals.push(fn);return ++sequence};
  w.setTimeout=(fn,ms)=>{const id=++sequence;timers.set(id,{fn,ms});return id};
  w.clearTimeout=id=>timers.delete(id);
  w.HTMLElement.prototype.scrollIntoView=function(options){this.lastScroll=options};
  const native=[...d.querySelectorAll('button[data-hook="plan-cta"]')];
  native.forEach((button,i)=>button.addEventListener('click',()=>calls[i]++));
  if(before) before(w,d);
  w.eval(source);
  return {dom,w,d,calls,native,timers,media,host:()=>d.getElementById('as-inner-sanctum'),shadow:()=>d.getElementById('as-inner-sanctum')?.shadowRoot,
    tick:()=>intervals.forEach(fn=>fn()),route:p=>{w.history.pushState({},'',p);intervals.forEach(fn=>fn())},reduce:v=>{media.matches=v;mediaListeners.forEach(fn=>fn())}};
}
const results=[];
function test(name,fn){let f;try{f=fixture();fn(f);results.push({name,status:'PASS'})}catch(e){results.push({name,status:'FAIL',error:e.message})}finally{f?.dom.window.close()}}
test('Five public plans preserve live amounts, names, and native nodes',f=>{assert.equal(f.shadow().querySelectorAll('[data-plan]').length,5);assert.deepEqual([...f.shadow().querySelectorAll('.plan h3')].map(x=>x.textContent),names);amounts.forEach((v,i)=>assert.ok(f.shadow().querySelectorAll('.price')[i].textContent.includes('$'+v)));f.native.forEach(n=>assert.ok(n.isConnected));});
for(let i=0;i<5;i++)test('Delegates once to original '+names[i],f=>{f.shadow().querySelector(`[data-plan="${i}"]`).click();assert.deepEqual(f.calls,Array.from({length:5},(_,j)=>Number(i===j)));f.shadow().querySelector(`[data-plan="${(i+1)%5}"]`).click();assert.equal(f.calls.reduce((a,b)=>a+b),1);});
test('Changed price between render and click opens native fallback without checkout',f=>{f.d.querySelector('[data-hook="price-amount"]').textContent='1,999';f.shadow().querySelector('[data-plan="0"]').click();assert.equal(f.calls.reduce((a,b)=>a+b),0);assert.equal(f.host(),null);assert.equal(f.d.activeElement.dataset.hook,'plan-title');});
test('Changed recurrence between render and click never delegates unseen terms',f=>{f.d.querySelectorAll('[data-hook="plan-recurrence"]')[2].textContent='Every year';f.shadow().querySelector('[data-plan="2"]').click();assert.equal(f.calls[2],0);assert.equal(f.host(),null);});
test('Native recurrence is preserved rather than forced to monthly',f=>{f.dom.window.close();const g=fixture({before:(w,d)=>d.querySelectorAll('[data-hook="plan-recurrence"]')[2].textContent='Every year'});try{assert.ok(g.shadow().querySelectorAll('.price')[2].textContent.includes('Every year'));assert.ok(!g.shadow().querySelectorAll('.price')[0].textContent.includes('month'));}finally{g.dom.window.close()}});
test('Unavailable native button fails back without a click',f=>{f.native[1].disabled=true;f.shadow().querySelector('[data-plan="1"]').click();assert.equal(f.calls[1],0);assert.equal(f.host(),null);});
test('Replacing a native control uses the fresh bound control',f=>{const n=f.native[0].cloneNode(true);let fresh=0;n.addEventListener('click',()=>fresh++);f.native[0].replaceWith(n);f.shadow().querySelector('[data-plan="0"]').click();assert.equal(f.calls[0],0);assert.equal(fresh,1);});
test('Standard selector stays visible through polling and preserves nodes',f=>{f.shadow().querySelector('[data-original]').click();f.tick();assert.equal(f.host(),null);assert.ok(!f.d.documentElement.classList.contains('as-sanctum-active'));f.native.forEach(n=>assert.ok(n.isConnected));});
test('Services and checkout remove all candidate integration state; reentry remounts',f=>{for(const p of ['/services','/checkout']){f.route(p);assert.equal(f.host(),null);assert.equal(f.d.getElementById('as-sanctum-integration-style'),null);assert.ok(!f.d.documentElement.classList.contains('as-sanctum-active'));f.route('/pricing-plans/plans-pricing');assert.ok(f.host());}assert.equal(f.d.getElementById('nav').getAttribute('href'),'/services');assert.equal(f.d.getElementById('site-footer').textContent,'Footer');});
test('Exact pathname and public scope required on initial load',f=>{for(const options of [{route:'/services'},{route:'/pricing-plans/plans-pricing-other'},{publicScope:false}]){const g=fixture(options);assert.equal(g.host(),null);g.dom.window.close();}});
test('Duplicate initializer mounts exactly one view',f=>{f.w.eval(source);assert.equal(f.d.querySelectorAll('#as-inner-sanctum').length,1);});
test('Stillness and reduced-motion DOM states stay synchronized',f=>{const button=f.shadow().querySelector('[data-stillness]');button.click();assert.equal(f.host().dataset.still,'true');assert.equal(button.getAttribute('aria-pressed'),'true');button.click();assert.equal(f.host().dataset.still,'false');f.reduce(true);assert.equal(f.host().dataset.still,'true');f.reduce(false);assert.equal(f.host().dataset.still,'false');});
test('Section activation moves focus to matching heading',f=>{f.shadow().querySelector('[data-jump="familiars"]').click();assert.equal(f.shadow().activeElement.textContent,'Familiar Plans');});
test('Timeout restores native selector without repeating delegation',f=>{f.shadow().querySelector('[data-plan="0"]').click();[...f.timers.values()].find(t=>t.ms===10000).fn();assert.equal(f.host(),null);assert.equal(f.calls[0],1);});
test('Missing or duplicate plan names fail closed',f=>{for(const kind of ['missing','duplicate']){const g=fixture({before:(w,d)=>{const p=d.querySelectorAll('[data-hook="plan-title"]');if(kind==='missing')p[4].closest('[data-hook="plan"]').remove();else p[4].textContent=names[0]}});assert.equal(g.host(),null);g.dom.window.close();}});
test('Wix text is escaped in presentation',f=>{f.dom.window.close();const g=fixture({before:(w,d)=>d.querySelector('[data-hook="plan-tagline"]').textContent='<img src=x onerror=alert(1)>'});assert.equal(g.shadow().querySelectorAll('.plan img').length,0);assert.ok(g.shadow().querySelector('.plan p').textContent.includes('<img'));g.dom.window.close();});
const output={scope:'Node/jsdom DOM simulation; no layout, real keyboard, animation timing, Safari, or Wix backend validation',source:process.env.SANCTUM_SOURCE||'wix/inner-sanctum-packages-live.js',passed:results.filter(x=>x.status==='PASS').length,failed:results.filter(x=>x.status==='FAIL').length,results};
console.log(JSON.stringify(output,null,2));
process.exitCode=output.failed?1:0;
