// Isolated Living Constellation 04 acceptance smoke.
// Runs in addition to, never instead of, the main Living Nexus gates.
import { chromium } from 'playwright';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import fs from 'node:fs';
import path from 'node:path';

const root=path.join(process.cwd(),'hud/prototype');
const exp=path.join(root,'experiments');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
  try{
    const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=path.resolve(root,'.'+name);
    if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
    res.end(await readFile(file));
  }catch(e){res.writeHead(e.code==='ENOENT'?404:500);res.end('Resource unavailable');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const file=origin+'/experiments/living-constellation-05.html';
const failures=[];
const out=path.join(root,'test-artifacts');
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true});

try{
 for(const width of [390,820,1280]){
  const page=await browser.newPage({viewport:{width,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  const errRequests=[];page.on('requestfailed',r=>errRequests.push(r.url()+': '+r.failure()));
  await page.goto(file,{waitUntil:'domcontentloaded',timeout:20000});
  await page.waitForTimeout(600);
  const base=await page.evaluate(()=>{
    const canvas=document.querySelector('#kineticField05');
    const rects=[...document.querySelectorAll('#space>.node')].map(n=>n.getBoundingClientRect());
    const snap=window.__livingKinetic05?.snapshot();
    return{count:rects.length,none:canvas?getComputedStyle(canvas).pointerEvents:null,
      hidden:canvas?.getAttribute('aria-hidden'),oldCanvas:!!document.querySelector('.living-chroma-canvas'),
      overflow:document.documentElement.scrollWidth>innerWidth,
      targets:rects.every(r=>r.width>=44&&r.height>=44&&r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight),
      snap};
  });
  const material=await page.locator('#kineticField05').getAttribute('data-material');
  if(material!=='continuous-auric-membrane-v05')failures.push(width+': material layer not rendered');
  if(!base.snap||base.count!==6||base.none!=='none'||base.hidden!=='true'||base.oldCanvas||base.overflow||!base.targets)
    failures.push(width+': base state/bounds/renderer '+JSON.stringify(base));
  if(errors.length||errRequests.length)failures.push(width+': initialization errors '+errors.join('|')+' requests '+errRequests.join('|'));
  await page.screenshot({path:path.join(out,'study05-idle-'+width+'.png'),fullPage:true,timeout:25000});
  await page.locator('[data-id="aura"]').hover();
  await page.waitForTimeout(130);
  const hovered=await page.evaluate(()=>window.__livingKinetic05.snapshot());
  if(hovered.hot!=='aura')failures.push(width+': no selection-anchored response');
  await page.locator('[data-id="aura"]').click();
  await page.waitForTimeout(285);
  const progress=await page.evaluate(()=>window.__livingKinetic05.snapshot());
  if(progress.selected!=='aura'||progress.progress<=0||progress.progress>=1)
    failures.push(width+': no intermediate unfolding state '+JSON.stringify(progress));
  await page.screenshot({path:path.join(out,'study05-unfold-'+width+'.png'),fullPage:true,timeout:25000});
  await page.waitForTimeout(1040);
  const stage=await page.evaluate(()=>window.__livingKinetic05.snapshot());
  if(stage.phase!=='stable'||!(await page.locator('#veil').getAttribute('class')||'').includes('open'))
    failures.push(width+': original Aura dialog did not stabilize '+JSON.stringify(stage));
  if(!(await page.locator('#threadButton').textContent()).includes('1'))
    failures.push(width+': original Living Thread did not record visit');
  await page.screenshot({path:path.join(out,'study05-stable-'+width+'.png'),fullPage:true,timeout:25000});
  await page.locator('#back').click();
  await page.waitForTimeout(165);
  const reverse=await page.evaluate(()=>window.__livingKinetic05.snapshot());
  if(reverse.phase!=='reverse'||reverse.progress>=1)
    failures.push(width+': no reversible movement '+JSON.stringify(reverse));
  await page.screenshot({path:path.join(out,'study05-reverse-'+width+'.png'),fullPage:true,timeout:25000});
  await page.waitForTimeout(1220);
  const home=await page.evaluate(()=>window.__livingKinetic05.snapshot());
  if(home.phase!=='idle'||home.selected!==null||(await page.evaluate(()=>document.activeElement?.dataset?.id))!=='aura')
    failures.push(width+': return/focus failed '+JSON.stringify(home));
  await page.locator('#still').click();
  await page.waitForTimeout(80);
  const quiet=await page.evaluate(()=>window.__livingKinetic05.snapshot());
  if(quiet.motion!=='paused')failures.push(width+': Stillness failed '+JSON.stringify(quiet));
  await page.locator('#still').click();
  await page.waitForTimeout(130);
  if(errors.length)failures.push(width+': JS errors '+errors.join('|'));
  await page.close();
 }
 // Reduced motion still allows genuine entry, exit and selected-world routing.
 const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await reduced.goto(file,{waitUntil:'domcontentloaded',timeout:20000});
 const start=await reduced.evaluate(()=>window.__livingKinetic05.snapshot());
 if(start.motion!=='paused')failures.push('reduced-motion: kinetic field not paused');
 await reduced.locator('[data-id="aura"]').click();
 await reduced.waitForTimeout(120);
 if(!(await reduced.locator('#veil').getAttribute('class')||'').includes('open'))
   failures.push('reduced-motion: real Aura dialog did not open');
 const link=await reduced.locator('#actions a').first().getAttribute('href');
 if(link!=='living-field-02.html')failures.push('Aura route changed unexpectedly: '+link);
 await reduced.locator('#actions a').first().click();
 await reduced.waitForLoadState('domcontentloaded');
 if(!reduced.url().endsWith('/experiments/living-field-02.html'))failures.push('Aura exercise URL not resolved: '+reduced.url());
 if(!(await reduced.locator('#worldTarget').count()))failures.push('Aura Field 02 controls unavailable');
 else{
   await reduced.locator('#worldTarget').click();
   await reduced.locator('[data-lesson="4"]').click();
   if((await reduced.locator('#integrateReturn').isHidden()))failures.push('Aura integrate action missing');
 }
 await reduced.close();
}finally{
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
if(failures.length){console.error('FAIL Study04\n'+failures.join('\n'));process.exit(1);}
console.log('PASS Study04: 390/820/1280 kinetic continuity, original world/journey/Return/Stillness, reduced-motion and Aura Field 02 route');
