// Read-only live-host acceptance smoke for Living Nexus 07.
// Tests only the isolated Wix route. No microphone, camera, payments or writes to Wix.
import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

const url = "https://headless-mfewrcffiie-archonsoulings-140e.wix-site-host.com/experiments/living-nexus-cinematic-v07.html";
const output = path.resolve("hud/prototype/test-artifacts/cinematic-v07-live");
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const failures = [];
const widths = [390, 820, 1280];
try {
 for (const width of widths) {
  const context = await browser.newContext({
    viewport: { width, height: width===390 ? 844 : width===820 ? 1180 : 900 },
    hasTouch: true,
    isMobile: width===390,
    reducedMotion: "no-preference"
  });
  const page = await context.newPage();
  page.setDefaultTimeout(16000);
  const errors = [];
  page.on("pageerror", e => errors.push(String(e)));
  try {
   const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
   assert.equal(response?.status(), 200, "Cinematic preview HTTP 200");
   await page.locator("#canon").waitFor({ state: "visible" });
   await page.waitForFunction(() => document.querySelector("#canon")?.complete &&
      document.querySelector("#canon")?.naturalWidth >= 1500, null, { timeout: 15000 });
   assert.equal(await page.locator(".world[data-world]").count(), 7, "Six worlds and Nexus");
   assert.equal(await page.locator(".world[data-world]:not([data-world=nexus])").count(), 6);
   assert.equal(await page.locator("#gazePanel").isVisible(), false, "Camera dialog initially hidden");
   const privacy = await page.evaluate(() => ({
     gaze: document.querySelector("#camera")?.srcObject !== null,
     still: document.querySelector("#still")?.getAttribute("aria-pressed"),
     overflow: document.documentElement.scrollWidth > innerWidth + 3
   }));
   assert.equal(privacy.gaze, false, "No camera stream without consent");
   assert.equal(privacy.overflow, false, "No horizontal overflow");
   const material = await page.locator("#filaments").getAttribute("data-material");
   assert.equal(material, "approved-image-plus-coherent-auric-membranes-v07");
   const firstFrame = Number(await page.locator("#filaments").getAttribute("data-frames"));
   await page.waitForTimeout(180);
   const secondFrame = Number(await page.locator("#filaments").getAttribute("data-frames"));
   assert.ok(secondFrame > firstFrame, "Living current animation must advance");
   assert.equal(await page.locator("#bookNow").isVisible(), true, "Visible booking CTA");
   await page.screenshot({ path: path.join(output, "v07-"+width+"-idle.png"), fullPage: true });
   await page.locator("#bookNow").click();
   assert.match(await page.locator("#panelTitle").textContent(), /Sessions/);
   assert.equal(await page.locator('#panelActions a[href*="booking-calendar"]').count(), 2);
   await page.locator("#closePanel").click();
   await page.locator("#menu").click();
   assert.equal(await page.getByRole("button",{name:"Share this Nexus"}).count(),1);
   await page.locator("#closePanel").click();
   await page.locator("#guide").click();
   await page.locator("#panelBody .choice").first().click();
   assert.match(await page.locator("#panelTitle").textContent(), /Aura Dynamics/);
   await page.locator("#closePanel").click();
   await page.locator(".world[data-world=aura]").click({ force: true });
   assert.match(await page.locator("#panelTitle").textContent(), /Aura Dynamics/);
   const link = await page.locator("#panelActions a").getAttribute("href");
   assert.ok(link.endsWith("/aura-dynamics.html"), "Real existing Aura route preserved");
   await page.screenshot({ path: path.join(output, "v07-"+width+"-aura.png"), fullPage: true });
   await page.locator("#closePanel").click();
   await page.locator(".world[data-world=sessions]").click({ force: true });
   assert.match(await page.locator("#panelTitle").textContent(), /Sessions/);
   const bookingLinks = await page.locator('#panelActions a[href*="booking-calendar"]').evaluateAll(
     links => links.map(a => ({ label: a.textContent, href: a.href }))
   );
   assert.equal(bookingLinks.length, 2, "Two verified online-bookable services");
   assert.ok(bookingLinks.some(a => a.href.endsWith("/booking-calendar/30-minutes-1") && a.label.includes("$100")));
   assert.ok(bookingLinks.some(a => a.href.endsWith("/booking-calendar/60-minutes-1") && a.label.includes("$200")));
   await page.locator("#closePanel").click();
   await page.locator("#thread").click();
   assert.match(await page.locator("#panelBody").textContent(), /Aura Dynamics/);
   await page.getByRole("button", { name: "Let it dissolve" }).click();
   assert.equal(await page.locator("#threadCount").textContent(), "0");
   await page.locator("#still").click();
   assert.equal(await page.locator("#still").getAttribute("aria-pressed"), "true");
   await page.screenshot({ path: path.join(output, "v07-"+width+"-still.png"), fullPage: true });
   assert.deepEqual(errors, [], "Page JS errors");
   console.log("PASS hosted cinematic", width);
  } catch (e) {
   failures.push(width + ": " + e.message);
  } finally { await context.close(); }
 }
 const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
 const page = await context.newPage();
 try {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  assert.equal(await page.locator("#still").getAttribute("aria-pressed"), "true");
  await page.locator(".world[data-world=gestalt]").click({ force: true });
  assert.match(await page.locator("#panelTitle").textContent(), /Gestalt/);
  await page.screenshot({ path: path.join(output, "v07-390-reduced.png"), fullPage: true });
  console.log("PASS hosted reduced-motion");
 } catch(e){failures.push("reduced-motion: " + e.message);}
 await context.close();
} finally { await browser.close(); }
if (failures.length) {
 console.error("FAIL hosted cinematic\n" + failures.join("\n"));
 process.exitCode = 1;
} else {
 console.log("PASS: Wix-hosted Living Nexus 07 image, six world routes, responsive views, touch, journey, Stillness, reduced motion and camera-off defaults");
}
