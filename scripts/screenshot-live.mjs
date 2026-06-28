// screenshot-live.mjs
// Replicates screenshot-template.mjs but captures the live site instead of the local MHTML file.
// Used to verify that the rendered output matches the archived MHTML version.

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Directory to store live screenshots and report
const BASE = resolve(__dirname, '../public/screenshots-live');
// URL of the live site (should match the original design)
const LIVE_URL = 'https://alchemists.dan-fisher.dev/basketball-dark/';
// Maximum tile height for scrolling screenshots
const TILE_H = 2000;

const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'laptop-1280', width: 1280, height: 800 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-375', width: 375, height: 812 },
];

mkdirSync(BASE, { recursive: true });

const browser = await chromium.launch({ headless: true });
const allLog = [];

for (const vp of VIEWPORTS) {
  allLog.push(`\n${'='.repeat(60)}`);
  allLog.push(`VIEWPORT: ${vp.name} (${vp.width}x${vp.height})`);
  allLog.push(`${'='.repeat(60)}`);

  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.goto(LIVE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  allLog.push(`Page height: ${scrollHeight}px`);
  allLog.push(`Tiles (max ${TILE_H}px each):`);

  for (let y = 0; y < scrollHeight; y += TILE_H) {
    const h = Math.min(TILE_H, scrollHeight - y);
    const normalPath = `${BASE}/${vp.name}_normal_y${y}.png`;
    const hoverPath = `${BASE}/${vp.name}_hover_y${y}.png`;

    // Normal screenshot
    await page.screenshot({ path: normalPath, fullPage: true, clip: { x: 0, y, width: vp.width, height: h } });

    // Detect hoverable elements in the tile (same logic as template script)
    const hoverables = await page.evaluate(({ tileY, tileH }) => {
      const candidates = document.querySelectorAll(
        'a, button, img, tr, .btn, [class*=social], [class*=player], [class*=posts__item], [class*=team-meta], [class*=widget], [class*=card], .tagcloud a, .main-nav a, .header a, .footer a, .table-standings tr, .posts--carousel-featured .posts__item'
      );
      const visible = [];
      for (const el of candidates) {
        const rect = el.getBoundingClientRect();
        const docY = rect.top + window.scrollY;
        if (docY + rect.height > tileY && docY < tileY + tileH) {
          if (rect.width > 10 && rect.height > 10) {
            visible.push({ tag: el.tagName, class: (el.className || '').substring(0, 50), x: Math.round(docY) });
          }
        }
      }
      return visible;
    }, { tileY: y, tileH: h });

    allLog.push(`\n  Tile y=${y} (${vp.width}x${h}): ${hoverables.length} hoverable elements`);
    // Hover each (up to 20) and capture hover screenshot
    for (let i = 0; i < Math.min(hoverables.length, 20); i++) {
      try {
        const el = await page.evaluateHandle((idx) => {
          const candidates = document.querySelectorAll(
            'a, button, img, tr, .btn, [class*=social], [class*=player], [class*=posts__item], [class*=team-meta], [class*=widget], [class*=card], .tagcloud a, .main-nav a, .header a, .footer a, .table-standings tr, .posts--carousel-featured .posts__item'
          );
          let count = 0;
          for (const c of candidates) {
            const rect = c.getBoundingClientRect();
            if (rect.width > 10 && rect.height > 10) {
              if (count === idx) return c;
              count++;
            }
          }
          return null;
        }, i);
        if (!el) continue;
        await el.asElement().hover({ force: true });
        await page.waitForTimeout(100);
      } catch (e) {
        // ignore hover errors
      }
    }

    await page.screenshot({ path: hoverPath, fullPage: true, clip: { x: 0, y, width: vp.width, height: h } });

    allLog.push(`  → ${normalPath.split('/').pop()}`);
    allLog.push(`  → ${hoverPath.split('/').pop()}`);
  }

  await page.close();
}

await browser.close();

const report = ['=== LIVE SCREENSHOT REPORT ===', ...allLog, '', '=== SUMMARY ===', `Total live screenshots in: ${BASE}`];
writeFileSync(`${BASE}/REPORT.txt`, report.join('\n'));
console.log(report.join('\n'));
