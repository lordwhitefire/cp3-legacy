"""
CP3 Legacy — Shared utilities for production refresh scripts
============================================================

This module provides:
  - Groq LLM client (free tier, Llama 3.1 70B)
  - DuckDuckGo web search (free, no key)
  - Bing Image Search API (1000/month free tier)
  - File-write with .bak backup (never lose good data)
  - Dry-run mode (test without overwriting)
  - Z-AI stand-in for sandbox testing (auto-detected)

Setup:
  1. Get a free Groq API key: https://console.groq.com
  2. Set environment variable: export GROQ_API_KEY="your_key"
  3. (Optional) Get Bing Image Search key for image fetching
     Set: export BING_API_KEY="your_key"

Usage in scripts:
  from _shared import web_search, ask_llm, save_data_file
  results = web_search("Chris Paul last game")
  data = ask_llm("Extract CP3's last game stats as JSON", results)
  save_data_file("src/data/cp3/last-game.ts", data, dry_run=False)
"""

import json
import os
import re
import sys
import time
import shutil
import subprocess
import urllib.request
import urllib.parse
import urllib.error
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any, Optional


# ============================================================
# Load .env file if present
# ============================================================

_env_path = Path(__file__).parent / ".env"
if _env_path.exists():
    for line in _env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        key = key.strip()
        val = val.strip().strip("\"'")
        if key and not os.environ.get(key):
            os.environ[key] = val


# ============================================================
# Configuration
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DATA_DIR = PROJECT_ROOT / "src" / "data" / "cp3"
PUBLIC_DIR = PROJECT_ROOT / "public" / "alchemists" / "assets" / "images" / "samples"

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

# NOTE: Bing Search API was RETIRED in August 2025 — no longer works.
# We now use DuckDuckGo Image Search (free, no key) instead.
# BING_API_KEY is kept for backwards compatibility but is unused.
BING_API_KEY = os.environ.get("BING_API_KEY", "")  # deprecated, do not use

# Z-AI stand-in: if GROQ_API_KEY is not set, try z-ai CLI (for sandbox testing)
USE_ZAI_STANDIN = not GROQ_API_KEY

GROQ_MODEL = "llama-3.3-70b-versatile"  # free tier
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


# ============================================================
# Logging
# ============================================================

def log(msg: str, level: str = "INFO") -> None:
    """Print with timestamp + level, flush immediately."""
    ts = time.strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] [{level}] {msg}", flush=True)


# ============================================================
# Web search — Google News RSS (free, no key, more reliable)
# ============================================================

def web_search(query: str, num_results: int = 5) -> list[dict]:
    """
    Search for news/articles using Google News RSS.
    Returns list of {title, url, snippet} dicts.

    Google News RSS is stable, free, and requires no API key.
    """
    log(f"web_search: {query}")
    url = "https://news.google.com/rss/search"
    params = {"q": query, "hl": "en-US", "gl": "US", "ceid": "US:en"}
    full_url = url + "?" + urllib.parse.urlencode(params)

    req = urllib.request.Request(full_url, headers={
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml",
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            xml_content = resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        log(f"web_search failed: {e}", "ERROR")
        return []

    results = []
    try:
        root = ET.fromstring(xml_content)
    except ET.ParseError as e:
        log(f"  XML parse error: {e}", "ERROR")
        return []

    for item in root.findall(".//item")[:num_results]:
        title_el = item.find("title")
        link_el = item.find("link")
        desc_el = item.find("description")
        title = _clean_html(title_el.text) if title_el is not None and title_el.text else ""
        link = link_el.text.strip() if link_el is not None and link_el.text else ""
        snippet = _clean_html(desc_el.text)[:200] if desc_el is not None and desc_el.text else ""
        if title:
            results.append({"title": title, "url": link, "snippet": snippet})

    log(f"  → got {len(results)} results")
    return results


# ============================================================
# LLM — Groq (free tier, Llama 3.1 70B) or z-ai stand-in
# ============================================================

def ask_llm(prompt: str, max_tokens: int = 2000, temperature: float = 0.1) -> str:
    """
    Send a prompt to the LLM and return the text response.

    Uses Groq API if GROQ_API_KEY is set, otherwise falls back to
    z-ai CLI (for sandbox testing only — does NOT work on your server).
    """
    if USE_ZAI_STANDIN:
        return _ask_zai(prompt, max_tokens, temperature)

    log(f"ask_llm (Groq, model={GROQ_MODEL})")
    payload = {
        "model": GROQ_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    req = urllib.request.Request(
        GROQ_API_URL,
        data=json.dumps(payload).encode(),
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode())
        text = data["choices"][0]["message"]["content"]
        log(f"  → {len(text)} chars returned")
        return text
    except urllib.error.HTTPError as e:
        body = e.read().decode() if e.fp else ""
        log(f"Groq API error {e.code}: {body[:200]}", "ERROR")
        raise
    except Exception as e:
        log(f"ask_llm failed: {e}", "ERROR")
        raise


def _ask_zai(prompt: str, max_tokens: int, temperature: float) -> str:
    """Stand-in using z-ai CLI for sandbox testing."""
    log("ask_llm (z-ai stand-in for sandbox testing)")
    # z-ai has a chat command
    try:
        result = subprocess.run(
            ["z-ai", "chat", "--prompt", prompt, "--no-stream"],
            capture_output=True, text=True, timeout=120,
        )
        if result.returncode != 0:
            log(f"z-ai CLI failed: {result.stderr[:200]}", "ERROR")
            return ""
        # Parse the JSON output
        stdout = result.stdout
        json_start = stdout.find("{")
        if json_start == -1:
            return stdout
        data = json.loads(stdout[json_start:])
        # Try common response shapes
        if "choices" in data:
            return data["choices"][0].get("message", {}).get("content", "")
        if "response" in data:
            return data["response"]
        return json.dumps(data)
    except Exception as e:
        log(f"z-ai stand-in failed: {e}", "ERROR")
        return ""


def ask_llm_json(prompt: str, max_tokens: int = 2000) -> dict | list | None:
    """
    Ask the LLM and parse the response as JSON.
    Returns None if the response isn't valid JSON.
    """
    text = ask_llm(prompt, max_tokens)
    # Extract JSON from the response (LLMs sometimes wrap in ```json blocks)
    json_match = re.search(r"```(?:json)?\s*(.+?)```", text, re.DOTALL)
    if json_match:
        text = json_match.group(1)
    # Also try to find the first { or [ and last } or ]
    start = max(text.find("{"), text.find("["))
    if start == -1:
        log("ask_llm_json: no JSON found in response", "ERROR")
        return None
    # Find the matching closing brace
    if text[start] == "{":
        end = text.rfind("}")
    else:
        end = text.rfind("]")
    if end == -1 or end <= start:
        log("ask_llm_json: incomplete JSON", "ERROR")
        return None
    try:
        decoder = json.JSONDecoder()
        return decoder.raw_decode(text[start:end + 1])[0]
    except (json.JSONDecodeError, ValueError) as e:
        log(f"ask_llm_json: invalid JSON: {e}", "ERROR")
        return None


# ============================================================
# Image search — DuckDuckGo (free, no key) or z-ai stand-in
# ============================================================
# NOTE: Bing Search API was RETIRED in August 2025.
# We now use DuckDuckGo's unofficial image search endpoint.

def image_search(query: str, num_results: int = 3) -> list[str]:
    """
    Search for images and return a list of downloadable URLs.

    Uses DuckDuckGo Image Search (free, no key).
    Falls back to z-ai image-search for sandbox testing if DDG fails.
    """
    # Try DuckDuckGo first (works in production)
    urls = _image_search_ddg(query, num_results)
    if urls:
        return urls

    # Fallback: z-ai stand-in (sandbox only)
    return _image_search_zai(query, num_results)


def _image_search_ddg(query: str, num_results: int) -> list[str]:
    """
    Search DuckDuckGo Images via the unofficial i.js endpoint.
    Free, no API key. Returns list of direct image URLs.
    """
    log(f"image_search (DuckDuckGo): {query}")
    try:
        # Step 1: get vqd token from search page
        search_url = "https://duckduckgo.com/?" + urllib.parse.urlencode({"q": query})
        req = urllib.request.Request(search_url, headers={
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        })
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode("utf-8", errors="replace")

        # Extract vqd token
        vqd_match = re.search(r'vqd=["\']([^"\']+)["\']', html) or re.search(r'vqd=([A-Za-z0-9\-_]+)', html)
        if not vqd_match:
            log("  → could not extract vqd token", "WARN")
            return []
        vqd = vqd_match.group(1)

        # Step 2: fetch image results JSON
        image_url = "https://duckduckgo.com/i.js?" + urllib.parse.urlencode({
            "q": query, "vqd": vqd, "l": "us-en", "o": "json", "f": ",,,,,", "p": "1",
        })
        req = urllib.request.Request(image_url, headers={
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://duckduckgo.com/",
            "Accept": "application/json, text/javascript, */*",
        })
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8", errors="replace"))

        urls = []
        for result in data.get("results", [])[:num_results]:
            img_url = result.get("image") or result.get("thumbnail")
            if img_url and img_url.startswith("http"):
                urls.append(img_url)
        log(f"  → got {len(urls)} image URLs")
        return urls
    except Exception as e:
        log(f"  → DuckDuckGo failed: {e}", "WARN")
        return []


def _image_search_zai(query: str, num_results: int) -> list[str]:
    """Stand-in using z-ai image-search CLI (sandbox only)."""
    log(f"image_search (z-ai stand-in): {query}")
    try:
        result = subprocess.run(
            ["z-ai", "image-search", "-q", query, "--count", str(num_results),
             "--no-rank", "--gl", "us"],
            capture_output=True, text=True, timeout=120,
        )
        if result.returncode != 0:
            return []
        stdout = result.stdout
        json_start = stdout.find("{")
        if json_start == -1:
            return []
        data = json.loads(stdout[json_start:])
        return [r.get("original_url", "") for r in data.get("results", []) if r.get("original_url")]
    except Exception:
        return []


def download_image(url: str, target_path: Path) -> bool:
    """
    Download an image URL to target_path. Returns True on success.

    Tries multiple User-Agent strings and Referer headers because many
    image hosts (Getty, Alamy, etc.) block requests without proper headers.
    """
    target_path.parent.mkdir(parents=True, exist_ok=True)

    # Some image hosts require a Referer header to allow downloads.
    # Derive the referer from the image URL's origin.
    try:
        parsed = urllib.parse.urlparse(url)
        referer = f"{parsed.scheme}://{parsed.netloc}/"
    except Exception:
        referer = "https://www.google.com/"

    # Try multiple header combinations
    header_sets = [
        {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            "Referer": referer,
        },
        {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
            "Accept": "image/*,*/*",
        },
        {
            "User-Agent": "curl/7.88.1",
            "Accept": "*/*",
        },
    ]

    for i, headers in enumerate(header_sets):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = resp.read()
            if len(data) < 1024:
                log(f"download_image: too small ({len(data)} bytes) on attempt {i+1}", "WARN")
                continue
            # Verify it's actually an image (check magic bytes)
            if not _is_image(data):
                log(f"download_image: not an image on attempt {i+1}", "WARN")
                continue
            target_path.write_bytes(data)
            log(f"  → saved {target_path.name} ({len(data) // 1024} KB) on attempt {i+1}")
            return True
        except urllib.error.HTTPError as e:
            log(f"download_image attempt {i+1}: HTTP {e.code}", "WARN")
            continue
        except Exception as e:
            log(f"download_image attempt {i+1}: {e}", "WARN")
            continue
    return False


def _is_image(data: bytes) -> bool:
    """Check if bytes start with a known image magic number."""
    if len(data) < 4:
        return False
    # JPEG: FF D8 FF
    if data[:3] == b"\xff\xd8\xff":
        return True
    # PNG: 89 50 4E 47
    if data[:4] == b"\x89PNG":
        return True
    # GIF: 47 49 46 38
    if data[:4] == b"GIF8":
        return True
    # WebP: RIFF....WEBP
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return True
    # BMP: 42 4D
    if data[:2] == b"BM":
        return True
    return False


# ============================================================
# Reddit scraping (free, no key)
# ============================================================

def scrape_reddit(subreddit: str, query: str, limit: int = 10) -> list[dict]:
    """
    Scrape Reddit's old.reddit.com search for posts matching a query.
    Returns list of {title, author, upvotes, comments, url, date, subreddit}.
    """
    url = f"https://old.reddit.com/r/{subreddit}/search"
    params = {
        "q": query,
        "restrict_sr": "on",
        "sort": "new",
        "t": "month",
    }
    full_url = url + "?" + urllib.parse.urlencode(params)
    log(f"scrape_reddit: {full_url}")
    req = urllib.request.Request(full_url, headers={
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            html = resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        log(f"scrape_reddit failed: {e}", "ERROR")
        return []

    posts = []
    # Parse: <a class="search-title" href="URL">TITLE</a>
    title_re = re.compile(r'<a class="search-title"[^>]*href="([^"]+)"[^>]*>([^<]+)</a>')
    score_re = re.compile(r'<span class="search-score"[^>]*>(\d+) points</span>')
    comments_re = re.compile(r'<a class="search-comments"[^>]*>(\d+) comments</a>')
    author_re = re.compile(r'<a class="author"[^>]*>([^<]+)</a>')
    date_re = re.compile(r'<time[^>]*datetime="([^"]+)"')

    titles = title_re.findall(html)
    scores = score_re.findall(html)
    comments = comments_re.findall(html)
    authors = author_re.findall(html)
    dates = date_re.findall(html)

    n = min(len(titles), len(scores), len(comments))
    for i in range(n):
        post_url = titles[i][0]
        if not post_url.startswith("http"):
            post_url = "https://www.reddit.com" + post_url
        posts.append({
            "title": _decode_html(titles[i][1]).strip(),
            "author": f"u/{authors[i]}" if i < len(authors) else "u/unknown",
            "upvotes": int(scores[i]) if i < len(scores) else 0,
            "comments": int(comments[i]),
            "url": post_url,
            "date": dates[i][:10] if i < len(dates) else time.strftime("%Y-%m-%d"),
            "subreddit": subreddit,
        })
    log(f"  → got {len(posts)} posts")
    return posts


# ============================================================
# File-write with backup + dry-run support
# ============================================================

def save_data_file(
    relative_path: str,
    content: str,
    dry_run: bool = False,
    header_comment: Optional[str] = None,
) -> bool:
    """
    Write content to a data file with safety features:
      - Creates a .bak backup before overwriting
      - Dry-run mode prints the would-be content without writing
      - Header comment is prepended with auto-generated timestamp

    Returns True on success.
    """
    full_path = (PROJECT_ROOT / relative_path).resolve()
    log(f"save_data_file: {relative_path} (dry_run={dry_run})")

    if header_comment:
        ts = time.strftime("%Y-%m-%dT%H:%M:%S%z")
        header = f"/**\n * CP3 Legacy — Auto-generated data file\n * Generated: {ts}\n * Source: {header_comment}\n *\n * DO NOT EDIT MANUALLY — run the refresh script instead.\n */\n\n"
        content = header + content

    if dry_run:
        log(f"  → DRY RUN — would write {len(content)} bytes to {full_path}")
        print(f"\n{'='*60}\nDRY RUN PREVIEW ({full_path.name}):\n{'='*60}\n{content[:500]}...\n{'='*60}\n")
        return True

    # Backup existing file
    if full_path.exists():
        bak_path = full_path.with_suffix(full_path.suffix + ".bak")
        shutil.copy2(full_path, bak_path)
        log(f"  → backed up to {bak_path.name}")

    full_path.parent.mkdir(parents=True, exist_ok=True)
    full_path.write_text(content, encoding="utf-8")
    log(f"  → wrote {len(content)} bytes")
    return True


# ============================================================
# Helpers
# ============================================================

def _clean_html(text: str) -> str:
    """Strip HTML tags and decode entities from text."""
    if not text:
        return ""
    text = text.replace("<![CDATA[", "").replace("]]>", "")
    text = re.sub(r"<[^>]+>", "", text)
    text = (text.replace("&amp;", "&")
                .replace("&lt;", "<")
                .replace("&gt;", ">")
                .replace("&quot;", '"')
                .replace("&#39;", "'")
                .replace("&nbsp;", " "))
    return text.strip()


def _decode_html(s: str) -> str:
    """Decode HTML entities."""
    return (s.replace("&amp;", "&")
             .replace("&lt;", "<")
             .replace("&gt;", ">")
             .replace("&quot;", '"')
             .replace("&#39;", "'")
             .replace("&nbsp;", " "))


# ============================================================
# data.json read/write (replaces .ts file output)
# ============================================================

_DATA_JSON_ENV = "CP3_DATA_JSON_PATH"


def _get_data_json_path() -> Path:
    """Get the data.json path from env var. Fails if not set."""
    val = os.environ.get(_DATA_JSON_ENV)
    if not val:
        raise RuntimeError(
            f"{_DATA_JSON_ENV} environment variable must be set. "
            "This prevents accidentally writing to the real data.json."
        )
    return Path(val)


def read_data_json() -> dict:
    """Read the data.json at CP3_DATA_JSON_PATH."""
    path = _get_data_json_path()
    if not path.exists():
        log(f"data.json not found at {path}", "WARN")
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        log(f"read data.json ({len(json.dumps(data))} bytes)")
        return data
    except (json.JSONDecodeError, Exception) as e:
        log(f"read_data_json: {e}", "ERROR")
        return {}


def write_data_json(data: dict, dry_run: bool = False) -> bool:
    """Write the entire data.json with .bak backup."""
    path = _get_data_json_path()
    if dry_run:
        log(f"DRY RUN — would write to {path}")
        return True
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        bak_path = path.with_suffix(".json.bak")
        backup_data = path.read_text(encoding="utf-8")
        bak_path.write_text(backup_data, encoding="utf-8")
        log(f"  → backed up to {bak_path.name}")
    path.write_text(json.dumps(data, indent=2), encoding="utf-8")
    log(f"  → wrote {len(json.dumps(data)) // 1024} KB to data.json")
    return True


def set_data_path(path: str, value: Any, data: dict) -> dict:
    """Set a value at a dot-separated path in a nested dict.
    Supports array index syntax: 'tabs[0].items' accesses tabs[0] as list index.
    Example: set_data_path('mainContent.popularNews.items', items, data)
             set_data_path('mainContent.trendingNews.tabs[0].items', items, data)
    """
    import re
    keys = re.findall(r'[^.[]+|\[\d+\]', path)
    obj = data
    for i, key in enumerate(keys[:-1]):
        is_last = i == len(keys) - 2
        m = re.match(r'\[(\d+)\]', key)
        if m:
            idx = int(m.group(1))
            parent = obj if isinstance(obj, list) else list(obj.values())[0] if obj else obj
            # Ensure the list is long enough
            while len(obj) <= idx:
                obj.append({} if not is_last else value)
            obj = obj[idx]
        else:
            if isinstance(obj, dict) and key not in obj:
                obj[key] = [] if i < len(keys) - 1 and keys[i+1].startswith('[') else {}
            obj = obj[key]
    m = re.match(r'\[(\d+)\]', keys[-1])
    if m:
        idx = int(m.group(1))
        while len(obj) <= idx:
            obj.append(None)
        obj[idx] = value
    else:
        obj[keys[-1]] = value
    return data


def categorize_cp3_headline(title: str) -> dict:
    """Categorize a CP3 headline as The Team / Playoffs / Injuries."""
    t = title.lower()
    if any(k in t for k in ["injur", "sprain", "fracture", "hurt", "surgery", "recovery", "return from"]):
        return {"category": "Injuries", "categoryClass": "posts__cat-label--cat-2"}
    if any(k in t for k in ["playoff", "finals", "championship", "ring", "title", "postseason"]):
        return {"category": "Playoffs", "categoryClass": "posts__cat-label--cat-3"}
    return {"category": "The Team", "categoryClass": "posts__cat-label--cat-1"}


def today_iso() -> str:
    return time.strftime("%Y-%m-%d")


def pretty_date(iso_date: str) -> str:
    """Convert YYYY-MM-DD to 'January 15th, 2025'."""
    try:
        from datetime import datetime
        d = datetime.strptime(iso_date[:10], "%Y-%m-%d")
        return d.strftime("%B %-dth, %Y").replace("11th", "11th").replace("12th", "12th").replace("13th", "13th")
    except Exception:
        return iso_date


# ============================================================
# CLI helper — parse --dry-run from any script
# ============================================================

def is_dry_run() -> bool:
    return "--dry-run" in sys.argv or "-n" in sys.argv


def check_api_keys() -> None:
    """Print a warning if no API keys are set."""
    if USE_ZAI_STANDIN:
        log("=" * 60, "WARN")
        log("GROQ_API_KEY not set — using z-ai stand-in.", "WARN")
        log("This works in the sandbox but NOT on your server.", "WARN")
        log("Get a free Groq key: https://console.groq.com", "WARN")
        log("Then: export GROQ_API_KEY='your_key'", "WARN")
        log("=" * 60, "WARN")
    # Image search now uses DuckDuckGo (free, no key) — no warning needed.
    # Bing Search API was retired August 2025.
