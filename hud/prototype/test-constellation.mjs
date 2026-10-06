import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const file = 'file://' + path.join(root, 'hud/prototype/index.html');
const out = path.join(root, 'hud/prototype/test-artifacts');
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ headless: true });
const widths = [390, 820, 1280];
const failures = [];

for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const jsErrors = [];
  page.on('pageerror', e => jsErrors.push(String(e)));
  await page.goto(file);
  await page.waitForTimeout(150);

  const nodeCount = await page.locator('.node').count();
  if (nodeCount !== 6) failures.push(width + ': expected 6 public nodes, got ' + nodeCount);

  const overflow = await page.evaluate(() => ({
    horizontal: document.documentElement.scrollWidth > innerWidth,
    sw: document.documentElement.scrollWidth,
    iw: innerWidth
  }));
  if (overflow.horizontal) failures.push(width + ': horizontal overflow ' + overflow.sw + ' > ' + overflow.iw);

  const boxes = await page.locator('.node').evaluateAll(nodes => nodes.map(n => {
    const r = n.getBoundingClientRect();
    return { left:r.left, right:r.right, top:r.top, bottom:r.bottom, w:r.width, h:r.height };
  }));
  boxes.forEach((b,i) => {
    if (b.left < 0 || b.right > width || b.top < 0 || b.bottom > 900) failures.push(width + ': node ' + i + ' out of viewport');
    if (b.w < 44 || b.h < 44) failures.push(width + ': node ' + i + ' touch target under 44px');
  });

  await page.locator('[data-id="aura"]').click();
  if (!(await page.locator('#veil').getAttribute('class') || '').includes('open')) failures.push(width + ': Aura dimension did not open');
  if ((await page.locator('#title').textContent()) !== 'Aura Dynamics') failures.push(width + ': Aura title mismatch');
  if ((await page.locator('#space').getAttribute('aria-hidden')) !== 'true') failures.push(width + ': Nexus not hidden from AT while dialog open');
  if ((await page.locator('#veil').getAttribute('aria-hidden')) !== 'false') failures.push(width + ': dialog aria-hidden not false');
  if ((await page.evaluate(() => document.activeElement?.id)) !== 'back') failures.push(width + ': focus did not move to back control');

  await page.keyboard.press('Escape');
  await page.waitForTimeout(50);
  if ((await page.locator('#veil').getAttribute('aria-hidden')) !== 'true') failures.push(width + ': Escape did not close dialog');
  const focused = await page.evaluate(() => document.activeElement?.getAttribute('data-id'));
  if (focused !== 'aura') failures.push(width + ': focus did not return to origin node');

  await page.locator('#still').click();
  if (!(await page.locator('body').getAttribute('class') || '').includes('still')) failures.push(width + ': Stillness did not activate');

  const text = await page.content();
  if (/silver/i.test(text)) failures.push(width + ': public prototype contains forbidden Silver reference');

  if (jsErrors.length) failures.push(width + ': JS errors: ' + jsErrors.join(' | '));
  await page.screenshot({ path:path.join(out, width + '.png'), fullPage:true });
  await page.close();
}

const reduced = await browser.newPage({ viewport:{ width:390,height:900 }, reducedMotion:'reduce' });
await reduced.goto(file);
const animation = await reduced.locator('.node').first().evaluate(el => getComputedStyle(el).animationName);
if (animation !== 'none') failures.push('reduced-motion: node animation still active: ' + animation);
await reduced.close();

await browser.close();

if (failures.length) {
  console.error('FAIL\n' + failures.join('\n'));
  process.exit(1);
}
console.log('PASS: 390/820/1280 layout, interactions, focus, Stillness, reduced motion, JS errors, and public Silver exclusion.');
