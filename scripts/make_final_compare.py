"""
Create final side-by-side comparison images at full screenshot size,
one per viewport. These show the original next to the rebuild so the
user can visually confirm pixel-perfect fidelity.
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

ORIG_DIR = Path("/home/z/my-project/download/screenshots/original")
REBUILD_DIR = Path("/home/z/my-project/download/screenshots/rebuild")
OUT_DIR = Path("/home/z/my-project/download/screenshots/final_compare")
OUT_DIR.mkdir(parents=True, exist_ok=True)

Image.MAX_IMAGE_PIXELS = None

VIEWPORTS = ["1440x900", "1280x800", "768x1024", "375x812"]

for name in VIEWPORTS:
    o = Image.open(ORIG_DIR / f"original_{name}.png").convert("RGB")
    r = Image.open(REBUILD_DIR / f"rebuild_{name}.png").convert("RGB")
    min_h = min(o.height, r.height)
    o_crop = o.crop((0, 0, o.width, min_h))
    r_crop = r.crop((0, 0, r.width, min_h))
    # Add a small label banner at top
    label_h = 60
    banner = Image.new("RGB", (o.width + r.width, label_h), (20, 20, 20))
    draw = ImageDraw.Draw(banner)
    try:
        font = ImageFont.truetype(
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 24
        )
    except Exception:
        font = ImageFont.load_default()
    draw.text((20, 16), "ORIGINAL (MHTML)", fill=(255, 255, 255), font=font)
    draw.text((o.width + 20, 16), "REBUILD (Next.js + Tailwind)", fill=(255, 220, 0), font=font)
    side = Image.new("RGB", (o.width + r.width, label_h + min_h), (0, 0, 0))
    side.paste(banner, (0, 0))
    side.paste(o_crop, (0, label_h))
    side.paste(r_crop, (o.width, label_h))
    # Downscale to 2000px wide for manageable file size
    target_w = 2000
    if side.width > target_w:
        scale = target_w / side.width
        side = side.resize((target_w, int(side.height * scale)), Image.LANCZOS)
    out_path = OUT_DIR / f"compare_{name}.jpg"
    side.save(out_path, "JPEG", quality=88)
    print(f"Wrote {out_path}  size={side.size}")
