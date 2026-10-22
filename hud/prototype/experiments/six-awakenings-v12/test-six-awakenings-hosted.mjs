import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
const url='https://headless-mfewrcffiie-archonsoulings-140e.wix-site-host.com/experiments/living-nexus-six-awakenings-v12.html';
const out=path.resolve('hud/prototype/test-artifacts/six-awakenings-hosted');
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});const failures=[];
try{
 for(const width of [390,820,1280]){
  const context=await browser.newContext({viewport:{width,height:width===390?844:width===820?1180:900},hasTouch:true,isMobile:width===390});
  const page=await context.newPage();page.setDefaultTimeout(15000);const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  try{
   const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});assert.equal(response?.status(),200);
   await page.waitForFunction(()=>window.__SixAwakenings?.snapshot().material==='six-cocoons-attached-filaments-v12');
   const state=await page.evaluate(()=>window.__SixAwakenings.snapshot());
   assert.equal(state.personas.length,6);assert.equal(state.inference,false);
   assert.equal(await page.locator('.world[data-world]').count(),7);
   assert.equal(await page.locator('#livingScene').getAttribute('data-material'),'procedural-living-constellation-v10');
   await page.screenshot({path:path.join(out,'hosted-idle-'+width+'.png'),fullPage:true});
   if(width===390)await page.locator('#mobileWorlds [data-world=aura]').click();
   else await page.locator('.world[data-world=aura]').click({force:true});
   await page.locator('#panelActions .awaken-cocoon').click();
   assert.match(await page.locator('#chamberTitle').textContent(),/Gardener/);
   await page.locator('#inspectLens').click();
   assert.match(await page.locator('#sealFeedback').textContent(),/refracts/);
   await page.screenshot({path:path.join(out,'hosted-chamber-'+width+'.png'),fullPage:true});
   for(const [i,count] of [[0,2],[1,5],[2,1]])for(let k=0;k<count;k++)await page.locator('[data-ring="'+i+'"][data-dir="1"]').click();
   await page.locator('#alignSeal').click();
   assert.match(await page.locator('#sealFeedback').textContent(),/resonate/);
   await page.locator('#chamberClose').click();
   await page.locator('#closePanel').click();
   await page.locator('#bookNow').click();
   const links=await page.locator('#panelActions a[href*="booking-calendar"]').evaluateAll(nodes=>nodes.map(n=>n.href));
   assert.equal(links.length,2);assert.ok(links.some(x=>x.endsWith('/booking-calendar/30-minutes-1')));
   assert.ok(links.some(x=>x.endsWith('/booking-calendar/60-minutes-1')));
   await page.locator('#closePanel').click();
   await page.locator('#still').click();
   await page.waitForTimeout(75);
   const before=await page.locator('#cocoonAuras').getAttribute('data-frames');
   await page.waitForTimeout(160);
   assert.equal(await page.locator('#cocoonAuras').getAttribute('data-frames'),before);
   assert.deepEqual(errors,[],'No JavaScript errors');
   console.log('PASS hosted six-awakenings '+width);
  }catch(e){failures.push(width+': '+e.message);}
  await context.close();
 }
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 const page=await context.newPage();
 try{
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.__SixAwakenings);
  assert.equal(await page.locator('#still').getAttribute('aria-pressed'),'true');
  await page.evaluate(()=>window.__SixAwakenings.open('gestalt'));
  assert.match(await page.locator('#chamberTitle').textContent(),/Cartographer/);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#sigilChamber').isVisible(),false);
  await page.screenshot({path:path.join(out,'hosted-reduced-390.png'),fullPage:true});
  console.log('PASS hosted reduced-motion');
 }catch(e){failures.push('reduced: '+e.message);}
 await context.close();
}finally{await browser.close();}
if(failures.length){console.error('FAIL hosted Six Awakenings\n'+failures.join('\n'));process.exitCode=1;}
else console.log('PASS hosted Six Awakenings: procedural, six authored SI, lens, seal, bookings, Stillness and accessibility');
