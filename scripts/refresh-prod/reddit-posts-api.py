"""
CP3 Legacy — Reddit Posts Refresh Script (API version)
======================================================

Uses Reddit's official OAuth API (free for personal use, up to 100 req/min).
This is the RELIABLE version — HTML scraping gets blocked by Reddit.

Setup:
  1. Go to https://www.reddit.com/prefs/apps
  2. Click "create another app" at the bottom
  3. Choose "script" type
  4. Name: cp3-legacy
  5. Redirect URI: http://localhost (doesn't matter for script apps)
  6. Click "create app"
  7. Copy the client_id (under the app name) and client_secret
  8. Set environment variables:
       export REDDIT_CLIENT_ID="your_id"
       export REDDIT_CLIENT_SECRET="your_secret"
       export REDDIT_USERNAME="your_reddit_username"
       export REDDIT_PASSWORD="your_reddit_password"

Free limits: 100 requests/minute, 1000 requests/hour (way more than you need).

Usage:
  python3 scripts/refresh-prod/reddit-posts-api.py
  python3 scripts/refresh-prod/reddit-posts-api.py --dry-run

Cron (every 6 hours):
  0 */6 * * * cd /path/to/cp3-legacy && python3 scripts/refresh-prod/reddit-posts-api.py >> /tmp/cp3-reddit.log 2>&1
"""

import sys
import os
import json
import time
import urllib.request
import urllib.parse
import urllib.error
from pathlib import Path

sys.path.insert(0, os.path.dirname(__file__))
from _shared import (
    image_search, download_image, save_data_file,
    check_api_keys, is_dry_run, log,
    categorize_cp3_headline, today_iso, PUBLIC_DIR
)

# Reddit API credentials (from environment)
REDDIT_CLIENT_ID = os.environ.get("REDDIT_CLIENT_ID", "")
REDDIT_CLIENT_SECRET = os.environ.get("REDDIT_CLIENT_SECRET", "")
REDDIT_USERNAME = os.environ.get("REDDIT_USERNAME", "")
REDDIT_PASSWORD = os.environ.get("REDDIT_PASSWORD", "")

# Subreddits to search
SUBREDDITS = ["nba", "SanAntonioSpurs", "Suns", "Clippers", "lakers"]


def get_reddit_token() -> str:
    """Get OAuth access token from Reddit. Returns token string."""
    if not all([REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD]):
        log("Missing Reddit API credentials. Set REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD", "ERROR")
        log("Get them at: https://www.reddit.com/prefs/apps (create a 'script' app)", "ERROR")
        sys.exit(1)

    log("Getting Reddit OAuth token...")
    auth_url = "https://www.reddit.com/api/v1/access_token"
    data = urllib.parse.urlencode({
        "grant_type": "password",
        "username": REDDIT_USERNAME,
        "password": REDDIT_PASSWORD,
    }).encode()
    # HTTP Basic Auth with client_id:client_secret
    import base64
    credentials = f"{REDDIT_CLIENT_ID}:{REDDIT_CLIENT_SECRET}"
    b64 = base64.b64encode(credentials.encode()).decode()
    req = urllib.request.Request(
        auth_url,
        data=data,
        headers={
            "Authorization": f"Basic {b64}",
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": f"cp3-legacy/0.1 by /u/{REDDIT_USERNAME}",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            token_data = json.loads(resp.read().decode())
        if "access_token" not in token_data:
            log(f"Reddit auth failed: {token_data}", "ERROR")
            sys.exit(1)
        log("  ✓ got token")
        return token_data["access_token"]
    except urllib.error.HTTPError as e:
        body = e.read().decode() if e.fp else ""
        log(f"Reddit auth error {e.code}: {body}", "ERROR")
        sys.exit(1)


def search_subreddit(token: str, subreddit: str, query: str, limit: int = 10) -> list[dict]:
    """Search a subreddit for posts matching query. Returns list of post dicts."""
    url = f"https://oauth.reddit.com/r/{subreddit}/search"
    params = {
        "q": query,
        "restrict_sr": "on",
        "sort": "new",
        "t": "month",
        "limit": str(limit),
    }
    full_url = url + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(full_url, headers={
        "Authorization": f"bearer {token}",
        "User-Agent": f"cp3-legacy/0.1 by /u/{REDDIT_USERNAME}",
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
        posts = []
        for child in data.get("data", {}).get("children", []):
            p = child["data"]
            # Skip stickied posts
            if p.get("stickied"):
                continue
            posts.append({
                "title": p["title"],
                "author": f"u/{p.get('author', 'unknown')}",
                "upvotes": p.get("ups", 0),
                "comments": p.get("num_comments", 0),
                "url": f"https://www.reddit.com{p.get('permalink', '')}",
                "date": time.strftime("%Y-%m-%d", time.localtime(p.get("created_utc", 0))),
                "subreddit": subreddit,
            })
        log(f"  r/{subreddit}: {len(posts)} posts")
        return posts
    except urllib.error.HTTPError as e:
        log(f"  r/{subreddit} search failed: HTTP {e.code}", "ERROR")
        return []
    except Exception as e:
        log(f"  r/{subreddit} search failed: {e}", "ERROR")
        return []


def fetch_top_reddit_posts(limit: int = 8) -> list[dict]:
    """Search all subreddits, return top posts mentioning CP3."""
    token = get_reddit_token()
    all_posts = []
    for sub in SUBREDDITS:
        posts = search_subreddit(token, sub, "Chris Paul", limit=10)
        all_posts.extend(posts)
        time.sleep(2)  # be polite (well under 100/min limit)

    # Filter: only keep posts mentioning CP3 (search may return false positives)
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

    # Sort by upvotes (desc) and take top N
    unique.sort(key=lambda p: p.get("upvotes", 0), reverse=True)
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


def build_ts_content(posts: list[dict]) -> str:
    items_ts = []
    for p in posts:
        cat = categorize_cp3_headline(p["title"])
        items_ts.append(f"""  {{
    image: {json.dumps(p.get("image", "/alchemists/assets/images/samples/post-img1-xs.jpg"))},
    category: {json.dumps(cat["category"])},
    categoryClass: {json.dumps(cat["categoryClass"])},
    title: {json.dumps(f"r/{p['subreddit']}: {p['title']}")},
    author: {json.dumps(p["author"])},
    authorAvatar: "/alchemists/assets/images/samples/avatar-1.jpg",
    date: {json.dumps(p["date"])},
    upvotes: {p["upvotes"]},
    comments: {p["comments"]},
    redditUrl: {json.dumps(p["url"])},
  }}""")
    return f"""import type {{ RedditPost }} from "./reddit-posts";

export const REDDIT_POSTS: RedditPost[] = [
{",\n".join(items_ts)}
];
"""


def main():
    log("=== CP3 Reddit Posts Refresh (API version) ===")
    check_api_keys()
    dry = is_dry_run()

    posts = fetch_top_reddit_posts(limit=4)
    log(f"Found {len(posts)} top CP3 Reddit posts")

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

    ts_content = build_ts_content(posts)
    save_data_file(
        "src/data/cp3/reddit-posts.ts",
        ts_content,
        dry_run=dry,
        header_comment="scripts/refresh-prod/reddit-posts-api.py",
    )
    log("=== Done ===")


if __name__ == "__main__":
    main()
