"""
Extract <body> inner HTML from the MHTML-extracted index.html,
process it (rewrite URLs, strip scripts), and emit a TS module
that exports the HTML as a string for dangerouslySetInnerHTML.
"""
from pathlib import Path
from bs4 import BeautifulSoup, NavigableString
import re
import json

SRC = "/home/z/my-project/extracted_mhtml/alchemists.dan-fisher.dev/basketball-dark/index.html"
OUT_TS = "/home/z/my-project/src/app/alchemists-html.ts"

html = Path(SRC).read_text(encoding="utf-8")
soup = BeautifulSoup(html, "html.parser")

body = soup.body
# Remove all <script> tags
for s in body.find_all("script"):
    s.decompose()

# Get the inner HTML as a string
body_html = body.decode_contents()

# Rewrite URLs: https://alchemists.dan-fisher.dev/basketball-dark/ -> /alchemists/
body_html = body_html.replace(
    "https://alchemists.dan-fisher.dev/basketball-dark/",
    "/alchemists/",
)
# Also handle the Google Fonts link if it's in there
# (won't be in body, but just in case)

# Write out as a TS module. Use JSON.stringify to safely escape the string.
ts = "// AUTO-GENERATED from MHTML. Do not edit by hand.\n"
ts += "// Body content of the Alchemists Basketball home page.\n"
ts += "export const ALCHEMISTS_HTML: string = "
ts += json.dumps(body_html)
ts += ";\n"

Path(OUT_TS).write_text(ts, encoding="utf-8")
print(f"Wrote {OUT_TS}  ({len(ts)} bytes, body HTML was {len(body_html)} chars)")

# Quick sanity: count occurrences of key sections
for marker in [
    "header--layout-1",
    "hero-unit",
    "featured-carousel",
    "site-content",
    'id="footer"',
    "modal-login-register",
]:
    print(f"  '{marker}' appears {body_html.count(marker)} time(s)")
