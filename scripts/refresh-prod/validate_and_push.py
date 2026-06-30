"""
CP3 Legacy — Validate & Push
=============================

Runs all scrapers against a WORKING COPY of data.json.backup.
Validates the result matches the backup structure. If valid:
  - Replaces data.json.backup with the fresh data
  - Runs complete-migration.ts to push to Sanity
  - Triggers Vercel rebuild

If validation fails, retries up to MAX_RETRIES times with delays.

Usage:
  python3 scripts/refresh-prod/validate-and-push.py
  python3 scripts/refresh-prod/validate-and-push.py --dry-run

Environment:
  SANITY_API_WRITE_TOKEN     required for migration
  VERCEL_DEPLOY_HOOK         optional — URL to trigger deploy
"""

import sys
import os
import json
import time
import shutil
import subprocess
from pathlib import Path

sys.path.insert(0, os.path.dirname(__file__))
from _shared import log, is_dry_run

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
BACKUP_PATH = PROJECT_ROOT / "src" / "data" / "data.json.backup"
WORK_DIR = Path("/tmp/cp3-refresh")
WORKING_COPY = WORK_DIR / "data.json"

SCRIPTS = [
    "featured-news.py",
    "google-news.py",
    "trending-news.py",
]

MAX_RETRIES = 5
RETRY_DELAY = 300  # 5 minutes between retries (safe for RSS)

SECTIONS = [
    ("featuredCarousel.slides", ["featuredCarousel", "slides"]),
    ("mainContent.featuredNews.slides", ["mainContent", "featuredNews", "slides"]),
    ("mainContent.latestNews.items", ["mainContent", "latestNews", "items"]),
    ("mainContent.popularNews.items", ["mainContent", "popularNews", "items"]),
    ("mainContent.trendingNews.tabs[0].items",
     ["mainContent", "trendingNews", "tabs", 0, "items"]),
    ("mainContent.trendingNews.tabs[1].items",
     ["mainContent", "trendingNews", "tabs", 1, "items"]),
    ("mainContent.trendingNews.tabs[2].items",
     ["mainContent", "trendingNews", "tabs", 2, "items"]),
]


def _get_path(data: dict, path_parts: list):
    """Walk a nested dict/list path like ['mainContent','trendingNews','tabs',0,'items']."""
    current = data
    for part in path_parts:
        if isinstance(current, dict):
            current = current.get(part)
        elif isinstance(current, list) and isinstance(part, int):
            if 0 <= part < len(current):
                current = current[part]
            else:
                return None
        else:
            return None
    return current


def run_scrapers(working_copy: Path):
    """Run all scrapers with CP3_DATA_JSON_PATH pointing to working_copy."""
    env = os.environ.copy()
    env["CP3_DATA_JSON_PATH"] = str(working_copy)

    script_dir = Path(__file__).parent

    for script_name in SCRIPTS:
        script_path = script_dir / script_name
        log(f"--- Running {script_name} ---")
        result = subprocess.run(
            [sys.executable, str(script_path)],
            env=env,
            capture_output=True,
            text=True,
            timeout=600,
        )
        for line in result.stdout.splitlines():
            log(f"  {line}")
        if result.stderr:
            for line in result.stderr.splitlines():
                log(f"  ERR: {line}", "ERROR")
        if result.returncode != 0:
            raise RuntimeError(f"{script_name} exited with code {result.returncode}")
        log(f"✓ {script_name} completed")


def validate(data_path: Path) -> list:
    """Compare data.json against backup. Returns list of failure messages."""
    with open(data_path) as f:
        new_data = json.load(f)
    with open(BACKUP_PATH) as f:
        backup_data = json.load(f)

    failures = []
    for name, path_parts in SECTIONS:
        expected = _get_path(backup_data, path_parts)
        got = _get_path(new_data, path_parts)
        expected_len = len(expected) if isinstance(expected, list) else 0
        got_len = len(got) if isinstance(got, list) else 0
        if expected_len != got_len:
            failures.append(
                f"{name}: expected {expected_len} items, got {got_len}"
            )

    return failures


def push_to_sanity():
    """Run the migration script to push to Sanity from backup."""
    log("--- Pushing to Sanity ---")
    result = subprocess.run(
        ["npx", "tsx", "scripts/complete-migration.ts"],
        capture_output=True,
        text=True,
        timeout=300,
    )
    for line in result.stdout.splitlines():
        log(f"  {line}")
    if result.stderr:
        for line in result.stderr.splitlines():
            log(f"  ERR: {line}", "ERROR")
    if result.returncode != 0:
        raise RuntimeError(f"Migration failed with code {result.returncode}")
    log("✓ Sanity push complete")


def trigger_rebuild():
    """Call Vercel deploy hook if URL is set."""
    hook_url = os.environ.get("VERCEL_DEPLOY_HOOK")
    if not hook_url:
        log("VERCEL_DEPLOY_HOOK not set — skipping rebuild trigger", "WARN")
        return
    log("--- Triggering Vercel rebuild ---")
    import urllib.request
    try:
        req = urllib.request.Request(hook_url, method="POST")
        with urllib.request.urlopen(req, timeout=30) as resp:
            log(f"✓ Rebuild triggered: HTTP {resp.status}")
    except Exception as e:
        log(f"Rebuild trigger failed: {e}", "ERROR")


def main():
    log("=== CP3 Legacy — Validate & Push ===")
    dry = is_dry_run()

    # Ensure backup exists
    if not BACKUP_PATH.exists():
        log(f"Backup not found at {BACKUP_PATH}", "ERROR")
        sys.exit(1)

    # Read backup for reference
    with open(BACKUP_PATH) as f:
        backup_data = json.load(f)

    for attempt in range(1, MAX_RETRIES + 1):
        log(f"\n{'='*60}")
        log(f"Attempt {attempt}/{MAX_RETRIES}")
        log(f"{'='*60}")

        # Create working copy from backup
        WORK_DIR.mkdir(parents=True, exist_ok=True)
        shutil.copy2(BACKUP_PATH, WORKING_COPY)

        try:
            # Run all scrapers against the working copy
            run_scrapers(WORKING_COPY)

            # Validate
            failures = validate(WORKING_COPY)

            if not failures:
                log("\n✓ All sections validated successfully!")

                if dry:
                    log("DRY RUN — stopping before push")
                    log(f"Would replace {BACKUP_PATH} with fresh data")
                    log("Would push to Sanity")
                    log("Would trigger Vercel rebuild")
                    return

                # Replace backup with validated fresh data
                shutil.copy2(WORKING_COPY, BACKUP_PATH)
                log(f"✓ Updated {BACKUP_PATH} with fresh data")

                # Push to Sanity
                push_to_sanity()

                # Trigger rebuild
                trigger_rebuild()

                log("\n=== ✓ Refresh cycle complete ===")
                return

            # Validation failed
            log(f"\n✗ Validation failed (attempt {attempt}/{MAX_RETRIES}):")
            for f in failures:
                log(f"  - {f}")

            if attempt < MAX_RETRIES:
                log(f"\nRetrying in {RETRY_DELAY} seconds...")
                time.sleep(RETRY_DELAY)

        except Exception as e:
            log(f"\n✗ Error on attempt {attempt}: {e}", "ERROR")
            if attempt < MAX_RETRIES:
                log(f"Retrying in {RETRY_DELAY} seconds...")
                time.sleep(RETRY_DELAY)

    # All retries exhausted
    log("\n=== ✗ All retries exhausted. Nothing pushed. Nothing broken. ===")
    log("Check the logs above to see which sections failed.")
    log("The site stays on its last good data. Try again tomorrow.")
    sys.exit(1)


if __name__ == "__main__":
    main()
