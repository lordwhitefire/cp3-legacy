"""
Measure all images on the rebuild page at multiple viewports.
Captures rendered vs natural dimensions to determine aspect ratio specs.
"""

import json
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = "http://localhost:3000/"
OUT_DIR = Path(__file__).resolve().parent.parent / "docs"
OUT_DIR.mkdir(parents=True, exist_ok=True)

VIEWPORTS = [
    ("1920", 1920, 900, 1),
    ("1440", 1440, 900, 1),
    ("1024", 1024, 768, 1),
    ("768",   768,  1024, 1),
]

def get_container_context(el):
    """Walk up from the img to find meaningful container classes."""
    classes = []
    parent = el
    for _ in range(6):
        parent = parent.get("parentElement")
        if parent is None:
            break
        cls = parent.get("className", "")
        if cls and any(k in cls for k in ["posts__thumb", "widget-player", "widget-instagram",
                                           "team-meta", "hero-unit", "header-mobile",
                                           "header-logo", "footer-logo", "pushy-panel",
                                           "main-news-banner", "match-preview", "player-details",
                                           "widget-banner", "widget-game-result", "cart-sm",
                                           "post-author", "header-cart"]):
            classes.append(cls[:80])
    return " | ".join(classes) if classes else "unknown"

def main():
    all_results = {}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        for name, w, h, dsf in VIEWPORTS:
            context = browser.new_context(
                viewport={"width": w, "height": h},
                device_scale_factor=dsf,
            )
            page = context.new_page()
            print(f"\n=== Measuring at {name} ({w}x{h}) ===")
            page.goto(URL, wait_until="networkidle", timeout=60000)
            page.wait_for_timeout(3000)

            results = page.evaluate("""
                () => {
                    const imgs = document.querySelectorAll('img');
                    return Array.from(imgs).map((img, idx) => {
                        const rect = img.getBoundingClientRect();
                        // Walk up to find container context
                        let container = '';
                        let el = img;
                        for (let i = 0; i < 6; i++) {
                            el = el.parentElement;
                            if (!el) break;
                            const cls = el.className || '';
                            if (cls && /posts__thumb|widget-player|widget-instagram|team-meta|hero-unit|header-mobile|header-logo|footer-logo|pushy-panel|main-news-banner|match-preview|player-details|widget-banner|widget-game-result|cart-sm|post-author|header-cart/.test(cls)) {
                                container = cls.slice(0, 100);
                            }
                        }
                        return {
                            index: idx,
                            src: img.getAttribute('src') || '',
                            alt: (img.getAttribute('alt') || '').slice(0, 30),
                            naturalW: img.naturalWidth,
                            naturalH: img.naturalHeight,
                            naturalRatio: img.naturalWidth && img.naturalHeight
                                ? (img.naturalWidth / img.naturalHeight).toFixed(3)
                                : '0',
                            renderedW: Math.round(rect.width),
                            renderedH: Math.round(rect.height),
                            renderedRatio: rect.width && rect.height
                                ? (rect.width / rect.height).toFixed(3)
                                : '0',
                            container: container || img.parentElement?.className?.slice(0, 60) || 'unknown',
                            isVisible: rect.width > 0 && rect.height > 0,
                        };
                    });
                }
            """)

            all_results[name] = results

            # Print summary
            visible = [r for r in results if r["isVisible"]]
            print(f"  Total images: {len(results)}, visible: {len(visible)}")
            for r in visible:
                ratio_note = ""
                if r["naturalRatio"] != r["renderedRatio"]:
                    ratio_note = f" *** RATIO MISMATCH: natural={r['naturalRatio']} rendered={r['renderedRatio']}"
                print(f"  [{r['index']:2d}] {r['container'][:50]:50s} | "
                      f"rendered {r['renderedW']:4d}x{r['renderedH']:<4d} "
                      f"(ratio {r['renderedRatio']}) | "
                      f"natural {r['naturalW']}x{r['naturalH']} | {r['src'][:45]}{ratio_note}")

            context.close()

        browser.close()

    # Save full results
    out_path = OUT_DIR / "image_specs.json"
    with open(out_path, "w") as f:
        json.dump(all_results, f, indent=2)
    print(f"\nFull results saved to {out_path}")

    # Cross-viewport comparison: group by src, show rendered dims per viewport
    print("\n\n=== CROSS-VIEWPORT COMPARISON ===")
    print(f"{'Image src':<55} {'Nat W':>6} {'Nat H':>6} {'Nat R':>8} | "
          f"{'1920 W':>6}{' H':>6}{' R':>8} | "
          f"{'1440 W':>6}{' H':>6}{' R':>8} | "
          f"{'1024 W':>6}{' H':>6}{' R':>8} | "
          f"{'768 W':>6}{' H':>6}{' R':>8}")
    print("-" * 170)

    # Key images to track (unique meaningful src paths)
    seen = set()
    for vp in ["1920", "1440", "1024", "768"]:
        if vp in all_results:
            for r in all_results[vp]:
                src_short = r["src"][-50:] if r["src"] else ""
                key = src_short
                if key and key not in seen and r["isVisible"] and "avatar" not in r["src"]:
                    seen.add(key)

    # Build table
    for src_key in sorted(seen):
        row = f"{src_key:<55}"
        nat_w = nat_h = nat_r = ""
        dims = {}
        for vp in ["1920", "1440", "1024", "768"]:
            if vp in all_results:
                for r in all_results[vp]:
                    if r["src"].endswith(src_key) or r["src"] == src_key or (src_key and src_key in r["src"]):
                        if r["isVisible"]:
                            if not nat_w:
                                nat_w = r["naturalW"]
                                nat_h = r["naturalH"]
                                nat_r = r["naturalRatio"]
                            dims[vp] = (r["renderedW"], r["renderedH"], r["renderedRatio"])
                        break
        if nat_w:
            row += f"{nat_w:>6} {nat_h:>6} {nat_r:>8} |"
        else:
            row += f"{'?':>6} {'?':>6} {'?':>8} |"
        for vp in ["1920", "1440", "1024", "768"]:
            if vp in dims:
                w, h, r = dims[vp]
                row += f" {w:>5} {h:>5} {r:>8} |"
            else:
                row += f" {'?':>5} {'?':>5} {'?':>8} |"
        print(row)

if __name__ == "__main__":
    main()
