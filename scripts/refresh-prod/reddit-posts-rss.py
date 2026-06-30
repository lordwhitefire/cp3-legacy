"""
CP3 Legacy — Reddit RSS Refresh Script (RECOMMENDED VERSION)
============================================================

Fetches Reddit posts via RSS feeds — no API key, no OAuth, no policy approval.
Reddit still publishes RSS for every subreddit and search query.

Since we don't need vote counts, RSS is perfect. We get:
  - Post title
  - Post URL (link to reddit.com)
  - Author
  - Publication date
  - Subreddit

Setup: NONE. Just run it.

Usage:
  python3 scripts/refresh-prod/reddit-posts-rss.py
  python3 scripts/refresh-prod/reddit-posts-rss.py --dry-run

Cron (every 6 hours):
  0 */6 * * * cd /path/to/cp3-legacy && python3 scripts/refresh-prod/reddit-posts-rss.py >> /tmp/cp3-reddit.log 2>&1
"""

import sys
import os
import json
import time
import re
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from pathlib import Path
from email.utils import parsedate_to_datetime

sys.path.insert(0, os.path.dirname(__file__))
from _shared import (
    image_search, download_image, save_data_file,
    check_api_keys, is_dry_run, log,
    categorize_cp3_headline, today_iso, PUBLIC_DIR,
    read_data_json, write_data_json, set_data_path,
)

# Subreddits to search (CP3-related)
SUBREDDITS = [
    "nba",
    "SanAntonioSpurs",
    "Suns",        # CP3 played here
    "Clippers",    # CP3 played here
    "lakers",      # rivalry
]

# How many posts to fetch per subreddit
POSTS_PER_SUB = 10
# How many posts to keep total (after dedup + filter)
MAX_POSTS = 4


def fetch_reddit_rss(subreddit: str, query: str, limit: int = 10) -> list[dict]:
    """
    Fetch a Reddit RSS feed for a subreddit search.
    Returns list of {title, url, author, date, subreddit}.

    Reddit RSS URL format:
      https://www.reddit.com/r/{subreddit}/search.rss?q={query}&restrict_sr=on&sort=new&t=month&limit={limit}
    """
    url = f"https://www.reddit.com/r/{subreddit}/search.rss"
    params = {
        "q": query,
        "restrict_sr": "on",
        "sort": "new",
        "t": "month",
        "limit": str(limit),
    }
    full_url = url + "?" + urllib.parse.urlencode(params)
    log(f"fetch_reddit_rss: r/{subreddit} q={query!r}")

    req = urllib.request.Request(full_url, headers={
        # A normal browser User-Agent helps avoid blocking
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml",
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            xml_content = resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        log(f"  HTTP {e.code} — Reddit blocked this request", "ERROR")
        return []
    except Exception as e:
        log(f"  failed: {e}", "ERROR")
        return []

    # Parse the RSS XML
    posts = []
    try:
        root = ET.fromstring(xml_content)
    except ET.ParseError as e:
        log(f"  XML parse error: {e}", "ERROR")
        return []

    # RSS 2.0 structure: <rss><channel><item>...</item></channel></rss>
    # Reddit uses Atom-ish feed with namespaced entries. Handle both.
    # Find all <item> or <entry> elements
    items = root.findall(".//item")
    if not items:
        items = root.findall(".//{http://www.w3.org/2005/Atom}entry")

    for item in items:
        post = parse_rss_item(item, subreddit)
        if post:
            posts.append(post)

    log(f"  → got {len(posts)} posts")
    return posts


def parse_rss_item(item: ET.Element, subreddit: str) -> dict:
    """Parse a single <item> or <entry> element into a post dict."""
    post = {
        "title": "",
        "url": "",
        "author": "u/unknown",
        "date": today_iso(),
        "subreddit": subreddit,
        "upvotes": 0,   # RSS doesn't include this
        "comments": 0,  # RSS doesn't include this
    }

    # Try RSS 2.0 fields first
    title_el = item.find("title")
    if title_el is not None and title_el.text:
        post["title"] = _clean_html(title_el.text)

    link_el = item.find("link")
    if link_el is not None and link_el.text:
        post["url"] = link_el.text.strip()
    elif link_el is not None and link_el.get("href"):
        # Atom format: <link href="..."/>
        post["url"] = link_el.get("href").strip()

    # Author — RSS: <dc:creator>, Atom: <author><name>
    author_el = item.find("{http://purl.org/dc/elements/1.1/}creator")
    if author_el is not None and author_el.text:
        post["author"] = f"u/{author_el.text.strip()}"
    else:
        author_el = item.find("{http://www.w3.org/2005/Atom}author/{http://www.w3.org/2005/Atom}name")
        if author_el is not None and author_el.text:
            post["author"] = f"u/{author_el.text.strip()}"

    # Date — RSS: <pubDate>, Atom: <updated> or <published>
    date_el = item.find("pubDate")
    if date_el is not None and date_el.text:
        post["date"] = _parse_date(date_el.text)
    else:
        date_el = item.find("{http://www.w3.org/2005/Atom}updated")
        if date_el is not None and date_el.text:
            post["date"] = _parse_date(date_el.text)
        else:
            date_el = item.find("{http://www.w3.org/2005/Atom}published")
            if date_el is not None and date_el.text:
                post["date"] = _parse_date(date_el.text)

    # If URL is missing, use the Reddit comments URL (we can construct it from <guid> or <comments>)
    if not post["url"]:
        guid_el = item.find("guid")
        if guid_el is not None and guid_el.text:
            post["url"] = guid_el.text.strip()
        else:
            comments_el = item.find("comments")
            if comments_el is not None and comments_el.text:
                post["url"] = comments_el.text.strip()

    return post if post["title"] else None


def _clean_html(text: str) -> str:
    """Strip HTML tags and decode entities from RSS text."""
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


def fetch_top_reddit_posts(limit: int = 4) -> list[dict]:
    """Fetch from all subreddits, filter for CP3, dedupe, return top N."""
    all_posts = []
    for sub in SUBREDDITS:
        posts = fetch_reddit_rss(sub, "Chris Paul", limit=POSTS_PER_SUB)
        all_posts.extend(posts)
        time.sleep(2)  # be polite

    # Filter: only keep posts mentioning CP3
    cp3_posts = [p for p in all_posts
                 if any(k in p["title"].lower() for k in ["chris paul", "cp3", "point god"])]

    # Dedupe by title
    seen = set()
    unique = []
    for p in cp3_posts:
        key = p["title"].lower()[:80]
        if key not in seen:
            seen.add(key)
            unique.append(p)

    # Sort by date (newest first) since we don't have upvotes
    unique.sort(key=lambda p: p["date"], reverse=True)
    return unique[:limit]


def fetch_image_for_post(post: dict, idx: int) -> str:
    """Search for an image matching the post title."""
    query = f"Chris Paul basketball {post['title'][:60]}"
    urls = image_search(query, num_results=3)
    if not urls:
        return f"/alchemists/assets/images/samples/post-img{(idx % 4) + 1}-xs.jpg"
    target_path = PUBLIC_DIR / f"refresh-reddit-{idx + 1}.jpg"
    if download_image(urls[0], target_path):
        return f"/alchemists/assets/images/samples/refresh-reddit-{idx + 1}.jpg"
    return f"/alchemists/assets/images/samples/post-img{(idx % 4) + 1}-xs.jpg"


def build_json_items(posts: list[dict]) -> list[dict]:
    """Build the JSON items for data.json."""
    items = []
    for p in posts:
        cat = categorize_cp3_headline(p["title"])
        items.append({
            "title": f"r/{p['subreddit']}: {p['title']}",
            "image": p.get("image", "/alchemists/assets/images/samples/post-img1-xs.jpg"),
            "category": cat["category"],
            "categoryClass": cat["categoryClass"],
            "date": p["date"],
            "author": p["author"],
            "authorAvatar": "/alchemists/assets/images/samples/avatar-1.jpg",
            "redditUrl": p["url"],
            "upvotes": p.get("upvotes", 0),
            "comments": p.get("comments", 0),
        })
    return items


def main():
    log("=== CP3 Reddit RSS Refresh ===")
    check_api_keys()
    dry = is_dry_run()

    posts = fetch_top_reddit_posts(limit=MAX_POSTS)
    log(f"Found {len(posts)} top CP3 Reddit posts")

    # Safety: don't overwrite good data with empty data
    if len(posts) < 1:
        log("No Reddit posts found — keeping existing data", "WARN")
        return

    # Fetch images (skip in dry-run)
    if not dry:
        for i, p in enumerate(posts):
            p["image"] = fetch_image_for_post(p, i)
            time.sleep(3)
    else:
        for i, p in enumerate(posts):
            p["image"] = f"/alchemists/assets/images/samples/refresh-reddit-{i+1}.jpg"

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
