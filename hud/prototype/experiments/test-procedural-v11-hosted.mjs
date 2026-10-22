import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
const url='https://headless-mfewrcffiie-archonsoulings-140e.wix-site-host.com/experiments/living-nexus-procedural-v11.html';
const out='hud/prototype/test-artifacts/procedural-v11-hosted';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const failures=[];
try{
 for(const width of [390,820,1280]){
  const page=await browser.newPage({viewport:{width,height:width===390?844:width===820?1180:854},hasTouch:true});
  page.setDefaultTimeout(18000);
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  try{
   const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
   assert.equal(response?.status(),200);
   await page.waitForFunction(()=>document.querySelector('#livingScene')?.dataset.material==='independent-living-six-worlds-v11',null,{timeout:16000});
   assert.equal(await page.locator('.world').count(),7);
   assert.equal(await page.locator('#canon').count(),0);
   assert.equal(await page.locator('#camera').evaluate(v=>v.srcObject===null),true);
   assert.ok(['canvas2d','webgl2'].includes(await page.locator('#livingVolume').getAttribute('data-renderer')));
   await page.screenshot({path:path.join(out,width+'-idle.png')});
   await page.locator('.world[data-world="sessions"]').click({force:true});
   assert.equal(await page.locator('#panelTitle').textContent(),'Sessions');
   assert.equal(await page.locator('#panelActions a[href*="booking-calendar"]').count(),2);
   await page.locator('#closePanel').click();
   await page.locator('#still').click();
   await page.waitForTimeout(140);
   const a=await page.locator('#livingScene').getAttribute('data-frames');
   const b=await page.locator('#livingVolume').getAttribute('data-frames');
   await page.waitForTimeout(220);
   assert.equal(await page.locator('#livingScene').getAttribute('data-frames'),a);
   assert.equal(await page.locator('#livingVolume').getAttribute('data-frames'),b);
   assert.deepEqual(errors,[]);
   console.log('PASS hosted v11',width);
  }catch(e){failures.push(width+': '+e.message);}
  await page.close();
 }
}finally{await browser.close();}
if(failures.length){console.error('FAIL\n'+failures.join('\n'));process.exitCode=1;}
else console.log('PASS: hosted procedural world, bookings, Stillness, camera off; owner visual review still required');
