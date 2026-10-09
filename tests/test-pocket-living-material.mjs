// Regression gate for the seven independently navigable public pocket dimensions.
// Additive renderer never owns input, route, storage, audio, or state.
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','hud','prototype');
const worlds=['aura-dynamics','living-tongue','inner-sanctum','convergence','living-archive','astral-journal','living-threshold'];
const sizes=[{width:1280,height:900},{width:820,height:1180},{width:390,height:844}];
const browser=await chromium.launch({headless:true});
const errors=[];let checks=0;
try{
 for(const name of worlds){
  for(const viewport of sizes){
   const page=await browser.newPage({viewport});
   const crashes=[];page.on('pageerror',err=>crashes.push(String(err)));
   await page.goto(pathToFileURL(path.join(root,name+'.html')).href,{waitUntil:'load'});
   await page.waitForFunction(()=>Number(document.querySelector('#livingPocketMaterial')?.dataset.frames||0)>=1,null,{timeout:5000});
   const initial=await page.evaluate(()=>{
    const canvas=document.querySelector('#livingPocketMaterial');
    return {present:!!canvas,aria:canvas?.getAttribute('aria-hidden'),role:canvas?.getAttribute('role'),
      pointer:canvas?getComputedStyle(canvas).pointerEvents:null,motion:canvas?.dataset.motion,
      frames:Number(canvas?.dataset.frames||0),w:canvas?.width||0,h:canvas?.height||0,
      overflow:document.documentElement.scrollWidth>innerWidth+2,
      nexus:!!document.querySelector('a[href="./index.html"],a[href="index.html"]')};
   });
   if(!initial.present||initial.aria!=='true'||initial.role!=='presentation'||initial.pointer!=='none'||initial.motion!=='running'||initial.frames<1||!initial.nexus)
     errors.push(name+' '+viewport.width+' initial decorative field/navigation: '+JSON.stringify(initial));
   if(initial.overflow)errors.push(name+' '+viewport.width+' horizontal overflow');
   const before=initial.frames;
   await page.locator('#still').click();
   await page.waitForFunction(()=>document.querySelector('#livingPocketMaterial')?.dataset.motion==='paused',null,{timeout:3000});
   const after=await page.evaluate(()=>({still:document.body.classList.contains('still'),motion:document.querySelector('#livingPocketMaterial')?.dataset.motion,
     frames:Number(document.querySelector('#livingPocketMaterial')?.dataset.frames||0)}));
   if(!after.still||after.motion!=='paused'||after.frames<before)
     errors.push(name+' '+viewport.width+' Stillness: '+JSON.stringify(after));
   await page.locator('#still').click();
   await page.waitForFunction(()=>document.querySelector('#livingPocketMaterial')?.dataset.motion==='running',null,{timeout:3000});
   const resumed=await page.locator('#livingPocketMaterial').getAttribute('data-motion');
   if(resumed!=='running')errors.push(name+' '+viewport.width+' resume failed: '+resumed);
   if(crashes.length)errors.push(name+' '+viewport.width+' JS: '+crashes.join(' | '));
   checks+=8;await page.close();
  }
  const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await reduced.goto(pathToFileURL(path.join(root,name+'.html')).href,{waitUntil:'load'});
  await reduced.waitForFunction(()=>!!document.querySelector('#livingPocketMaterial')?.dataset.motion,null,{timeout:5000});
  const paused=await reduced.locator('#livingPocketMaterial').getAttribute('data-motion');
  if(paused!=='paused')errors.push(name+' reduced motion failed: '+paused);
  checks++;await reduced.close();
 }
}finally{await browser.close();}
if(errors.length){console.error('FAIL pocket living material:\n'+errors.join('\n'));process.exit(1);}
console.log('PASS '+checks+' pocket material assertions: all seven worlds, 390/820/1280, focus-independent navigation, Stillness/resume, reduced motion, no input interception or overflow.');
