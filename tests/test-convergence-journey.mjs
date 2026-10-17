// Read-only local browser regression suite. No messages, reservations or payments are sent.
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {createHash} from 'node:crypto';
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(process.env.SITE_ROOT || 'hud/prototype');
const baseline = process.env.BASELINE_ROOT ? path.resolve(process.env.BASELINE_ROOT) : null;
const out = path.resolve(process.env.REPORT_DIR || 'test-artifacts/convergence-journey');
await fs.mkdir(out, {recursive: true});
const results = [];
const outbound = [];
const errors = [];
const check = (name, passed, detail = '') => results.push({name, status: passed ? 'PASS' : 'FAIL', detail});
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
const server = http.createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const isBaseline = urlPath.startsWith('/baseline/');
    const dir = isBaseline ? baseline : root;
    if (!dir) {res.writeHead(404); res.end(); return;}
    const rel = isBaseline ? urlPath.slice('/baseline/'.length) : urlPath.slice(1);
    const file = path.resolve(dir, rel || 'convergence.html');
    if (!file.startsWith(dir + path.sep)) {res.writeHead(403); res.end(); return;}
    const bytes = await fs.readFile(file);
    res.writeHead(200, {'Content-Type':mime[path.extname(file)] || 'text/plain', 'Cache-Control':'no-store'});
    res.end(bytes);
  } catch {res.writeHead(404);res.end('Not found');}
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = 'http://127.0.0.1:' + server.address().port;
const launch = {headless: true};
if (process.env.PLAYWRIGHT_EXECUTABLE_PATH) launch.executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
if (process.env.PLAYWRIGHT_NO_SANDBOX === '1') launch.args = ['--no-sandbox'];
const browser = await chromium.launch(launch);
async function context(options = {}) {
  const ctx = await browser.newContext({acceptDownloads:true, ...options});
  await ctx.route('**/*', route => {
    const url = route.request().url();
    if (url.startsWith(origin + '/') || url.startsWith('blob:') || url.startsWith('data:')) return route.continue();
    outbound.push(url); return route.abort();
  });
  ctx.on('page', page => page.on('pageerror', e => errors.push(String(e))));
  return ctx;
}
async function openInquiry(page, key) {
  await page.locator(`[data-gate="${key}"]`).click();
  await page.locator('#primary').click();
}
async function prepare(page, text = 'A clear, non-sensitive practice question.') {
  await page.locator('#inquiryGoal').fill(text);
  await page.locator('#inquiryConsent').check();
  await page.locator('#reviewInquiry').click();
}
async function fileFromDownload(page, button) {
  const waiting = page.waitForEvent('download');
  await page.locator(button).click();
  const download = await waiting;
  return {filename: download.suggestedFilename(), text: await fs.readFile(await download.path(), 'utf8')};
}
const mockAudio = () => {
  window.__audio = {created:0,started:0,stopped:0,disconnected:0,suspended:0,delayed:false,pending:[]};
  class Audio {
    constructor() {window.__audio.created++; this.destination = {};}
    suspend() {window.__audio.suspended++; return Promise.resolve();}
    resume() {return window.__audio.delayed ? new Promise(resolve => window.__audio.pending.push(resolve)) : Promise.resolve();}
    createGain() {return {gain:{value:0},connect(){return this;},disconnect(){window.__audio.disconnected++;}};}
    createOscillator() {return {frequency:{value:0},connect(){return this;},start(){window.__audio.started++;},stop(){window.__audio.stopped++;},disconnect(){window.__audio.disconnected++;}};}
  }
  window.AudioContext = Audio; window.webkitAudioContext = Audio;
};
let fatal = null;
try {
  for (const width of [390, 820, 1280]) {
    const ctx = await context({viewport:{width,height:900},reducedMotion:'reduce',hasTouch:width<1000});
    const page = await ctx.newPage(); page.setDefaultTimeout(5000);
    await page.goto(origin + '/convergence.html');
    await page.waitForFunction(() => document.querySelector('#convergenceInquiry'));
    check(`${width}: four existing gates`, await page.locator('.gate').count() === 4);
    check(`${width}: no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    check(`${width}: Nexus return preserved`, await page.locator('.nexus-home').getAttribute('href') === './index.html');
    check(`${width}: original procedural renderer present`, await page.locator('#livingPocketMaterial').count() === 1);
    check(`${width}: reduced-motion renderer paused`, await page.locator('#livingPocketMaterial').getAttribute('data-motion') === 'paused');
    check(`${width}: renderer pointer-inert`, await page.locator('#livingPocketMaterial').evaluate(e => getComputedStyle(e).pointerEvents) === 'none');
    await page.screenshot({path:path.join(out, `updated-${width}.png`),fullPage:true});
    const after = await page.locator('.field').screenshot({animations:'disabled'});
    await fs.writeFile(path.join(out,`field-updated-${width}.png`),after);
    if (baseline) {
      const beforePage = await ctx.newPage();
      await beforePage.goto(origin + '/baseline/convergence.html');
      await beforePage.waitForFunction(() => document.querySelector('#livingPocketMaterial'));
      await beforePage.screenshot({path:path.join(out,`baseline-${width}.png`),fullPage:true});
      const before = await beforePage.locator('.field').screenshot({animations:'disabled'});
      await fs.writeFile(path.join(out,`field-baseline-${width}.png`),before);
      check(`${width}: field screenshot byte-identical to pinned baseline`, before.equals(after),
        `before=${createHash('sha256').update(before).digest('hex')} after=${createHash('sha256').update(after).digest('hex')}`);
      await beforePage.close();
    }
    await page.locator('#primary').click();
    check(`${width}: unselected Continue focuses first gate`, await page.evaluate(() => document.activeElement?.dataset.gate) === 'attend');
    for (const [key, label, cta] of [['attend','Attend','See workshops'],['host','Host','Discuss hosting'],['teach','Invite','Invite a workshop'],['collab','Collaborate','Propose collaboration']]) {
      await openInquiry(page, key);
      check(`${width}/${key}: legacy CTA label preserved`, await page.locator('#primary').textContent() === cta);
      check(`${width}/${key}: selected gate announced`, await page.locator(`[data-gate="${key}"]`).getAttribute('aria-pressed') === 'true');
      check(`${width}/${key}: dialog title`, (await page.locator('#inquiryTitle').textContent()).startsWith(label));
      check(`${width}/${key}: input receives focus`, await page.evaluate(() => document.activeElement.id) === 'inquiryGoal');
      check(`${width}/${key}: draft does not bleed across paths`, await page.locator('#inquiryGoal').inputValue() === '');
      check(`${width}/${key}: modal fits viewport`, await page.locator('#convergenceInquiry').evaluate(e => {const b=e.getBoundingClientRect();return b.left>=0&&b.right<=innerWidth&&b.top>=0&&b.bottom<=innerHeight;}));
      check(`${width}/${key}: review is hidden before consent`, await page.locator('#inquiryReview').isHidden());
      await page.locator('#inquiryGoal').fill('   ');
      await page.locator('#reviewInquiry').click();
      check(`${width}/${key}: empty/whitespace draft blocked`, await page.locator('#inquiryReview').isHidden());
      const text = `${label}: <img src=x onerror=alert(1)> &bcc=outsider@example.invalid`;
      await prepare(page,text);
      check(`${width}/${key}: reviewed text is literal, not HTML`, (await page.locator('#inquiryText').textContent()).includes(text) && await page.locator('#inquiryText img').count() === 0);
      check(`${width}/${key}: review focus`, await page.evaluate(() => document.activeElement.id) === 'inquiryReviewTitle');
      const mail = new URL(await page.locator('#emailInquiry').getAttribute('href'));
      check(`${width}/${key}: fixed verified public recipient`, mail.protocol === 'mailto:' && mail.pathname === 'Drew@ArchonSoulings.com');
      check(`${width}/${key}: body cannot inject recipient headers`, !mail.searchParams.has('bcc') && !mail.searchParams.has('cc') && mail.searchParams.get('body').includes('&bcc='));
      check(`${width}/${key}: no claimed booking or delivery`, (await page.locator('#inquiryStatus').textContent()).includes('Nothing has been sent or reserved'));
      if (key === 'attend') await page.screenshot({path:path.join(out,`inquiry-${width}.png`),fullPage:true});
      await page.keyboard.press('Escape');
      check(`${width}/${key}: Escape restores original CTA focus`, await page.evaluate(() => !document.querySelector('#convergenceInquiry').open && document.activeElement.id === 'primary'));
    }
    await page.locator('#other').click();
    check(`${width}: reset clears stale CTA and selected state`, await page.locator('#primary').textContent() === 'Continue' && await page.locator('#primary').getAttribute('href') === '#field' && await page.locator('.gate[aria-pressed="true"]').count() === 0);
    await page.locator('#primary').click();
    check(`${width}: reset does not open prior inquiry`, await page.locator('#convergenceInquiry').evaluate(e => !e.open));
    await ctx.close();
  }

  const ctx = await context({viewport:{width:390,height:900},reducedMotion:'reduce'});
  const page = await ctx.newPage();page.setDefaultTimeout(5000);
  await page.goto(origin + '/convergence.html');
  await page.evaluate(() => {localStorage.setItem('unrelated-test','keep');sessionStorage.setItem('archonLivingThread.session.v1','["aura"]');});
  await openInquiry(page,'collab');
  await page.locator('#inquiryGoal').fill('A test collaboration');
  await page.locator('#reviewInquiry').click();
  check('unchecked consent blocks review', await page.locator('#inquiryReview').isHidden());
  await prepare(page,'A test collaboration');
  const exported = await fileFromDownload(page,'#exportInquiry');
  check('inquiry export contains exact reviewed text', exported.text === await page.locator('#inquiryText').textContent());
  check('inquiry export has scoped .txt filename', exported.filename === 'archon-collab-inquiry.txt');
  check('inquiry export explicitly remains unsent', exported.text.includes('UNSENT DRAFT') && exported.text.includes('Not a reservation'));
  await page.locator('.sheet-next summary').click();
  const followup = await fileFromDownload(page,'#exportFollowup');
  check('follow-up export is blank organizer, not credential', followup.filename === 'archon-collab-follow-up.txt' && followup.text.includes('Not proof of attendance') && followup.text.includes('Official receipt location:'));
  await page.locator('#editInquiry').click();
  check('Edit removes stale share URL and preview', await page.locator('#emailInquiry').getAttribute('href') === null && await page.locator('#inquiryText').textContent() === '');
  await page.locator('#inquiryGoal').evaluate(e => {e.value='x'.repeat(601);e.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.locator('#reviewInquiry').click();
  check('programmatic over-limit input is rejected', await page.locator('#inquiryReview').isHidden() && await page.locator('#inquiryGoal').evaluate(e => !e.validity.valid));
  const longText = '🌌'.repeat(250);
  await prepare(page,longText);
  const longMail = new URL(await page.locator('#emailInquiry').getAttribute('href'));
  check('long Unicode draft uses explicit subject-only fallback', !longMail.searchParams.has('body') && (await page.locator('#inquiryEmailHint').textContent()).includes('subject only'));
  const longExport = await fileFromDownload(page,'#exportInquiry');
  check('long export does not silently truncate Unicode', longExport.text.includes(longText));
  await page.locator('#dissolveInquiry').click();
  check('Dissolve clears all selected form fields and consent', await page.locator('#inquiryGoal').inputValue() === '' && await page.locator('#inquiryTiming').inputValue() === '' && await page.locator('#inquiryFormat').inputValue() === '' && !(await page.locator('#inquiryConsent').isChecked()));
  check('Dissolve clears reviewed text and mail URL', await page.locator('#inquiryText').textContent() === '' && await page.locator('#emailInquiry').getAttribute('href') === null);
  await page.keyboard.press('Escape');await page.locator('#primary').click();
  check('Dissolved draft stays empty when reopened', await page.locator('#inquiryGoal').inputValue() === '');
  await prepare(page,'A draft to remove on navigation');
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true})));
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
  check('history navigation clears unsent draft memory and review', await page.locator('#inquiryGoal').inputValue() === '' && await page.locator('#inquiryText').textContent() === '' && await page.locator('#emailInquiry').getAttribute('href') === null);
  check('no new persistent storage or unrelated deletion', await page.evaluate(() => localStorage.length===1 && localStorage.getItem('unrelated-test')==='keep' && sessionStorage.length===1 && sessionStorage.getItem('archonLivingThread.session.v1')==='["aura"]'));
  // Unsupported download APIs retain the reviewed text and report failure.
  await prepare(page,'A draft with a simulated unavailable download API');
  await page.evaluate(() => {URL.createObjectURL=()=>{throw new Error('test only');};});
  await page.locator('#exportInquiry').click();
  check('download failure is honest and leaves copyable text', (await page.locator('#inquiryStatus').textContent()).includes('Export is unavailable') && (await page.locator('#inquiryText').textContent()).includes('simulated unavailable'));
  await ctx.close();

  const audioCtx = await context({viewport:{width:820,height:900}});
  await audioCtx.addInitScript(mockAudio);
  const sound = await audioCtx.newPage();await sound.goto(origin + '/convergence.html');
  check('audio is off until explicit opt-in', await sound.evaluate(() => window.__audio.created === 0));
  await sound.locator('#sound').click();
  await sound.waitForFunction(() => document.querySelector('#sound').dataset.audioState==='on');
  check('explicit Atmosphere starts only two original tones', await sound.evaluate(() => window.__audio.started === 2));
  await sound.locator('#still').click();
  check('Stillness immediately stops tones and resets audio', await sound.evaluate(() => window.__audio.stopped===2 && document.querySelector('#sound').dataset.audioState==='off' && document.querySelector('#sound').getAttribute('aria-pressed')==='false'));
  check('Stillness stops decorative transitions', await sound.locator('.gate').first().evaluate(e => getComputedStyle(e).transitionDuration) === '0s');
  await sound.locator('#still').click();
  check('leaving Stillness does not restart sound', await sound.evaluate(() => window.__audio.started===2 && document.querySelector('#sound').dataset.audioState==='off'));
  await sound.evaluate(() => {window.__audio.delayed=true;document.querySelector('#sound').click();document.querySelector('#still').click();window.__audio.pending.splice(0).forEach(resolve=>resolve());});
  await sound.waitForTimeout(40);
  check('pending audio cannot start after Stillness', await sound.evaluate(() => window.__audio.started===2 && document.querySelector('#sound').dataset.audioState==='off'));
  await sound.evaluate(() => {document.querySelector('#still').click();window.__audio.delayed=false;});
  await sound.locator('#sound').click();
  await sound.waitForFunction(() => document.querySelector('#sound').dataset.audioState==='on');
  await sound.evaluate(() => {Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  check('hidden tab stops audio', await sound.locator('#sound').getAttribute('data-audio-state') === 'off');
  await sound.evaluate(() => {Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
  check('returning to tab does not auto-resume audio', await sound.evaluate(() => window.__audio.started===4 && document.querySelector('#sound').dataset.audioState==='off'));
  await audioCtx.close();

  const fallbackCtx = await context({viewport:{width:390,height:900},reducedMotion:'reduce'});
  await fallbackCtx.addInitScript(() => {window.AudioContext=undefined;window.webkitAudioContext=undefined;HTMLCanvasElement.prototype.getContext=()=>null;HTMLDialogElement.prototype.showModal=undefined;});
  const fallback = await fallbackCtx.newPage();await fallback.goto(origin + '/convergence.html');
  await fallback.locator('[data-gate="host"]').click();
  check('missing Canvas does not break gate navigation', await fallback.locator('#title').textContent() === 'Create a local convergence.');
  check('missing dialog support retains email fallback', (await fallback.locator('#primary').getAttribute('href')).startsWith('mailto:Drew@ArchonSoulings.com?subject=Workshop%20hosting'));
  await fallback.locator('#sound').click();
  check('missing audio API is reported without crashing', await fallback.locator('#sound').getAttribute('data-audio-state') === 'unavailable');
  await fallbackCtx.close();

  const noScriptCtx = await context({viewport:{width:390,height:900},javaScriptEnabled:false});
  const noScript = await noScriptCtx.newPage();await noScript.goto(origin + '/convergence.html');
  check('no-JavaScript public contact fallback exists', await noScript.locator('noscript a[href="mailto:Drew@ArchonSoulings.com"]').isVisible());
  await noScriptCtx.close();

  const fileCtx = await browser.newContext({viewport:{width:390,height:900},reducedMotion:'reduce'});
  const filePage = await fileCtx.newPage();filePage.on('pageerror',e=>errors.push(String(e)));
  await filePage.goto('file://' + path.join(root,'convergence.html'));
  await filePage.locator('[data-gate="host"]').focus();
  check('legacy file:// gate resonance preserved', (await filePage.locator('#field').getAttribute('class')).includes('resonating'));
  await filePage.locator('[data-gate="host"]').click();
  check('legacy host copy preserved', await filePage.locator('#title').textContent() === 'Create a local convergence.');
  await filePage.locator('[data-gate="collab"]').click();
  check('legacy collaboration CTA preserved', await filePage.locator('#primary').textContent() === 'Propose collaboration');
  await filePage.locator('#primary').click();
  check('inquiry also works in file:// preview', await filePage.locator('#convergenceInquiry').evaluate(e=>e.open));
  await fileCtx.close();
  const source = await Promise.all(['convergence.html','convergence-journey.js','convergence-journey.css'].map(file=>fs.readFile(path.join(root,file),'utf8')));
  check('changed public runtime excludes private assistant identity', !/silver|nox|efa\b|api[_-]?key|sk-proj-/i.test(source.join('\n')));
  check('new journey contains no storage, fetch, microphone or telemetry calls', !/localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest|getUserMedia|sendBeacon/.test(source[1]));
  check('no external network requests', outbound.length===0, JSON.stringify(outbound));
  check('no unhandled browser errors', errors.length===0, JSON.stringify(errors));
} catch (error) {
  fatal = String(error.stack || error);
  check('suite completed without fatal error', false, fatal);
} finally {
  const report = {suite:'Convergence inquiry journey 0.1',sourceSha:process.env.SOURCE_SHA || 'local working tree',
    browser:browser.version(),physicalSafariTested:false,productionTested:false,
    baselineScreenshotComparison:baseline ? 'EXECUTED' : 'NOT RUN',
    passed:results.filter(r=>r.status==='PASS').length,failed:results.filter(r=>r.status==='FAIL').length,results};
  await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({passed:report.passed,failed:report.failed,failures:results.filter(r=>r.status==='FAIL'),report:path.join(out,'report.json')},null,2));
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
  if (report.failed || fatal) process.exitCode=1;
}
