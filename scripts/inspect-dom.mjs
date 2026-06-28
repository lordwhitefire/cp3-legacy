import {chromium} from 'playwright'
import {resolve} from 'path'

const MHTML_PATH = resolve('/home/lordwhitefire/current-project/cp/Alchemists Basketball Club & Sports News HTML Template - Home.mhtml')
const CHROME_BIN = '/home/lordwhitefire/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome'

const browser = await chromium.launch({
  executablePath: CHROME_BIN,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

const page = await browser.newPage({viewport: {width: 1440, height: 900}})
await page.goto('file://' + MHTML_PATH, {waitUntil: 'networkidle', timeout: 30000})
await page.waitForTimeout(3000)

const structure = await page.evaluate(() => {
  const parts = []
  // Get all major visible elements with their tag, class, position, size
  const all = document.querySelectorAll('section, div[class], header, footer, nav, main, aside, table')
  for (const el of all) {
    const rect = el.getBoundingClientRect()
    const cls = el.className || ''
    if (rect.width > 100 && rect.height > 20 && rect.width < 2000) {
      parts.push({
        tag: el.tagName,
        class: cls.substring(0, 60),
        id: el.id,
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        w: Math.round(rect.width),
        h: Math.round(rect.height),
        visible: rect.width > 0 && rect.height > 0,
      })
    }
  }
  return parts
})

// Group by y-position to find sections
structure.sort((a, b) => a.y - b.y)

let currentY = -1
for (const s of structure) {
  if (Math.abs(s.y - currentY) > 50) {
    console.log(`\n--- y=${s.y} ---`)
    currentY = s.y
  }
  console.log(`  ${s.tag}  y=${s.y} x=${s.x}  ${s.w}x${s.h}  class="${s.class}"`)
}

console.log(`\n\nTotal page height: ${structure.length > 0 ? Math.max(...structure.map(s => s.y + s.h)) : '?'}`)

await browser.close()
