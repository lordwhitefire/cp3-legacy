import {chromium} from 'playwright'
import {writeFileSync, mkdirSync} from 'fs'
import {resolve, dirname} from 'path'
import {fileURLToPath} from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MHTML_PATH = resolve('/home/lordwhitefire/current-project/cp/Alchemists Basketball Club & Sports News HTML Template - Home.mhtml')
const BASE = resolve(__dirname, '../public/screenshots')
const CHROME_BIN = '/home/lordwhitefire/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome'
const TILE_H = 2000

const VIEWPORTS = [
  {name: 'desktop-1440', width: 1440, height: 900},
  {name: 'laptop-1280', width: 1280, height: 800},
  {name: 'tablet-768', width: 768, height: 1024},
  {name: 'mobile-375', width: 375, height: 812},
]

mkdirSync(BASE, {recursive: true})

const browser = await chromium.launch({
  executablePath: CHROME_BIN,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

const allLog = []

for (const vp of VIEWPORTS) {
  allLog.push(`\n${'='.repeat(60)}`)
  allLog.push(`VIEWPORT: ${vp.name} (${vp.width}x${vp.height})`)
  allLog.push(`${'='.repeat(60)}`)

  const page = await browser.newPage({viewport: {width: vp.width, height: vp.height}})
  await page.goto('file://' + MHTML_PATH, {waitUntil: 'networkidle', timeout: 30000})
  await page.waitForTimeout(2000)

  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight)
  allLog.push(`Page height: ${scrollHeight}px`)
  allLog.push(`Tiles (max ${TILE_H}px each):`)

  for (let y = 0; y < scrollHeight; y += TILE_H) {
    const h = Math.min(TILE_H, scrollHeight - y)
    const normalPath = `${BASE}/${vp.name}_normal_y${y}.png`
    const hoverPath = `${BASE}/${vp.name}_hover_y${y}.png`

    // --- NORMAL TILE ---
    await page.screenshot({
      path: normalPath,
      fullPage: true,
      clip: {x: 0, y, width: vp.width, height: h},
    })

    // --- HOVER TILE ---
    // Scroll to tile position
    await page.evaluate(yy => window.scrollTo(0, yy), y)
    await page.waitForTimeout(300)

    // Find all interactive elements visible in this tile
    const hoverables = await page.evaluate(({tileY, tileH}) => {
      const candidates = document.querySelectorAll(
        'a, button, img, tr, .btn, [class*=social], [class*=player], [class*=posts__item], [class*=team-meta], [class*=widget], [class*=card], .tagcloud a, .main-nav a, .header a, .footer a, .table-standings tr, .posts--carousel-featured .posts__item'
      )
      const visible = []
      for (const el of candidates) {
        const rect = el.getBoundingClientRect()
        const docY = rect.top + window.scrollY
        if (docY + rect.height > tileY && docY < tileY + tileH) {
          if (rect.width > 10 && rect.height > 10) {
            visible.push({
              tag: el.tagName,
              class: (el.className || '').substring(0, 50),
              x: Math.round(docY),
            })
          }
        }
      }
      return visible
    }, {tileY: y, tileH: h})

    allLog.push(`\n  Tile y=${y} (${vp.width}x${h}): ${hoverables.length} hoverable elements`)

    // Hover each element and capture state
    const detectedChanges = []

    for (let i = 0; i < Math.min(hoverables.length, 20); i++) {
      try {
        // Re-query elements by tag+class position
        const el = await page.evaluateHandle((idx) => {
          const candidates = document.querySelectorAll(
            'a, button, img, tr, .btn, [class*=social], [class*=player], [class*=posts__item], [class*=team-meta], [class*=widget], [class*=card], .tagcloud a, .main-nav a, .header a, .footer a, .table-standings tr, .posts--carousel-featured .posts__item'
          )
          let count = 0
          for (const c of candidates) {
            const rect = c.getBoundingClientRect()
            if (rect.width > 10 && rect.height > 10) {
              if (count === idx) return c
              count++
            }
          }
          return null
        }, i)

        if (!el) continue

        const before = await page.evaluate(el => ({
          t: getComputedStyle(el).transform,
          o: getComputedStyle(el).opacity,
          bg: getComputedStyle(el).backgroundColor,
          c: getComputedStyle(el).color,
          bs: getComputedStyle(el).boxShadow,
          scale: el.style.transform,
        }), el)

        await el.asElement().hover({force: true})
        await page.waitForTimeout(100)

        const after = await page.evaluate(el => ({
          t: getComputedStyle(el).transform,
          o: getComputedStyle(el).opacity,
          bg: getComputedStyle(el).backgroundColor,
          c: getComputedStyle(el).color,
          bs: getComputedStyle(el).boxShadow,
          scale: el.style.transform,
        }), el)

        const changes = []
        for (const key of ['t', 'o', 'bg', 'c', 'bs']) {
          if (before[key] !== after[key]) {
            changes.push(`${key}: ${before[key]} → ${after[key]}`)
          }
        }
        if (changes.length > 0) {
          detectedChanges.push(`  [${i}] <${hoverables[i].tag}> ${hoverables[i].class}: ${changes.join('; ')}`)
        }

        await page.evaluate(el => {
          const evt = new MouseEvent('mouseout', {bubbles: true})
          el.dispatchEvent(evt)
        }, el)
        await page.waitForTimeout(50)
      } catch (e) {
        // skip individual hover errors
      }
    }

    // Now take the hover screenshot with last few elements hovered
    // Re-hover the last 3 elements for the visual
    try {
      const lastFew = await page.evaluateHandle((idx) => {
        const candidates = document.querySelectorAll(
          'a, button, img, tr, .btn, [class*=social], [class*=player], [class*=posts__item], [class*=team-meta], [class*=widget], [class*=card], .tagcloud a, .main-nav a, .header a, .footer a, .table-standings tr, .posts--carousel-featured .posts__item'
        )
        let count = 0
        for (const c of candidates) {
          const rect = c.getBoundingClientRect()
          if (rect.width > 10 && rect.height > 10) {
            if (count === idx) return c
            count++
          }
        }
        return null
      }, Math.min(hoverables.length - 1, 2))
      if (lastFew) {
        await lastFew.asElement().hover({force: true})
        await page.waitForTimeout(100)
      }
    } catch (e) {}

    await page.screenshot({
      path: hoverPath,
      fullPage: true,
      clip: {x: 0, y, width: vp.width, height: h},
    })

    if (detectedChanges.length > 0) {
      allLog.push(`  Hover CSS changes in this tile:`)
      allLog.push(...detectedChanges)
    } else {
      allLog.push(`  (no CSS hover changes detected in this tile)`)
    }

    allLog.push(`  → ${normalPath.split('/').pop()}`)
    allLog.push(`  → ${hoverPath.split('/').pop()}`)
  }

  await page.close()
}

await browser.close()

// Write report
const report = [
  '=== SCREENSHOT REPORT ===',
  ...allLog,
  '',
  '=== SUMMARY ===',
  `Total screenshots in: ${BASE}`,
]

writeFileSync(`${BASE}/REPORT.txt`, report.join('\n'))
console.log(report.join('\n'))
