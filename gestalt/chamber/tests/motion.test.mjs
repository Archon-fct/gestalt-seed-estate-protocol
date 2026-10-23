import test from 'node:test';
import assert from 'node:assert/strict';
import { mountChamberField } from '../site/chamber-field.mjs';

function harness({legacy = false, hz = 60} = {}) {
  const doc = new EventTarget(), win = new EventTarget(), surface = new EventTarget(), media = new EventTarget();
  doc.hidden = false; media.matches = false;
  if (legacy) { media.addListener = fn => EventTarget.prototype.addEventListener.call(media, 'change', fn); media.removeListener = fn => EventTarget.prototype.removeEventListener.call(media, 'change', fn); media.addEventListener = undefined; media.removeEventListener = undefined; }
  const queue = new Map(); let id = 0, clock = 0, io;
  Object.assign(globalThis, {document: doc, window: win, matchMedia: () => media,
    requestAnimationFrame: fn => { queue.set(++id, fn); return id; }, cancelAnimationFrame: key => queue.delete(key),
    ResizeObserver: class {observe() {} disconnect() {}},
    IntersectionObserver: class {constructor(fn) {io = fn;} observe() {} disconnect() {}}});
  const gradient = {addColorStop() {}};
  const context = new Proxy({}, {get: (obj, key) => key === 'createLinearGradient' || key === 'createRadialGradient' ? () => gradient : () => {}});
  const rect = () => ({width: 375, height: 375, top: 0, left: 0});
  surface.getBoundingClientRect = rect;
  const canvas = {getContext: () => context, getBoundingClientRect: rect, parentElement: surface, dataset: {}, width: 0, height: 0};
  let still = false;
  const field = mountChamberField(canvas, {still: () => still});
  function advance(ms) { const steps = Math.round(ms * hz / 1000); for (let n = 0; n < steps; n++) {clock += 1000 / hz; const callbacks = [...queue.values()]; queue.clear(); callbacks.forEach(fn => fn(clock));} }
  return {canvas, field, advance, queue, media, doc, win, surface, visible: value => io([{isIntersecting: value}]), setStill: value => {still = value; field.refresh();}};
}

for (const hz of [60, 120]) test(`stable 30 fps on a simulated ${hz} Hz display`, () => {
  const h = harness({hz}); h.advance(1000 / hz); const before = +h.canvas.dataset.frames;
  h.advance(2000); assert.equal(+h.canvas.dataset.frames - before, 60); h.field.destroy(); assert.equal(h.queue.size, 0);
});
test('Stillness, live media changes, offscreen, visibility and page lifecycle stop and resume', () => {
  const h = harness(); h.advance(200); h.setStill(true); let n = h.canvas.dataset.frames;
  h.advance(500); assert.equal(h.canvas.dataset.frames, n); assert.equal(h.queue.size, 0);
  h.setStill(false); h.advance(200); assert.ok(+h.canvas.dataset.frames > +n);
  h.media.matches = true; h.media.dispatchEvent(new Event('change')); n = h.canvas.dataset.frames;
  h.advance(500); assert.equal(h.canvas.dataset.frames, n);
  h.media.matches = false; h.media.dispatchEvent(new Event('change')); h.advance(200); assert.ok(+h.canvas.dataset.frames > +n);
  h.visible(false); n = h.canvas.dataset.frames; h.field.refresh(); h.advance(200); assert.equal(h.canvas.dataset.frames, n);
  h.visible(true); h.advance(200); assert.ok(+h.canvas.dataset.frames > +n);
  h.doc.hidden = true; h.doc.dispatchEvent(new Event('visibilitychange')); n = h.canvas.dataset.frames; h.advance(200); assert.equal(h.canvas.dataset.frames, n);
  h.doc.hidden = false; h.doc.dispatchEvent(new Event('visibilitychange')); h.advance(200); assert.ok(+h.canvas.dataset.frames > +n);
  h.win.dispatchEvent(new Event('pagehide')); n = h.canvas.dataset.frames; h.advance(200); assert.equal(h.canvas.dataset.frames, n);
  h.win.dispatchEvent(new Event('pageshow')); h.advance(200); assert.ok(+h.canvas.dataset.frames > +n);
  h.field.destroy(); h.field.refresh(); assert.equal(h.queue.size, 0);
});
test('legacy Safari media-query subscription works in the API harness', () => {
  const h = harness({legacy: true}); h.media.matches = true; h.media.dispatchEvent(new Event('change'));
  const n = h.canvas.dataset.frames; h.advance(200); assert.equal(h.canvas.dataset.frames, n); h.field.destroy();
});
