/* Inner Sanctum Packages 1.0.0. Additive presentation; native Wix plans own checkout.
   No accounts, prices, subscriptions, or site routing are written by this code. */
(() => {
  'use strict';
  const KEY = '__ARCHON_SANCTUM_PACKAGES_V1';
  if (window[KEY]) return;
  window[KEY] = true;
  const PATH = '/pricing-plans/plans-pricing';
  const VERSION = 'inner-sanctum-packages-1.0.0';
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
    shadow.innerHTML = `<style>${styles}</style><div class="field" aria-hidden="true"></div><div class="content">
<section class="intro"><div class="eyebrow">The Living Nexus · Sessions</div><div class="aura" aria-hidden="true"><span>✦</span></div><h1>The Inner Sanctum</h1><p>Paths of transformation, exploration, and continued practice. Choose the kind of support that fits your intentions and your life.</p><div class="utilities"><button class="quiet" type="button" data-stillness aria-pressed="false">Stillness</button><a class="quiet" href="/services">Individual sessions ↗</a></div></section>
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
