"""Split the huge screenshots into vertical segments for VLM review."""
from PIL import Image
from pathlib import Path
import os

SRC = Path("/home/z/my-project/download/screenshots/original")
OUT = Path("/home/z/my-project/download/screenshots/_segments")
OUT.mkdir(parents=True, exist_ok=True)

# For each screenshot, split into ~2000px-tall chunks (CSS pixels)
# Actually since they're already at high DPI, split into ~3000px chunks at native res
CHUNK_PX = 3000  # native pixels per chunk

for f in sorted(SRC.glob("*.png")):
    img = Image.open(f)
    # Disable bomb warning
    Image.MAX_IMAGE_PIXELS = None
    w, h = img.size
    print(f"\n{f.name}: {w}x{h}")
    n_chunks = (h + CHUNK_PX - 1) // CHUNK_PX
    # Limit to first 6 chunks per file (most content is at top)
    n_chunks = min(n_chunks, 8)
    for i in range(n_chunks):
        top = i * CHUNK_PX
        bot = min((i + 1) * CHUNK_PX, h)
        chunk = img.crop((0, top, w, bot))
        # Downscale to 1200px wide for review
        cw, ch = chunk.size
        new_w = 1200
        new_h = int(ch * new_w / cw)
        chunk.thumbnail((new_w, new_h), Image.LANCZOS)
        base = f.stem
        out_path = OUT / f"{base}_seg{i+1:02d}.jpg"
        chunk.convert("RGB").save(out_path, "JPEG", quality=85)
        print(f"  -> {out_path.name}  {chunk.size}")
