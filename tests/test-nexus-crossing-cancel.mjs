// Proves the original early-Escape race, then checks its repair in both browser engines.
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
const root=path.resolve('hud/prototype'), before=process.env.BEFORE_INDEX;
assert.ok(before,'An exact pre-repair index is required');
const out='repair-evidence';await fs.mkdir(out,{recursive:true});
const server=http.createServer(async(req,res)=>{
  try {
    const u=new URL(req.url,'http://localhost');
    const file=u.pathname==='/before.html'?path.resolve(before):path.resolve(root,'.'+(u.pathname==='/'?'/index.html':u.pathname));
    if(file!==path.resolve(before)&&!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    res.setHeader('content-type',file.endsWith('.html')?'text/html':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'application/json');
    res.end(await fs.readFile(file));
  }catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const results=[],errors=[];
try {
  for(const [engineName,engine] of [['chromium',chromium],['webkit',webkit]]) {
    const browser=await engine.launch({headless:true});
    try {
      for(const motion of ['reduce','no-preference']) {
        for(const kind of ['before','fixed']) {
          const context=await browser.newContext({viewport:{width:390,height:900},hasTouch:true,reducedMotion:motion});
          await context.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());
          const page=await context.newPage();page.setDefaultTimeout(7000);
          page.on('pageerror',e=>errors.push(String(e)));
          try {
            await page.goto(origin+(kind==='before'?'/before.html':'/'),{waitUntil:'networkidle'});
            const immediate=await page.evaluate(()=>{
              const n=document.querySelector('[data-id="aura"].node');n.focus();n.click();
              document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
              return document.querySelector('#veil').getAttribute('aria-hidden');
            });
            await page.waitForTimeout(950);
            const state=await page.evaluate(()=>({hidden:document.querySelector('#veil').getAttribute('aria-hidden'),space:document.querySelector('#space').getAttribute('aria-hidden'),open:document.querySelector('#veil').classList.contains('open'),focus:document.activeElement.dataset.id,thread:document.querySelector('#threadButton').textContent}));
            if(kind==='before') {assert.equal(immediate,'false');assert.equal(state.open,true,'The expected old race must be reproduced');}
            else {
              assert.equal(immediate,'true');assert.equal(state.hidden,'true');assert.equal(state.space,'false');assert.equal(state.open,false);assert.equal(state.focus,'aura');
              await page.locator('#threadButton').click();await page.locator('#dissolveJourney').click();
              assert.ok((await page.locator('#threadButton').textContent()).includes('0'));
              await page.locator('[data-id="aura"].node').click();
              await page.waitForFunction(()=>document.querySelector('#veil').classList.contains('open'));
              await page.locator('#back').click();await page.waitForFunction(()=>document.querySelector('#veil').getAttribute('aria-hidden')==='true');
            }
            results.push({engine:engineName,motion,kind,status:'PASS',state});
          }catch(e){results.push({engine:engineName,motion,kind,status:'FAIL',error:String(e.stack)});}
          await context.close();
        }
      }
    }finally{await browser.close();}
  }
}finally{server.close();}
const report={results,errors,passed:results.filter(x=>x.status==='PASS').length,failed:results.filter(x=>x.status==='FAIL').length};
await fs.writeFile(out+'/crossing-cancel.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
if(report.failed||errors.length)process.exitCode=1;
