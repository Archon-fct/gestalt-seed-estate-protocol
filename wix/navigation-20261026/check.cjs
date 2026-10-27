const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
for (const file of ['navigation.html', 'production-adapter.html', 'arrival.html']) {
  const html = fs.readFileSync(path.join(__dirname, file), 'utf8');
  assert.ok(html.length <= 15000, `${file}: Wix embed size limit`);
  for (const script of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) new vm.Script(script[1]);
  console.log(`PASS syntax and size: ${file}`);
}
// Record the actual renderer's contour coordinates without a browser or fake image.
const points = [];
const gradient = { addColorStop() {} };
const ctx = new Proxy({
  canvas: {}, createRadialGradient: () => gradient, createLinearGradient: () => gradient,
  moveTo: (x, y) => points.push([x, y]), lineTo: (x, y) => points.push([x, y])
}, {get: (t, p) => p in t ? t[p] : () => {}, set: (t, p, value) => (t[p] = value, true)});
const env = vm.createContext({Math});
vm.runInContext(fs.readFileSync(path.join(__dirname, 'welcome-paint.js'), 'utf8'), env);
const sample = phase => {points.length = 0; env.D(ctx, 560, 560, phase); return JSON.stringify(points);};
const first = sample(0), moving = sample(2);
assert.notEqual(first, moving, 'Time must change the actual contours');
assert.equal(moving, sample(2), 'An unchanged paused phase must not drift');
assert.equal(first, sample(0), 'The same phase must reproduce the same contours');
assert.ok(points.flat().every(Number.isFinite), 'All contour coordinates must be finite');
console.log('PASS contour movement, paused phase stability, deterministic return, finite geometry');
