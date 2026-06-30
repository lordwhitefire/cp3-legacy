"""
Compute pixel-level diff between original MHTML screenshots and Next.js rebuild.
Outputs:
  - diff_{name}.png  (visual diff: black=same, brighter=more different)
  - comparison_{name}.jpg  (side-by-side original | rebuild for visual review)
  - Prints similarity score (% of pixels that match exactly or near-exactly)
"""
from PIL import Image, ImageChops
from pathlib import Path
import numpy as np

ORIG_DIR = Path("/home/z/my-project/download/screenshots/original")
REBUILD_DIR = Path("/home/z/my-project/download/screenshots/rebuild")
OUT_DIR = Path("/home/z/my-project/download/screenshots/diff")
OUT_DIR.mkdir(parents=True, exist_ok=True)

Image.MAX_IMAGE_PIXELS = None

VIEWPORTS = ["1440x900", "1280x800", "768x1024", "375x812"]

for name in VIEWPORTS:
    print(f"\n=== {name} ===")
    orig_path = ORIG_DIR / f"original_{name}.png"
    rebuild_path = REBUILD_DIR / f"rebuild_{name}.png"
    o = Image.open(orig_path).convert("RGB")
    r = Image.open(rebuild_path).convert("RGB")
    print(f"  Original: {o.size}  Rebuild: {r.size}")

    # Crop both to the min height (to compare the common top region)
    min_h = min(o.height, r.height)
    o_crop = o.crop((0, 0, o.width, min_h))
    r_crop = r.crop((0, 0, r.width, min_h))

    # Compute per-pixel absolute difference
    o_arr = np.asarray(o_crop, dtype=np.int16)
    r_arr = np.asarray(r_crop, dtype=np.int16)
    diff_arr = np.abs(o_arr - r_arr)

    # Similarity metrics
    # 1. Mean absolute difference per channel
    mean_diff = diff_arr.mean()
    # 2. % of pixels that are EXACTLY identical
    exact_match_pct = (diff_arr.sum(axis=2) == 0).mean() * 100
    # 3. % of pixels where max channel diff <= 5 (near-identical, allows for jpeg/png quantization)
    near_match_pct = (diff_arr.max(axis=2) <= 8).mean() * 100

    print(f"  Mean per-channel diff: {mean_diff:.2f}")
    print(f"  Exact-match pixels:    {exact_match_pct:.2f}%")
    print(f"  Near-match pixels (≤8 per channel): {near_match_pct:.2f}%")

    # Save a visual diff (amplified so small differences are visible)
    # diff_arr max is 255. Amplify by 3x for visibility.
    diff_vis = np.clip(diff_arr * 3, 0, 255).astype(np.uint8)
    diff_img = Image.fromarray(diff_vis, "RGB")
    diff_path = OUT_DIR / f"diff_{name}.png"
    diff_img.save(diff_path)
    print(f"  Diff image: {diff_path}")

    # Save a side-by-side preview at lower resolution for quick review
    target_w = 800
    scale = target_w / (o.width + r.width)
    new_w = target_w
    new_h = int(min_h * scale)
    side_by_side = Image.new("RGB", (new_w, new_h))
    o_small = o_crop.resize((new_w // 2, new_h), Image.LANCZOS)
    r_small = r_crop.resize((new_w // 2, new_h), Image.LANCZOS)
    side_by_side.paste(o_small, (0, 0))
    side_by_side.paste(r_small, (new_w // 2, 0))
    cmp_path = OUT_DIR / f"compare_{name}.jpg"
    side_by_side.save(cmp_path, "JPEG", quality=85)
    print(f"  Side-by-side preview: {cmp_path}")
