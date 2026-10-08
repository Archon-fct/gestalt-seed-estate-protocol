#!/usr/bin/env node
// Living HUD preview evidence capture. Requires: npm install --no-save playwright && npx playwright install chromium
// Usage: node scripts/capture-living-hud.mjs http://localhost:8000/hud/prototype/ [output-dir]
// Does not modify the site or claim visual acceptance.
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const target = process.argv[2];
const output = process.argv[3] ?? 'living-hud-evidence';
if (!target || !/^https?:\/\//.test(target)) {
  console.error('Usage: node scripts/capture-living-hud.mjs <http(s)-preview-url> [output-dir]');
  process.exit(2);
}
const devices = [
  { name: 'mobile-390', width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: 'ipad-820', width: 820, height: 1180, isMobile: true, hasTouch: true },
  { name: 'desktop-1280', width: 1280, height: 800, isMobile: false, hasTouch: false }
];
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = { target, capturedAt: new Date().toISOString(), results: [] };
try {
  for (const device of devices) {
    const context = await browser.newContext({
      viewport: { width: device.width, height: device.height },
      isMobile: device.isMobile, hasTouch: device.hasTouch,
      reducedMotion: 'reduce', deviceScaleFactor: 1
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', err => errors.push(String(err)));
    const response = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.screenshot({ path: join(output, device.name + '.png'), fullPage: true, animations: 'disabled' });
    const metrics = await page.evaluate(() => ({
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
      title: document.title,
      livingFilaments: document.querySelectorAll('svg.living-filaments path').length,
      visibleWorlds: [...document.querySelectorAll('#space .node')].filter(el => {const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&r.left<innerWidth&&r.right>0&&r.top<innerHeight&&r.bottom>0;}).length,
      buttons: [...document.querySelectorAll('button,a')].length,
      undersizedTargets: [...document.querySelectorAll('button,a')].filter(el => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && (r.width < 44 || r.height < 44);
      }).length
    }));
    report.results.push({ device: device.name, httpStatus: response?.status() ?? null, ...metrics, errors });
    await context.close();
  }
} finally {
  await browser.close();
}
await writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (report.results.some(r => r.httpStatus >= 400 || r.horizontalOverflow || r.errors.length || r.visibleWorlds !== 6 || r.livingFilaments < 30)) process.exitCode = 1;
// Screenshot review against owner-approved imagery and actual iPad Safari remain mandatory.
