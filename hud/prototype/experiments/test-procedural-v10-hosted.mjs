// Read-only hosted browser smoke for the isolated procedural v0.10 Living Nexus.
// This checks functional behavior, NOT aesthetic approval or production readiness.
import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
const url="https://headless-mfewrcffiie-archonsoulings-140e.wix-site-host.com/experiments/living-nexus-procedural-v10.html";
const out=path.resolve("hud/prototype/test-artifacts/procedural-v10");
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const failures=[];
try{
 for(const [width,height] of [[390,844],[820,1180],[1280,853]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:true});
  const page=await context.newPage();page.setDefaultTimeout(16000);
  const errors=[];page.on("pageerror",e=>errors.push(String(e)));
  try{
   const res=await page.goto(url,{waitUntil:"domcontentloaded",timeout:30000});
   assert.equal(res?.status(),200,"Hosted page status");
   await page.waitForFunction(()=>window.__LivingMaterial10?.snapshot().frames>=2,null,{timeout:20000});
   const snap=await page.evaluate(()=>window.__LivingMaterial10.snapshot());
   assert.equal(snap.artBackplate,false,"Must use independent procedural scene, not image warp");
   assert.equal(snap.material,"procedural-living-constellation-v10");
   assert.equal(await page.locator(".world").count(),7);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,"No overflow");
   await page.screenshot({path:path.join(out,"v10-"+width+"-idle.png"),fullPage:true});
   await page.locator("#guide").click();
   assert.match(await page.locator("#panelDescription").innerText(),/Choose a world/);
   await page.locator("#panelBody .choice").first().click();
   assert.match(await page.locator("#panelTitle").innerText(),/Aura Dynamics/);
   await page.locator("#closePanel").click();
   await page.locator("#bookNow").click();
   assert.match(await page.locator("#panelTitle").innerText(),/Sessions/);
   assert.equal(await page.locator('#panelActions a[href*="booking-calendar"]').count(),2);
   await page.screenshot({path:path.join(out,"v10-"+width+"-sessions.png"),fullPage:true});
   await page.locator("#closePanel").click();
   await page.locator('.world[data-world="aura"]').click({force:true});
   await page.locator("#closePanel").click();
   await page.locator("#thread").click();
   assert.match(await page.locator("#panelBody").innerText(),/Aura Dynamics/);
   await page.getByRole("button",{name:"Let it dissolve"}).click();
   assert.equal(await page.locator("#threadCount").innerText(),"0");
   await page.locator("#still").click();
   const f1=Number(await page.locator("#livingScene").getAttribute("data-frames"));
   await page.waitForTimeout(200);
   const f2=Number(await page.locator("#livingScene").getAttribute("data-frames"));
   assert.equal(f1,f2,"Stillness must freeze procedural material");
   assert.deepEqual(errors,[],"Page JavaScript errors");
   console.log("PASS hosted procedural",width);
  }catch(e){failures.push(width+": "+e.message);}
  await context.close();
 }
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:"reduce"});
 const page=await context.newPage();
 try{
  await page.goto(url,{waitUntil:"domcontentloaded",timeout:30000});
  assert.equal(await page.locator("#still").getAttribute("aria-pressed"),"true");
  await page.locator('.world[data-world="gestalt"]').click({force:true});
  assert.match(await page.locator("#panelTitle").innerText(),/Gestalt/);
  console.log("PASS reduced-motion");
 }catch(e){failures.push("reduced: "+e.message);}
 await context.close();
}finally{await browser.close();}
if(failures.length){console.error("FAIL:\n"+failures.join("\n"));process.exitCode=1;}
else console.log("PASS: hosted procedural v0.10 technical acceptance; owner visual approval pending");
