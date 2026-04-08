#!/usr/bin/env python3
"""
Import blog articles from .md + -meta.json files into Payload CMS
via the /api/import-blog endpoint.

Usage:
  python3 scripts/import-blog-articles.py ../bestpragueguide-docs/marketing/seo2/articles/
  python3 scripts/import-blog-articles.py ../bestpragueguide-docs/marketing/seo2/articles/ --batch-size 10
  python3 scripts/import-blog-articles.py ../bestpragueguide-docs/marketing/seo2/articles/ --dry-run
"""

import sys, json, os, glob, subprocess

PAYLOAD_URL = os.environ.get("PAYLOAD_URL", "https://bestpragueguide.com")
PAYLOAD_SECRET = os.environ.get("PAYLOAD_SECRET", "")
BATCH_SIZE = 10
STATE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "import-blog-state.json")


def load_state():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE) as f:
            return json.load(f)
    return {"imported": [], "errors": []}


def save_state(state):
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)


def send_batch(articles, dry_run=False):
    if dry_run:
        for a in articles:
            print(f"  DRY-RUN: {a['slug']} — {a['metaTitle'][:50]}")
        return [{"slug": a["slug"], "status": "dry-run"} for a in articles]

    import tempfile
    data = {"articles": articles}
    if os.environ.get("IMPORT_LOCALE"):
        data["locale"] = os.environ["IMPORT_LOCALE"]
    if os.environ.get("IMPORT_MODE") == "update":
        data["mode"] = "update"
    else:
        data["defaultHeroImageId"] = 691
    # Write payload to temp file to avoid "Argument list too long"
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as tmp:
        json.dump(data, tmp, ensure_ascii=False)
        tmp_path = tmp.name
    r = subprocess.run([
        "curl", "-s", "-X", "POST", f"{PAYLOAD_URL}/api/import-blog",
        "-H", f"x-init-secret: {PAYLOAD_SECRET}",
        "-H", "Content-Type: application/json",
        "-d", f"@{tmp_path}",
    ], capture_output=True, text=True, timeout=120)
    os.unlink(tmp_path)

    try:
        data = json.loads(r.stdout)
        if "error" in data:
            print(f"  API ERROR: {data['error']}")
            return [{"slug": a["slug"], "status": "error", "error": data["error"]} for a in articles]
        return data.get("results", [])
    except json.JSONDecodeError:
        print(f"  PARSE ERROR: {r.stdout[:200]}")
        return [{"slug": a["slug"], "status": "error", "error": "parse error"} for a in articles]


def main():
    dry_run = "--dry-run" in sys.argv
    args = [a for a in sys.argv[1:] if not a.startswith("--")]

    batch_size = BATCH_SIZE
    for a in sys.argv[1:]:
        if a.startswith("--batch-size"):
            batch_size = int(a.split("=")[1] if "=" in a else sys.argv[sys.argv.index(a) + 1])

    if not args:
        print("Usage: python3 import-blog-articles.py <articles-directory> [--dry-run] [--batch-size N]")
        sys.exit(1)

    if not PAYLOAD_SECRET and not dry_run:
        print("ERROR: Set PAYLOAD_SECRET env var")
        sys.exit(1)

    articles_dir = args[0]
    md_files = sorted(glob.glob(os.path.join(articles_dir, "*.md")))
    md_files = [f for f in md_files if not f.endswith("-meta.json")]

    state = load_state()
    already_imported = set(state["imported"])

    # Build article list
    articles = []
    for md_path in md_files:
        slug = os.path.basename(md_path).replace(".md", "")
        if slug in already_imported:
            continue

        meta_path = md_path.replace(".md", "-meta.json")
        if not os.path.exists(meta_path):
            print(f"  SKIP {slug}: no meta file")
            continue

        with open(md_path) as f:
            content = f.read()
        with open(meta_path) as f:
            meta = json.load(f)

        # Auto-assign category from slug
        category = "prague-guide"
        if any(k in slug for k in ["eat", "food", "cuisine", "beer", "dinner", "tipping"]):
            category = "food-and-drink"
        elif any(k in slug for k in ["day-trip", "karlstejn", "terezin", "hluboka", "cesky-krumlov", "karlovy", "karlsbad", "konopiste", "bohemian", "pilsner", "dresden", "vienna", "sternberk", "kozel", "skoda"]):
            category = "day-trips"
        elif any(k in slug for k in ["safe", "currency", "tipping", "scam", "dos-and-donts", "tourist-trap", "first-time", "hotel", "souvenir", "budget"]):
            category = "tips"
        elif any(k in slug for k in ["history", "communism", "kafka", "wwii", "revolution", "jewish-history", "legends", "famous-people", "traditions", "architecture", "art-nouveau"]):
            category = "history"

        articles.append({
            "slug": meta.get("slug", slug),
            "title": meta.get("title", ""),
            "content": content,
            "metaTitle": meta.get("metaTitle", ""),
            "metaDescription": meta.get("metaDescription", ""),
            "excerpt": meta.get("excerpt", ""),
            "category": category,
            "faqItems": meta.get("faqItems", []),
            "publishedAt": "2026-04-06T12:00:00.000Z",
        })

    if not articles:
        print(f"No new articles to import ({len(already_imported)} already imported)")
        sys.exit(0)

    print(f"Importing {len(articles)} articles in batches of {batch_size}...")

    total_created = 0
    total_skipped = 0
    total_errors = 0

    for i in range(0, len(articles), batch_size):
        batch = articles[i:i + batch_size]
        print(f"\nBatch {i // batch_size + 1} ({len(batch)} articles):")
        results = send_batch(batch, dry_run)

        for r in results:
            status = r.get("status", "unknown")
            slug = r.get("slug", "?")
            if status in ("created", "updated"):
                total_created += 1
                if slug not in state["imported"]:
                    state["imported"].append(slug)
                print(f"  {'OK' if status == 'created' else 'UPDATED'}: {slug} (id={r.get('id', '?')})")
            elif status == "skipped":
                total_skipped += 1
                if slug not in state["imported"]:
                    state["imported"].append(slug)
                print(f"  SKIP: {slug} (already exists, id={r.get('id', '?')})")
            elif status == "dry-run":
                pass
            else:
                total_errors += 1
                state["errors"].append({"slug": slug, "error": r.get("error", "unknown")})
                print(f"  FAIL: {slug} — {r.get('error', 'unknown')[:100]}")

        if not dry_run:
            save_state(state)

    print(f"\nDone: {total_created} created, {total_skipped} skipped, {total_errors} errors")


if __name__ == "__main__":
    main()
