import { paintField } from './field.mjs';

// Chamber-only compositor. The captured production renderer stays untouched.
// No sensors, image assets, network calls or pointer capture.
export function paintVeils(ctx, w, h, time, response) {
  const u = Math.min(w, h), cx = w / 2, cy = h / 2;
  const faces = [];
  for (let k = 0; k < 6; k++) {
    const point = (s, edge) => {
      const a = k * 2.399 + time * (k % 2 ? -.13 : .11) + s * 3.8;
      const wave = Math.sin(s * 8 - time * .47 + k);
      const r = u * (.20 + (k % 3) * .024 + .016 * wave);
      const z = Math.sin(a + k * .3);
      const width = u * (.009 + .012 * Math.sin(s * Math.PI) ** 2);
      const rr = r + edge * width;
      return {x: cx + Math.cos(a) * rr + response.x * (2 + z * 3),
        y: cy + Math.sin(a) * rr * (.65 + (k % 3) * .10) + response.y * (2 + z * 3), z};
    };
    for (let j = 0; j < 40; j++) {
      const s = j / 40, p = [point(s, -1), point(s + .025, -1), point(s + .025, 1), point(s, 1)];
      faces.push({p, z: p.reduce((sum, v) => sum + v.z, 0) / 4, k, s});
    }
  }
  faces.sort((a, b) => a.z - b.z);
  ctx.save();
  // Preserve the original central eye; the folds pass around it, not over its label.
  ctx.beginPath(); ctx.arc(cx, cy, u * .32, 0, Math.PI * 2);
  ctx.arc(cx, cy, u * .142, 0, Math.PI * 2, true); ctx.clip('evenodd');
  for (const {p, z, k, s} of faces) {
    const edge = Math.sin(s * Math.PI) ** 2;
    const alpha = (.045 + (z + 1) * .065) * edge * (.7 + response.reveal * .3);
    const color = k % 3 === 0 ? '193,164,225' : k % 3 === 1 ? '115,202,203' : '209,193,150';
    const gradient = ctx.createLinearGradient(p[0].x, p[0].y, p[3].x, p[3].y);
    gradient.addColorStop(0, `rgba(${color},${alpha * .15})`);
    gradient.addColorStop(.6, `rgba(${color},${alpha})`);
    gradient.addColorStop(1, `rgba(${color},${alpha * .35})`);
    ctx.beginPath(); p.forEach((v, i) => i ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y));
    ctx.closePath(); ctx.fillStyle = gradient; ctx.fill();
    ctx.beginPath(); ctx.moveTo(p[3].x, p[3].y); ctx.lineTo(p[2].x, p[2].y);
    ctx.strokeStyle = `rgba(${color},${alpha * 1.6})`; ctx.lineWidth = .65; ctx.stroke();
  }
  ctx.restore();
}

export function mountChamberField(canvas, {targets = () => [], selection = () => -1,
  still = () => false, opened = () => false} = {}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return {refresh() {}, destroy() {}};
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = {x: 0, y: 0}, response = {x: 0, y: 0, reveal: 0};
  let frame = 0, last = null, elapsed = 0, time = 0, aperture = .68;
  let visible = true, dead = false, width = 0, height = 0, frames = 0, paintMs = 0;
  const interval = 1000 / 30;
  const paused = () => still() || media.matches || document.hidden || !visible;
  function measure() {
    const rect = canvas.getBoundingClientRect(); width = rect.width; height = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const bw = Math.round(width * dpr), bh = Math.round(height * dpr);
    if (canvas.width !== bw || canvas.height !== bh) { canvas.width = bw; canvas.height = bh; }
  }
  function draw(dt = 0) {
    if (!width || !height) return;
    const started = performance.now();
    time += dt;
    const ease = 1 - Math.exp(-dt * 5);
    response.x += (pointer.x - response.x) * ease;
    response.y += (pointer.y - response.y) * ease;
    response.reveal += ((opened() ? 1 : 0) - response.reveal) * ease;
    aperture += ((selection() >= 0 ? .61 : .69) - aperture) * ease;
    ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
    paintField(ctx, width, height, time, {selected: selection(), targets: targets(), aperture});
    paintVeils(ctx, width, height, time, response);
    paintMs += performance.now() - started;
    canvas.dataset.frames = String(++frames);
    canvas.dataset.paintMs = String(paintMs);
  }
  function stop() { cancelAnimationFrame(frame); frame = 0; last = null; elapsed = 0; }
  function tick(now) {
    frame = 0;
    if (dead || paused()) { last = null; elapsed = 0; return; }
    if (last === null) last = now;
    elapsed += Math.max(0, now - last); last = now;
    if (elapsed + .001 >= interval) {
      const steps = Math.floor((elapsed + .001) / interval);
      elapsed = Math.max(0, elapsed - steps * interval);
      draw(Math.min(.1, steps * interval / 1000));
    }
    frame = requestAnimationFrame(tick);
  }
  function refresh() {
    if (dead) return;
    if (paused()) { stop(); if (!document.hidden && visible) { measure(); draw(); } return; }
    measure(); draw();
    // Selection/pointer input must not restart the animation clock.
    if (!frame) frame = requestAnimationFrame(tick);
  }
  const surface = canvas.parentElement;
  function move(event) {
    if (paused() || event.pointerType === 'touch') return;
    const rect = surface.getBoundingClientRect();
    pointer.x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
    pointer.y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
  }
  function resetPointer() { pointer.x = 0; pointer.y = 0; }
  const ro = new ResizeObserver(refresh);
  const io = new IntersectionObserver(entries => { visible = entries.some(e => e.isIntersecting); refresh(); });
  ro.observe(canvas); io.observe(canvas);
  surface.addEventListener('pointermove', move, {passive: true});
  surface.addEventListener('pointerleave', resetPointer);
  // addListener supports older Safari MediaQueryList implementations.
  if (media.addEventListener) media.addEventListener('change', refresh); else media.addListener(refresh);
  document.addEventListener('visibilitychange', refresh);
  window.addEventListener('pageshow', refresh); window.addEventListener('pagehide', stop);
  refresh();
  return {refresh, destroy() {
    dead = true; stop(); ro.disconnect(); io.disconnect();
    surface.removeEventListener('pointermove', move); surface.removeEventListener('pointerleave', resetPointer);
    if (media.removeEventListener) media.removeEventListener('change', refresh); else media.removeListener(refresh);
    document.removeEventListener('visibilitychange', refresh);
    window.removeEventListener('pageshow', refresh); window.removeEventListener('pagehide', stop);
  }};
}
