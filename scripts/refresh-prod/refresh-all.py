"""
CP3 Legacy — Refresh All
========================

Runs all 5 refresh scripts in sequence.
Use this for manual refreshes or as the daily cron entry point.

Usage:
  python3 scripts/refresh-prod/refresh-all.py            # live
  python3 scripts/refresh-prod/refresh-all.py --dry-run  # preview all

Cron (daily at 3 AM as a safety net):
  0 3 * * * cd /path/to/cp3-legacy && python3 scripts/refresh-prod/refresh-all.py >> /tmp/cp3-refresh-all.log 2>&1
"""

import sys
import os
import subprocess
import time
from pathlib import Path

sys.path.insert(0, os.path.dirname(__file__))
from _shared import log, is_dry_run

SCRIPTS = [
    "featured-news.py",   # 1 hour
    "google-news.py",     # 4 hours (replaces reddit-posts.py)
    "last-game.py",       # 2 hours
    "next-match.py",      # 6 hours
    "trending-news.py",   # 3 hours
]


def main():
    log("=== CP3 Legacy — Refresh All ===")
    dry = is_dry_run()
    if dry:
        log("DRY RUN MODE — no files will be modified", "WARN")

    script_dir = Path(__file__).parent
    success = 0
    failed = 0

    for script in SCRIPTS:
        script_path = script_dir / script
        log(f"\n--- Running {script} ---")
        try:
            cmd = [sys.executable, str(script_path)]
            if dry:
                cmd.append("--dry-run")
            result = subprocess.run(cmd, timeout=600)  # 10-min timeout each
            if result.returncode == 0:
                log(f"✓ {script} completed")
                success += 1
            else:
                log(f"✗ {script} exited with code {result.returncode}", "ERROR")
                failed += 1
        except subprocess.TimeoutExpired:
            log(f"✗ {script} timed out after 10 minutes", "ERROR")
            failed += 1
        except Exception as e:
            log(f"✗ {script} crashed: {e}", "ERROR")
            failed += 1
        # Pause between scripts
        time.sleep(10)

    log(f"\n=== Refresh All finished: {success} succeeded, {failed} failed ===")


if __name__ == "__main__":
    main()
