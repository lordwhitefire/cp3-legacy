"""
Make focused side-by-side crops of specific page regions for visual review.
Crops: top (header + hero), middle (main content), bottom (footer)
For each viewport.
"""
from PIL import Image
from pathlib import Path

ORIG_DIR = Path("/home/z/my-project/download/screenshots/original")
REBUILD_DIR = Path("/home/z/my-project/download/screenshots/rebuild")
OUT_DIR = Path("/home/z/my-project/download/screenshots/compare_regions")
OUT_DIR.mkdir(parents=True, exist_ok=True)

Image.MAX_IMAGE_PIXELS = None

VIEWPORTS = ["1440x900", "1280x800", "768x1024", "375x812"]

for name in VIEWPORTS:
    o = Image.open(ORIG_DIR / f"original_{name}.png").convert("RGB")
    r = Image.open(REBUILD_DIR / f"rebuild_{name}.png").convert("RGB")
    min_h = min(o.height, r.height)

    # Take the top 3000 px (which is the most visible: header + hero + featured carousel + top of main content)
    # Crop at 1/4 resolution for review
    crop_h = min(3000, min_h)
    o_crop = o.crop((0, 0, o.width, crop_h))
    r_crop = r.crop((0, 0, r.width, crop_h))

    target_w = 1400
    scale = target_w / (o.width + r.width)
    new_w = target_w
    new_h = int(crop_h * scale)
    side_by_side = Image.new("RGB", (new_w, new_h))
    o_small = o_crop.resize((new_w // 2, new_h), Image.LANCZOS)
    r_small = r_crop.resize((new_w // 2, new_h), Image.LANCZOS)
    side_by_side.paste(o_small, (0, 0))
    side_by_side.paste(r_small, (new_w // 2, 0))
    out_path = OUT_DIR / f"top_{name}.jpg"
    side_by_side.save(out_path, "JPEG", quality=90)
    print(f"Wrote {out_path}  size={side_by_side.size}")

    # Also a middle region
    mid_start = min_h // 2
    mid_end = min(mid_start + 3000, min_h)
    o_mid = o.crop((0, mid_start, o.width, mid_end))
    r_mid = r.crop((0, mid_start, r.width, mid_end))
    side_mid = Image.new("RGB", (new_w, new_h))
    o_mid_s = o_mid.resize((new_w // 2, new_h), Image.LANCZOS)
    r_mid_s = r_mid.resize((new_w // 2, new_h), Image.LANCZOS)
    side_mid.paste(o_mid_s, (0, 0))
    side_mid.paste(r_mid_s, (new_w // 2, 0))
    out_mid = OUT_DIR / f"mid_{name}.jpg"
    side_mid.save(out_mid, "JPEG", quality=90)
    print(f"Wrote {out_mid}")
