"""
Convert the Alchemists MHTML body HTML into proper TSX.

Output:
  - /home/z/my-project/src/components/alchemists/Header.tsx
  - /home/z/my-project/src/components/alchemists/HeroUnit.tsx
  - /home/z/my-project/src/components/alchemists/FeaturedCarousel.tsx
  - /home/z/my-project/src/components/alchemists/MainContent.tsx
  - /home/z/my-project/src/components/alchemists/Footer.tsx
  - /home/z/my-project/src/components/alchemists/Modals.tsx
  - /home/z/my-project/src/components/alchemists/PushyPanel.tsx
  - /home/z/my-project/src/components/alchemists/MobileHeader.tsx

Each component receives no props (data is inline, same as the original MHTML).
Component is a plain function returning JSX, wrapped in 'use client' where needed.
"""

import re
from bs4 import BeautifulSoup, NavigableString, Comment, Doctype
from pathlib import Path

SRC = "/home/z/my-project/extracted_mhtml/alchemists.dan-fisher.dev/basketball-dark/index.html"
OUT_DIR = Path("/home/z/my-project/src/components/alchemists")
OUT_DIR.mkdir(parents=True, exist_ok=True)

html = Path(SRC).read_text(encoding="utf-8")
soup = BeautifulSoup(html, "html.parser")
body = soup.body

# Strip all <script> tags
for s in body.find_all("script"):
    s.decompose()

# --- Identify major section boundaries ---
# Based on parse_structure.py output, the site-wrapper has these direct children:
#   1. site-overlay
#   2. header-mobile
#   3. header (header--layout-1)
#   4. pushy-panel (aside)
#   5. hero-unit
#   6. posts posts--carousel-featured (featured-carousel)
#   7. site-content
#   8. footer
#   9. modal-login-register
# We'll group these into 7 component files:
#   - MobileHeader.tsx  (header-mobile + site-overlay)
#   - Header.tsx        (header--layout-1)
#   - PushyPanel.tsx    (pushy-panel)
#   - HeroUnit.tsx      (hero-unit)
#   - FeaturedCarousel.tsx (posts--carousel-featured)
#   - MainContent.tsx   (site-content)
#   - Footer.tsx        (footer)
#   - Modals.tsx        (modal-login-register + misc hidden modals)

# Find direct children of site-wrapper
wrapper = body.find(class_="site-wrapper")
direct_children = [c for c in wrapper.children if c.name and not isinstance(c, Comment)]

# Map each direct child to a component
# We'll find them by class/id
def find_child(predicate):
    for c in direct_children:
        if predicate(c):
            return c
    return None

sections = {
    "site-overlay": find_child(lambda c: "site-overlay" in c.get("class", [])),
    "header-mobile": find_child(lambda c: "header-mobile" in c.get("class", []) or c.get("id") == "header-mobile"),
    "header": find_child(lambda c: c.name == "header" and "header--layout-1" in c.get("class", [])),
    "pushy-panel": find_child(lambda c: c.name == "aside" and "pushy-panel" in c.get("class", [])),
    "hero-unit": find_child(lambda c: "hero-unit" in c.get("class", [])),
    "featured-carousel": find_child(lambda c: "featured-carousel" in c.get("class", [])),
    "site-content": find_child(lambda c: "site-content" in c.get("class", [])),
    "footer": find_child(lambda c: c.name == "footer" and c.get("id") == "footer"),
    "modal-login-register": find_child(lambda c: c.get("id") == "modal-login-register"),
}

# Print found sections
for name, el in sections.items():
    print(f"{name}: {'FOUND' if el else 'NOT FOUND'}")

# Also catch any children we didn't classify
classified = set(sections.values())
unclassified = [c for c in direct_children if c not in classified and c.name]
if unclassified:
    print(f"\nUnclassified children:")
    for c in unclassified:
        print(f"  <{c.name}> id='{c.get('id')}' class='{' '.join(c.get('class', []))[:60]}'")

# --- HTML → TSX converter ---
# React attribute name mapping (HTML attrs that need renaming in JSX)
REACT_ATTR_MAP = {
    "class": "className",
    "for": "htmlFor",
    "tabindex": "tabIndex",
    "readonly": "readOnly",
    "maxlength": "maxLength",
    "minlength": "minLength",
    "colspan": "colSpan",
    "rowspan": "rowSpan",
    "cellpadding": "cellPadding",
    "cellspacing": "cellSpacing",
    "usemap": "useMap",
    "frameborder": "frameBorder",
    "srcset": "srcSet",
    "sizes": "sizes",
    "crossorigin": "crossOrigin",
    "autocomplete": "autoComplete",
    "autofocus": "autoFocus",
    "autoplay": "autoPlay",
    "enctype": "encType",
    "novalidate": "noValidate",
    "datetime": "dateTime",
    "contenteditable": "contentEditable",
    "contextmenu": "contextMenu",
    "spellcheck": "spellCheck",
    "srcdoc": "srcDoc",
    "ismap": "isMap",
    "inputmode": "inputMode",
    "maxlength": "maxLength",
    "accesskey": "accessKey",
}

# Boolean attributes (rendered without =true in JSX)
BOOLEAN_ATTRS = {
    "disabled", "checked", "selected", "readonly", "multiple", "required",
    "autofocus", "autoplay", "controls", "loop", "muted", "hidden",
    "open", "reversed", "async", "defer", "novalidate", "formnovalidate",
    "ismap", "default", "itemscope",
}

# Self-closing tags in HTML5 (that don't need explicit closing in JSX either)
VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input",
             "link", "meta", "param", "source", "track", "wbr"}

# SVG tags — keep self-closing form
SVG_TAGS = {"svg", "path", "circle", "rect", "line", "polyline", "polygon",
            "ellipse", "g", "defs", "use", "symbol", "linearGradient",
            "radialGradient", "stop", "text", "tspan"}

# Inline elements — text/element siblings need whitespace preserved between them
INLINE_TAGS = {
    "a", "abbr", "b", "bdi", "bdo", "br", "cite", "code", "data",
    "dfn", "em", "i", "kbd", "mark", "q", "rp", "rt", "ruby", "s",
    "samp", "small", "span", "strong", "sub", "sup", "time", "u",
    "var", "wbr", "img", "label", "select", "textarea", "button",
    "input", "svg", "use", "path", "icon", "i",
}

# Escape special characters in text content
def escape_text(text):
    # In JSX text, we need to escape { } < > ' "
    # But < > are already handled by HTML structure (text only contains entities)
    # We need to handle: { }  (used for JSX expressions)
    text = text.replace("{", "&#123;").replace("}", "&#125;")
    return text

# Escape attribute values
def escape_attr(value):
    # In JSX attribute strings, escape " and \
    value = value.replace("\\", "\\\\").replace('"', '\\"')
    return value

# Rewrite asset URLs to Next.js public path
def rewrite_url(url):
    if not url:
        return url
    # Strip query strings for matching (we'll preserve them)
    url = url.replace(
        "https://alchemists.dan-fisher.dev/basketball-dark/",
        "/alchemists/",
    )
    # Fix relative 'assets/images/icons-basket.svg' -> '/alchemists/assets/images/icons-basket.svg'
    if url.startswith("assets/"):
        url = "/alchemists/" + url
    return url

# Convert a single attribute
def convert_attr(name, value):
    # React attribute renaming
    new_name = REACT_ATTR_MAP.get(name.lower(), name)
    # Strip namespace prefixes that JSX doesn't like (xlink:href → xlinkHref)
    if ":" in new_name:
        # Convert namespace:name to namespaceName
        parts = new_name.split(":")
        new_name = parts[0] + parts[1][0].upper() + parts[1][1:]
    # Rewrite URL attributes
    if new_name in ("src", "href", "srcSet", "xlinkHref", "poster", "data"):
        value = rewrite_url(value)
    # Boolean attributes
    if name.lower() in BOOLEAN_ATTRS and (value == "" or value == name.lower()):
        return new_name
    # Style attribute — convert "k:v; k2:v2;" to React style object
    if new_name == "style":
        return f'style={{{style_to_object(value)}}}'
    # Regular string attribute
    return f'{new_name}="{escape_attr(value)}"'

# Convert CSS style string to React style object literal
def style_to_object(style_str):
    if not style_str:
        return "{}"
    pairs = []
    for decl in style_str.split(";"):
        decl = decl.strip()
        if not decl:
            continue
        if ":" not in decl:
            continue
        k, v = decl.split(":", 1)
        k = k.strip()
        v = v.strip().strip('"').strip("'")
        # Convert kebab-case to camelCase
        k_camel = re.sub(r"-([a-z])", lambda m: m.group(1).upper(), k)
        # Escape any double quotes in value
        v_escaped = v.replace('"', '\\"')
        pairs.append(f'"{k_camel}": "{v_escaped}"')
    return "{" + ", ".join(pairs) + "}"

# Render a single node (element or text) as TSX
def render_node(node, indent=0, prev_sibling=None, next_sibling=None):
    pad = "  " * indent
    if isinstance(node, NavigableString):
        if isinstance(node, Comment):
            # Drop HTML comments to keep JSX clean
            return ""
        if isinstance(node, Doctype):
            return ""
        text = str(node)
        # Collapse newlines into spaces, but preserve leading/trailing whitespace
        # as a single space if there was any (significant whitespace).
        text = text.replace("\r", "")
        # Collapse multiple whitespace into a single space
        import re as _re
        text = _re.sub(r"\s+", " ", text)
        # If the text is all whitespace, we still need to preserve a single
        # space if it sits between two inline elements (so JSX doesn't merge
        # their text). We use {" "} expression which is the standard JSX idiom.
        if not text.strip():
            # Whitespace-only — emit {" "} only if it's between two inline elements
            prev_is_inline = prev_sibling is not None and prev_sibling.name in INLINE_TAGS
            next_is_inline = next_sibling is not None and next_sibling.name in INLINE_TAGS
            if prev_is_inline and next_is_inline:
                return pad + '{" "}\n'
            return ""
        # Non-empty text — preserve leading/trailing single space if present
        # by using {" "} before/after the text content
        has_leading_space = text.startswith(" ")
        has_trailing_space = text.endswith(" ") and text.strip()
        stripped = text.strip()
        result = ""
        if has_leading_space:
            # Check if previous sibling is an inline element
            if prev_sibling is not None and prev_sibling.name in INLINE_TAGS:
                result += pad + '{" "}\n'
        result += pad + escape_text(stripped) + "\n"
        if has_trailing_space:
            if next_sibling is not None and next_sibling.name in INLINE_TAGS:
                result += pad + '{" "}\n'
        return result
    if not node.name:
        return ""

    tag = node.name.lower()
    is_svg = tag in SVG_TAGS
    attrs = []
    for k, v in node.attrs.items():
        # Skip data-* attributes that are React-internal noise?
        # Keep them all — they're used by the theme CSS selectors
        if k.startswith("data-"):
            # data-* attrs are fine in JSX
            attrs.append(convert_attr(k, v if isinstance(v, str) else " ".join(v)))
        elif isinstance(v, list):
            attrs.append(convert_attr(k, " ".join(v)))
        else:
            attrs.append(convert_attr(k, v))
    attr_str = " " + " ".join(attrs) if attrs else ""

    # Handle void / self-closing tags
    if tag in VOID_TAGS or is_svg and not node.contents:
        return f"{pad}<{tag}{attr_str} />\n"

    # Recurse into children
    children_tsx = ""
    has_block_children = False
    child_output = []
    # Build a list of (child, prev, next) tuples for sibling-aware rendering
    child_list = [c for c in node.children]
    for i, child in enumerate(child_list):
        # Find previous element sibling (skip text nodes that are pure whitespace)
        prev_sib = None
        for j in range(i - 1, -1, -1):
            prev_sib = child_list[j]
            break
        next_sib = None
        for j in range(i + 1, len(child_list)):
            next_sib = child_list[j]
            break
        out = render_node(child, indent + 1, prev_sibling=prev_sib, next_sibling=next_sib)
        if out:
            child_output.append(out)
            if "\n" in out:
                has_block_children = True

    if not child_output:
        # Empty element
        if is_svg or tag in ("img", "input", "br", "hr", "link", "meta"):
            return f"{pad}<{tag}{attr_str} />\n"
        return f"{pad}<{tag}{attr_str}></{tag}>\n"

    if has_block_children:
        children_tsx = "\n" + "".join(child_output)
        return f"{pad}<{tag}{attr_str}>{children_tsx}{pad}</{tag}>\n"
    else:
        # Inline content
        content = " ".join(line.strip() for line in child_output).strip()
        return f"{pad}<{tag}{attr_str}>{content}</{tag}>\n"

# Render an element AS the wrapper itself (preserving its tag & attributes)
def render_element(el):
    return render_node(el, 0)

# --- Generate component files ---
def make_component(component_name, element, fragment=True):
    """Generate a .tsx file for the given component wrapping the given element."""
    tsx_body = render_element(element).rstrip()
    # Indent the entire body by 6 spaces so it nests cleanly inside the return ( )
    indented = "\n".join(("      " + line) if line else line for line in tsx_body.split("\n"))
    body = f"""import React from "react";

export function {component_name}() {{
  return (
{indented}
  );
}}
"""
    return body

# Generate each component
components = {
    "MobileHeader": sections.get("site-overlay") if sections.get("site-overlay") else sections.get("header-mobile"),
    "Header": sections.get("header"),
    "PushyPanel": sections.get("pushy-panel"),
    "HeroUnit": sections.get("hero-unit"),
    "FeaturedCarousel": sections.get("featured-carousel"),
    "MainContent": sections.get("site-content"),
    "Footer": sections.get("footer"),
    "Modals": sections.get("modal-login-register"),
}

# MobileHeader actually needs both site-overlay and header-mobile
# Let's regenerate that one specially
for name, el in components.items():
    if el is None:
        print(f"  SKIP {name} (no element)")
        continue
    print(f"\nGenerating {name}.tsx (source: <{el.name}> class='{' '.join(el.get('class', []))[:50]}')")
    tsx = make_component(name, el)
    out_path = OUT_DIR / f"{name}.tsx"
    out_path.write_text(tsx, encoding="utf-8")
    print(f"  Wrote {out_path}  ({len(tsx)} bytes)")

# Special: MobileHeader combines site-overlay + header-mobile
overlay = sections.get("site-overlay")
mobile = sections.get("header-mobile")
if overlay and mobile:
    overlay_tsx = render_element(overlay).rstrip()
    mobile_tsx = render_element(mobile).rstrip()
    # Indent both by 6 spaces
    overlay_indented = "\n".join(("      " + line) if line else line for line in overlay_tsx.split("\n"))
    mobile_indented = "\n".join(("      " + line) if line else line for line in mobile_tsx.split("\n"))
    tsx = f"""import React from "react";

export function MobileHeader() {{
  return (
    <>
{overlay_indented}
{mobile_indented}
    </>
  );
}}
"""
    out_path = OUT_DIR / "MobileHeader.tsx"
    out_path.write_text(tsx, encoding="utf-8")
    print(f"\n  Regenerated MobileHeader.tsx (combines site-overlay + header-mobile)  ({len(tsx)} bytes)")
