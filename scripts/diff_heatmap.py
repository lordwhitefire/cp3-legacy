"""
Build a 'differences heatmap' for each viewport:
- Downscale the diff to a small grid (e.g. 50x100 cells)
- For each cell, compute the mean per-channel difference
- Output a small heatmap PNG that shows WHERE on the page the differences are
  (black = identical, red/bright = different)
Also print a coarse text summary of where the differences concentrate (top/middle/bottom,
left/right).
"""
from PIL import Image
from pathlib import Path
import numpy as np

ORIG_DIR = Path("/home/z/my-project/download/screenshots/original")
REBUILD_DIR = Path("/home/z/my-project/download/screenshots/rebuild")
OUT_DIR = Path("/home/z/my-project/download/screenshots/heatmap")
OUT_DIR.mkdir(parents=True, exist_ok=True)

Image.MAX_IMAGE_PIXELS = None

VIEWPORTS = ["1440x900", "1280x800", "768x1024", "375x812"]

GRID_W = 40  # horizontal cells
GRID_H = 80  # vertical cells

for name in VIEWPORTS:
    o = Image.open(ORIG_DIR / f"original_{name}.png").convert("RGB")
    r = Image.open(REBUILD_DIR / f"rebuild_{name}.png").convert("RGB")
    min_h = min(o.height, r.height)
    o_arr = np.asarray(o.crop((0, 0, o.width, min_h)), dtype=np.int16)
    r_arr = np.asarray(r.crop((0, 0, r.width, min_h)), dtype=np.int16)
    diff_arr = np.abs(o_arr - r_arr).mean(axis=2)  # (H, W) grayscale diff

    # Downsample to GRID_W x GRID_H by mean
    H, W = diff_arr.shape
    cell_h = H // GRID_H
    cell_w = W // GRID_W
    # Trim to multiples
    diff_trim = diff_arr[:cell_h * GRID_H, :cell_w * GRID_W]
    diff_reshape = diff_trim.reshape(GRID_H, cell_h, GRID_W, cell_w)
    grid = diff_reshape.mean(axis=(1, 3))  # (GRID_H, GRID_W)

    # Save heatmap: scale to 0-255, red channel for visibility
    grid_norm = (grid / grid.max() * 255).astype(np.uint8) if grid.max() > 0 else grid.astype(np.uint8)
    # Make a red colormap (black->red->yellow->white)
    heat = np.zeros((GRID_H, GRID_W, 3), dtype=np.uint8)
    heat[..., 0] = grid_norm  # R
    # G channel: 0 below 128, ramps up after
    heat[..., 1] = np.clip((grid_norm.astype(np.int16) - 96) * 2, 0, 255).astype(np.uint8)
    # B channel: ramps up only at very high values
    heat[..., 2] = np.clip((grid_norm.astype(np.int16) - 192) * 4, 0, 255).astype(np.uint8)
    heat_img = Image.fromarray(heat, "RGB").resize((GRID_W * 16, GRID_H * 16), Image.NEAREST)
    out_path = OUT_DIR / f"heatmap_{name}.png"
    heat_img.save(out_path)
    print(f"\n=== {name} ===")
    print(f"  Heatmap: {out_path}")
    print(f"  Overall mean diff: {diff_arr.mean():.2f}")
    print(f"  Max cell diff: {grid.max():.2f}")

    # Coarse breakdown: divide into 8 vertical bands
    print(f"  Vertical band mean diff (top → bottom):")
    band_h = GRID_H // 8
    for i in range(8):
        band = grid[i*band_h:(i+1)*band_h]
        print(f"    band {i+1} (rows {i*band_h*cell_h}-{(i+1)*band_h*cell_h}px): mean={band.mean():.1f} max={band.max():.1f}")
