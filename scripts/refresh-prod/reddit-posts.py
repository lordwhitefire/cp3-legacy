"""
CP3 Legacy — Reddit Posts Refresh Script
=========================================

Scrapes Reddit's public HTML (no API key) for posts about Chris Paul,
then fetches an image for each post via image search.

Writes to src/data/cp3/reddit-posts.ts

Usage:
  python3 scripts/refresh-prod/reddit-posts.py
  python3 scripts/refresh-prod/reddit-posts.py --dry-run

Cron (every 6 hours):
  0 */6 * * * cd /path/to/cp3-legacy && python3 scripts/refresh-prod/reddit-posts.py >> /tmp/cp3-reddit.log 2>&1
"""

import sys
import os
import json
import time
sys.path.insert(0, os.path.dirname(__file__))

from _shared import (
    scrape_reddit, image_search, download_image,
    save_data_file, check_api_keys, is_dry_run, log,
    categorize_cp3_headline, today_iso, PUBLIC_DIR
)

# Subreddits to search (CP3-related)
SUBREDDITS = [
    "nba",
    "SanAntonioSpurs",
    "Suns",        # CP3 played here
    "Clippers",    # CP3 played here
    "lakers",      # rivalry
]


def fetch_top_reddit_posts(limit: int = 8) -> list[dict]:
    """Scrape multiple subreddits for CP3 posts, return top by upvotes."""
    all_posts = []
    for sub in SUBREDDITS:
        posts = scrape_reddit(sub, "Chris Paul", limit=10)
        all_posts.extend(posts)
        time.sleep(2)  # be polite

    # Filter: only keep posts mentioning CP3
    cp3_posts = [p for p in all_posts if any(k in p["title"].lower() for k in ["chris paul", "cp3", "point god"])]

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
    """Build the TypeScript file content."""
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
    log("=== CP3 Reddit Posts Refresh ===")
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
        header_comment="scripts/refresh-prod/reddit-posts.py",
    )
    log("=== Done ===")


if __name__ == "__main__":
    main()
