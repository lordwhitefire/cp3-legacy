"""
Screenshot the Next.js rebuild of the Alchemists page.
Same 4 viewports as the original MHTML screenshots, same DSF for ~2000px output.
Output: /home/z/my-project/download/screenshots/rebuild/
"""

from pathlib import Path
from playwright.sync_api import sync_playwright

URL = "http://localhost:3000/"
OUT_DIR = Path("/home/z/my-project/download/screenshots/rebuild")
OUT_DIR.mkdir(parents=True, exist_ok=True)

VIEWPORTS = [
    ("1440x900", 1440, 900, 2),
    ("1280x800", 1280, 800, 2),
    ("768x1024",  768, 1024, 3),
    ("375x812",   375, 812,  5),
]

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for name, w, h, dsf in VIEWPORTS:
            context = browser.new_context(
                viewport={"width": w, "height": h},
                device_scale_factor=dsf,
            )
            page = context.new_page()
            print(f"Loading {name} (viewport {w}x{h}, dsf={dsf})...")
            page.goto(URL, wait_until="networkidle", timeout=120000)
            # Give web fonts & images a beat to settle
            page.wait_for_timeout(4000)
            out = OUT_DIR / f"rebuild_{name}.png"
            page.screenshot(path=str(out), full_page=True)
            print(f"  -> {out}  ({out.stat().st_size//1024} KB)")
            context.close()
        browser.close()
    print("Done.")

if __name__ == "__main__":
    main()
