"""
CP3 Legacy — DuckDuckGo Image Search (replaces retired Bing Image Search)
=========================================================================

As of August 2025, Bing Search API v7 was retired by Microsoft.
This module uses DuckDuckGo's unofficial image search endpoint instead.

Pros:
  - Free, no API key
  - Works from any IP
  - Finds real CP3 photos

Cons:
  - Unofficial endpoint (could change)
  - May rate-limit if abused
  - No aspect ratio filter

Endpoint:
  https://duckduckgo.com/i.js?q={query}&o=json
  (returns JSON with image results)

Fallback: if DuckDuckGo fails, reuse existing images from the public folder.
"""

import json
import re
import urllib.request
import urllib.parse
import os
from pathlib import Path


def image_search_ddg(query: str, num_results: int = 5) -> list[str]:
    """
    Search DuckDuckGo Images for a query.
    Returns list of image URLs (direct links to image files).

    Uses the unofficial i.js endpoint which returns JSON.
    """
    # DuckDuckGo requires a "vqd" token to access image results.
    # Step 1: get the token from the search page
    search_url = "https://duckduckgo.com/"
    params = {"q": query}
    full_search_url = search_url + "?" + urllib.parse.urlencode(params)

    req = urllib.request.Request(full_search_url, headers={
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    })
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode("utf-8", errors="replace")
    except Exception:
        return []

    # Extract vqd token from the HTML
    # It appears as: vqd="4-1234567890-abc..."
    vqd_match = re.search(r'vqd=["\']([^"\']+)["\']', html)
    if not vqd_match:
        # Try alternate format
        vqd_match = re.search(r'vqd=([A-Za-z0-9\-_]+)', html)
    if not vqd_match:
        return []
    vqd = vqd_match.group(1)

    # Step 2: fetch the image results JSON
    image_url = "https://duckduckgo.com/i.js"
    image_params = {
        "q": query,
        "vqd": vqd,
        "l": "us-en",
        "o": "json",
        "f": ",,,,,",
        "p": "1",  # safe search: 1=moderate, -1=off
    }
    full_image_url = image_url + "?" + urllib.parse.urlencode(image_params)

    req = urllib.request.Request(full_image_url, headers={
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://duckduckgo.com/",
        "Accept": "application/json, text/javascript, */*",
    })
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8", errors="replace"))
    except Exception:
        return []

    # Parse results — DuckDuckGo returns {results: [{image: "...", ...}, ...]}
    urls = []
    for result in data.get("results", [])[:num_results]:
        img_url = result.get("image") or result.get("thumbnail")
        if img_url and img_url.startswith("http"):
            urls.append(img_url)
    return urls


def image_search_fallback(query: str, num_results: int, existing_images: list[str]) -> list[str]:
    """
    Fallback: if DuckDuckGo fails, return existing images from the public folder.
    Picks images based on keywords in the query.
    """
    if not existing_images:
        return []
    # Simple keyword matching — if query mentions "spurs", prefer spurs logo, etc.
    q = query.lower()
    if "logo" in q or "shield" in q:
        return [u for u in existing_images if "logo" in u or "shield" in u][:num_results]
    if "avatar" in q or "headshot" in q or "journalist" in q:
        return [u for u in existing_images if "avatar" in u][:num_results]
    # Default: return the first few existing images
    return existing_images[:num_results]


if __name__ == "__main__":
    # Quick test
    print("Testing DuckDuckGo image search...")
    urls = image_search_ddg("Chris Paul basketball action", 3)
    print(f"Found {len(urls)} images:")
    for u in urls:
        print(f"  {u}")
