"""
CP3 Legacy — Featured News Refresh Script
=========================================

Fetches recent Chris Paul news articles and images, then writes 4 data files:
  1. src/data/cp3/featured-news.ts      (6 articles for main column)
  2. src/data/cp3/carousel.ts           (14 items for top carousel)
  3. src/data/cp3/post-grid-cards.ts    (12 cards across 3 rows)
  4. src/data/cp3/latest-news.ts        (4 cards for Latest News section)

For each article:
  - Web search finds the headline + snippet
  - Image search finds a relevant CP3 photo
  - LLM writes a clean title + excerpt

Usage:
  python3 scripts/refresh-prod/featured-news.py
  python3 scripts/refresh-prod/featured-news.py --dry-run

Cron (hourly):
  0 * * * * cd /path/to/cp3-legacy && python3 scripts/refresh-prod/featured-news.py >> /tmp/cp3-featured.log 2>&1
"""

import sys
import os
import json
import re
sys.path.insert(0, os.path.dirname(__file__))

from _shared import (
    web_search, ask_llm_json, image_search, download_image,
    save_data_file, check_api_keys, is_dry_run, log,
    categorize_cp3_headline, today_iso, pretty_date, PUBLIC_DIR,
    read_data_json, write_data_json, set_data_path,
)

QUERIES = [
    "Chris Paul Spurs latest news",
    "Chris Paul NBA highlights recent",
    "Chris Paul Wembanyama Spurs chemistry",
    "Chris Paul career stats milestones",
    "Chris Paul playoff performance recent",
    "Chris Paul injury update",
    "Chris Paul basketball news today",
    "Chris Paul Point God legacy",
]


def fetch_articles() -> list[dict]:
    """Fetch article seeds from multiple web searches."""
    all_articles = []
    for q in QUERIES:
        results = web_search(q, num_results=5)
        for r in results:
            title = r.get("title", "").strip()
            snippet = r.get("snippet", "").strip()
            url = r.get("url", "#")
            if not title or len(title) < 15:
                continue
            if "youtube.com/watch" in url:
                continue
            all_articles.append({
                "title": title,
                "excerpt": snippet[:200] if snippet else "",
                "url": url,
                "date": today_iso(),  # fallback; LLM may improve
                "source": "Web",
            })
        # Polite pause between searches
        import time
        time.sleep(2)

    # Dedupe by title
    seen = set()
    unique = []
    for a in all_articles:
        key = a["title"].lower()[:80]
        if key not in seen:
            seen.add(key)
            unique.append(a)
    return unique


def refine_with_llm(articles: list[dict]) -> list[dict]:
    """Ask LLM to clean up titles and write better excerpts."""
    if not articles:
        return []
    # Send first 20 articles to LLM for refinement
    sample = articles[:20]
    context = json.dumps(sample, indent=2)

    prompt = f"""You are a sports news editor. Here are {len(sample)} raw web search results about Chris Paul:

{context}

For each article, write:
1. A clean, professional headline (capitalize properly, max 80 chars)
2. A 1-2 sentence excerpt (max 200 chars) based on the snippet

Return a JSON array with the SAME number of items, each with:
{{
  "title": "clean headline",
  "excerpt": "1-2 sentence excerpt",
  "date": "YYYY-MM-DD (use today {today_iso()} if unknown)",
  "category_hint": "the team | playoffs | injuries (based on content)"
}}

Return ONLY the JSON array."""

    refined = ask_llm_json(prompt, max_tokens=3000)
    if not isinstance(refined, list):
        log("LLM didn't return a list — using raw articles", "WARN")
        return articles

    # Merge refined data back with original URLs
    result = []
    for i, orig in enumerate(articles):
        if i < len(refined):
            r = refined[i]
            merged = {
                "title": r.get("title", orig["title"]),
                "excerpt": r.get("excerpt", orig["excerpt"]),
                "url": orig["url"],
                "date": r.get("date", orig["date"]),
                "source": orig["source"],
                "category_hint": r.get("category_hint", "the team"),
            }
        else:
            merged = {**orig, "category_hint": "the team"}
        result.append(merged)
    return result


def fetch_image_for_article(article: dict, idx: int) -> str:
    """Find and download an image for an article. Tries multiple URLs."""
    query = f"Chris Paul basketball {article['title'][:60]}"
    urls = image_search(query, num_results=8)
    if not urls:
        return f"/alchemists/assets/images/samples/post-img{(idx % 7) + 1}.jpg"
    target_path = PUBLIC_DIR / f"refresh-featured-{idx + 1}.jpg"
    for url in urls:
        if download_image(url, target_path):
            return f"/alchemists/assets/images/samples/refresh-featured-{idx + 1}.jpg"
    log(f"  → all image downloads failed, using fallback", "WARN")
    return f"/alchemists/assets/images/samples/post-img{(idx % 7) + 1}.jpg"


def _cap_title(title: str, max_len: int = 100) -> str:
    return title[:max_len] + "…" if len(title) > max_len else title


def _cap_words(text: str, max_words: int = 10) -> str:
    words = text.split()
    if len(words) <= max_words:
        return text
    return " ".join(words[:max_words]) + "…"


def _excerpt_fallback(excerpt: str, title: str) -> str:
    if excerpt and len(excerpt.strip()) > 10:
        return excerpt.strip()
    return _cap_title(title, 120)


def build_json_article(a: dict) -> dict:
    """Convert a single article dict to JSON format."""
    cat = categorize_cp3_headline(a["title"])
    return {
        "image": a.get("image", "/alchemists/assets/images/samples/post-img1.jpg"),
        "title": _cap_words(a["title"]),
        "excerpt": _excerpt_fallback(a["excerpt"], a["title"]),
        "category": cat["category"],
        "categoryClass": cat["categoryClass"],
        "date": a["date"],
        "dateTime": a["date"],
        "author": {"name": "Victor Makuo", "avatar": "/alchemists/assets/images/samples/avatar-1.jpg"},
        "views": hash(a["title"]) % 30000 + 5000,
        "comments": hash(a["title"]) % 100 + 10,
        "likes": hash(a["title"]) % 3000 + 500,
    }


def main():
    log("=== CP3 Featured News Refresh ===")
    check_api_keys()
    dry = is_dry_run()

    # Step 1: fetch articles
    articles = fetch_articles()
    log(f"Fetched {len(articles)} unique articles")
    if len(articles) < 6:
        log("Not enough articles (< 6) — keeping existing data", "WARN")
        return

    # Step 2: refine with LLM
    articles = refine_with_llm(articles)
    log(f"Refined to {len(articles)} articles")

    # Step 3: fetch images (skip in dry-run)
    if not dry:
        import time
        for i, a in enumerate(articles[:14]):
            a["image"] = fetch_image_for_article(a, i)
            time.sleep(3)
        for a in articles[14:]:
            a["image"] = "/alchemists/assets/images/samples/post-img1.jpg"
    else:
        for i, a in enumerate(articles):
            a["image"] = f"/alchemists/assets/images/samples/refresh-featured-{i+1}.jpg"

    # Step 4: build JSON for each section
    carousel_slides = []
    for i, a in enumerate(articles[:14]):
        cat = categorize_cp3_headline(a["title"])
        carousel_slides.append({
            "id": f"slide-{i+1}",
            "image": a.get("image", "/alchemists/assets/images/samples/post-slide1.jpg"),
            "category": cat["category"],
            "title": _cap_words(a["title"]),
            "date": a["date"],
            "dateTime": a["date"],
            "views": hash(a["title"]) % 50000 + 10000,
            "likes": hash(a["title"]) % 5000 + 1000,
            "comments": hash(a["title"]) % 200 + 20,
        })
    # Pad carousel to 14
    while len(carousel_slides) < 14:
        carousel_slides.append(carousel_slides[len(carousel_slides) % len(carousel_slides)])

    featured_slides = []
    for i, a in enumerate(articles[:6]):
        cat = categorize_cp3_headline(a["title"])
        featured_slides.append({
            "image": a.get("image", "/alchemists/assets/images/samples/post-slide1.jpg"),
            "category": cat["category"],
            "categoryClass": cat["categoryClass"],
            "title": _cap_words(a["title"]),
            "excerpt": _excerpt_fallback(a["excerpt"], a["title"]),
            "author": {"name": "Victor Makuo", "avatar": "/alchemists/assets/images/samples/avatar-1.jpg"},
            "date": a["date"],
            "dateTime": a["date"],
        })

    # Post cards: row1 (2 cards), row3 (4 cards)
    card_items = []
    for a in articles[:12]:
        card_items.append(build_json_article(a))
    row1 = card_items[:2]
    row2_card = build_json_article(articles[2]) if len(articles) > 2 else card_items[0]
    row2_card["image"] = articles[2].get("image", "/alchemists/assets/images/samples/post-img4.jpg")
    row3 = card_items[8:12] if len(card_items) >= 12 else card_items[:4]

    # row2.simpleList (3 items)
    simple_items = []
    for a in articles[3:6]:
        cat = categorize_cp3_headline(a["title"])
        simple_items.append({
            "title": _cap_title(a["title"]),
            "excerpt": _excerpt_fallback(a["excerpt"], a["title"]),
            "category": cat["category"],
            "date": a["date"],
            "dateTime": a["date"],
        })

    # mainBanner
    banner_article = articles[6] if len(articles) > 6 else articles[0]
    cat = categorize_cp3_headline(banner_article["title"])
    main_banner = {
        "image": banner_article.get("image", "/alchemists/assets/images/samples/post-img1.jpg"),
        "category": cat["category"],
        "title": _cap_words(banner_article["title"]),
        "titleHighlight": "",
        "titleEnd": "",
        "excerpt": _excerpt_fallback(banner_article["excerpt"], banner_article["title"]),
        "date": banner_article["date"],
        "dateTime": banner_article["date"],
        "button": {"text": "Read More", "url": "/alchemists/index.html#"},
    }

    # Latest news (4 items)
    latest_items = []
    for a in articles[:4]:
        cat = categorize_cp3_headline(a["title"])
        latest_items.append({
            "image": a.get("image", "/alchemists/assets/images/samples/post-img9-m.jpg"),
            "category": cat["category"],
            "title": _cap_title(a["title"]),
            "excerpt": _excerpt_fallback(a["excerpt"], a["title"]),
            "date": a["date"],
            "dateTime": a["date"],
            "author": {"name": "Victor Makuo", "avatar": "/alchemists/assets/images/samples/avatar-1.jpg"},
            "views": hash(a["title"]) % 50000 + 10000,
            "likes": hash(a["title"]) % 5000 + 1000,
            "comments": hash(a["title"]) % 200 + 50,
        })

    # PushyPanel posts (2 sidebar items)
    pushy_posts = []
    for i, a in enumerate(articles[:2]):
        cat = categorize_cp3_headline(a["title"])
        pushy_posts.append({
            "category": cat["category"],
            "title": _cap_words(a["title"]),
            "date": a["date"],
            "excerpt": _excerpt_fallback(a["excerpt"], a["title"]),
            "author": {"name": "Victor Makuo", "avatar": "/alchemists/assets/images/samples/avatar-1.jpg"},
            "likes": hash(a["title"]) % 3000 + 500,
            "comments": hash(a["title"]) % 100 + 10,
        })

    # Step 5: write to data.json
    data = read_data_json()
    data = set_data_path("pushyPanel.posts", pushy_posts, data)
    data = set_data_path("featuredCarousel.slides", carousel_slides, data)
    data = set_data_path("mainContent.featuredNews.slides", featured_slides, data)
    data = set_data_path("mainContent.postCards.row1", row1, data)
    data = set_data_path("mainContent.postCards.row2.card", row2_card, data)
    data = set_data_path("mainContent.postCards.row2.simpleList", simple_items, data)
    data = set_data_path("mainContent.postCards.mainBanner", main_banner, data)
    data = set_data_path("mainContent.postCards.row3", row3, data)
    data = set_data_path("mainContent.latestNews.items", latest_items, data)
    write_data_json(data, dry_run=dry)
    log("=== Done ===")


if __name__ == "__main__":
    main()
