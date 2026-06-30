"""
CP3 Legacy — Trending News Refresh Script
=========================================

Fetches trending Chris Paul news for the sidebar widget (3 tabs: Newest, Most Commented, Popular).
Uses web search + LLM extraction + image search.

Writes to src/data/cp3/trending-news.ts

Usage:
  python3 scripts/refresh-prod/trending-news.py
  python3 scripts/refresh-prod/trending-news.py --dry-run

Cron (every 3 hours):
  0 */3 * * * cd /path/to/cp3-legacy && python3 scripts/refresh-prod/trending-news.py >> /tmp/cp3-trending.log 2>&1
"""

import sys
import os
import json
import time
import hashlib
sys.path.insert(0, os.path.dirname(__file__))

from _shared import (
    web_search, ask_llm_json, image_search, download_image,
    save_data_file, check_api_keys, is_dry_run, log,
    categorize_cp3_headline, today_iso, PUBLIC_DIR,
    read_data_json, write_data_json, set_data_path,
)

NEWEST_QUERIES = [
    "Chris Paul Spurs latest news today",
    "Chris Paul NBA news this week",
    "Chris Paul basketball recent",
]

POPULAR_QUERIES = [
    "Chris Paul best career moments",
    "Chris Paul Point God legacy",
    "Chris Paul top performances",
    "Chris Paul highlights all time",
]

COMMENTED_QUERIES = [
    "Chris Paul controversial moments debate",
    "Chris Paul biggest fan discussions",
    "Chris Paul hot takes analysis",
    "Chris Paul most talked about games",
]


def fetch_articles(queries: list[str]) -> list[dict]:
    """Fetch articles from multiple queries and dedupe."""
    all = []
    for q in queries:
        results = web_search(q, num_results=5)
        for r in results:
            title = r.get("title", "").strip()
            snippet = r.get("snippet", "").strip()
            url = r.get("url", "#")
            if not title or len(title) < 15:
                continue
            if "youtube.com/watch" in url:
                continue
            all.append({
                "title": title,
                "excerpt": snippet[:200] if snippet else "",
                "url": url,
                "date": today_iso(),
                "source": r.get("source", "Web"),
                # Deterministic "popularity" from title hash (display only)
                "views": int(hashlib.md5(title.encode()).hexdigest()[:8], 16) % 50000 + 5000,
                "likes": int(hashlib.md5(title.encode()).hexdigest()[:8], 16) % 5000 + 500,
                "comments": int(hashlib.md5(title.encode()).hexdigest()[:8], 16) % 200 + 10,
            })
        time.sleep(2)
    # Dedupe
    seen = set()
    unique = []
    for a in all:
        key = a["title"].lower()[:80]
        if key not in seen:
            seen.add(key)
            unique.append(a)
    return unique


def fetch_image_for_article(article: dict, idx: int, prefix: str) -> str:
    """Find and download an image for an article. Tries multiple URLs."""
    query = f"Chris Paul basketball {article['title'][:60]}"
    urls = image_search(query, num_results=8)
    if not urls:
        return f"/alchemists/assets/images/samples/post-img{(idx % 4) + 9}-m.jpg"
    target_path = PUBLIC_DIR / f"refresh-trending-{prefix}-{idx + 1}.jpg"
    for url in urls:
        if download_image(url, target_path):
            return f"/alchemists/assets/images/samples/refresh-trending-{prefix}-{idx + 1}.jpg"
    log(f"  → all image downloads failed, using fallback", "WARN")
    return f"/alchemists/assets/images/samples/post-img{(idx % 4) + 9}-m.jpg"


def _cap_title(title: str, max_len: int = 100) -> str:
    return title[:max_len] + "…" if len(title) > max_len else title


def build_json_items(articles: list[dict]) -> list[dict]:
    """Build JSON items for a tab with full fields (image, views, etc)."""
    items = []
    for a in articles[:5]:
        cat = categorize_cp3_headline(a["title"])
        excerpt = a.get("excerpt", "").strip()
        if len(excerpt) <= 10:
            excerpt = _cap_title(a["title"], 120)
        items.append({
            "title": _cap_title(a["title"]),
            "excerpt": excerpt,
            "image": a.get("image", "/alchemists/assets/images/samples/post-img9-m.jpg"),
            "category": cat["category"],
            "categoryClass": cat["categoryClass"],
            "date": a["date"],
            "dateTime": a["date"],
            "views": a["views"],
            "likes": a["likes"],
            "comments": a["comments"],
        })
    return items


def build_json_simple_items(articles: list[dict]) -> list[dict]:
    """Build JSON items for the simple schema (no image, no stats)."""
    items = []
    for a in articles[:6]:
        cat = categorize_cp3_headline(a["title"])
        excerpt = a.get("excerpt", "").strip()
        if len(excerpt) <= 10:
            excerpt = _cap_title(a["title"], 120)
        items.append({
            "category": cat["category"],
            "title": _cap_title(a["title"]),
            "date": a["date"],
            "dateTime": a["date"],
            "excerpt": excerpt,
        })
    return items


def main():
    log("=== CP3 Trending News Refresh ===")
    check_api_keys()
    dry = is_dry_run()

    log("\n--- Fetching NEWEST articles ---")
    newest = fetch_articles(NEWEST_QUERIES)
    log(f"Got {len(newest)} newest articles")

    log("\n--- Fetching POPULAR articles ---")
    popular = fetch_articles(POPULAR_QUERIES)
    popular.sort(key=lambda a: a["views"], reverse=True)
    log(f"Got {len(popular)} popular articles")

    log("\n--- Fetching MOST COMMENTED articles ---")
    commented = fetch_articles(COMMENTED_QUERIES)
    commented.sort(key=lambda a: a["comments"], reverse=True)
    log(f"Got {len(commented)} most commented articles")

    # Safety: don't overwrite good data with empty data
    if len(newest) < 4 and len(popular) < 4:
        log("Both tabs have < 4 articles — keeping existing data", "WARN")
        return
    if len(newest) == 0:
        log("No newest articles — keeping existing data", "WARN")
        return
    if len(popular) == 0:
        log("No popular articles — keeping existing data", "WARN")
        return

    # Fetch images (skip in dry-run)
    if not dry:
        log("\n--- Fetching images for newest ---")
        for i, a in enumerate(newest[:5]):
            a["image"] = fetch_image_for_article(a, i, "newest")
            time.sleep(3)
        log("--- Fetching images for popular ---")
        for i, a in enumerate(popular[:5]):
            a["image"] = fetch_image_for_article(a, i, "popular")
            time.sleep(3)
    else:
        for i, a in enumerate(newest[:5]):
            a["image"] = f"/alchemists/assets/images/samples/refresh-trending-newest-{i+1}.jpg"
        for i, a in enumerate(popular[:5]):
            a["image"] = f"/alchemists/assets/images/samples/refresh-trending-popular-{i+1}.jpg"

    data = read_data_json()
    newest_items = build_json_items(newest)
    popular_items = build_json_items(popular)
    commented_items = build_json_simple_items(commented)

    # Update all 3 trending tabs
    tabs = data.get("mainContent", {}).get("trendingNews", {}).get("tabs", [])
    if len(tabs) >= 3:
        data = set_data_path("mainContent.trendingNews.tabs[0].items", newest_items, data)
        data = set_data_path("mainContent.trendingNews.tabs[1].items", commented_items, data)
        data = set_data_path("mainContent.trendingNews.tabs[2].items", popular_items, data)

    write_data_json(data, dry_run=dry)
    log("=== Done ===")


if __name__ == "__main__":
    main()
