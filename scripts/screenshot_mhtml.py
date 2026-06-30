"""
Screenshot the original MHTML file at 4 viewport sizes.
Output: PNGs in /home/z/my-project/download/screenshots/original/
Each screenshot is full-page (captures everything below the fold).
deviceScaleFactor=2 so the output is ~2x the viewport width — for desktop
viewports (1440/1280) this gives ~2880/2560px wide screenshots; for the
tablet (768) and phone (375) we bump the scale factor so the output is
still ~2000px+ wide and crisp without zooming.
"""

from pathlib import Path
from playwright.sync_api import sync_playwright

MHTML_PATH = "/home/z/my-project/upload/Alchemists Basketball Club & Sports News HTML Template - Home.mhtml"
OUT_DIR = Path("/home/z/my-project/download/screenshots/original")
OUT_DIR.mkdir(parents=True, exist_ok=True)

# (name, width, height, device_scale_factor)
# DSF chosen so output width ≈ 2000–2900px (no zooming needed)
VIEWPORTS = [
    ("1440x900",  1440, 900,  2),   # → 2880px wide
    ("1280x800",  1280, 800,  2),   # → 2560px wide
    ("768x1024",   768, 1024, 3),   # → 2304px wide
    ("375x812",    375, 812,  5),   # → 1875px wide (close to 2000)
]

def main():
    file_url = "file://" + MHTML_PATH
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for name, w, h, dsf in VIEWPORTS:
            context = browser.new_context(
                viewport={"width": w, "height": h},
                device_scale_factor=dsf,
            )
            page = context.new_page()
            print(f"Loading {name} (viewport {w}x{h}, dsf={dsf})...")
            page.goto(file_url, wait_until="networkidle", timeout=60000)
            # Give web fonts & images a beat to settle
            page.wait_for_timeout(2000)
            out = OUT_DIR / f"original_{name}.png"
            page.screenshot(path=str(out), full_page=True)
            print(f"  -> {out}  ({out.stat().st_size//1024} KB)")
            context.close()
        browser.close()
    print("Done.")

if __name__ == "__main__":
    main()
