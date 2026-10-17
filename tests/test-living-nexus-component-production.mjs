// Real custom-domain acceptance gate for the page-scoped component.
// Run after Wix Editor installation; never point this at the isolated preview.
// Opens ordinary visitor pages but never submits a form, booking, or payment.
import {chromium, webkit} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
const target=new URL(process.env.NEXUS_RELEASE_URL||'https://www.archonsoulings.com/living-nexus');
const source=process.env.NEXUS_COMPONENT_COMMIT||'315b27632703da9ce83c0dcb950e97d013dcb746';
assert.equal(target.origin,'https://www.archonsoulings.com');
assert.equal(target.pathname,'/living-nexus');
assert.equal(target.username,'');assert.equal(target.password,'');assert.equal(target.search,'');assert.equal(target.hash,'');
assert.match(source,/^[a-f0-9]{40}$/);
const out=process.env.REPORT_DIR||'component-production-evidence';await fs.mkdir(out,{recursive:true});
const results=[];
async function check(name,run){try{await run();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',error:String(e.stack)});}}
for(const [label,engine,sizes] of [['chromium',chromium,[[390,844],[820,1180],[1280,900]]],['webkit',webkit,[[390,844],[820,1180]]]]){
 const browser=await engine.launch({headless:true});
 try{for(const [width,height] of sizes){
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<1000,reducedMotion:'no-preference'});
  const page=await context.newPage();page.setDefaultTimeout(12000);const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await check(`${label} ${width}: actual published component and business links`,async()=>{
   const r=await page.goto(target.href,{waitUntil:'domcontentloaded'});assert.equal(r.status(),200);
   const el=page.locator('archon-living-nexus');await el.waitFor({state:'visible'});
   await page.waitForFunction(()=>document.querySelector('archon-living-nexus')?.dataset.ready==='true');
   assert.equal(await el.evaluate(e=>e.snapshot().build.sourceCommit),source);
   let frame=await (await el.locator('iframe').elementHandle()).contentFrame();
   await frame.waitForFunction(()=>window.__LivingMaterial10?.snapshot().frames>=2);
   const material=await frame.evaluate(()=>window.__LivingMaterial10.snapshot());
   assert.equal(material.material,'procedural-living-constellation-v10');assert.equal(material.artBackplate,false);
   const ids=await frame.locator('.world[data-world]').evaluateAll(xs=>xs.map(x=>x.dataset.world));
   for(const id of ['aura','aureglossa','sessions','workshops','gestalt','journal'])assert.ok(ids.includes(id));
   const geometry=await frame.locator('.world:not(.nexus-touch)').evaluateAll(xs=>xs.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,w:r.width,h:r.height,iw:innerWidth,ih:innerHeight};}));
   for(const g of geometry)assert.ok(g.x>=0&&g.y>=0&&g.right<=g.iw&&g.bottom<=g.ih&&g.w>=44&&g.h>=44,JSON.stringify(g));
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   assert.ok(await el.locator('[data-action="silence"]').isVisible());
   await frame.locator('#bookNow').click();
   for(const slug of ['30-minutes-1','60-minutes-1'])assert.ok(await frame.locator(`a[href="https://www.archonsoulings.com/booking-calendar/${slug}"]`).count());
   await frame.locator('#closePanel').click();await frame.locator('#guide').click();
   assert.equal(await frame.locator('#panelBody button.choice').count(),5);
   await frame.locator('#closePanel').click();await el.locator('[data-action="still"]').click();
   await page.waitForTimeout(200);const before=await frame.locator('#livingScene').getAttribute('data-frames');
   await page.waitForTimeout(200);assert.equal(await frame.locator('#livingScene').getAttribute('data-frames'),before);
   await frame.locator('.world[data-world="aura"]').click();await frame.locator('#panelActions a').first().click();
   await page.waitForFunction(()=>document.querySelector('archon-living-nexus')?.snapshot().world==='aura'&&document.querySelector('archon-living-nexus').dataset.ready==='true');
   await page.waitForURL(u=>u.searchParams.get('world')==='aura');
   frame=await (await el.locator('iframe').elementHandle()).contentFrame();await frame.locator('[data-step="4"]').click();
   await el.locator('[data-action="return"]').click();await page.waitForURL(u=>!u.searchParams.has('world'));
   await el.locator('[data-action="journey"]').click();assert.ok((await el.locator('.journey-content').innerText()).includes('Completed Sense'));
   await el.locator('[data-action="save"]').click();assert.ok(await page.evaluate(()=>localStorage.getItem('archonLivingNexus.saved.v1')));
   await el.locator('[data-action="dissolve"]').click();assert.equal(await page.evaluate(()=>localStorage.getItem('archonLivingNexus.saved.v1')),null);
   await el.locator('[data-action="close"]').click();
   assert.deepEqual(errors,[]);await page.screenshot({path:path.join(out,`${label}-${width}.png`),fullPage:true});
  });await context.close();
 }}finally{await browser.close();}
}
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();
 for(const url of ['https://www.archonsoulings.com/','https://www.archonsoulings.com/booking-calendar/30-minutes-1','https://www.archonsoulings.com/booking-calendar/60-minutes-1','https://archonsoulings.wixforms.com/f/7513018975966463049']){
  await check(`Existing route: ${url}`,async()=>{const r=await page.goto(url,{waitUntil:'domcontentloaded'});assert.ok(r.status()>=200&&r.status()<400);
   if(url==='https://www.archonsoulings.com/')assert.ok(await page.locator('a[href]').evaluateAll((xs,t)=>xs.some(a=>a.href===t),target.href),'Homepage must have a native entrance to the released page');});
 }
}finally{await browser.close();}
const report={target:target.href,expectedComponentSource:source,results,passed:results.filter(x=>x.status==='PASS').length,failed:results.filter(x=>x.status==='FAIL').length,physicalSafariAccepted:false,ownerVisualAcceptance:false,editorRollbackVerified:false,paymentOrFormSubmissionAttempted:false};
await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(report.failed)process.exitCode=1;
