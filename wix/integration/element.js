/* Page-scoped Living Nexus adapter. Bundles trusted original documents inside one
   bounded, same-origin srcdoc frame. Never replaces the host document or loads a
   remote scene. Removing the element tears down its frame and runtime resources. */
(() => {
  'use strict';
  const DOCUMENTS = __NEXUS_DOCUMENTS__;
  const GRAPH = __NEXUS_GRAPH__;
  const PROVENANCE = __NEXUS_PROVENANCE__;
  const BUILD = __NEXUS_BUILD__;
  __NEXUS_SHARED_FACTORIES__
  const ROUTES = Object.freeze({nexus:'index.html',aura:'aura-dynamics.html',aureglossa:'living-tongue.html',sessions:'inner-sanctum.html',workshops:'convergence.html',gestalt:'living-archive.html',journal:'astral-journal.html',threshold:'living-threshold.html'});
  const hasWorld = value => typeof value === 'string' && Object.hasOwn(ROUTES, value);
  const LABELS = Object.freeze({nexus:'Living Nexus',aura:'Aura Dynamics',aureglossa:'Aureglossa',sessions:'Sessions',workshops:'Workshops',gestalt:'Gestalt',journal:'Journal / Stories',threshold:'Living Threshold'});
  const SESSION_KEYS = new Set(['archonLivingThread.session.v1','archonLivingThread.v1','archonPassport.v1','archonLastSessionPath','archonSoul.v1']);
  const SAVED = 'archonLivingNexus.saved.v1', LEGACY = 'nexus-cinematic-v10-saved';
  const LOCAL_KEYS = new Set([SAVED, LEGACY]);
  const journeyIds = ['nexus','aura','aureglossa','services','workshops','gestalt','journal'];
  const passportIds = ['entered-living-field','integrated-aura','discovered-tharavel','checked-provenance','entered-inner-sanctum','explored-gestalt-relationship','entered-convergence','entered-journal'];
  const clean = (list, allowed) => [...new Set((Array.isArray(list) ? list : []).filter(x => allowed.includes(x)))];
  const toShared = w => w === 'sessions' ? 'services' : w;
  const toWorld = w => w === 'services' ? 'sessions' : w;
  const safeJSON = (text, fallback) => { try { return JSON.parse(text); } catch { return fallback; } };
  function storage(allowed, source, changed) {
    const fallback = new Map(); let durable = true;
    return Object.freeze({
      getItem(key) { if (!allowed.has(key)) return null; if (fallback.has(key)) return fallback.get(key);
        try { return source()?.getItem(key) ?? null; } catch { durable = false; return null; } },
      setItem(key, value) { if (!allowed.has(key) || String(value).length > 24000) return;
        value = String(value); fallback.set(key, value);
        try { source().setItem(key, value); } catch { durable = false; }
        changed(); },
      removeItem(key) { if (!allowed.has(key)) return; fallback.set(key, null);
        try { source().removeItem(key); } catch { durable = false; } changed(); },
      isDurable() { return durable; }
    });
  }
  class ArchonLivingNexus extends HTMLElement {
    static get observedAttributes() { return ['world', 'route-base']; }
    constructor() {
      super(); this.attachShadow({mode:'open'}); this.frame = null; this.live = false;
      this.pendingWorld = 'nexus'; this.lastWorld = 'nexus'; this.sequence = 0;
      this.reduce = matchMedia('(prefers-reduced-motion: reduce)'); this.still = this.reduce.matches;
      this.bus = new EventTarget(); this.sessionStore = storage(SESSION_KEYS, () => window.sessionStorage, () => this.sync());
      this.localStore = storage(LOCAL_KEYS, () => window.localStorage, () => this.sync());
      this.threadAPI = sharedJourney(this.sessionStore, this.bus);
      this.passportAPI = sharedPassport(this.sessionStore, this.bus);
      this.soulAPI = sharedSoul(this.sessionStore);
      this.guideAPI = sharedGuide(); this.searchAPI = sharedSearch();
      this.paused = document.hidden; this.offscreen = false;
      this.onVisibility = () => { this.paused = document.hidden || this.offscreen; if (this.paused) this.silence();try{this.frame?.contentDocument?.dispatchEvent(new Event('visibilitychange'));}catch{} };
      this.observer = new IntersectionObserver(entries => { this.offscreen = !entries[0].isIntersecting; this.onVisibility(); });
      this.onPageHide = () => this.silence();
      this.onReduce = () => { if (this.reduce.matches) this.setStill(true); };
    }
    connectedCallback() {
      if (this.live) return;
      this.live = true; this.restore(); this.renderShell();
      document.addEventListener('visibilitychange', this.onVisibility);
      window.addEventListener('pagehide', this.onPageHide);
      this.reduce.addEventListener('change', this.onReduce);this.observer.observe(this);
      this.renderWorld(this.getAttribute('world') || 'nexus');
    }
    disconnectedCallback() {
      this.live = false; this.disposeFrame();
      document.removeEventListener('visibilitychange', this.onVisibility);
      window.removeEventListener('pagehide', this.onPageHide);
      this.reduce.removeEventListener('change', this.onReduce);this.observer.disconnect();
      this.shadowRoot.replaceChildren();
    }
    attributeChangedCallback(name, old, value) {
      if (old === value || !this.live) return;
      if (name === 'world' && hasWorld(value) && value !== this.pendingWorld) this.renderWorld(value);
      if (name === 'route-base') this.syncLinks();
    }
    get routeBase() {
      const value = this.getAttribute('route-base') || 'https://www.archonsoulings.com/living-nexus';
      const url = new URL(value, location.href);
      // The current-origin branch supports a local test fixture, never untrusted destinations.
      if (url.origin !== location.origin && !['https://www.archonsoulings.com','https://headless-mfewrcffiie-archonsoulings-140e.wix-site-host.com'].includes(url.origin)) throw new Error('Unapproved Nexus route origin');
      if (!/^https?:$/.test(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error('Invalid Nexus route base');
      return url.href;
    }
    hrefFor(world) { const url = new URL(this.routeBase); if (world !== 'nexus' && hasWorld(world)) url.searchParams.set('world', world); return url.href; }
    worldForFile(raw) { if (!raw) return null;
      const file = raw.split(/[?#]/)[0].replace(/^\.\//,'');
      return Object.keys(ROUTES).find(w => ROUTES[w] === file) || null; }
    isInternalUrl(raw) { try { const u = new URL(raw, this.routeBase), b = new URL(this.routeBase);
      return u.origin === b.origin && u.pathname === b.pathname && hasWorld(u.searchParams.get('world') || 'nexus');
    } catch { return false; } }
    navigateByUrl(raw) { if (!this.isInternalUrl(raw)) return;
      const url = new URL(raw, this.routeBase); this.navigate(url.searchParams.get('world') || 'nexus'); }
    navigate(world) {
      if (!hasWorld(world) || !this.live) return;
      this.renderWorld(world);
      this.dispatchEvent(new CustomEvent('nexus-route', {detail:{world, href:this.hrefFor(world)}, bubbles:true, composed:true}));
    }
    renderShell() {
      this.shadowRoot.innerHTML = `<style>__NEXUS_SHELL_CSS__</style>
      <section class="environment" aria-label="Archon Soulings Living Nexus">
        <div class="view"></div>
        <nav class="utility" aria-label="Living field controls">
          <button data-action="return" aria-label="Return to the Living Nexus">← Nexus</button>
          <button data-action="journey">Thread <span class="count">0</span></button>
          <button data-action="still" aria-pressed="false">Stillness</button>
          <button data-action="silence">Silence</button>
        </nav>
        <span class="notice" role="status" aria-live="polite"></span>
        <dialog aria-labelledby="journeyTitle"><header><h2 id="journeyTitle">The Living Thread</h2><button data-action="close" aria-label="Close Living Thread">✕</button></header><div class="journey-content"></div><footer><button data-action="save">Save this journey</button><button data-action="dissolve">Let it dissolve</button></footer></dialog>
      </section>`;
      for (const button of this.shadowRoot.querySelectorAll('[data-action]')) button.addEventListener('click', () => {
        const action = button.dataset.action;
        if (action === 'return') this.navigate('nexus');
        if (action === 'journey') this.openJourney();
        if (action === 'still') this.setStill(!this.still);
        if (action === 'silence') { this.silence(); this.say('Silence — sound stopped.'); }
        if (action === 'close') this.closeJourney();
        if (action === 'save') this.save();
        if (action === 'dissolve') this.dissolve();
      });
      const dialog = this.shadowRoot.querySelector('dialog');
      dialog.addEventListener('cancel', e => { e.preventDefault(); this.closeJourney(); });
      this.sync();
    }
    renderWorld(world) {
      if (!hasWorld(world)) world = 'nexus';
      this.closeJourney(); this.disposeFrame(); this.pendingWorld = world;
      const frame = document.createElement('iframe'); this.frame = frame;
      frame.title = `${LABELS[world]} — Archon Soulings`;
      frame.setAttribute('allow','microphone \'none\'; geolocation \'none\'; camera \'self\'');
      frame.setAttribute('referrerpolicy','no-referrer');
      frame.dataset.world = world;
      // Only build-owned, allowlisted content is assigned to srcdoc. User drafts never enter HTML.
      frame.srcdoc = DOCUMENTS[world];
      this.shadowRoot.querySelector('.view').replaceChildren(frame);
      this.sequence++; this.sync();
    }
    frameReady(win) {
      if (!this.live || win !== this.frame?.contentWindow) return;
      if (this.pendingWorld !== 'nexus' && this.pendingWorld !== 'threshold') this.remember(this.pendingWorld);
      this.syncLinks(); this.sync(); this.dataset.ready = 'true';
      this.dispatchEvent(new CustomEvent('nexus-ready',{detail:{world:this.pendingWorld,build:BUILD.version},bubbles:true,composed:true}));
    }
    disposeFrame() {
      this.dataset.ready = 'false';
      try { (this.frameWindow || this.frame?.contentWindow)?.__nexusDispose?.(); } catch {}
      this.frame?.remove(); this.frame = null; this.frameWindow = null;
    }
    silence() { try { (this.frameWindow || this.frame?.contentWindow)?.__nexusSilence?.(); } catch {} }
    setStill(value, fromFrame = false) {
      this.still = !!value; if (this.still) this.silence();
      const win = this.frame?.contentWindow;
      if (!fromFrame) { try { if (win?.NexusApp) win.NexusApp.setStill(this.still, true);
        else win?.document.body.classList.toggle('still', this.still); } catch {} }
      this.sync();
    }
    say(text) { const el = this.shadowRoot.querySelector('.notice'); if (el) el.textContent = text; }
    remember(world) {
      if (world === 'threshold' || world === 'nexus') return;
      this.threadAPI.rememberWorld(toShared(world));
      const mark = {aura:'entered-living-field',sessions:'entered-inner-sanctum',workshops:'entered-convergence',journal:'entered-journal'}[world];
      if (mark) this.passportAPI.mark(mark);
      this.lastWorld = world; this.sync();
    }
    getJourneyForApp() { return this.threadAPI.getJourney().filter(x=>x!=='nexus').map(toWorld); }
    restore() {
      // A previous explicit Save is the only source of persistent journey restoration.
      const saved = safeJSON(this.localStore.getItem(SAVED), null);
      if (!this.threadAPI.getJourney().length && saved?.version === 1) {
        this.sessionStore.setItem('archonLivingThread.session.v1', JSON.stringify(clean(saved.journey,journeyIds)));
        this.sessionStore.setItem('archonPassport.v1', JSON.stringify(clean(saved.passport,passportIds)));
      } else if (!this.threadAPI.getJourney().length && !saved) {
        const legacy = safeJSON(this.localStore.getItem(LEGACY),null);
        if (legacy?.version === 1) this.sessionStore.setItem('archonLivingThread.session.v1', JSON.stringify(clean(Array.isArray(legacy.worlds)?legacy.worlds.map(toShared):[],journeyIds)));
      }
    }
    sync() {
      if (!this.live) return;
      const count = this.getJourneyForApp().length;
      const indicator = this.shadowRoot.querySelector('.count'); if (indicator) indicator.textContent = String(count);
      const button = this.shadowRoot.querySelector('[data-action="still"]'); if (button) { button.setAttribute('aria-pressed',String(this.still)); button.textContent = this.still ? 'Resume motion' : 'Stillness'; }
      const win = this.frame?.contentWindow;
      try { if (win?.NexusApp) { win.NexusApp.state.thread = this.getJourneyForApp(); win.document.getElementById('threadCount').textContent = String(count); for(const node of win.document.querySelectorAll('.world'))node.classList.toggle('visited',win.NexusApp.state.thread.includes(node.dataset.world)); } } catch {}
    }
    syncLinks() {
      const doc = this.frame?.contentDocument; if (!doc) return;
      for (const link of doc.querySelectorAll('a[href]')) {
        const world = this.worldForFile(link.getAttribute('href'));
        if (world) { link.href = this.hrefFor(world); link.removeAttribute('target'); }
      }
    }
    fillJourney() {
      const content = this.shadowRoot.querySelector('.journey-content'); content.replaceChildren();
      const paragraph = text => { const p=document.createElement('p');p.textContent=text;content.append(p); };
      paragraph('Public-world history only. This tab remembers your path; Save adds a resumable copy on this device. No server upload.');
      const visited = this.getJourneyForApp();
      paragraph(visited.length ? 'Your path: ' + visited.map(w=>LABELS[w]).join(' → ') : 'No worlds recorded yet.');
      const h3=document.createElement('h3'); h3.textContent='Field Journal';content.append(h3);
      const marks=this.passportAPI.getPassport();
      if (!marks.length) paragraph('No field notes yet. No points, scores, or rankings.');
      for (const id of marks) paragraph(this.passportAPI.labels[id]);
      const provenance = document.createElement('button');provenance.textContent='Where did this environment come from?';
      provenance.onclick=()=>{paragraph('Procedural v0.10 and existing Archon Soulings public controllers. Source release: '+BUILD.sourceCommit);};content.append(provenance);
      const soul=this.soulAPI.loadSoul();
      if (!soul) {paragraph('Optional Soul: create a random identifier and a record of your selected public worlds in this tab. No upload, wallet, financial asset, or ownership rights. Clear this identity separately whenever you choose.');const create=document.createElement('button');create.textContent='Create a browser-local Soul (optional)';create.onclick=()=>{
        // The separate explicit click authorizes this existing identity/provenance feature.
        this.soulAPI.createSoul({journey:this.threadAPI.getJourney(),marks});this.fillJourney();this.say('Local Soul created for this tab. No wallet or financial asset.');};content.append(create);
      } else {paragraph('A browser-local Soul exists in this tab. It is not a wallet, ownership claim, or financial asset.');const remove=document.createElement('button');remove.textContent='Dissolve local Soul';remove.onclick=()=>{this.soulAPI.dissolveLocalSoul();this.fillJourney();};content.append(remove);}
    }
    openJourney() {
      if (!this.live) return; this.silence();this.fillJourney();const dialog=this.shadowRoot.querySelector('dialog');
      if (!dialog.open) dialog.showModal();
    }
    closeJourney() { const dialog=this.shadowRoot.querySelector('dialog');if (dialog?.open) { dialog.close();this.shadowRoot.querySelector('[data-action="journey"]')?.focus(); } }
    save() {
      this.threadAPI.saveJourney();
      this.localStore.setItem(SAVED, JSON.stringify({version:1,journey:this.threadAPI.getJourney(),passport:this.passportAPI.getPassport()}));
      this.say(this.localStore.isDurable() ? 'Your public-world journey and Field Journal were saved on this device.' : 'Persistent storage is unavailable. Your path remains in this open page only.');
    }
    dissolve() {
      this.threadAPI.dissolveJourney(); this.passportAPI.clearPassport();
      this.localStore.removeItem(SAVED);this.localStore.removeItem(LEGACY);this.sessionStore.removeItem('archonLastSessionPath');
      this.lastWorld='nexus';this.sync();this.fillJourney();this.say('Journey and Field Journal dissolved. Other site data and any separately created Soul were not removed.');
    }
    openGuide() {
      const win=this.frame?.contentWindow, app=win?.NexusApp;if(!app)return;
      app.openPanel('Guide Me','THE FIELD RESPONDS','Choose one intention. Relevant worlds will be illuminated from your explicit choice.');
      const body=win.document.getElementById('panelBody');
      for(const prompt of this.guideAPI.prompts){const button=win.document.createElement('button');button.className='choice';button.textContent=prompt.label;button.onclick=()=>{
        const matches=this.guideAPI.recommend(prompt.id,this.threadAPI.getJourney()).map(toWorld);
        for(const node of win.document.querySelectorAll('.world'))node.classList.toggle('guide-relevant',matches.includes(node.dataset.world));
        app.state.focus=matches[0]||null;win.dispatchEvent(new win.Event('nexus:focus'));
        body.replaceChildren();for(const world of matches){const b=win.document.createElement('button');b.className='choice';b.textContent=LABELS[world];b.onclick=()=>app.focusWorld(world,false);body.append(b);}
      };body.append(button);}
    }
    enhanceSearch() {
      const win=this.frame?.contentWindow,app=win?.NexusApp,input=win?.document.querySelector('#panelBody input[type="search"]');if(!input||!app)return;
      const results=input.parentElement.nextElementSibling;
      input.oninput=()=>{const found=this.searchAPI.searchConstellation(input.value,GRAPH);results.replaceChildren();
        for(const match of found.nodes){const world=toWorld(match.id);if(!LABELS[world])continue;const b=win.document.createElement('button');b.className='choice';b.textContent=LABELS[world];b.onclick=()=>app.focusWorld(world,false);results.append(b);}
        if(!found.nodes.length){const p=win.document.createElement('p');p.textContent=input.value.trim()?'No matching public relationship.':'Type a topic to illuminate related worlds.';results.append(p);}
        app.state.focus=toWorld(found.nodes[0]?.id)||null;win.dispatchEvent(new win.Event('nexus:focus'));
      };input.dispatchEvent(new win.Event('input'));
    }
    snapshot() { return {build:BUILD,world:this.pendingWorld,journey:this.threadAPI.getJourney(),passport:this.passportAPI.getPassport(),still:this.still,live:this.live}; }
  }
  if (!customElements.get('archon-living-nexus')) customElements.define('archon-living-nexus', ArchonLivingNexus);
})();
