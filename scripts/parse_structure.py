"""
Parse the original Alchemists HTML and dump structured JSON for:
  - navigation menu items
  - top bar (account, wishlist, currency, language)
  - header secondary (contact info, social links, login/register, search)
  - hero unit content
  - featured carousel posts
  - main content layout (left sidebar, main column, right sidebar)
  - footer widgets & links
  - modal login/register content

Output: /home/z/my-project/scripts/extracted_data.json
This is for ANALYSIS ONLY — the actual app will read from typed data files.
"""
import json
from bs4 import BeautifulSoup
from pathlib import Path

SRC = "/home/z/my-project/extracted_mhtml/alchemists.dan-fisher.dev/basketball-dark/index.html"
html = Path(SRC).read_text(encoding="utf-8")
soup = BeautifulSoup(html, "html.parser")
body = soup.body

def text(el):
    return el.get_text(strip=True) if el else ""

def dump_section(name, el, max_len=4000):
    print(f"\n========== {name} ==========")
    if el is None:
        print("  (not found)")
        return
    txt = text(el)
    print(f"  text preview ({len(txt)} chars): {txt[:500]}")
    # Find direct children
    children = [c for c in el.find_all(recursive=False) if c.name]
    print(f"  direct children: {len(children)}")
    for i, c in enumerate(children):
        cls = " ".join(c.get("class", []))[:80]
        id_ = c.get("id", "")
        print(f"    [{i}] <{c.name}> id='{id_}' class='{cls}'  text='{text(c)[:120]}'")

# Top-level structure
print("=== TOP-LEVEL BODY CHILDREN ===")
for i, c in enumerate(body.find_all(recursive=False)):
    if not c.name: continue
    cls = " ".join(c.get("class", []))[:80]
    id_ = c.get("id", "")
    print(f"[{i}] <{c.name}> id='{id_}' class='{cls}'")

# Header sections
header = body.find("header", class_="header")
if header:
    dump_section("HEADER", header)
    for sub in header.find_all(recursive=False):
        cls = " ".join(sub.get("class", []))
        if "header__top-bar" in cls:
            dump_section("  HEADER TOP BAR", sub)
        elif "header__secondary" in cls:
            dump_section("  HEADER SECONDARY", sub)
        elif "header__primary" in cls:
            dump_section("  HEADER PRIMARY", sub)
