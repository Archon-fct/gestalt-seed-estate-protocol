// Read-only smoke test for the Wix-hosted Living Nexus PREVIEW.
// Does not submit forms, create a Soul, request microphones, or touch production.
import { chromium, webkit } from "playwright";
import assert from "node:assert/strict";
import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

const base = process.env.PREVIEW_URL || "https://headless-mfewrcffiie-archonsoulings-140e.wix-site-host.com/";
const dir = path.resolve("hud/prototype");
const out = path.resolve("hud/prototype/test-artifacts/live-smoke");
const files = [
  "index.html","aura-dynamics.html","inner-sanctum.html","living-tongue.html",
  "living-archive.html","living-threshold.html","astral-journal.html","convergence.html",
  "organic-depth.js","organic-depth.css","spatial-atmosphere.js","soul.js",
  "soul-currency.js","event-souls.js","adaptive-guide.js","aureglossa-commands.js",
  "constellation-passport.js","constellation-search.js","living-thread-state.js",
  "physical-thresholds.json","public-graph.json","public-provenance.json",
  "public-relationships.json"
];
const worlds=files.filter(name => name.endsWith(".html") && name!=="index.html");
const failures=[];
const results=[];
const digest = bytes => createHash("sha256").update(bytes).digest("hex");
await mkdir(out,{recursive:true});

for(const file of files){
  try{
    const url = new URL(file,base).href;
    const response = await fetch(url,{redirect:"follow",signal:AbortSignal.timeout(14000)});
    assert.equal(response.status,200,"HTTP status for "+file);
    const actual = Buffer.from(await response.arrayBuffer());
    const expected = await readFile(path.join(dir,file));
    assert.equal(digest(actual),digest(expected),"Source bytes mismatch for "+file);
    const text=actual.toString("utf8");
    assert.equal(/\bsilver\b|sk-proj-[a-z0-9_-]{12,}|BEGIN PRIVATE KEY/i.test(text),false,
      "Private/Silver pattern in public runtime "+file);
    results.push({file,status:"PASS",sha256:digest(actual)});
    console.log("PASS SOURCE",file);
  }catch(e){failures.push("RESOURCE "+file+": "+e.message);}
}

for(const [engineName,engine] of [["chromium",chromium],["webkit",webkit]]){
  const browser=await engine.launch({headless:true});
  try{
    for(const width of (engineName==="webkit" ? [390,820] : [390,820,1280])){
      const context=await browser.newContext({viewport:{width,height:1050},hasTouch:true,isMobile:width<1000});
      const page=await context.newPage();
      page.setDefaultTimeout(12000);
      const errors=[];
      page.on("pageerror",e=>errors.push(String(e)));
      try{
        await page.goto(base,{waitUntil:"domcontentloaded"});
        await page.locator(".organic-depth-field .organ-cell").first().waitFor({timeout:12000});
        assert.equal(await page.locator(".node").count(),6,"Six living worlds");
        assert.equal(await page.locator(".organic-depth-field .organ-cell").count(),6,"Six living membranes");
        for(const control of ["#guide","#searchButton","#still","#atmosphere","#silence","#threadButton"]){
          assert.equal(await page.locator(control).isVisible(),true,"Missing control "+control);
        }
        const geometry=await page.evaluate(()=>({
          viewport:innerWidth,scroll:document.documentElement.scrollWidth,
          nodes:[...document.querySelectorAll(".node")].map(n=>{
            const r=n.getBoundingClientRect();
            return {left:r.left,right:r.right,width:r.width,height:r.height};
          })
        }));
        assert.ok(geometry.scroll<=geometry.viewport,"Nexus horizontal overflow");
        for(const node of geometry.nodes){
          assert.ok(node.left>=-3&&node.right<=width+3,"Nexus world clipped");
          assert.ok(node.width>=44&&node.height>=44,"Nexus world touch target");
        }
        if(width===820||engineName==="chromium"){
          await page.screenshot({path:path.join(out,engineName+"-nexus-"+width+".png"),fullPage:true});
        }
        await page.locator("#guide").click();
        await page.locator('[data-intent="learn"]').click();
        assert.ok((await page.locator('[data-id="aura"]').getAttribute("class")).includes("recommended"),"Guide Me must respond");
        assert.deepEqual(errors,[],"Nexus JS errors");
        console.log("PASS NEXUS",engineName,width);
      }catch(e){failures.push("NEXUS "+engineName+" "+width+": "+e.message);}
      for(const world of worlds){
        try{
          const res=await page.goto(new URL(world,base).href,{waitUntil:"domcontentloaded"});
          assert.equal(res.status(),200,"World status "+world);
          const link=page.locator('a[href="./index.html"],a[href="index.html"]').first();
          assert.ok(await link.count(),"No direct Nexus return "+world);
          const box=await link.boundingBox();
          assert.ok(box&&box.width>=44&&box.height>=44,"Undersized return target "+world);
          const g=await page.evaluate(()=>({
            width:innerWidth,
            scroll:document.documentElement.scrollWidth,
            panels:[...document.querySelectorAll(".intro,.detail,.reader,.lesson,.copy")]
            .filter(e=>getComputedStyle(e).display!=="none"&&getComputedStyle(e).visibility!=="hidden")
            .map(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right};})
          }));
          assert.ok(g.scroll<=g.width,"Overflow "+world);
          for(const p of g.panels){
            assert.ok(p.left>=-4&&p.right<=width+4,"Clipped world panel "+world+" "+JSON.stringify(p));
          }
          if(width===820)await page.screenshot({path:path.join(out,engineName+"-"+world+".png"),fullPage:true});
          await link.click();
          await page.waitForURL(url=>url.pathname==="/"||url.pathname==="/index.html");
          console.log("PASS WORLD",engineName,width,world);
        }catch(e){failures.push("WORLD "+engineName+" "+width+" "+world+": "+e.message);}
      }
      await context.close();
    }
  }finally{await browser.close();}
}

console.log("SOURCE FILES:",results.length+"/"+files.length);
if(failures.length){
  console.error("LIVE PREVIEW SMOKE FAILED\n"+failures.join("\n"));
  process.exitCode=1;
}else{
  console.log("PASS LIVE PREVIEW: 23 exact public files, 5 Nexus viewport/engine checks and 35 world interactions. Owner iPad Safari visual approval is still required.");
}
