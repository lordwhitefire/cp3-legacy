"""
CP3 Legacy — Next Match Refresh Script
======================================

Fetches Chris Paul's next scheduled game using:
  1. DuckDuckGo web search
  2. Groq LLM to extract structured data

Writes to src/data/cp3/next-match.ts (new file)

Usage:
  python3 scripts/refresh-prod/next-match.py
  python3 scripts/refresh-prod/next-match.py --dry-run

Cron (every 6 hours):
  0 */6 * * * cd /path/to/cp3-legacy && python3 scripts/refresh-prod/next-match.py >> /tmp/cp3-nextmatch.log 2>&1
"""

import sys
import os
import json
sys.path.insert(0, os.path.dirname(__file__))

from _shared import (
    web_search, ask_llm_json, save_data_file,
    check_api_keys, is_dry_run, log,
    read_data_json, write_data_json, set_data_path,
)

# Reuse the same team-logo mapping
TEAM_LOGOS = {
    "San Antonio Spurs": "/alchemists/assets/images/samples/logos/alchemists_b_shield.png",
    "Los Angeles Lakers": "/alchemists/assets/images/samples/logos/sharks_shield.png",
    "Los Angeles Clippers": "/alchemists/assets/images/samples/logos/pirates_shield.png",
    "Golden State Warriors": "/alchemists/assets/images/samples/logos/ocean_kings_shield.png",
    "Houston Rockets": "/alchemists/assets/images/samples/logos/red_wings_shield.png",
    "Phoenix Suns": "/alchemists/assets/images/samples/logos/lucky_clovers_shield.png",
    "Oklahoma City Thunder": "/alchemists/assets/images/samples/logos/draconians_shield.png",
    "Dallas Mavericks": "/alchemists/assets/images/samples/logos/bloody_wave_shield.png",
    "Sacramento Kings": "/alchemists/assets/images/samples/logos/alchemists_b_shield.png",
    "Minnesota Timberwolves": "/alchemists/assets/images/samples/logos/ocean_kings_shield.png",
    "Denver Nuggets": "/alchemists/assets/images/samples/logos/bloody_wave_shield.png",
    "New Orleans Pelicans": "/alchemists/assets/images/samples/logos/red_wings_shield.png",
    "Memphis Grizzlies": "/alchemists/assets/images/samples/logos/draconians_shield.png",
    "Portland Trail Blazers": "/alchemists/assets/images/samples/logos/lucky_clovers_shield.png",
    "Utah Jazz": "/alchemists/assets/images/samples/logos/pirates_shield.png",
}


def get_team_logo(team_name: str) -> str:
    if team_name in TEAM_LOGOS:
        return TEAM_LOGOS[team_name]
    for known, logo in TEAM_LOGOS.items():
        first_word = known.split()[0].lower()
        if first_word in team_name.lower() or team_name.lower() in known.lower():
            return logo
    return "/alchemists/assets/images/samples/logos/alchemists_b_shield.png"


def fetch_next_match():
    """Fetch CP3's next scheduled game via web search + LLM."""
    queries = [
        "San Antonio Spurs next game schedule 2025",
        "Spurs upcoming game Chris Paul",
        "San Antonio Spurs next matchup date time",
    ]
    all_results = []
    for q in queries:
        all_results.extend(web_search(q, num_results=5))

    if not all_results:
        log("No search results", "ERROR")
        return None

    context = "\n\n".join([
        f"Result {i+1}: {r['title']}\nURL: {r['url']}\nSnippet: {r['snippet']}"
        for i, r in enumerate(all_results[:10])
    ])

    prompt = f"""You are a sports schedule extractor.

Here are web search results about the San Antonio Spurs' NEXT scheduled NBA game:

{context}

Extract the next scheduled Spurs game as JSON with these EXACT fields:
{{
  "date": "YYYY-MM-DD",
  "time": "HH:MM AM/PM local time",
  "iso_datetime": "YYYY-MM-DDTHH:MM:SS",
  "opponent": "full team name",
  "venue": "arena name",
  "city": "city, state",
  "is_home": true or false,
  "broadcast": "TV network (e.g. 'ESPN', 'NBA TV', 'BSSW')",
  "confidence": "high | medium | low"
}}

Rules:
- Use ONLY info from the search results.
- If no future game is found, return {{ "found": false, "confidence": "low" }}.
- Return ONLY the JSON object."""

    return ask_llm_json(prompt, max_tokens=800)


def build_json_match(data: dict) -> dict:
    """Build the next match JSON for data.json."""
    opponent = data.get("opponent", "Opponent")
    opponent_logo = get_team_logo(opponent)
    spurs_logo = TEAM_LOGOS["San Antonio Spurs"]
    venue = data.get("venue", "TBD")
    city = data.get("city", "")
    match_title = f"San Antonio Spurs vs {opponent}"

    try:
        from datetime import datetime
        d = datetime.strptime(data["date"], "%Y-%m-%d")
        pretty = d.strftime("%A, %B %-dth, %Y")
    except Exception:
        pretty = data.get("date", "")

    countdown_str = data.get("date", "") + " " + (data.get("time", "19:00")[:5]) + ":00"

    return {
        "title": "Top Next Match",
        "date": pretty,
        "dateTime": data.get("date", ""),
        "matchTitle": match_title,
        "matchTime": data.get("time", "7:00 PM"),
        "matchPlace": f"{venue}, {city}".strip(", "),
        "countdownDate": countdown_str,
        "countdownTitle": "Game Countdown",
        "buttonText": "Buy Tickets Now",
        "team1": {
            "name": "San Antonio Spurs",
            "logo": spurs_logo,
            "info": "San Antonio Spurs",
        },
        "team2": {
            "name": opponent,
            "logo": opponent_logo,
            "info": opponent,
        },
    }


def main():
    log("=== CP3 Next Match Refresh ===")
    check_api_keys()
    dry = is_dry_run()

    match = fetch_next_match()
    if not match:
        log("Failed to fetch next match data — keeping existing", "ERROR")
        return

    next_data = build_json_match(match)
    data = read_data_json()
    data = set_data_path("mainContent.nextMatch", next_data, data)
    write_data_json(data, dry_run=dry)
    log("=== Done ===")


if __name__ == "__main__":
    main()
