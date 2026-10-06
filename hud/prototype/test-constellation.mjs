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

  await page.locator('[data-id="aura"]').hover();
  if (!(await page.locator('[data-nerve="aura"]').getAttribute('class') || '').includes('hot')) failures.push(width + ': Aura nerve did not respond to hover');
  if (!(await page.locator('#space').getAttribute('class') || '').includes('resonating')) failures.push(width + ': world attraction resonance did not activate');
  if (!(await page.locator('[data-id="aura"]').getAttribute('class') || '').includes('resonant')) failures.push(width + ': selected world did not enter resonant state');
  await page.locator('[data-id="aura"]').click();
  await page.waitForTimeout(780);
  if (!(await page.locator('#veil').getAttribute('class') || '').includes('open')) failures.push(width + ': Aura dimension did not open');
  if ((await page.locator('#title').textContent()) !== 'Aura Dynamics') failures.push(width + ': Aura title mismatch');
  if ((await page.locator('#space').getAttribute('aria-hidden')) !== 'true') failures.push(width + ': Nexus not hidden from AT while dialog open');
  if ((await page.locator('#veil').getAttribute('aria-hidden')) !== 'false') failures.push(width + ': dialog aria-hidden not false');
  if ((await page.evaluate(() => document.activeElement?.id)) !== 'back') failures.push(width + ': focus did not move to back control');

  await page.keyboard.press('Escape');
  await page.waitForTimeout(1400);
  if ((await page.locator('#veil').getAttribute('aria-hidden')) !== 'true') failures.push(width + ': Escape did not close dialog');
  if ((await page.locator('#status').textContent()) !== 'Returned · the field remembers') failures.push(width + ': integration return did not complete');
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


const thresholdPage = await browser.newPage({ viewport:{ width:390,height:900 } });
await thresholdPage.goto('file://' + path.join(root, 'hud/prototype/living-threshold.html'));
const thresholdErrors=[]; thresholdPage.on('pageerror',e=>thresholdErrors.push(String(e)));
await thresholdPage.locator('#enter').click();
if (!(await thresholdPage.locator('#threshold').getAttribute('class') || '').includes('active')) failures.push('threshold: pocket dimension did not open');
if ((await thresholdPage.evaluate(()=>document.activeElement?.id)) !== 'openForm') failures.push('threshold: focus did not enter chamber');
const thresholdText=await thresholdPage.content();
if (/silver/i.test(thresholdText)) failures.push('threshold: public prototype contains forbidden Silver reference');
await thresholdPage.locator('#still').click();
if (!(await thresholdPage.locator('body').getAttribute('class') || '').includes('still')) failures.push('threshold: Stillness did not activate');
await thresholdPage.locator('[data-stage="1"]').click();
if (!(await thresholdPage.locator('body').getAttribute('class') || '').includes('stage-stone')) failures.push('threshold: Stone environment did not activate');
if ((await thresholdPage.locator('#stageTitle').textContent()) !== 'II · The Stone') failures.push('threshold: Stone title mismatch');
await thresholdPage.locator('[data-stage="2"]').click();
if (!(await thresholdPage.locator('body').getAttribute('class') || '').includes('stage-memory')) failures.push('threshold: Memory environment did not activate');
await thresholdPage.locator('[data-stage="3"]').click();
if (!(await thresholdPage.locator('body').getAttribute('class') || '').includes('stage-covenant')) failures.push('threshold: Covenant environment did not activate');
if ((await thresholdPage.locator('.stone.on').count()) !== 4) failures.push('threshold: stage stones did not illuminate through Covenant');
await thresholdPage.keyboard.press('Escape');
if (!(await thresholdPage.locator('#approach').getAttribute('class') || '').includes('active')) failures.push('threshold: Escape did not return to approach');
if (thresholdErrors.length) failures.push('threshold JS errors: '+thresholdErrors.join(' | '));
await thresholdPage.screenshot({path:path.join(out,'living-threshold-390.png'),fullPage:true});
await thresholdPage.close();


const auraPage=await browser.newPage({viewport:{width:390,height:900}});
const auraErrors=[];auraPage.on('pageerror',e=>auraErrors.push(String(e)));
await auraPage.goto('file://' + path.join(root,'hud/prototype/aura-dynamics.html'));
if ((await auraPage.locator('[data-step]').count()) !== 5) failures.push('aura: expected five experiential steps');
await auraPage.locator('[data-step="2"]').click();
if ((await auraPage.locator('#hint').textContent()) !== 'EXPAND · OUTER FIELD') failures.push('aura: Expand lesson did not activate');
if (!(await auraPage.locator('[data-layer="outer"]').getAttribute('class') || '').includes('active')) failures.push('aura: outer field did not activate with Expand');
await auraPage.locator('[data-layer="relational"]').focus();
if (!(await auraPage.locator('[data-layer="relational"]').getAttribute('class') || '').includes('active')) failures.push('aura: keyboard layer inspection failed');
await auraPage.locator('#still').click();
if (!(await auraPage.locator('body').getAttribute('class') || '').includes('still')) failures.push('aura: Stillness did not activate');
if (/silver/i.test(await auraPage.content())) failures.push('aura: public pocket dimension contains forbidden Silver reference');
if(auraErrors.length)failures.push('aura JS errors: '+auraErrors.join(' | '));
await auraPage.screenshot({path:path.join(out,'aura-dynamics-390.png'),fullPage:true});await auraPage.close();


const sanctum=await browser.newPage({viewport:{width:390,height:900}});
const sanctumErrors=[];sanctum.on('pageerror',e=>sanctumErrors.push(String(e)));
await sanctum.goto('file://' + path.join(root,'hud/prototype/inner-sanctum.html'));
if((await sanctum.locator('.path').count())!==4)failures.push('sanctum: expected four pathways');
await sanctum.locator('[data-path="clarity"]').focus();
if(!(await sanctum.locator('#paths').getAttribute('class')||'').includes('resonating'))failures.push('sanctum: pathway resonance failed');
await sanctum.locator('[data-path="clarity"]').click();
if(!(await sanctum.locator('#detail').getAttribute('class')||'').includes('open'))failures.push('sanctum: detail chamber did not open');
if((await sanctum.locator('#detailKicker').textContent())!=='CLARITY')failures.push('sanctum: clarity content mismatch');
await sanctum.keyboard.press('Escape');
if((await sanctum.locator('#detail').getAttribute('class')||'').includes('open'))failures.push('sanctum: Escape did not close detail');
await sanctum.locator('#still').click();if(!(await sanctum.locator('body').getAttribute('class')||'').includes('still'))failures.push('sanctum: Stillness failed');
if(/silver/i.test(await sanctum.content()))failures.push('sanctum: public pocket dimension contains forbidden Silver reference');
if(sanctumErrors.length)failures.push('sanctum JS errors: '+sanctumErrors.join(' | '));
await sanctum.screenshot({path:path.join(out,'inner-sanctum-390.png'),fullPage:true});await sanctum.close();

await browser.close();

if (failures.length) {
  console.error('FAIL\n' + failures.join('\n'));
  process.exit(1);
}
console.log('PASS: 390/820/1280 layout, interactions, focus, Stillness, reduced motion, JS errors, and public Silver exclusion.');
