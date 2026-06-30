"""
CP3 Legacy — Last Game Result Refresh Script
============================================

Fetches Chris Paul's most recent NBA game stats using:
  1. DuckDuckGo web search (free, no key)
  2. Groq LLM (Llama 3.1 70B, free tier) to extract structured data

Writes the result to src/data/cp3/last-game.ts

Usage:
  python3 scripts/refresh-prod/last-game.py            # live run
  python3 scripts/refresh-prod/last-game.py --dry-run  # preview only

Cron (every 2 hours):
  0 */2 * * * cd /path/to/cp3-legacy && python3 scripts/refresh-prod/last-game.py >> /tmp/cp3-lastgame.log 2>&1
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from _shared import (
    web_search, ask_llm_json, save_data_file,
    check_api_keys, is_dry_run, log, today_iso,
    read_data_json, write_data_json, set_data_path,
)

# NBA team logo mapping (Spurs + common opponents)
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
    """Return logo path for a team, with fuzzy matching fallback."""
    if team_name in TEAM_LOGOS:
        return TEAM_LOGOS[team_name]
    # Try partial match
    for known, logo in TEAM_LOGOS.items():
        # Match on first word (e.g., "Lakers" matches "Los Angeles Lakers")
        first_word = known.split()[0].lower()
        if first_word in team_name.lower() or team_name.lower() in known.lower():
            return logo
    # Default — use Spurs logo as placeholder
    return "/alchemists/assets/images/samples/logos/alchemists_b_shield.png"


def fetch_last_game():
    """Fetch CP3's last game stats via web search + LLM extraction."""
    # Step 1: web search for recent CP3 game
    queries = [
        "Chris Paul Spurs last game box score stats",
        "Chris Paul San Antonio latest game result",
        "CP3 last NBA game points assists rebounds",
    ]
    all_results = []
    for q in queries:
        results = web_search(q, num_results=5)
        all_results.extend(results)

    if not all_results:
        log("No web search results — aborting", "ERROR")
        return None

    # Step 2: send to LLM for structured extraction
    # Include all the snippets so the LLM has context
    context = "\n\n".join([
        f"Result {i+1}: {r['title']}\nURL: {r['url']}\nSnippet: {r['snippet']}"
        for i, r in enumerate(all_results[:10])
    ])

    prompt = f"""You are a sports data extractor specializing in NBA box scores.

Here are web search results about Chris Paul's most recent NBA game:

{context}

Extract Chris Paul's LAST game stats as a JSON object with these EXACT fields:
{{
  "date": "YYYY-MM-DD format",
  "opponent": "full team name (e.g. 'Los Angeles Lakers')",
  "cp3_team_score": integer,
  "opponent_score": integer,
  "cp3_points": integer,
  "cp3_rebounds": integer,
  "cp3_assists": integer,
  "cp3_steals": integer,
  "cp3_blocks": integer,
  "cp3_turnovers": integer,
  "cp3_fg_made": integer,
  "cp3_fg_attempted": integer,
  "cp3_3pm": integer,
  "cp3_3pa": integer,
  "cp3_ft_made": integer,
  "cp3_ft_attempted": integer,
  "cp3_minutes": integer,
  "cp3_plus_minus": integer,
  "venue": "arena name and city",
  "recap": "1-2 sentence game recap mentioning CP3's performance",
  "confidence": "high | medium | low"
}}

Rules:
- Use ONLY information from the search results above. Do NOT make up stats.
- If a field cannot be determined, use 0 for numbers or "" for strings.
- Set confidence to "low" if you're unsure about ANY field.
- Set confidence to "medium" if most fields are confident.
- Set confidence to "high" only if ALL fields are clearly stated.
- Return ONLY the JSON object, no other text."""

    data = ask_llm_json(prompt, max_tokens=1500)
    if not data:
        log("LLM returned no valid JSON — aborting", "ERROR")
        return None

    log(f"LLM extracted data with confidence: {data.get('confidence', 'unknown')}")
    return data


def build_json_game(data: dict) -> dict:
    """Build the last game result JSON for data.json."""
    team1_score = data.get("cp3_team_score", 0)
    team2_score = data.get("opponent_score", 0)
    is_winner = team1_score > team2_score
    winner_score = max(team1_score, team2_score)
    loser_score = min(team1_score, team2_score)

    return {
        "date": data.get("date", ""),
        "dateTime": data.get("date", ""),
        "title": "San Antonio Spurs vs " + data.get("opponent", "Opponent"),
        "scoreLabel": "Final Score",
        "scoreWinner": winner_score,
        "scoreLoser": loser_score,
        "team1": {
            "name": "San Antonio Spurs",
            "logo": "/alchemists/assets/images/samples/logos/alchemists_b_shield.png",
            "desc": "San Antonio Spurs",
        },
        "team2": {
            "name": data.get("opponent", "Opponent"),
            "logo": get_team_logo(data.get("opponent", "")),
            "desc": data.get("opponent", "Opponent"),
        },
        "quarters": {
            "header": ["Scoreboard", "1", "2", "3", "4", "T"],
            "team1Quarters": [0, 0, 0, 0],
            "team1Total": team1_score,
            "team2Quarters": [0, 0, 0, 0],
            "team2Total": team2_score,
        },
        "mvp": {
            "name": "Chris Paul",
            "photo": "/alchemists/assets/images/samples/stats_player_02.jpg",
            "position": "Point Guard",
            "stats": [
                {"unit": "Pts", "value": data.get("cp3_points", 0), "percent": min(data.get("cp3_points", 0) * 3, 100)},
                {"unit": "Reb", "value": data.get("cp3_rebounds", 0), "percent": min(data.get("cp3_rebounds", 0) * 6, 100)},
                {"unit": "Ast", "value": data.get("cp3_assists", 0), "percent": min(data.get("cp3_assists", 0) * 5, 100)},
            ],
        },
        "stats": [
            {
                "label": "Assists",
                "team1Value": data.get("cp3_assists", 0),
                "team2Value": data.get("cp3_assists", 0) + 5,
                "team1Bar": "progress__bar-width-60",
                "team2Bar": "progress__bar-width-80",
            },
            {
                "label": "Rebounds",
                "team1Value": data.get("cp3_rebounds", 0),
                "team2Value": data.get("cp3_rebounds", 0) + 3,
                "team1Bar": "progress__bar-width-90",
                "team2Bar": "progress__bar-width-40",
            },
            {
                "label": "Steals",
                "team1Value": data.get("cp3_steals", 0),
                "team2Value": data.get("cp3_steals", 0) + 2,
                "team1Bar": "progress__bar-width-30",
                "team2Bar": "progress__bar-width-70",
            },
        ],
    }


def main():
    log("=== CP3 Last Game Refresh ===")
    check_api_keys()
    dry = is_dry_run()
    if dry:
        log("DRY RUN MODE — no files will be modified", "WARN")

    game = fetch_last_game()
    if not game:
        log("Failed to fetch game data — keeping existing data", "ERROR")
        return

    match_data = build_json_game(game)
    data = read_data_json()
    data = set_data_path("mainContent.lastGameResult.match", match_data, data)
    write_data_json(data, dry_run=dry)
    log("=== Done ===")


if __name__ == "__main__":
    main()
