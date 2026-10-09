// Production release gate for Archon Soulings Living Nexus procedural v0.10.
// Run ONLY after a production Wix Editor deployment, as a read-only verification.
// Never creates bookings, submits forms, starts audio, requests camera, or writes Wix data.
import { chromium, webkit } from "playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const productionOrigin = "https://www.archonsoulings.com";
const productionHostnames = new Set(["www.archonsoulings.com", "archonsoulings.com"]);
const input = (process.env.NEXUS_RELEASE_URL || "").trim();
if (!input) {
  console.error("BLOCKED: Set NEXUS_RELEASE_URL to the actual production Wix URL after installation.");
  process.exit(2);
}
const productionURL = new URL(input);
if (!productionHostnames.has(productionURL.hostname) || productionURL.protocol !== "https:") {
  console.error("BLOCKED: NEXUS_RELEASE_URL must be on the established HTTPS production domain.");
  process.exit(2);
}
const out = path.resolve("hud/prototype/test-artifacts/production-release");
await mkdir(out, { recursive: true });
const report = {
  target: productionURL.href,
  timestamp: new Date().toISOString(),
  checks: [],
  warnings: [
    "Technical smoke does not verify owner artistic acceptance or physical iPad Safari.",
    "No payment, booking submission, or contribution form submission was attempted.",
    "Production Wix Site History rollback revision must be recorded manually."
  ],
  status: "NOT VERIFIED"
};
const failures = [];
function result(name, ok, detail = "") {
  report.checks.push({ name, status: ok ? "PASS" : "FAIL", detail: String(detail).slice(0, 350) });
  if (!ok) failures.push(name + ": " + detail);
}
const expected = ["aura","aureglossa","sessions","workshops","gestalt","journal"];
for (const [name, engine, sizes] of [
  ["chromium", chromium, [[390,844],[820,1180],[1280,853]]],
  ["webkit", webkit, [[390,844],[820,1180]]]
]) {
  const browser = await engine.launch({ headless: true });
  try {
    for (const [width,height] of sizes) {
      const context = await browser.newContext({
        viewport: { width, height },
        hasTouch: true,
        isMobile: width < 650,
        reducedMotion: "no-preference"
      });
      const page = await context.newPage();
      const prefix = name + " " + width;
      const pageErrors = [];
      page.on("pageerror", e => pageErrors.push(String(e)));
      page.setDefaultTimeout(14000);
      try {
        const response = await page.goto(productionURL.href, { waitUntil: "domcontentloaded", timeout: 30000 });
        assert.equal(response?.status(), 200, "Production route HTTP 200");
        await page.waitForFunction(
          () => window.__LivingMaterial10?.snapshot?.().frames >= 2,
          null, { timeout: 20000 }
        );
        const snapshot = await page.evaluate(() => window.__LivingMaterial10?.snapshot?.());
        assert.equal(snapshot?.artBackplate, false, "Independent procedural material only");
        assert.equal(snapshot?.material, "procedural-living-constellation-v10", "Exact procedural renderer family");
        const ids = await page.locator(".world[data-world]").evaluateAll(els=>els.map(e=>e.dataset.world));
        for (const id of expected) assert.ok(ids.includes(id), "Missing functional world: " + id);
        const geometry = await page.evaluate(() => {
          const els = [...document.querySelectorAll(".world[data-world]")];
          return { innerWidth, scrollWidth: document.documentElement.scrollWidth,
            targets: els.map(e => {const r=e.getBoundingClientRect();return {x:r.left,right:r.right,w:r.width,h:r.height};})};
        });
        assert.ok(geometry.scrollWidth <= geometry.innerWidth + 3, "Horizontal overflow");
        for (const target of geometry.targets) {
          assert.ok(target.w>=44&&target.h>=44,"Undersized touch target");
          assert.ok(target.x>=-6&&target.right<=width+6,"World outside viewport");
        }
        for (const control of ["#guide","#bookNow","#thread","#still"]) {
          assert.ok(await page.locator(control).isVisible(), "Missing functional control: " + control);
        }
        await page.screenshot({ path: path.join(out, name+"-"+width+"-idle.png"), fullPage: true });
        await page.locator("#bookNow").click();
        assert.match(await page.locator("#panelTitle").innerText(), /Sessions/i);
        const bookingHrefs=await page.locator('#panelActions a[href*="booking-calendar"]').evaluateAll(
          els=>els.map(e=>e.href)
        );
        for(const slug of ["30-minutes-1","60-minutes-1"])
          assert.ok(bookingHrefs.some(h=>h===productionOrigin+"/booking-calendar/"+slug), "Missing live calendar: "+slug);
        await page.locator("#closePanel").click();
        await page.locator("#guide").click();
        assert.match(await page.locator("#panelDescription").innerText(), /Choose a world/i);
        await page.locator("#closePanel").click();
        await page.locator("#still").click();
        const f1=Number(await page.locator("#livingScene").getAttribute("data-frames"));
        await page.waitForTimeout(200);
        const f2=Number(await page.locator("#livingScene").getAttribute("data-frames"));
        assert.equal(f1,f2,"Stillness does not freeze material");
        assert.deepEqual(pageErrors,[],"Uncaught browser errors");
        result(prefix+" real procedural world, booking and Stillness",true);
      } catch(e) {
        result(prefix+" real procedural world, booking and Stillness",false,e.message);
      } finally { await context.close(); }
    }
  } finally { await browser.close(); }
}

// A separate read-only check of existing public-facing business routes.
// HTTP success is not proof of available appointment slots or settled payment.
const paths=[
  ["production homepage",productionOrigin+"/"],
  ["30-minute Wix calendar",productionOrigin+"/booking-calendar/30-minutes-1"],
  ["60-minute Wix calendar",productionOrigin+"/booking-calendar/60-minutes-1"],
  ["existing contribution form","https://archonsoulings.wixforms.com/f/7513018975966463049"]
];
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage({viewport:{width:1280,height:853}});
  for(const [label,url] of paths){
    try{
      const response=await page.goto(url,{waitUntil:"domcontentloaded",timeout:35000});
      assert.ok(response && response.status()>=200 && response.status()<400, "HTTP "+response?.status());
      if(label==="production homepage"){
        if(productionURL.pathname!=="/"){
          const linked=await page.locator('a[href]').evaluateAll((els,target)=>els.some(
            a=>a.href===target || (new URL(a.href).pathname===new URL(target).pathname &&
              new URL(a.href).hostname===new URL(target).hostname)
          ),productionURL.href);
          assert.ok(linked,"New Living Nexus route not linked from homepage");
        }
        await page.screenshot({path:path.join(out,"production-homepage.png"),fullPage:true});
      }
      result(label+" still accessible",true,"GET "+response.status());
    }catch(e){result(label+" still accessible",false,e.message);}
  }
}finally{await browser.close();}
report.status=failures.length?"FAIL":"TECHNICAL PASS — OWNER DEVICE/EDITOR ROLLBACK STILL REQUIRED";
await writeFile(path.join(out,"launch-gate-report.json"),JSON.stringify(report,null,2)+"\n");
if(failures.length){
  console.error("PRODUCTION RELEASE GATE FAILED:\n"+failures.join("\n"));
  process.exitCode=1;
}else{
  console.log("PRODUCTION RELEASE GATE TECHNICAL PASS. No money charged or forms submitted.");
  console.log("Still required: physical iPad Safari, protected editor history, business submission owner test, and final owner visual acceptance.");
}
