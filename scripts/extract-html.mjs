import { chromium } from 'playwright';
import { resolve } from 'path';
import { writeFileSync } from 'fs';

const MHTML_PATH = resolve('/home/lordwhitefire/current-project/cp/Alchemists Basketball Club & Sports News HTML Template - Home.mhtml');
const CHROME_BIN = '/home/lordwhitefire/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome';

(async () => {
  const browser = await chromium.launch({
    executablePath: CHROME_BIN,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('file://' + MHTML_PATH, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  const html = await page.content();
  writeFileSync('/home/lordwhitefire/current-project/cp/extracted_homepage.html', html);
  console.log('Successfully saved extracted HTML to /home/lordwhitefire/current-project/cp/extracted_homepage.html');

  await browser.close();
})();
