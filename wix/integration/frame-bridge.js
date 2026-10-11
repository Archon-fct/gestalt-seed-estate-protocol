/* Trusted, bundled document bridge. No cross-origin scene or visitor-code execution. */
(() => {
  'use strict';
  const host = window.frameElement?.getRootNode()?.host;
  if (!host || host.localName !== 'archon-living-nexus') return;
  window.__NexusHost = host; host.frameWindow = window;
  const timers = new Set(), frames = new Set(), audio = new Set(), streams = new Set();
  let disposed = false, captureEpoch = 0;
  Object.defineProperty(document,'hidden',{get:()=>host.paused||document.visibilityState==='hidden',configurable:true});
  const schedule = window.setTimeout.bind(window), cancel = window.clearTimeout.bind(window);
  const raf = window.requestAnimationFrame.bind(window), caf = window.cancelAnimationFrame.bind(window);
  window.setTimeout = (fn, delay, ...args) => {
    if (typeof fn !== 'function' || disposed) return 0;
    const id = schedule(() => { timers.delete(id); if (!disposed) fn(...args); }, delay);
    timers.add(id); return id;
  };
  window.clearTimeout = id => { timers.delete(id); cancel(id); };
  window.requestAnimationFrame = fn => {
    if (disposed) return 0;
    const id = raf(t => { frames.delete(id); if (!disposed) fn(t); });
    frames.add(id); return id;
  };
  window.cancelAnimationFrame = id => { frames.delete(id); caf(id); };
  Object.defineProperty(window, 'sessionStorage', {value: host.sessionStore, configurable: true});
  Object.defineProperty(window, 'localStorage', {value: host.localStore, configurable: true});
  for (const name of ['AudioContext', 'webkitAudioContext']) {
    const Native = window[name];
    if (Native) window[name] = new Proxy(Native, {construct(target, args) {
      const context = new target(...args); audio.add(context); return context;
    }});
  }
  const media = navigator.mediaDevices;
  if (media?.getUserMedia) {
    const acquire = media.getUserMedia.bind(media);
    media.getUserMedia = async constraints => {
      // The existing optional experiment requests video only after a click.
      if (disposed || constraints.audio) throw new DOMException('Audio capture is disabled', 'NotAllowedError');
      const epoch = captureEpoch;
      const stream = await acquire(constraints);
      if (disposed || epoch !== captureEpoch) { stream.getTracks().forEach(t => t.stop()); throw new DOMException('View was closed', 'AbortError'); }
      streams.add(stream); return stream;
    };
  }
  window.__nexusSilence = () => {
    document.dispatchEvent(new Event('nexus:force-silence'));
    for (const context of audio) {
      // suspend() stops output immediately; the controller's close also invalidates pending starts.
      try { void context.suspend().catch(() => {}); } catch {}
      try { void context.close().catch(() => {}); } catch {}
    }
    audio.clear();
  };
  window.__nexusDispose = () => {
    if (disposed) return;
    disposed = true;
    window.__nexusSilence();
    window.dispatchEvent(new Event('pagehide'));
    document.getElementById('stopCamera')?.click();
    streams.forEach(s => s.getTracks().forEach(t => t.stop())); streams.clear();
    timers.forEach(cancel); timers.clear(); frames.forEach(caf); frames.clear();
  };
  window.__nexusLifecycle = () => ({disposed, timers: timers.size, frames: frames.size, audio: audio.size, streams: streams.size});
  document.addEventListener('visibilitychange', () => { if (document.hidden) window.__nexusSilence(); });
  document.addEventListener('click', e => {
    if (e.target.closest?.('#stopCamera,#closeGaze')) {captureEpoch++;streams.forEach(s=>s.getTracks().forEach(t=>t.stop()));streams.clear();}
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const link = e.target.closest?.('a[href]'); if (!link) return;
    if (host.isInternalUrl(link.href)) {
      if (document.documentElement.dataset.nexusPage === 'nexus' && link.closest('#panelActions')) return;
      e.preventDefault(); host.navigateByUrl(link.href);
    }
  }, true);
  window.addEventListener('DOMContentLoaded', () => {
    const page = document.documentElement.dataset.nexusPage;
    for (const link of document.querySelectorAll('a[href]')) {
      const route = host.worldForFile(link.getAttribute('href'));
      if (route) { link.href = host.hrefFor(route); link.removeAttribute('target'); }
      else if (/^https?:/.test(link.href)) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
    }
    if (page === 'nexus') {
      document.getElementById('thread').onclick = () => host.openJourney();
      document.getElementById('guide').onclick = () => host.openGuide();
      document.getElementById('menu').addEventListener('click', () => host.enhanceSearch());
      window.NexusApp.setStill(host.still, true);
    } else {
      document.body.classList.toggle('still', host.still);
      document.getElementById('still')?.addEventListener('click', () => host.setStill(document.body.classList.contains('still'), true));
    }
    host.frameReady(window);
  });
})();
