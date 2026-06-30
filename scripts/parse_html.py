"""Parse the MHTML HTML and print a structured outline: top-level sections, headers, navigation, main sections, etc."""
from bs4 import BeautifulSoup
from pathlib import Path

html_path = "/home/z/my-project/extracted_mhtml/alchemists.dan-fisher.dev/basketball-dark/index.html"
html = Path(html_path).read_text(encoding="utf-8")

soup = BeautifulSoup(html, "html.parser")

# Print body's direct children
body = soup.body
print("=== BODY direct children ===")
for i, child in enumerate(body.find_all(recursive=False)):
    cls = " ".join(child.get("class", []))[:80]
    id_ = child.get("id", "")
    text_preview = child.get_text(strip=True)[:60]
    print(f"{i}: <{child.name}> id='{id_}' class='{cls}'  text='{text_preview}'")

print("\n=== Major sections (header, nav, main, footer, sections) ===")
for tag_name in ["header", "nav", "main", "footer", "section"]:
    for i, el in enumerate(body.find_all(tag_name, recursive=True)):
        cls = " ".join(el.get("class", []))[:80]
        id_ = el.get("id", "")
        print(f"<{tag_name}> [{i}] id='{id_}' class='{cls}'")

# Top-level container structure
print("\n=== First 5 levels of structure ===")
def walk(el, depth=0, max_depth=5):
    if depth > max_depth:
        return
    cls = " ".join(el.get("class", []))[:60]
    id_ = el.get("id", "")
    name = el.name
    text_preview = el.get_text(strip=True)[:40] if depth == max_depth else ""
    indent = "  " * depth
    print(f"{indent}<{name}> id='{id_}' class='{cls}' {('→ '+text_preview) if text_preview else ''}")
    if depth < max_depth:
        for child in el.find_all(recursive=False):
            if child.name:
                walk(child, depth + 1, max_depth)

# Walk site-wrapper
wrapper = body.find(class_="site-wrapper")
if wrapper:
    walk(wrapper, 0, 3)
