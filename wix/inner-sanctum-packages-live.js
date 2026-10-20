/* Inner Sanctum Packages 1.0.0. Additive presentation; native Wix plans own checkout.
   No accounts, prices, subscriptions, or site routing are written by this code. */
(() => {
  'use strict';
  const KEY = '__ARCHON_SANCTUM_PACKAGES_V1';
  if (window[KEY]) return;
  window[KEY] = true;
  const PATH = '/pricing-plans/plans-pricing';
  const VERSION = 'inner-sanctum-packages-1.1.0-visual-review';
  const NAMES = ['Package of 10', 'Package of 20', 'Familiar #1', 'Familiar #2', 'Speciality Familiar'];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  let host = null, sheet = null, bypass = false, selected = false, paused = false;
  let previousPath = '', signature = '', pending = 0, retryAt = 0;
  const text = (node, selector) => (node.querySelector(selector)?.textContent || '').trim();
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const currentPath = () => location.pathname.replace(/\/$/, '') || '/';
  const eligible = () => currentPath() === PATH && root.classList.contains('as-public');
  function readPlans() {
    const nodes = [...document.querySelectorAll('#PAGES_CONTAINER [data-hook="plan"]')];
    if (nodes.length !== NAMES.length) return null;
    const plans = NAMES.map(name => {
      const matches = nodes.filter(node => text(node, '[data-hook="plan-title"]') === name);
      if (matches.length !== 1) return null;
      const node = matches[0], button = node.querySelector('button[data-hook="plan-cta"]');
      const amount = text(node, '[data-hook="price-amount"]');
      const currency = text(node, '[data-hook="price-currency"]');
      if (!button || button.disabled || button.getAttribute('aria-disabled') === 'true' || !amount || currency !== '$') return null;
      return { name, amount, currency, recurrence: text(node, '[data-hook="plan-recurrence"]'),
        tagline: text(node, '[data-hook="plan-tagline"]'),
        benefits: [...node.querySelectorAll('[data-hook="benefit"]')].map(n => n.textContent.trim()), button };
    });
    return plans.every(Boolean) ? plans : null;
  }
  function clearView() {
    clearTimeout(pending); pending = 0; selected = false;
    root.classList.remove('as-sanctum-active');
    host?.remove(); sheet?.remove(); host = null; sheet = null; signature = '';
  }
  function originalPlans() {
    bypass = true; clearView();
    const heading = document.querySelector('#PAGES_CONTAINER [data-hook="plan-title"]');
    if (heading) { heading.tabIndex = -1; heading.focus(); heading.scrollIntoView({block: 'center'}); }
  }
  function checkout(index, control) {
    if (selected || !eligible()) return;
    const plans = readPlans(), plan = plans?.[index];
    if (!plan) { originalPlans(); return; }
    selected = true;
    control.disabled = true;
    control.textContent = 'Opening secure checkout…';
    host.shadowRoot.querySelector('[role="status"]').textContent = 'Opening the selected plan in secure Wix checkout.';
    // Never clone controls, invent checkout IDs, or repeat a purchase/navigation attempt.
    // Call the original React-bound Wix control after a fresh title/availability check.
    try { plan.button.click(); } catch { originalPlans(); return; }
    pending = setTimeout(() => { if (eligible()) originalPlans(); }, 10000);
  }
  const styles = `
:host{display:block;position:relative;order:4;width:100%;min-width:0;isolation:isolate;color-scheme:dark;--gold:#e8c98e;--teal:#8ad9cd;--text:#f3eee4;background:radial-gradient(ellipse at 52% 20%,#243451 0%,#12162d 32%,#070b17 74%);color:var(--text);font:16px/1.65 system-ui,sans-serif;text-align:left;overflow:hidden}
*{box-sizing:border-box}a{color:inherit}button{font:inherit;color:inherit;cursor:pointer}a:focus-visible,button:focus-visible,summary:focus-visible{outline:3px solid var(--teal);outline-offset:5px}button:disabled{cursor:wait;opacity:.75}
.field{position:absolute;inset:0;z-index:-1;pointer-events:none;background:repeating-radial-gradient(ellipse at 50% 24%,transparent 0 55px,#8ad9cd0b 56px 57px,transparent 58px 100px);animation:sanctum-breathe 9s ease-in-out infinite alternate}
@keyframes sanctum-breathe{to{opacity:.35;transform:scale(1.04)}}
.content{max-width:1160px;margin:auto;padding:3rem 20px 6rem;position:relative}.intro{text-align:center;max-width:820px;margin:0 auto 3rem}.eyebrow{letter-spacing:.28em;color:var(--teal);font-size:.74rem;text-transform:uppercase}h1,h2,h3{font-family:Georgia,serif;font-weight:400}h1{font-size:clamp(2.7rem,7vw,5.4rem);line-height:1.1;color:#f6e5bc;margin:1rem 0}h2{font-size:clamp(1.8rem,3vw,2.7rem);color:#f2ddb1}h3{font-size:1.5rem;color:#f2ddb1;margin:.2rem 0}p{margin:1em 0}
.aura{height:175px;position:relative;display:grid;place-items:center;margin:1rem auto}.aura:before,.aura:after{content:"";position:absolute;border-radius:48% 52% 62% 38%;border:1px solid #d6b97b99;box-shadow:0 0 55px #9a77c750,inset 0 0 50px #5cc7c73a;transform:rotate(-20deg);width:150px;height:145px;animation:sanctum-breathe 9s ease-in-out infinite alternate}.aura:after{width:110px;height:155px;border-color:#79e4dc88;transform:rotate(30deg)}.aura span{color:#e9c88d;font-size:2rem;text-shadow:0 0 25px #f7e6a7}
.paths{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.5rem}.path{background:linear-gradient(135deg,#192238c9,#0a0e20e8);border:1px solid #c4b6a04a;border-radius:42% 42% 20px 20px/60px 60px 20px 20px;padding:2.4rem 1.6rem 1.8rem;min-height:360px;box-shadow:inset 0 0 45px #80c9cc0c,0 15px 60px #0004;transition:transform .25s,border-color .25s}.path:hover,.path:focus-within{transform:translateY(-5px);border-color:#e8c98ea6}.glyph{display:block;text-align:center;font-size:3rem;color:var(--teal);text-shadow:0 0 28px #82ded5;margin:0 0 1rem}.path p{min-height:100px}.action{display:inline-block;text-decoration:none;border:1px solid #e8c98eaa;padding:.7rem 1.3rem;border-radius:100px;background:#d2b8781a;min-height:44px;line-height:1.65;text-align:center}
.detail{margin:4rem auto 0;max-width:900px;padding:2rem;border-top:1px solid #d9c48b55;scroll-margin-top:110px}.plans{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}.plan{border:1px solid #8ad9cd44;border-radius:16px;padding:1.2rem;background:#0a1223ba;min-width:0}.price{font-size:1.6rem;color:var(--gold)}.note{font-size:.86rem;color:#c8cbd2}details{margin:1rem 0}summary{cursor:pointer;min-height:44px;padding:.6rem 0;color:var(--teal)}details ul{padding-left:1.2rem;font-size:.9rem}footer{text-align:center;border-top:1px solid #d9c48b33;padding:2rem 20px;color:#c4b8a4;letter-spacing:.1em}.utilities{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin-top:1.4rem}.quiet{border:1px solid #e8c98e70;border-radius:100px;min-height:44px;padding:.5rem 1rem;background:#080d1db8;font-size:.85rem}.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
:host([data-still="true"]) *,:host([data-still="true"]) *:before,:host([data-still="true"]) *:after{animation-play-state:paused!important;transition:none!important}
@media(max-width:750px){.paths,.plans{grid-template-columns:1fr}.path{min-height:0;border-radius:70px 70px 20px 20px}.path p{min-height:0}.detail{padding:1.4rem .4rem}.content{padding-top:2rem}}
@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
`;
  const visualReviewLayer = `
/* Inner Sanctum v1.1 visual-review layer: no checkout, storage or router changes.
   Rest-state richness is static. Only short opacity/transform animation.
   Existing Stillness and prefers-reduced-motion freeze every added animation. */
:host{
  --sanctum-auric-gold:#f2d5a0;
  --sanctum-auric-teal:#93e2d5;
  background:
    radial-gradient(ellipse 67% 31% at 50% 14%,#536b6955 0%,#233b5548 34%,transparent 100%),
    radial-gradient(ellipse 48% 27% at 10% 44%,#3a2e4b52 0%,transparent 100%),
    radial-gradient(ellipse 58% 31% at 92% 69%,#29434d44 0%,transparent 100%),
    linear-gradient(178deg,#080c17 0%,#141b2d 35%,#060a15 77%,#080c18 100%);
}
.field{
  background:
    radial-gradient(circle at 50% 12%,#c8d2b015 0%,transparent 36%),
    repeating-radial-gradient(ellipse at 50% 21%,transparent 0 48px,#edd6a50c 49px 50px,transparent 52px 93px),
    linear-gradient(108deg,transparent 36%,#73d8cb08 49%,transparent 62%);
  opacity:.78;
  animation:sanctum-material-breath 17s ease-in-out infinite alternate;
}
.field::before,.field::after{
  content:"";position:absolute;display:block;pointer-events:none;
  width:min(70vw,800px);height:330px;left:50%;top:105px;
  transform:translateX(-50%) rotate(-8deg);
  border-radius:56% 44% 63% 37% / 44% 62% 38% 56%;
  border-top:1px solid #efdaad43;
  border-bottom:1px solid #83dbd41e;
  box-shadow:0 0 82px #8addca18,inset 0 0 84px #e7c2840d;
  opacity:.65;
  animation:sanctum-material-breath 19s ease-in-out infinite alternate;
}
.field::after{
  width:min(61vw,680px);height:270px;top:155px;
  transform:translateX(-50%) rotate(13deg);
  border-color:#9bdfdd57;
  animation-duration:23s;
  animation-direction:alternate-reverse;
}
@keyframes sanctum-material-breath{from{opacity:.52}to{opacity:.88}}
.intro{isolation:isolate}
.intro .eyebrow{letter-spacing:.34em;color:#9fe9df;text-shadow:0 0 22px #79d8cf5e}
.aura{height:213px;filter:drop-shadow(0 0 28px #f6d1a34a);isolation:isolate}
.aura:before{
  width:179px;height:174px;
  background:conic-gradient(from 35deg,#a5dfd50c,#d9c5ab21,#b597de20,#d4edc320,#a5dfd50c);
  border-color:#f3dab997;
  border-radius:52% 48% 63% 37% / 42% 58% 41% 59%;
  box-shadow:0 0 58px #d7c2906b,inset 0 0 55px #a1e1d448;
}
.aura:after{
  width:154px;height:191px;border-radius:48% 52% 39% 61% / 63% 39% 61% 37%;
  border-color:#8ddbd4a6;box-shadow:0 0 55px #8ddbd344,inset 0 0 39px #dfc59422;
}
.aura span{
  position:relative;display:grid;place-items:center;z-index:1;
  width:74px;height:74px;color:#fff2c9;
  font-size:2.6rem;
  text-shadow:0 0 13px #fff4d0,0 0 38px #f6d18b,0 0 83px #f5bd6893;
}
.aura span::before,.aura span::after{
  content:"";position:absolute;z-index:-1;
  width:136px;height:105px;border-radius:63% 37% 54% 46% / 40% 67% 33% 60%;
  border:1px solid #c9a4ed72;
  transform:rotate(29deg);
  box-shadow:0 0 34px #d1a8df30;
  animation:sanctum-material-breath 13s ease-in-out infinite alternate;
}
.aura span::after{
  width:105px;height:143px;transform:rotate(-39deg);
  border-color:#f3e2a99c;animation-duration:16s;
}
.intro h1{letter-spacing:.025em;text-shadow:0 0 34px #e5c08063,0 0 92px #e7bf8852;color:#fae7c0}
.intro>p{max-width:670px;margin-left:auto;margin-right:auto}
.threshold-prompt{margin-top:1.3rem!important;font-size:.72rem;letter-spacing:.23em;text-transform:uppercase;color:#c2b6bc}
.paths{position:relative;isolation:isolate;gap:1.3rem}
.paths::before{
  content:"";position:absolute;z-index:-1;pointer-events:none;
  left:8%;right:8%;top:-28px;height:125px;
  border-radius:50% 50% 0 0 / 100% 100% 0 0;
  border-top:1px solid #e3cd9854;
  box-shadow:0 -27px 67px #e7c89a16,0 -1px 12px #e7c89a25;
}
.path{
  --path-auric:#efd39d;
  position:relative;isolation:isolate;overflow:hidden;
  background:
    radial-gradient(ellipse 76% 57% at 50% 1%,#b68d5e44 0%,transparent 89%),
    radial-gradient(ellipse 98% 45% at 48% 93%,#549f9c18 0%,transparent 90%),
    linear-gradient(145deg,#1c2741de,#0a0e1df2);
  border-color:#efd5a568;
  box-shadow:0 19px 48px #0008,inset 0 0 48px #d6b9810f;
  transition:transform .3s ease,border-color .3s ease,box-shadow .3s ease;
}
.path:nth-child(2){--path-auric:#96e2d5;background:radial-gradient(ellipse 74% 60% at 50% 1%,#65b8ae48 0%,transparent 92%),linear-gradient(145deg,#152c3ddd,#0a0f1ef5)}
.path:nth-child(3){--path-auric:#c5ade6;background:radial-gradient(ellipse 74% 60% at 50% 1%,#ad8bdf3c 0%,transparent 92%),linear-gradient(145deg,#272038dc,#0b0e1ef2)}
.path:before{
  content:"";position:absolute;z-index:-1;
  top:8px;left:50%;width:146px;height:146px;margin-left:-73px;
  border:1px solid var(--path-auric);
  border-radius:58% 42% 64% 36%/42% 63% 37% 58%;
  box-shadow:0 0 30px var(--path-auric),inset 0 0 47px #ffffff12;
  opacity:.3;
  animation:sanctum-material-breath 19s ease-in-out infinite alternate;
}
.path:after{
  content:"";position:absolute;pointer-events:none;
  top:10px;left:7%;width:86%;height:110px;
  border-top:1px solid #f8e3b36b;
  border-radius:50% 50% 0 0;
  box-shadow:0 -9px 31px #dac29e27;
  opacity:.65;
}
.path:is(:hover,:focus-within){
  border-color:var(--path-auric);transform:translateY(-4px);
  box-shadow:0 0 28px #b79a633c,0 20px 50px #0009,inset 0 0 54px #ffffff08;
}
.glyph{color:var(--path-auric);text-shadow:0 0 22px var(--path-auric)}
.detail{position:relative;border-top-color:#f0d7a16b}
.detail::before{
  content:"";position:absolute;top:-1px;left:16%;right:16%;height:2px;
  background:linear-gradient(90deg,transparent,#f7d89a72,transparent);
}
.plan{border-color:#a7d8cf59;box-shadow:0 12px 33px #0007,inset 0 0 29px #80cdcb12}
.action:hover,.quiet:hover{background:#cba97033;border-color:#f4dba2df}
@media(max-width:750px){
  .field::before,.field::after{width:95vw;top:115px}
  .paths::before{display:none}
  .aura{height:185px}
  .intro h1{font-size:clamp(2.7rem,11vw,4.5rem)}
  .path{padding-top:2.8rem}
  .path:after{height:76px}
  .threshold-prompt{letter-spacing:.12em}
}
@media(prefers-reduced-motion:reduce){
  .field,.field::before,.field::after,.aura span::before,.aura span::after,.path::before{animation:none!important}
}
`;
  function planCard(plan, index) {
    return `<article class="plan"><h3>${escape(plan.name)}</h3><div class="price">${escape(plan.currency + plan.amount)}${plan.recurrence ? ' / month' : ''}</div><p>${escape(plan.tagline)}</p><details><summary>What’s included</summary><ul>${plan.benefits.map(b => `<li>${escape(b)}</li>`).join('')}</ul></details><button class="action" type="button" data-plan="${index}" aria-label="Review and purchase ${escape(plan.name)}">Review &amp; purchase ↗</button></article>`;
  }
  function mount(plans) {
    const native = document.getElementById('PAGES_CONTAINER');
    const banner = document.getElementById('as-public-banner');
    if (!native || !banner || !native.parentNode) return;
    const invite = 'mailto:Drew@ArchonSoulings.com?subject=Archon%20Soulings%20%E2%80%94%20Speaking%2C%20Teaching%20or%20Event%20Invitation';
    host = document.createElement('main');
    host.id = 'as-inner-sanctum'; host.dataset.version = VERSION;
    host.setAttribute('aria-label', 'The Inner Sanctum — Packages and subscriptions');
    const shadow = host.attachShadow({mode: 'open'});
    shadow.innerHTML = `<style>${styles}${visualReviewLayer}</style><div class="field" aria-hidden="true"></div><div class="content">
<section class="intro"><div class="eyebrow">The Living Nexus · Sessions</div><div class="aura" aria-hidden="true"><span>✦</span></div><h1>The Inner Sanctum</h1><p>Paths of transformation, exploration, and continued practice. Choose the kind of support that fits your intentions and your life.</p><p class="threshold-prompt">What are you seeking right now?</p><div class="utilities"><button class="quiet" type="button" data-stillness aria-pressed="false">Stillness</button><a class="quiet" href="/services">Individual sessions ↗</a></div></section>
<section class="paths" aria-label="Explore offerings"><article class="path"><span class="glyph" aria-hidden="true">◈</span><h3>Personal Transformation</h3><p>Dedicated individual sessions and extended packages for those seeking consistent time to explore, reflect, and practice.</p><a class="action" href="#packages" data-jump="packages">Explore session packages ↓</a></article><article class="path"><span class="glyph" aria-hidden="true">◎</span><h3>Familiar Companionship</h3><p>Explore the existing monthly Familiar offerings. Review the exact benefits, terms, and renewal conditions before purchasing.</p><a class="action" href="#familiars" data-jump="familiars">Explore Familiar plans ↓</a></article><article class="path"><span class="glyph" aria-hidden="true">✧</span><h3>Groups &amp; Organizations</h3><p>Workshops, invitations to teach, speaking engagements, and thoughtfully structured collaborations.</p><a class="action" href="${invite}">Explore collaboration ↗</a></article></section>
<section class="detail" id="packages"><div class="eyebrow">Personal pathways</div><h2 tabindex="-1">Session Packages</h2><div class="plans">${plans.slice(0,2).map(planCard).join('')}</div></section>
<section class="detail" id="familiars"><div class="eyebrow">Ongoing pathways</div><h2 tabindex="-1">Familiar Plans</h2><div class="plans">${plans.slice(2).map((p,i)=>planCard(p,i+2)).join('')}</div><p class="note">No refunds. Review the full plan terms and recurring payment details in secure checkout before purchasing.</p></section>
<div class="utilities"><button class="quiet" type="button" data-original>Use standard plan selector</button></div><p class="sr" role="status" aria-live="polite"></p></div><footer>THARAVEL ~ KOSMATHRA ~ ✦</footer>`;
    shadow.addEventListener('click', e => {
      const control = e.target.closest('button,a'); if (!control) return;
      if (control.hasAttribute('data-plan')) checkout(Number(control.dataset.plan), control);
      else if (control.hasAttribute('data-original')) originalPlans();
      else if (control.hasAttribute('data-stillness')) { paused = !paused; syncMotion(); }
      else if (control.hasAttribute('data-jump')) {
        e.preventDefault();
        const section = shadow.getElementById(control.dataset.jump);
        section.scrollIntoView({block: 'start', behavior: 'auto'});
        section.querySelector('h2').focus({preventScroll: true});
      }
    });
    sheet = document.createElement('style'); sheet.id = 'as-sanctum-integration-style';
    sheet.textContent = 'html.as-sanctum-active #PAGES_CONTAINER,html.as-sanctum-active #as-public-banner{display:none!important}#as-inner-sanctum{order:4;width:100%;min-width:0;flex:none}';
    document.head.append(sheet);
    banner.before(host);
    root.classList.add('as-sanctum-active');
    signature = JSON.stringify(plans.map(({button, ...p}) => p));
    syncMotion();
  }
  function syncMotion() {
    if (!host) return;
    const quiet = paused || reduced.matches || root.classList.contains('as-calm') || document.hidden;
    const value = String(quiet);
    if (host.dataset.still !== value) host.dataset.still = value;
    const button = host.shadowRoot.querySelector('[data-stillness]');
    if (button.getAttribute('aria-pressed') !== value) {
      button.setAttribute('aria-pressed', value);
      button.textContent = quiet ? 'Stillness on' : 'Stillness';
    }
  }
  function refresh() {
    const path = currentPath();
    if (path !== previousPath) { bypass = false; previousPath = path; retryAt = 0; }
    if (!eligible()) { if (host) clearView(); return; }
    if (bypass) return;
    if (host && !host.isConnected) clearView();
    syncMotion();
    if (selected) return;
    // Bounded polling avoids mutating Wix's React tree or creating observer feedback loops.
    if (Date.now() < retryAt) return;
    retryAt = Date.now() + 1000;
    const plans = readPlans();
    if (!plans) { if (host) clearView(); return; }
    const next = JSON.stringify(plans.map(({button, ...p}) => p));
    if (host && next !== signature) clearView();
    if (!host) mount(plans);
  }
  function safeRefresh() { try { refresh(); } catch { bypass = true; clearView(); } }
  window.addEventListener('popstate', safeRefresh);
  window.addEventListener('hashchange', safeRefresh);
  document.addEventListener('visibilitychange', safeRefresh);
  reduced.addEventListener?.('change', syncMotion);
  window.addEventListener('pagehide', () => { clearTimeout(pending); });
  window.addEventListener('pageshow', e => { if (e.persisted) { clearView(); safeRefresh(); } });
  setInterval(safeRefresh, 250);
  safeRefresh();
})();
