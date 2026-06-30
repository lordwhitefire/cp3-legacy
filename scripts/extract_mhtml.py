"""
Extract HTML + assets from an MHTML file into a working directory so we can:
  1. Read the HTML to understand structure
  2. Copy images / fonts out so we can serve them locally from the Next.js public/ folder
  3. Render the original page locally via a simple static server for side-by-side comparison

Output: /home/z/my-project/extracted_mhtml/
"""
import email, os, quopri, base64
from pathlib import Path
from urllib.parse import unquote

SRC = "/home/z/my-project/upload/Alchemists Basketball Club & Sports News HTML Template - Home.mhtml"
OUT = Path("/home/z/my-project/extracted_mhtml")
OUT.mkdir(parents=True, exist_ok=True)

with open(SRC, "rb") as f:
    msg = email.message_from_bytes(f.read())

html_parts = []
asset_paths = []

for part in msg.walk():
    if part is msg:
        continue
    ctype = part.get_content_type()
    if ctype in ("multipart/related", "multipart/alternative"):
        continue
    # Get the Content-Location header — that's the original URL
    loc = part.get("Content-Location") or part.get("Content-ID") or ""
    if not loc:
        continue
    loc_clean = unquote(loc)
    payload = part.get_payload(decode=True)
    if payload is None:
        continue
    # Save the asset under a flat-ish path derived from URL
    # Strip protocol
    rel = loc_clean.replace("https://", "").replace("http://", "").replace("file://", "")
    # Some MHTMLs use cid: — keep as-is
    target = OUT / rel
    target.parent.mkdir(parents=True, exist_ok=True)
    with open(target, "wb") as out_f:
        out_f.write(payload)
    asset_paths.append(str(target))
    if ctype == "text/html":
        html_parts.append(str(target))

print(f"Extracted {len(asset_paths)} parts total.")
print(f"HTML parts: {len(html_parts)}")
for h in html_parts:
    print(f"  HTML: {h}")
print(f"First 5 assets:")
for a in asset_paths[:5]:
    print(f"  {a}")
print(f"...")

# Identify the main HTML (largest text/html)
if html_parts:
    main_html = max(html_parts, key=lambda p: Path(p).stat().st_size)
    print(f"\nMain HTML file: {main_html}")
    print(f"Size: {Path(main_html).stat().st_size} bytes")
