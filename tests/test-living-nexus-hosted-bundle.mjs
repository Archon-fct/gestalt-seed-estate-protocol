// Read-only hosted preview gate: no messages, purchases, uploads or reservations.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {chromium, webkit} from 'playwright';
const base = 'https://headless-mfewrcffiie-archonsoulings-140e.wix-site-host.com/';
const expected = process.env.EXPECTED_SOURCE_SHA;
assert.match(expected || '', /^[a-f0-9]{40}$/);
const out = process.env.REPORT_DIR || 'test-artifacts/hosted-operational';
await fs.mkdir(out, {recursive:true});
const results = [], errors = [];
async function check(name, run) {
  try { const detail = await run(); results.push({name,status:'PASS',detail}); }
  catch(e) {results.push({name,status:'FAIL',detail:String(e.message)});}
}
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
async function get(file) {
  const response = await fetch(new URL(file,base), {signal:AbortSignal.timeout(25000)});
  assert.equal(response.status,200,`${file}: HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}
let fatal;
try {
  const release = JSON.parse(await get('release.json'));
  assert.equal(release.sourceCommit,expected,'Unexpected deployed release');
  assert.equal(release.previewOnly,true);
  await check('Exact source identity and preview status',()=>release.sourceCommit);
  const manifest = JSON.parse(await fs.readFile('hud/prototype/PREVIEW_BUNDLE_MANIFEST.json','utf8'));
  for (const file of Object.keys(release.files)) {
    await check('Hosted resource integrity: '+file,async()=>{
      const bytes = await get(file);
      assert.equal(sha(bytes),release.files[file],'Served bytes differ from release receipt');
      if (manifest.required.includes(file)) {
        const source = await fs.readFile(path.join('hud/prototype',file));
        assert.equal(sha(bytes),sha(source),'Served bytes differ from committed source');
      }
      return {bytes:bytes.length,sha256:sha(bytes)};
    });
  }
  for (const file of manifest.required) assert.ok(release.files[file],`Required file omitted: ${file}`);
  for (const [engineName, engine, widths] of [['chromium',chromium,[390,820,1280]],['webkit',webkit,[390,820]]]) {
    const browser = await engine.launch({headless:true});
    try {
      for (const width of widths) {
        const ctx = await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce',hasTouch:width<1000,acceptDownloads:true});
        await ctx.route('**/*',route=>{
          const req = route.request(), url = req.url();
          if (url.startsWith('blob:') || url.startsWith('data:')) return route.continue();
          if (req.method()==='GET' && new URL(url).origin===new URL(base).origin) return route.continue();
          return route.abort();
        });
        const page = await ctx.newPage();page.setDefaultTimeout(7000);
        page.on('pageerror',e=>errors.push({engine:engineName,width,message:String(e)}));
        const prefix = engineName+' '+width;
        await check(prefix+': six-world entry and clearable journey',async()=>{
          await page.goto(base,{waitUntil:'networkidle'});
          await page.waitForFunction(()=>document.querySelectorAll('.node').length===6);
          assert.equal(await page.locator('.node').count(),6);
          assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
          await page.locator('[data-id="aura"].node').click();
          await page.waitForFunction(()=>document.querySelector('#threadButton').textContent.includes('1'));
          await page.keyboard.press('Escape');
          await page.waitForFunction(()=>document.querySelector('#veil').getAttribute('aria-hidden')==='true');
          await page.locator('#threadButton').click();
          await page.locator('#dissolveJourney').click();
          assert.ok((await page.locator('#threadButton').textContent()).includes('0'));
          await page.screenshot({path:path.join(out,`${engineName}-${width}-nexus.png`),fullPage:true});
        });
        for (const file of ['aura-dynamics.html','inner-sanctum.html','living-archive.html','living-threshold.html','astral-journal.html','living-tongue.html','convergence.html']) {
          await check(prefix+': '+file+' load, material, layout and return',async()=>{
            const response = await page.goto(new URL(file,base).href,{waitUntil:'networkidle'});
            assert.equal(response.status(),200);
            await page.waitForSelector('#livingPocketMaterial');
            assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
            const back = page.locator('a[href="./index.html"],a[href="index.html"]').first();
            assert.ok(await back.count());
            await back.click();
            await page.waitForURL(url=>url.pathname==='/index.html');
            await page.waitForSelector('.node');
          });
        }
        await check(prefix+': Aureglossa atlas opens and changes sections',async()=>{
          await page.goto(new URL('living-tongue.html',base).href,{waitUntil:'networkidle'});
          await page.locator('#openAtlas').click();
          await page.locator('[data-atlas-tab="grammar"]').click();
          assert.ok((await page.locator('.atlas-body').textContent()).includes('Grammar as relationship'));
          await page.screenshot({path:path.join(out,`${engineName}-${width}-atlas.png`),fullPage:true});
          await page.keyboard.press('Escape');
        });
        await page.goto(new URL('convergence.html',base).href,{waitUntil:'networkidle'});
        for (const key of ['attend','host','teach','collab']) {
          await check(prefix+': '+key+' inquiry review, export and dissolve',async()=>{
            await page.locator(`[data-gate="${key}"]`).click();
            await page.locator('#primary').click();
            await page.locator('#inquiryGoal').fill('Automated local-only verification. This draft will not be sent.');
            await page.locator('#inquiryConsent').check();
            await page.locator('#reviewInquiry').click();
            const email = new URL(await page.locator('#emailInquiry').getAttribute('href'));
            assert.equal(email.protocol,'mailto:');assert.equal(email.pathname,'Drew@ArchonSoulings.com');
            assert.ok((await page.locator('#inquiryStatus').textContent()).includes('Nothing has been sent or reserved'));
            const waiting = page.waitForEvent('download');
            await page.locator('#exportInquiry').click();
            const download = await waiting;
            assert.ok((await fs.readFile(await download.path(),'utf8')).includes('Automated local-only verification'));
            if (key==='attend') await page.screenshot({path:path.join(out,`${engineName}-${width}-inquiry.png`),fullPage:true});
            await page.locator('#dissolveInquiry').click();
            assert.equal(await page.locator('#inquiryGoal').inputValue(),'');
            await page.keyboard.press('Escape');
          });
        }
        await check(prefix+': native session URLs unchanged',async()=>{
          await page.goto(new URL('inner-sanctum.html',base).href,{waitUntil:'networkidle'});
          assert.ok(await page.locator('a[href="https://www.archonsoulings.com/booking-calendar/30-minutes-1"]').count());
          assert.ok(await page.locator('a[href="https://www.archonsoulings.com/booking-calendar/60-minutes-1"]').count());
        });
        await ctx.close();
      }
    } finally {await browser.close();}
  }
  await check('No unhandled application errors in hosted browser checks',()=>{assert.deepEqual(errors,[]);});
} catch(e) {fatal=String(e.stack||e);results.push({name:'Hosted suite completion',status:'FAIL',detail:fatal});}
const report={sourceCommit:expected,previewUrl:base,productionTested:false,physicalSafariTested:false,noMessagesOrPaymentsSubmitted:true,passed:results.filter(x=>x.status==='PASS').length,failed:results.filter(x=>x.status==='FAIL').length,errors,results};
await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:report.passed,failed:report.failed,failures:results.filter(x=>x.status==='FAIL')}));
if(report.failed||fatal)process.exitCode=1;
