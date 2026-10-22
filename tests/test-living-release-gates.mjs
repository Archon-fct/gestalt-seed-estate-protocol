// Regression gate for the owner-approved Living Nexus: explicit returns, iPad layout and Silence race.
// Run after npm install playwright: node tests/test-living-release-gates.mjs
import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import http from "node:http";

const dir = path.resolve("hud/prototype");
const routes = [
  "aura-dynamics.html",
  "convergence.html",
  "inner-sanctum.html",
  "living-archive.html",
  "living-threshold.html",
  "living-tongue.html",
  "astral-journal.html"
];
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json" };
const server = http.createServer(async (req, res) => {
  try {
    const name = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const target = path.resolve(dir, "." + (name === "/" ? "/index.html" : name));
    if (!target.startsWith(dir + path.sep)) { res.writeHead(403); res.end(); return; }
    const bytes = await fs.readFile(target);
    res.writeHead(200, { "Content-Type": mime[path.extname(target)] || "application/octet-stream" });
    res.end(bytes);
  } catch (e) { res.writeHead(e.code === "ENOENT" ? 404 : 500); res.end(String(e.code || e)); }
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const base = "http://127.0.0.1:" + server.address().port + "/";
const browser = await chromium.launch({ headless: true });
const failures = [];
const artifactDir = path.resolve("hud/prototype/test-artifacts");
await fs.mkdir(artifactDir, { recursive: true });

try {
  for (const width of [390, 820, 1280]) {
    const context = await browser.newContext({ viewport: { width, height: 1050 }, hasTouch: true });
    const page = await context.newPage();
    page.setDefaultTimeout(8000);
    for (const route of routes) {
      const title = width + " " + route;
      try {
        const errors = [];
        const onError = error => errors.push(String(error));
        page.on("pageerror", onError);
        const response = await page.goto(new URL(route, base).href, { waitUntil: "load" });
        assert.equal(response.status(), 200);
        await page.waitForTimeout(60);
        const link = page.locator('a[href="./index.html"], a[href="index.html"]').first();
        assert.ok(await link.count(), title + " must have a real Nexus return link");
        const geometry = await page.evaluate(() => {
          const selectors = [".intro", ".detail", ".reader", ".lesson", ".copy"];
          const panels = [...document.querySelectorAll(selectors.join(","))].filter(el => {
            const computed = getComputedStyle(el);
            return computed.display !== "none" && computed.visibility !== "hidden";
          }).map(el => {
            const r = el.getBoundingClientRect();
            return { className: el.className, x: r.x, right: r.right, width: r.width };
          });
          return { overflow: document.documentElement.scrollWidth > innerWidth, panels };
        });
        assert.equal(geometry.overflow, false, title + " horizontal overflow");
        for (const panel of geometry.panels) {
          assert.ok(panel.x >= -3 && panel.right <= width + 3,
            title + " clipped panel " + JSON.stringify(panel));
        }
        if (width === 820) {
          await page.screenshot({ path: path.join(artifactDir, "portrait-" + route + ".png"), fullPage: true });
        }
        const size = await link.boundingBox();
        assert.ok(size && size.height >= 44 && size.width >= 44, title + " Nexus link touch target");
        await link.click();
        await page.waitForURL(/\/index\.html$/);
        assert.equal(new URL(page.url()).pathname, "/index.html", title + " direct return");
        assert.deepEqual(errors, [], title + " JS errors");
        page.off("pageerror", onError);
        console.log("PASS:", title);
      } catch (error) {
        failures.push(title + ": " + error.message);
      }
    }
    await context.close();
  }

  // Explicit owner-started audio may still be awaiting an AudioContext resume.
  // Silence must cancel it and prevent any oscillator from starting late.
  const audioPage = await browser.newPage({ viewport: { width: 820, height: 1050 } });
  await audioPage.addInitScript(() => {
    window.__audio = { starts: 0, stops: 0, resumes: [] };
    class FakeAudioContext {
      constructor() { this.destination = {}; this.state = "suspended"; }
      resume() {
        this.state = "running";
        return new Promise(resolve => window.__audio.resumes.push(resolve));
      }
      suspend() { this.state = "suspended"; return Promise.resolve(); }
      createGain() {
        return { gain: { value: 0 }, connect() { return this; }, disconnect() {} };
      }
      createOscillator() {
        return {
          frequency: { value: 0 },
          connect() { return this; },
          start() { window.__audio.starts++; },
          stop() { window.__audio.stops++; },
          disconnect() {}
        };
      }
    }
    window.AudioContext = FakeAudioContext;
    window.webkitAudioContext = FakeAudioContext;
  });
  try {
    await audioPage.goto(base, { waitUntil: "load" });
    await audioPage.locator("#atmosphere").click();
    await audioPage.waitForFunction(() => window.__audio.resumes.length === 1);
    await audioPage.locator("#silence").click();
    await audioPage.evaluate(() => window.__audio.resumes.shift()());
    await audioPage.waitForTimeout(60);
    const state = await audioPage.evaluate(() => ({
      starts: window.__audio.starts,
      pressed: document.querySelector("#atmosphere").getAttribute("aria-pressed"),
      message: document.querySelector("#status").textContent
    }));
    assert.equal(state.starts, 0, "Silence must cancel pending audio");
    assert.equal(state.pressed, "false", "Atmosphere must show disabled");
    assert.ok(state.message.includes("Silence"), "Silence status must not be overwritten by a stale start");
    console.log("PASS: pending Atmosphere / immediate Silence");
  } catch (e) { failures.push("audio race: " + e.message); }
  await audioPage.close();
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
if (failures.length) {
  console.error("FAIL:\n" + failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log("PASS: 21 pocket-dimension viewport/return checks and immediate-Silence regression");
}
