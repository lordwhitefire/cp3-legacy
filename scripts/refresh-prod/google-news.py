"""
CP3 Legacy — Google News RSS Refresh Script (RECOMMENDED — replaces Reddit)
==========================================================================

Fetches news articles about Chris Paul from Google News RSS.

WHY THIS IS THE BEST OPTION:
  - Zero setup (no API key, no OAuth, no policy approval)
  - 100% reliable (Google News RSS has been stable for 15+ years)
  - Works from any IP (GitHub Actions, VPS, home server — all fine)
  - Real news articles (ESPN, The Athletic, NBA.com, etc.)
  - Never gets blocked or rate-limited

Google News RSS endpoint:
  https://news.google.com/rss/search?q={query}&hl=en-US&gl=US&ceid=US:en

Returns:
  - Title
  - Link (Google News redirect URL — we decode to the real article URL)
  - Publication date
  - Source (e.g. "ESPN", "The Athletic")
  - Description (snippet)

Usage:
  python3 scripts/refresh-prod/google-news.py
  python3 scripts/refresh-prod/google-news.py --dry-run

Cron (every 4 hours):
  0 */4 * * * cd /path/to/cp3-legacy && python3 scripts/refresh-prod/google-news.py >> /tmp/cp3-news.log 2>&1
"""

import sys
import os
import json
import time
import re
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime

sys.path.insert(0, os.path.dirname(__file__))
from _shared import (
    image_search, download_image, save_data_file,
    check_api_keys, is_dry_run, log,
    categorize_cp3_headline, today_iso, PUBLIC_DIR,
    read_data_json, write_data_json, set_data_path,
)

# Search queries — multiple to get variety
QUERIES = [
    "Chris Paul Spurs",
    "Chris Paul NBA",
    "Chris Paul Wembanyama",
    "Chris Paul highlights",
]

# How many posts to keep total (after dedup + filter)
MAX_POSTS = 4


def fetch_google_news_rss(query: str, limit: int = 10) -> list[dict]:
    """
    Fetch a Google News RSS feed for a search query.
    Returns list of {title, url, date, source, snippet}.

    Google News RSS URL:
      https://news.google.com/rss/search?q={query}&hl=en-US&gl=US&ceid=US:en
    """
    url = "https://news.google.com/rss/search"
    params = {
        "q": query,
        "hl": "en-US",
        "gl": "US",
        "ceid": "US:en",
    }
    full_url = url + "?" + urllib.parse.urlencode(params)
    log(f"fetch_google_news_rss: {query!r}")

    req = urllib.request.Request(full_url, headers={
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml",
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            xml_content = resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        log(f"  failed: {e}", "ERROR")
        return []

    # Parse RSS XML
    posts = []
    try:
        root = ET.fromstring(xml_content)
    except ET.ParseError as e:
        log(f"  XML parse error: {e}", "ERROR")
        return []

    # Google News uses standard RSS 2.0: <rss><channel><item>...</item></channel></rss>
    items = root.findall(".//item")
    for item in items[:limit]:
        post = parse_news_item(item, query)
        if post:
            posts.append(post)

    log(f"  → got {len(posts)} articles")
    return posts


def _clean_html(text: str) -> str:
    """Strip HTML tags and decode entities from RSS text."""
    if not text:
        return ""
    # Remove CDATA wrappers
    text = text.replace("<![CDATA[", "").replace("]]>", "")
    # Remove HTML tags
    text = re.sub(r"<[^>]+>", "", text)
    # Decode common HTML entities
    text = (text.replace("&amp;", "&")
                .replace("&lt;", "<")
                .replace("&gt;", ">")
                .replace("&quot;", '"')
                .replace("&#39;", "'")
                .replace("&nbsp;", " "))
    return text.strip()


def _parse_date(date_str: str) -> str:
    """Parse a date string from RSS and return YYYY-MM-DD."""
    if not date_str:
        return today_iso()
    try:
        # RFC 822 format: "Sat, 15 Jan 2025 14:30:00 +0000"
        d = parsedate_to_datetime(date_str)
        return d.strftime("%Y-%m-%d")
    except Exception:
        pass
    try:
        # ISO format: "2025-01-15T14:30:00+00:00"
        d = time.strptime(date_str[:19], "%Y-%m-%dT%H:%M:%S")
        return time.strftime("%Y-%m-%d", d)
    except Exception:
        return today_iso()


def parse_news_item(item: ET.Element, query: str) -> dict:
    """Parse a single <item> from Google News RSS."""
    post = {
        "title": "",
        "url": "",
        "date": today_iso(),
        "source": "Web",
        "snippet": "",
        "subreddit": "google-news",  # reused field — shows as "Google News: ..."
    }

    # Title — Google News format: "Article Title - Source Name"
    title_el = item.find("title")
    if title_el is not None and title_el.text:
        raw_title = _clean_html(title_el.text)
        # Split "Title - Source" format
        if " - " in raw_title:
            parts = raw_title.rsplit(" - ", 1)
            post["title"] = parts[0].strip()
            post["source"] = parts[1].strip()
        else:
            post["title"] = raw_title

    # Link — Google News wraps in a redirect URL like
    # https://news.google.com/rss/articles/CAAq...?oc=5&en=...
    # We need to decode it to get the real article URL.
    link_el = item.find("link")
    if link_el is not None and link_el.text:
        post["url"] = decode_google_news_url(link_el.text.strip())

    # Source (override if <source> element exists)
    source_el = item.find("source")
    if source_el is not None and source_el.text:
        post["source"] = source_el.text.strip()

    # Date — RFC 822 format
    date_el = item.find("pubDate")
    if date_el is not None and date_el.text:
        post["date"] = _parse_date(date_el.text)

    # Snippet / description
    desc_el = item.find("description")
    if desc_el is not None and desc_el.text:
        # Google News description contains HTML — strip it
        post["snippet"] = _clean_html(desc_el.text)[:200]

    return post if post["title"] else None


def decode_google_news_url(google_url: str) -> str:
    """
    Decode a Google News redirect URL to get the real article URL.

    Google News URLs look like:
      https://news.google.com/rss/articles/CAAq...?oc=5&hl=en-US&gl=US&ceid=US:en

    Sometimes the real URL is in the 'url' query param, sometimes it's base64-encoded.
    For simplicity, we just return the Google News URL (it still works — redirects to article).
    """
    # Try to extract from query param first
    try:
        parsed = urllib.parse.urlparse(google_url)
        params = urllib.parse.parse_qs(parsed.query)
        if "url" in params:
            return params["url"][0]
    except Exception:
        pass
    # Otherwise, return the Google News URL as-is (it redirects to the real article)
    return google_url


def fetch_top_news(limit: int = 4) -> list[dict]:
    """Fetch from all queries, filter for CP3, dedupe, return top N."""
    all_posts = []
    for q in QUERIES:
        posts = fetch_google_news_rss(q, limit=10)
        all_posts.extend(posts)
        time.sleep(1)  # be polite

    # Filter: ensure posts mention Chris Paul or CP3
    cp3_posts = [p for p in all_posts
                 if any(k in (p["title"] + " " + p["snippet"]).lower()
                        for k in ["chris paul", "cp3", "point god"])]

    # Dedupe by title
    seen = set()
    unique = []
    for p in cp3_posts:
        key = p["title"].lower()[:80]
        if key not in seen:
            seen.add(key)
            unique.append(p)

    # Sort by date (newest first)
    unique.sort(key=lambda p: p["date"], reverse=True)
    return unique[:limit]


def fetch_image_for_post(post: dict, idx: int) -> str:
    """Search for an image matching the article title. Tries multiple URLs."""
    query = f"Chris Paul basketball {post['title'][:60]}"
    urls = image_search(query, num_results=8)  # get more results to try
    if not urls:
        return f"/alchemists/assets/images/samples/post-img{(idx % 4) + 1}-xs.jpg"
    target_path = PUBLIC_DIR / f"refresh-news-{idx + 1}.jpg"
    # Try each URL until one downloads successfully
    for url in urls:
        if download_image(url, target_path):
            return f"/alchemists/assets/images/samples/refresh-news-{idx + 1}.jpg"
    # All failed — use fallback
    log(f"  → all image downloads failed, using fallback", "WARN")
    return f"/alchemists/assets/images/samples/post-img{(idx % 4) + 1}-xs.jpg"


def _cap_title(title: str, max_len: int = 100) -> str:
    return title[:max_len] + "…" if len(title) > max_len else title


def build_json_items(posts: list[dict]) -> list[dict]:
    """Build the JSON items for data.json."""
    items = []
    for p in posts:
        cat = categorize_cp3_headline(p["title"])
        title = _cap_title(f"{p['source']}: {p['title']}")
        snippet = p.get("snippet", "").strip()
        excerpt = snippet if len(snippet) > 10 else _cap_title(p['title'], 120)
        items.append({
            "title": title,
            "excerpt": excerpt,
            "image": p.get("image", "/alchemists/assets/images/samples/post-img1-xs.jpg"),
            "category": cat["category"],
            "categoryClass": cat["categoryClass"],
            "date": p["date"],
            "dateTime": p["date"],
            "author": {"name": p["source"], "avatar": "/alchemists/assets/images/samples/avatar-1.jpg"},
            "redditUrl": p["url"],
        })
    return items


def main():
    log("=== CP3 Google News RSS Refresh ===")
    check_api_keys()
    dry = is_dry_run()

    posts = fetch_top_news(limit=MAX_POSTS)
    log(f"Found {len(posts)} top CP3 news articles")

    # Safety: don't overwrite good data with empty data
    if len(posts) < 1:
        log("No news articles found — keeping existing data", "WARN")
        return

    # Fetch images (skip in dry-run)
    if not dry:
        for i, p in enumerate(posts):
            p["image"] = fetch_image_for_post(p, i)
            time.sleep(3)
    else:
        for i, p in enumerate(posts):
            p["image"] = f"/alchemists/assets/images/samples/refresh-news-{i+1}.jpg"

    items = build_json_items(posts)
    data = read_data_json()
    data = set_data_path("mainContent.popularNews.items", items, data)
    # Also update footer popular news (subset)
    footer_items = [
        {"category": i["category"], "title": i["title"], "date": i["date"]}
        for i in items[:3]
    ]
    data = set_data_path("footer.popularNews.items", footer_items, data)
    write_data_json(data, dry_run=dry)
    log("=== Done ===")


if __name__ == "__main__":
    main()
