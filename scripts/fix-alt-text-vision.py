#!/usr/bin/env python3
"""
Generate SEO-rich alt text for media images using Claude CLI (vision).
Supports stop (Ctrl+C) and resume — tracks progress in a state file.

Usage:
  python3 scripts/fix-alt-text-vision.py

Resume after interruption:
  python3 scripts/fix-alt-text-vision.py          # auto-resumes from state file

Reset and start over:
  python3 scripts/fix-alt-text-vision.py --reset

Dry run (no updates, still calls Claude for alt text):
  python3 scripts/fix-alt-text-vision.py --dry-run

Use a different model (default: haiku):
  python3 scripts/fix-alt-text-vision.py --model sonnet
"""

import json
import os
import re
import subprocess
import sys
import signal
import time
import urllib.request
import urllib.error
from pathlib import Path

# --- Config ---
PAYLOAD_URL = "https://bestpragueguide.com"
PAYLOAD_EMAIL = "admin@bestpragueguide.com"
PAYLOAD_PASS = "BestPrague2026!"
STATE_FILE = Path(__file__).parent / "fix-alt-state.json"
THUMBNAIL_SIZE = "card"  # 640x430 — good enough for vision, small download
TMP_DIR = Path("/tmp/alt-work")

CLAUDE_PROMPT = """Read the image at {image_path}. This image is from bestpragueguide.com, a Prague private tour guide website.

Generate SEO-optimized alt text for this image in both English and Russian.

Rules:
- Max 100 characters each
- Include "Prague" or location name when relevant
- Include specific landmarks, places, or activities visible
- Use descriptive keywords a tourist would search for
- No quotes, no prefixes, just the alt text
- If it shows a person/guide giving a tour, mention "private tour guide Prague"
- If it shows a castle/landmark outside Prague, name it specifically

Respond with ONLY this JSON (no markdown, no explanation):
{{"en": "English alt text here", "ru": "Russian alt text here"}}"""


# --- State management ---
def load_state():
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {"completed": {}, "failed": [], "total_cost_usd": 0.0,
            "total_input_tokens": 0, "total_output_tokens": 0,
            "total_cache_read_tokens": 0, "total_cache_creation_tokens": 0}


def save_state(state):
    STATE_FILE.write_text(json.dumps(state, indent=2, ensure_ascii=False))


# --- Payload API ---
def payload_login():
    data = json.dumps({"email": PAYLOAD_EMAIL, "password": PAYLOAD_PASS}).encode()
    req = urllib.request.Request(
        f"{PAYLOAD_URL}/api/users/login",
        data=data,
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req) as resp:
        return json.load(resp)["token"]


def fetch_all_media(token):
    """Fetch all media records sorted by id."""
    all_docs = []
    page = 1
    while True:
        url = f"{PAYLOAD_URL}/api/media?limit=100&page={page}&depth=0&sort=id"
        req = urllib.request.Request(url, headers={"Authorization": f"JWT {token}"})
        with urllib.request.urlopen(req) as resp:
            data = json.load(resp)
        all_docs.extend(data["docs"])
        if not data.get("hasNextPage"):
            break
        page += 1
    return all_docs


def update_alt(token, media_id, alt_en, alt_ru):
    """Update alt text for both EN and RU locales."""
    for locale, alt in [("en", alt_en), ("ru", alt_ru)]:
        data = json.dumps({"alt": alt}).encode()
        req = urllib.request.Request(
            f"{PAYLOAD_URL}/api/media/{media_id}?locale={locale}",
            data=data,
            method="PATCH",
            headers={
                "Authorization": f"JWT {token}",
                "Content-Type": "application/json",
            },
        )
        with urllib.request.urlopen(req) as resp:
            result = json.load(resp)
            if not result.get("doc", {}).get("alt"):
                raise Exception(f"Failed to set {locale} alt for media {media_id}")


# --- Claude CLI ---
def analyze_image_cli(image_path, model="sonnet", retries=3):
    """Call claude CLI to analyze image and return (en_alt, ru_alt, cost_usd, usage_dict)."""
    prompt = CLAUDE_PROMPT.format(image_path=image_path)

    last_err = None
    for attempt in range(retries):
        if attempt > 0:
            time.sleep(5 * attempt)  # 5s, 10s back-off

        result = subprocess.run(
            [
                "claude", "-p", prompt,
                "--model", model,
                "--output-format", "json",
                "--dangerously-skip-permissions",
                "--allowedTools", "Read",
                "--max-budget-usd", "0.10",
            ],
            capture_output=True,
            text=True,
            timeout=120,
        )

        if result.returncode == 0:
            break
        last_err = result.stderr[:300] or result.stdout[:300] or "empty output"
    else:
        raise Exception(f"claude CLI failed after {retries} attempts: {last_err}")

    data = json.loads(result.stdout)

    if data.get("is_error"):
        raise Exception(f"claude error: {data.get('result', 'unknown')[:300]}")

    # Extract alt text from result
    text = data.get("result", "")

    # Strip markdown code fences if present
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*\n?", "", text)
        text = re.sub(r"\n?```\s*$", "", text)
        text = text.strip()

    alt_data = json.loads(text)
    cost = data.get("total_cost_usd", 0)

    # Extract token usage
    usage = data.get("usage", {})
    model_usage = data.get("modelUsage", {})
    # Get from modelUsage (more detailed)
    mu = next(iter(model_usage.values()), {}) if model_usage else {}

    return (
        alt_data["en"],
        alt_data["ru"],
        cost,
        {
            "input_tokens": mu.get("inputTokens", usage.get("input_tokens", 0)),
            "output_tokens": mu.get("outputTokens", usage.get("output_tokens", 0)),
            "cache_read": mu.get("cacheReadInputTokens", usage.get("cache_read_input_tokens", 0)),
            "cache_creation": mu.get("cacheCreationInputTokens", usage.get("cache_creation_input_tokens", 0)),
        },
    )


def download_thumbnail(url, dest):
    """Download image to local file."""
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=30) as resp:
        dest.write_bytes(resp.read())


# --- Main ---
def main():
    dry_run = "--dry-run" in sys.argv
    reset = "--reset" in sys.argv
    retry_failed = "--retry-failed" in sys.argv
    model = "sonnet"
    if "--model" in sys.argv:
        idx = sys.argv.index("--model")
        if idx + 1 < len(sys.argv):
            model = sys.argv[idx + 1]

    # State
    if reset and STATE_FILE.exists():
        STATE_FILE.unlink()
        print("State reset.")

    state = load_state()
    completed = state["completed"]

    # Graceful shutdown
    shutdown = False

    def handle_signal(sig, frame):
        nonlocal shutdown
        print("\n\nStopping after current image... (state saved)")
        shutdown = True

    signal.signal(signal.SIGINT, handle_signal)
    signal.signal(signal.SIGTERM, handle_signal)

    # Setup
    TMP_DIR.mkdir(parents=True, exist_ok=True)

    # Login
    print("Logging in to Payload CMS...")
    token = payload_login()

    # Fetch media
    print("Fetching media library...")
    all_media = fetch_all_media(token)
    missing = [m for m in all_media if not m.get("alt") or m["alt"].strip() == ""]
    already = len(completed)
    print(f"Total media: {len(all_media)} | Missing alt: {len(missing)} | Already done: {already}")

    # Filter: retry-failed mode processes only previously failed IDs
    failed_ids = {str(x["id"]) for x in state["failed"]}
    if retry_failed:
        # Clear failed list so they can be retried fresh
        state["failed"] = []
        save_state(state)
        todo = [m for m in missing if str(m["id"]) in failed_ids]
        print(f"Retrying {len(todo)} previously failed images")
    else:
        todo = [m for m in missing if str(m["id"]) not in completed]
    print(f"Remaining: {len(todo)}")
    if not todo:
        print("All done!")
        return

    mode = "DRY RUN" if dry_run else "LIVE"
    print(f"\n[{mode}] Processing with model: {model}\n")
    print(f"{'#':<5} {'ID':<6} {'Filename':<45} {'St':<5} {'Cost $':<9} {'Total $':<10} {'In':<7} {'Out':<6}")
    print("-" * 100)

    for i, media in enumerate(todo, 1):
        if shutdown:
            break

        media_id = media["id"]
        filename = media.get("filename", "?")
        short_fn = (filename[:42] + "...") if len(filename) > 45 else filename

        try:
            # Get thumbnail URL
            thumb_url = (media.get("sizes") or {}).get(THUMBNAIL_SIZE, {}).get("url")
            if not thumb_url:
                thumb_url = media.get("url", "")
            if not thumb_url:
                print(f"{i:<5} {media_id:<6} {short_fn:<45} {'SKIP':<5}")
                state["failed"].append({"id": media_id, "reason": "no URL"})
                save_state(state)
                continue

            # Download to temp
            img_path = TMP_DIR / f"img_{media_id}.jpg"
            download_thumbnail(thumb_url, img_path)

            # Analyze with Claude CLI
            alt_en, alt_ru, cost, usage = analyze_image_cli(str(img_path), model)

            # Truncate to 100 chars
            alt_en = alt_en[:100]
            alt_ru = alt_ru[:100]

            # Update CMS
            if not dry_run:
                update_alt(token, media_id, alt_en, alt_ru)

            # Track state
            state["total_cost_usd"] += cost
            state["total_input_tokens"] += usage["input_tokens"]
            state["total_output_tokens"] += usage["output_tokens"]
            state["total_cache_read_tokens"] += usage["cache_read"]
            state["total_cache_creation_tokens"] += usage["cache_creation"]
            completed[str(media_id)] = {"en": alt_en, "ru": alt_ru}
            save_state(state)

            # Cleanup temp file
            img_path.unlink(missing_ok=True)

            st = "DRY" if dry_run else "OK"
            total = state["total_cost_usd"]
            print(f"{i:<5} {media_id:<6} {short_fn:<45} {st:<5} ${cost:<8.4f} ${total:<9.4f} {usage['input_tokens']:<7} {usage['output_tokens']:<6}")
            print(f"      EN: {alt_en}")
            print(f"      RU: {alt_ru}")

        except Exception as e:
            err_msg = str(e)[:200]
            print(f"{i:<5} {media_id:<6} {short_fn:<45} {'FAIL':<5}")
            print(f"      Error: {err_msg}")
            state["failed"].append({"id": media_id, "reason": err_msg})
            save_state(state)
            # Cleanup on error too
            img_path = TMP_DIR / f"img_{media_id}.jpg"
            img_path.unlink(missing_ok=True)
            time.sleep(1)

    # Summary
    done = len(completed)
    total = len(missing)
    print(f"\n{'=' * 100}")
    print(f"Processed: {done} / {total}  |  Failed: {len(state['failed'])}")
    print(f"Input tokens:          {state['total_input_tokens']:>10,}")
    print(f"Output tokens:         {state['total_output_tokens']:>10,}")
    print(f"Cache read tokens:     {state['total_cache_read_tokens']:>10,}")
    print(f"Cache creation tokens: {state['total_cache_creation_tokens']:>10,}")
    print(f"Total cost:            ${state['total_cost_usd']:>10.4f}")
    if shutdown:
        print("\nStopped by user. Run again to resume from where you left off.")


if __name__ == "__main__":
    main()
