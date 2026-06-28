import { chromium } from 'playwright-core';
import path from 'path';

async function run() {
    const userDataDir = '/tmp/brave-cp3';
    const bravePath = '/usr/bin/brave-browser';
    const artifactDir = '/home/lordwhitefire/.gemini/antigravity/brain/977bb39b-d47a-4587-af21-3f126fbcf086';

    console.log('Launching Brave from:', bravePath);
    console.log('Using profile directory:', userDataDir);

    const browserContext = await chromium.launchPersistentContext(userDataDir, {
        executablePath: bravePath,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        viewport: { width: 1440, height: 900 }
    });

    const page1 = await browserContext.newPage();
    console.log('Opening original design...');
    await page1.goto('file:///home/lordwhitefire/current-project/cp/Alchemists%20Basketball%20Club%20&%20Sports%20News%20HTML%20Template%20-%20Home.mhtml', { waitUntil: 'networkidle' });
    await page1.screenshot({ path: path.join(artifactDir, 'original_design.png'), fullPage: true });

    const page2 = await browserContext.newPage();
    console.log('Opening implementation at localhost:3001...');
    await page2.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    await page2.screenshot({ path: path.join(artifactDir, 'my_implementation.png'), fullPage: true });

    await browserContext.close();
    console.log('Comparison complete. Screenshots saved.');
}

run().catch(error => {
    console.error('Error during comparison:', error);
    process.exit(1);
});
