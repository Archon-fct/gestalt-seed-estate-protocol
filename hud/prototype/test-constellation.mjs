// Release gate: full Living Nexus integration journey
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { readFile } from 'node:fs/promises';

const root = process.cwd();
const siteRoot = path.join(root, 'hud/prototype');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const target = path.resolve(siteRoot, '.' + pathname);
    if (target !== siteRoot && !target.startsWith(siteRoot + path.sep)) {
      res.writeHead(403); res.end(); return;
    }
    const filename = pathname === '/' ? path.join(siteRoot, 'index.html') : target;
    const data = await readFile(filename);
    res.writeHead(200, { 'Content-Type': mime[path.extname(filename)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  } catch (error) {
    res.writeHead(error.code === 'ENOENT' ? 404 : 500);
    res.end('Resource unavailable');
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = 'http://127.0.0.1:' + server.address().port;
const file = origin + '/index.html';
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

  if((await page.locator('#threadButton').textContent())!=='Living Thread · 0')failures.push(width+': Living Thread should begin empty');
  if((await page.locator('#soulButton').textContent())!=='Create My Soul')failures.push(width+': Soul should begin as explicit opt-in');
  await page.locator('#soulButton').click();
  if(!(await page.locator('#soulConsent').getAttribute('open')!==null))failures.push(width+': Soul consent chamber did not open as a modal');
  if((await page.evaluate(()=>document.activeElement?.id))!=='confirmSoul')failures.push(width+': Soul consent focus did not move to explicit confirmation');
  const consentDiagnostics = await page.evaluate(() => {
    const dialog = document.querySelector('#soulConsent');
    const button = document.querySelector('#confirmSoul');
    const rect = button.getBoundingClientRect();
    const style = getComputedStyle(button);
    const dialogStyle = getComputedStyle(dialog);
    return { open: dialog.open, active: document.activeElement?.id,
      buttonRect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      buttonDisplay: style.display, buttonVisibility: style.visibility,
      dialogDisplay: dialogStyle.display, dialogVisibility: dialogStyle.visibility,
      dialogOpacity: dialogStyle.opacity, dialogRect: dialog.getBoundingClientRect().toJSON() };
  });
  console.log('SOUL_CONSENT_DIAGNOSTICS', width, JSON.stringify(consentDiagnostics));
  console.log('SOUL_SCRIPT_DIAGNOSTICS', width, JSON.stringify(await page.evaluate(() => ({ moduleCount: document.querySelectorAll('script[type=module]').length, scripts: [...document.scripts].map(s => s.src || s.type || 'classic'), soulModuleLoaded: Boolean(document.querySelector('#soulButton')?.onclick), performance: performance.getEntriesByType('resource').filter(x => /soul|atmosphere|event-souls/.test(x.name)).map(x => x.name) }))));
  await page.screenshot({ path: path.join(out, 'soul-consent-' + width + '.png'), fullPage: true });
  await page.locator('#confirmSoul').click({ timeout: 5000 });
  const soulState=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('archonSoul.v1')||'null'));
  if(!soulState||!/^soul_[0-9a-f]{32}$/.test(soulState.id||''))failures.push(width+': Soul creation did not create a valid local Soul ID');
  if(soulState?.chain!==null||soulState?.economic!==false)failures.push(width+': Soul v0.1 must remain off-chain and non-economic');
  if(!(await page.locator('#soulButton').textContent()).startsWith('My Soul · '))failures.push(width+': Soul control did not reflect created identity');
  if(!(await page.locator('body').getAttribute('class')||'').includes('has-soul'))failures.push(width+': Soul did not alter the living Nexus field');
  if((await page.locator('.nexus-membrane').count())!==3)failures.push(width+': central Nexus membranes missing');
  const nexusText=(await page.locator('.nexus').innerText()).toUpperCase();
  if(!nexusText.includes('NEXUS')||!nexusText.includes('MEETING FIELD')||!nexusText.includes('THARAVEL'))failures.push(width+': visual authority inscription missing from Nexus');
  await page.locator('#searchButton').click();await page.locator('#searchInput').fill('boundaries');await page.locator('#runSearch').click();if(!(await page.locator('[data-id="aura"]').getAttribute('class')||'').includes('search-hit'))failures.push(width+': constellation search did not illuminate Aura for boundaries');if(!(await page.locator('[data-id="workshops"]').getAttribute('class')||'').includes('search-neighbor'))failures.push(width+': constellation search did not reveal related Workshops world');await page.locator('#searchButton').click();await page.locator('#clearSearch').click();
  await page.locator('#guide').click();await page.locator('[data-intent="learn"]').click();
  if(!(await page.locator('[data-id="aura"]').getAttribute('class')||'').includes('recommended'))failures.push(width+': Guide Me did not recommend Aura for Learn');
  if(!(await page.locator('[data-id="services"]').getAttribute('class')||'').includes('deemphasized'))failures.push(width+': Guide Me did not reorganize non-learning world');
  await page.locator('[data-id="aura"]').hover();
  if (!(await page.locator('[data-nerve="aura"]').getAttribute('class') || '').includes('hot')) failures.push(width + ': Aura nerve did not respond to hover');
  if (!(await page.locator('#space').getAttribute('class') || '').includes('resonating')) failures.push(width + ': world attraction resonance did not activate');
  if (!(await page.locator('[data-id="aura"]').getAttribute('class') || '').includes('resonant')) failures.push(width + ': selected world did not enter resonant state');
  await page.locator('[data-id="aura"]').click();
  await page.waitForTimeout(780);
  if((await page.locator('#threadButton').textContent())!=='Living Thread · 1')failures.push(width+': Living Thread did not remember Aura visit');
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

  await page.locator('#threadButton').click();
  if(!(await page.locator('#journeyPanel').getAttribute('class')||'').includes('open'))failures.push(width+': Living Thread panel did not open');
  if((await page.locator('.journey-seed').count())!==1)failures.push(width+': Living Thread expected one journey seed');
  await page.locator('#saveJourney').click();
  const stored=await page.evaluate(()=>sessionStorage.getItem('archonLivingThread.v1'));
  if(!stored||!stored.includes('aura'))failures.push(width+': explicit session save did not persist journey');
  await page.locator('#threadButton').click();await page.locator('#dissolveJourney').click();
  if((await page.locator('#threadButton').textContent())!=='Living Thread · 0')failures.push(width+': dissolve did not clear journey');
  if(await page.evaluate(()=>sessionStorage.getItem('archonLivingThread.v1')||sessionStorage.getItem('archonLivingThread.session.v1')))failures.push(width+': dissolve did not clear saved/session journey');
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
await sanctum.goto('file://' + path.join(root,'hud/prototype/inner-sanctum.html'));const sanctJourney=await sanctum.evaluate(()=>sessionStorage.getItem('archonLivingThread.session.v1'));if(!sanctJourney||!sanctJourney.includes('services'))failures.push('sanctum: shared Living Thread did not remember world entry');
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


const archivePage=await browser.newPage({viewport:{width:390,height:900}});const archiveErrors=[];archivePage.on('pageerror',e=>archiveErrors.push(String(e)));await archivePage.goto('file://' + path.join(root,'hud/prototype/living-archive.html'));if((await archivePage.locator('.stone').count())!==6)failures.push('archive: expected six visible prototype stones');await archivePage.locator('[data-stone="motto"]').focus();if(!(await archivePage.locator('#archive').getAttribute('class')||'').includes('resonating'))failures.push('archive: stone resonance failed');await archivePage.locator('[data-stone="motto"]').click();if((await archivePage.locator('#title').textContent())!=='Tharavel · Kosmathra')failures.push('archive: motto record mismatch');await archivePage.locator('[data-rel="USES_CANON"]').click();if((await archivePage.locator('#title').textContent())!=='USES_CANON')failures.push('archive: relationship semantics failed');await archivePage.locator('#about').click();if((await archivePage.locator('#title').textContent())!=='Submission is not publication.')failures.push('archive: review boundary explanation failed');if(/silver/i.test(await archivePage.content()))failures.push('archive: public archive contains forbidden Silver reference');if(archiveErrors.length)failures.push('archive JS errors: '+archiveErrors.join(' | '));await archivePage.screenshot({path:path.join(out,'living-archive-390.png'),fullPage:true});await archivePage.close();


const journal=await browser.newPage({viewport:{width:390,height:900}});const journalErrors=[];journal.on('pageerror',e=>journalErrors.push(String(e)));await journal.goto('file://' + path.join(root,'hud/prototype/astral-journal.html'));if((await journal.locator('.fragment').count())!==6)failures.push('journal: expected six prototype fragments');await journal.locator('[data-entry="motto"]').focus();if(!(await journal.locator('#archive').getAttribute('class')||'').includes('resonating'))failures.push('journal: fragment resonance failed');await journal.locator('[data-entry="motto"]').click();if((await journal.locator('#title').textContent())!=='Tharavel · Kosmathra')failures.push('journal: motto fragment mismatch');await journal.locator('[data-filter="language"]').click();const visible=await journal.locator('.fragment:not([hidden])').count();if(visible!==1)failures.push('journal: language filter expected one visible fragment, got '+visible);await journal.locator('#still').click();if(!(await journal.locator('body').getAttribute('class')||'').includes('still'))failures.push('journal: Stillness failed');if(/silver state|silver prompt|silver route/i.test(await journal.content()))failures.push('journal: public archive exposes private Silver implementation');if(journalErrors.length)failures.push('journal JS errors: '+journalErrors.join(' | '));await journal.screenshot({path:path.join(out,'astral-journal-390.png'),fullPage:true});await journal.close();


const conv=await browser.newPage({viewport:{width:390,height:900}});const convErrors=[];conv.on('pageerror',e=>convErrors.push(String(e)));await conv.goto('file://' + path.join(root,'hud/prototype/convergence.html'));if((await conv.locator('.gate').count())!==4)failures.push('convergence: expected four gathering paths');await conv.locator('[data-gate="host"]').focus();if(!(await conv.locator('#field').getAttribute('class')||'').includes('resonating'))failures.push('convergence: gate resonance failed');await conv.locator('[data-gate="host"]').click();if((await conv.locator('#title').textContent())!=='Create a local convergence.')failures.push('convergence: host content mismatch');await conv.locator('[data-gate="collab"]').click();if((await conv.locator('#primary').textContent())!=='Propose collaboration')failures.push('convergence: collaboration CTA mismatch');await conv.locator('#still').click();if(!(await conv.locator('body').getAttribute('class')||'').includes('still'))failures.push('convergence: Stillness failed');if(/silver/i.test(await conv.content()))failures.push('convergence: public workshop world contains forbidden Silver reference');if(convErrors.length)failures.push('convergence JS errors: '+convErrors.join(' | '));await conv.screenshot({path:path.join(out,'convergence-390.png'),fullPage:true});await conv.close();


const tongue=await browser.newPage({viewport:{width:390,height:900}});const tongueErrors=[];tongue.on('pageerror',e=>tongueErrors.push(String(e)));await tongue.goto('file://' + path.join(root,'hud/prototype/living-tongue.html'));if((await tongue.locator('.word').count())!==6)failures.push('tongue: expected six prototype language nodes');await tongue.locator('[data-word="tharavel"]').click();if((await tongue.locator('#canon').textContent())!=='ADOPTED')failures.push('tongue: Tharavel canon status mismatch');if(!(await tongue.locator('#note').textContent()).includes('Do not split'))failures.push('tongue: Tharavel audit warning missing');await tongue.locator('#origin').click();if(!(await tongue.locator('#note').textContent()).includes('THARAVEL_KOSMATHRA_AUDIT'))failures.push('tongue: provenance gesture failed');await tongue.locator('[data-word="chant"]').click();if(!(await tongue.locator('#canon').textContent()).includes('PENDING LEXICAL RESOLUTION'))failures.push('tongue: unresolved chant status lost');await tongue.locator('#still').click();if(!(await tongue.locator('body').getAttribute('class')||'').includes('still'))failures.push('tongue: Stillness failed');if(/silver/i.test(await tongue.content()))failures.push('tongue: public language world contains forbidden Silver reference');if(tongueErrors.length)failures.push('tongue JS errors: '+tongueErrors.join(' | '));await tongue.screenshot({path:path.join(out,'living-tongue-390.png'),fullPage:true});await tongue.close();


const journeyPage=await browser.newPage({viewport:{width:820,height:900}});
const journeyErrors=[];journeyPage.on('pageerror',e=>journeyErrors.push(String(e)));
await journeyPage.goto('file://' + path.join(root,'hud/prototype/index.html'));
await journeyPage.locator('#guide').click();await journeyPage.locator('[data-intent="learn"]').click();
if(!(await journeyPage.locator('[data-id="aureglossa"]').getAttribute('class')||'').includes('recommended'))failures.push('journey: Guide Me Learn did not recommend Aureglossa');
await journeyPage.locator('#searchButton').click();await journeyPage.locator('#searchInput').fill('boundaries');await journeyPage.locator('#runSearch').click();
if(!(await journeyPage.locator('[data-id="aura"]').getAttribute('class')||'').includes('search-hit'))failures.push('journey: search did not resonate Aura');
await journeyPage.goto('file://' + path.join(root,'hud/prototype/aura-dynamics.html'));
await journeyPage.locator('[data-step="4"]').click();
let p=await journeyPage.evaluate(()=>JSON.parse(sessionStorage.getItem('archonPassport.v1')||'[]'));
if(!p.includes('entered-living-field')||!p.includes('integrated-aura'))failures.push('journey: Aura passport traces missing');
await journeyPage.goto('file://' + path.join(root,'hud/prototype/living-tongue.html'));
await journeyPage.locator('[data-word="tharavel"]').click();await journeyPage.locator('#origin').click();
p=await journeyPage.evaluate(()=>JSON.parse(sessionStorage.getItem('archonPassport.v1')||'[]'));
if(!p.includes('discovered-tharavel')||!p.includes('checked-provenance'))failures.push('journey: Aureglossa passport traces missing');
await journeyPage.goto('file://' + path.join(root,'hud/prototype/living-archive.html'));
await journeyPage.locator('[data-rel="EXTENDS"]').click();
if((await journeyPage.locator('#title').textContent())!=='EXTENDS')failures.push('journey: Gestalt relationship exploration failed');
await journeyPage.goto('file://' + path.join(root,'hud/prototype/index.html'));
const shared=await journeyPage.evaluate(()=>JSON.parse(sessionStorage.getItem('archonLivingThread.session.v1')||'[]'));
if(!shared.includes('aura'))failures.push('journey: shared thread lost Aura across pages');
await journeyPage.locator('#passportButton').click();
if((await journeyPage.locator('#passportMarks .journey-seed').count())<2)failures.push('journey: Field Journal did not render accumulated marks');
await journeyPage.locator('#passportButton').click();
await journeyPage.locator('#threadButton').click();
if(!(await journeyPage.locator('#journeyPanel').getAttribute('class')||'').includes('open'))failures.push('journey: Living Thread did not open after Field Journal');
await journeyPage.locator('#dissolveJourney').click();
if(await journeyPage.evaluate(()=>sessionStorage.getItem('archonLivingThread.session.v1')))failures.push('journey: dissolve did not clear shared thread');
if(journeyErrors.length)failures.push('journey JS errors: '+journeyErrors.join(' | '));
await journeyPage.screenshot({path:path.join(out,'integrated-journey-820.png'),fullPage:true});await journeyPage.close();

await browser.close();
await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));

if (failures.length) {
  console.error('FAIL\n' + failures.join('\n'));
  process.exit(1);
}
console.log('PASS: 390/820/1280 layout, interactions, focus, Stillness, reduced motion, JS errors, and public Silver exclusion.');
