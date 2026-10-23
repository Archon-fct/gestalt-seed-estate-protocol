from pathlib import Path
import hashlib,json
root=Path(__file__).parent
source=Path('live-nexus.js').read_text()
def swap(before,after):
 global source
 assert source.count(before)==1, before[:80]
 source=source.replace(before,after)
assert hashlib.sha256(source.encode()).hexdigest() == '9ccac269d891b362431ea74cf524afd958aeb2436e68dfb03222a66d04290276', 'Live baseline changed; recover the pinned source before building'
original=source
start=source.index('    renderWorld(world) {')
end=source.index('    silence() {',start)
replacement='''    clearCrossing() {
      clearTimeout(this.crossingTimeout);
      this.crossingAnimation?.cancel(); this.crossingAnimation = null;
    }
    removeOutgoing() {
      this.clearCrossing();
      this.outgoing?.remove(); this.outgoing = null;
    }
    renderWorld(world) {
      if (!hasWorld(world)) world = 'nexus';
      if (world === this.pendingWorld && this.frame && this.dataset.ready === 'true') return;
      this.closeNavigation(); this.closeJourney(); this.clearCrossing();
      const previous = this.outgoing || this.frame;
      // Stop the old runtime immediately, but keep its pixels until the new world is ready.
      try { (this.frameWindow || this.frame?.contentWindow)?.__nexusDispose?.(); } catch {}
      if (this.frame && this.frame !== previous) this.frame.remove();
      this.outgoing = previous; this.crossingFrom = previous?.dataset.world;
      if (previous) {
        previous.inert = true; previous.setAttribute('aria-hidden','true');
        previous.style.cssText = 'position:absolute;inset:0;z-index:2;pointer-events:none;opacity:1';
        try { previous.contentDocument.getAnimations().forEach(a => a.pause()); } catch {}
      }
      this.dataset.ready = 'false'; this.pendingWorld = world; this.frameWindow = null;
      const frame = document.createElement('iframe'); this.frame = frame;
      frame.title = `${LABELS[world]} — Archon Soulings`;
      frame.setAttribute('allow',"microphone 'none'; geolocation 'none'; camera 'self'");
      frame.setAttribute('referrerpolicy','no-referrer'); frame.dataset.world = world;
      frame.style.cssText = 'position:absolute;inset:0;opacity:0'; frame.inert = true;
      frame.srcdoc = DOCUMENTS[world];
      this.shadowRoot.querySelector('.view').append(frame);
      this.sequence++; this.sync(); this.say('Opening ' + LABELS[world] + '…');
      this.crossingTimeout = setTimeout(() => {
        if (this.frame === frame && this.dataset.ready !== 'true')
          this.say('This world is taking longer to open. Explore remains available to choose another world.');
      }, 8000);
    }
    frameReady(win) {
      if (!this.live || win !== this.frame?.contentWindow) return;
      clearTimeout(this.crossingTimeout);
      if (this.pendingWorld !== 'nexus' && this.pendingWorld !== 'threshold') this.remember(this.pendingWorld);
      this.syncLinks(); this.sync(); this.dataset.ready = 'true';
      const frame = this.frame;
      frame.style.opacity = '1'; frame.inert = false;
      const outgoing = this.outgoing;
      const finish = () => {
        if (this.frame !== frame) return;
        this.removeOutgoing(); this.say(LABELS[this.pendingWorld]);
        // Focus the destination only when a dialog or utility has not taken focus meanwhile.
        if (outgoing && !this.shadowRoot.querySelector('dialog[open]') &&
            (!this.shadowRoot.activeElement || this.shadowRoot.activeElement === outgoing)) {
          const doc = frame.contentDocument;
          const target = doc?.querySelector('h1') || doc?.querySelector('button,a[href]');
          if (target) { if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex','-1'); target.focus({preventScroll:true}); }
        }
      };
      if (outgoing && !this.still && !this.reduce.matches && !this.paused && outgoing.animate) {
        this.crossingAnimation = outgoing.animate([{opacity:1},{opacity:0}], {duration:260,easing:'cubic-bezier(.22,.61,.36,1)',fill:'forwards'});
        this.crossingAnimation.onfinish = finish;
      } else finish();
      this.dispatchEvent(new CustomEvent('nexus-ready',{detail:{world:this.pendingWorld,build:BUILD.version},bubbles:true,composed:true}));
    }
    disposeFrame() {
      this.removeOutgoing(); this.dataset.ready = 'false';
      try { (this.frameWindow || this.frame?.contentWindow)?.__nexusDispose?.(); } catch {}
      this.frame?.remove(); this.frame = null; this.frameWindow = null;
    }
'''
source=source[:start]+replacement+source[end:]
swap('this.still = !!value; if (this.still) this.silence();','this.still = !!value || this.reduce.matches; if (this.still) { this.silence(); if (this.dataset.ready === \'true\') this.removeOutgoing(); }')
(root/'archon-living-nexus.js').write_text(source)
(root/'patch.json').write_text(json.dumps({'baselineSHA256':hashlib.sha256(original.encode()).hexdigest(),'replacements':[{'before':original[start:end],'after':replacement},{'before':'this.still = !!value; if (this.still) this.silence();','after':"this.still = !!value || this.reduce.matches; if (this.still) { this.silence(); if (this.dataset.ready === 'true') this.removeOutgoing(); }"}]},indent=2))
print('Built',len(source),'characters; baseline',hashlib.sha256(original.encode()).hexdigest())
