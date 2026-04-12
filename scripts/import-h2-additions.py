#!/usr/bin/env python3
"""
Import H2 additions to existing blog articles via /api/append-h2 endpoint.

Usage:
  python3 scripts/import-h2-additions.py ../bestpragueguide-docs/marketing/seo8/articles/h2-additions/
  python3 scripts/import-h2-additions.py ../bestpragueguide-docs/marketing/seo8/articles/h2-additions/ --dry-run
"""

import sys, json, os, glob, subprocess, tempfile

PAYLOAD_URL = os.environ.get("PAYLOAD_URL", "https://bestpragueguide.com")
PAYLOAD_SECRET = os.environ.get("PAYLOAD_SECRET", "")


def main():
    dry_run = "--dry-run" in sys.argv
    args = [a for a in sys.argv[1:] if not a.startswith("--")]

    if not args:
        print("Usage: python3 import-h2-additions.py <h2-additions-directory> [--dry-run]")
        sys.exit(1)

    if not PAYLOAD_SECRET and not dry_run:
        print("ERROR: Set PAYLOAD_SECRET env var")
        sys.exit(1)

    h2_dir = args[0]
    h2_files = sorted(glob.glob(os.path.join(h2_dir, "*.md")))

    if not h2_files:
        print("No H2 addition files found")
        sys.exit(1)

    # Group by target slug
    additions = {}
    for f in h2_files:
        basename = os.path.basename(f).replace(".md", "")
        parts = basename.split("--", 1)
        if len(parts) != 2:
            print(f"  SKIP {basename}: invalid naming")
            continue
        target_slug = parts[0]
        with open(f) as fh:
            content = fh.read().strip()

        if target_slug not in additions:
            additions[target_slug] = []
        additions[target_slug].append(content)

    # Build API payload — combine multiple sections per slug
    api_additions = []
    for slug, sections in sorted(additions.items()):
        combined = "\n\n".join(sections)
        api_additions.append({"slug": slug, "content": combined})
        if dry_run:
            for s in sections:
                first_line = s.split("\n")[0]
                print(f"  DRY-RUN: {slug} += {first_line}")

    print(f"\nProcessing {len(api_additions)} articles with {len(h2_files)} H2 sections total...")

    if dry_run:
        print("\nDone (dry run)")
        return

    # Send in batches of 5
    batch_size = 5
    total_updated = 0
    total_errors = 0

    for i in range(0, len(api_additions), batch_size):
        batch = api_additions[i:i + batch_size]
        print(f"\nBatch {i // batch_size + 1} ({len(batch)} articles):")

        import_locale = os.environ.get("IMPORT_LOCALE", "en")
        payload = {"additions": batch, "locale": import_locale}
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as tmp:
            json.dump(payload, tmp, ensure_ascii=False)
            tmp_path = tmp.name

        r = subprocess.run([
            "curl", "-s", "-X", "POST", f"{PAYLOAD_URL}/api/append-h2",
            "-H", f"x-init-secret: {PAYLOAD_SECRET}",
            "-H", "Content-Type: application/json",
            "-d", f"@{tmp_path}",
        ], capture_output=True, text=True, timeout=120)
        os.unlink(tmp_path)

        try:
            data = json.loads(r.stdout)
            if "error" in data and "results" not in data:
                print(f"  API ERROR: {data['error']}")
                total_errors += len(batch)
                continue
            for res in data.get("results", []):
                status = res.get("status", "unknown")
                slug = res.get("slug", "?")
                if status == "updated":
                    print(f"  OK: {slug} (id={res.get('id', '?')})")
                    total_updated += 1
                else:
                    print(f"  {status.upper()}: {slug} — {res.get('error', '')[:100]}")
                    total_errors += 1
        except json.JSONDecodeError:
            print(f"  PARSE ERROR: {r.stdout[:300]}")
            total_errors += len(batch)

    print(f"\nDone: {total_updated} updated, {total_errors} errors")


if __name__ == "__main__":
    main()
