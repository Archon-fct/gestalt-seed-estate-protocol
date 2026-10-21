import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve('hud/prototype/experiments');
const out=path.resolve('hud/prototype/test-artifacts/six-awakenings');
await mkdir(out,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css'};
const server=createServer(async(req,res)=>{
 try{
  const u=new URL(req.url,'http://localhost'),file=path.resolve(root,'.'+u.pathname);
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(file);res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream'});res.end(bytes);
 }catch(e){res.writeHead(e.code==='ENOENT'?404:500);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url='http://127.0.0.1:'+server.address().port+'/six-awakenings-v12/index.html';
const browser=await chromium.launch({headless:true});
const failures=[];
try{
 for(const width of [390,820,1280]){
  const context=await browser.newContext({viewport:{width,height:width===390?844:width===820?1180:900},hasTouch:true,isMobile:width===390,reducedMotion:'no-preference'});
  const page=await context.newPage();page.setDefaultTimeout(12000);
  const errors=[],requests=[];page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:'))requests.push(r.url());});
  try{
   const response=await page.goto(url,{waitUntil:'load'});assert.equal(response.status(),200);
   await page.waitForFunction(()=>window.__SixAwakenings?.snapshot().material==='six-cocoons-attached-filaments-v12');
   const snapshot=await page.evaluate(()=>window.__SixAwakenings.snapshot());
   assert.equal(snapshot.worlds,6);assert.equal(snapshot.personas.length,6);assert.equal(snapshot.inference,false);
   assert.equal(await page.locator('.world[data-world]').count(),7);
   await page.screenshot({path:path.join(out,'idle-'+width+'.png'),fullPage:true});
   if(width===390)await page.locator('#mobileWorlds [data-world=aura]').click();
   else await page.locator('.world[data-world=aura]').click({force:true});
   await page.locator('#panelActions .awaken-cocoon').click();
   assert.equal(await page.locator('#sigilChamber').isVisible(),true);
   assert.match(await page.locator('#chamberTitle').textContent(),/Gardener/);
   await page.screenshot({path:path.join(out,'chamber-'+width+'.png'),fullPage:true});
   await page.locator('[data-ask=guard]').click();
   assert.match(await page.locator('#personaVoice').textContent(),/possibilities/);
   for(const [ring,count] of [[0,2],[1,5],[2,1]]){
    for(let k=0;k<count;k++)await page.locator('[data-ring="'+ring+'"][data-dir="1"]').click();
   }
   await page.locator('#alignSeal').click();
   assert.match(await page.locator('#sealFeedback').textContent(),/resonate/);
   assert.deepEqual(await page.evaluate(()=>window.__SixAwakenings.snapshot().unlocked),['aura']);
   await page.screenshot({path:path.join(out,'unlocked-'+width+'.png'),fullPage:true});
   await page.locator('#chamberClose').click();
   assert.equal(await page.locator('#sigilChamber').isVisible(),false);
   const route=await page.locator('#panelActions a[href$="aura-dynamics.html"]').getAttribute('href');
   assert.ok(route.endsWith('/aura-dynamics.html'));
   await page.locator('#closePanel').click();
   await page.locator('#bookNow').click();
   assert.equal(await page.locator('#panelActions a[href*="booking-calendar"]').count(),2);
   await page.locator('#closePanel').click();
   await page.locator('#still').click();
   assert.equal(await page.locator('#still').getAttribute('aria-pressed'),'true');
   await page.waitForTimeout(90);const f=Number(await page.locator('#cocoonAuras').getAttribute('data-frames'));
   await page.waitForTimeout(150);assert.equal(Number(await page.locator('#cocoonAuras').getAttribute('data-frames')),f);
   assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
   console.log('PASS Six Awakenings',width);
  }catch(e){failures.push(width+': '+e.message);}
  await context.close();
 }
 const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 const page=await ctx.newPage();
 try{
  await page.goto(url,{waitUntil:'load'});
  assert.equal(await page.locator('#still').getAttribute('aria-pressed'),'true');
  await page.evaluate(()=>window.__SixAwakenings.open('gestalt'));
  assert.match(await page.locator('#chamberTitle').textContent(),/Cartographer/);
  await page.screenshot({path:path.join(out,'reduced-390.png'),fullPage:true});
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#sigilChamber').isVisible(),false);
  console.log('PASS reduced motion + keyboard close');
 }catch(e){failures.push('reduced: '+e.message);}
 await ctx.close();
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
if(failures.length){console.error('FAIL\n'+failures.join('\n'));process.exitCode=1;}
else console.log('PASS: isolated six-world cocoon study, distinct personas, puzzle, real routes, booking, Stillness and privacy');
