#!/usr/bin/env python3
"""
Cross-linking audit for bestpragueguide.com blog articles.

Crawls all blog pages, extracts internal links, and reports:
- Articles with fewer than 3 internal links
- Orphan articles (no other article links to them)
- Link counts per article
- Top linked-to pages

Usage:
  python3 scripts/cross-linking-audit.py
  python3 scripts/cross-linking-audit.py --locale en
  python3 scripts/cross-linking-audit.py --locale ru
"""

import subprocess, re, sys, json
from collections import defaultdict

LOCALE = 'en'
if '--locale' in sys.argv:
    idx = sys.argv.index('--locale')
    if idx + 1 < len(sys.argv):
        LOCALE = sys.argv[idx + 1]

print(f'Cross-linking audit for /{LOCALE}/blog/ ...')

# Get all blog URLs from sitemap
r = subprocess.run(['curl', '-s', 'https://bestpragueguide.com/sitemap.xml'],
    capture_output=True, text=True, timeout=15)
all_urls = re.findall(r'<loc>(.*?)</loc>', r.stdout)

blog_prefix = f'/{LOCALE}/blog/'
blog_urls = sorted([u for u in all_urls if blog_prefix in u])
blog_slugs = set(u.split(blog_prefix)[-1] for u in blog_urls)

print(f'Found {len(blog_urls)} blog articles in /{LOCALE}/blog/')

# Crawl each article and extract internal links
outgoing = {}  # slug → set of linked slugs
incoming = defaultdict(set)  # slug → set of articles that link to it
tour_links = {}  # slug → count of tour links

for i, url in enumerate(blog_urls):
    slug = url.split(blog_prefix)[-1]
    if (i + 1) % 25 == 0:
        print(f'  ...crawled {i+1}/{len(blog_urls)}', file=sys.stderr)

    try:
        r = subprocess.run(['curl', '-s', '-H', 'User-Agent: Mozilla/5.0', url],
            capture_output=True, text=True, timeout=15)
        html = r.stdout

        # Extract internal blog links
        blog_links = set()
        for href in re.findall(r'href="[^"]*' + re.escape(blog_prefix) + r'([^"]+)"', html):
            if href in blog_slugs and href != slug:
                blog_links.add(href)

        outgoing[slug] = blog_links
        for target in blog_links:
            incoming[target].add(slug)

        # Count tour links
        tour_prefix = f'/{LOCALE}/{"ekskursii" if LOCALE == "ru" else "tours"}/'
        tours = set(re.findall(r'href="[^"]*' + re.escape(tour_prefix) + r'([^"]+)"', html))
        tour_links[slug] = len(tours)

    except Exception:
        outgoing[slug] = set()
        tour_links[slug] = 0

# Analysis
orphans = [s for s in blog_slugs if s not in incoming or len(incoming[s]) == 0]
low_links = [(s, len(outgoing.get(s, set()))) for s in blog_slugs if len(outgoing.get(s, set())) < 3]
no_tour_links = [s for s in blog_slugs if tour_links.get(s, 0) == 0]

# Top linked-to pages
top_targets = sorted(incoming.items(), key=lambda x: -len(x[1]))[:15]

# Report
print(f'\n{"="*60}')
print(f'  CROSS-LINKING AUDIT — /{LOCALE}/blog/')
print(f'{"="*60}')
print(f'\nTotal articles: {len(blog_slugs)}')
print(f'Orphan articles (nothing links to them): {len(orphans)}')
print(f'Articles with < 3 outgoing blog links: {len(low_links)}')
print(f'Articles with 0 tour links: {len(no_tour_links)}')

print(f'\n--- TOP 15 MOST LINKED-TO ARTICLES ---')
for slug, sources in top_targets:
    print(f'  {len(sources):3d} incoming  {slug[:50]}')

if orphans:
    print(f'\n--- ORPHAN ARTICLES ({len(orphans)}) ---')
    for s in sorted(orphans)[:20]:
        out = len(outgoing.get(s, set()))
        print(f'  {s[:50]:50s} (outgoing: {out})')
    if len(orphans) > 20:
        print(f'  ...and {len(orphans)-20} more')

if low_links:
    print(f'\n--- ARTICLES WITH < 3 BLOG LINKS ({len(low_links)}) ---')
    for s, count in sorted(low_links)[:20]:
        print(f'  {count} links  {s[:50]}')
    if len(low_links) > 20:
        print(f'  ...and {len(low_links)-20} more')

print(f'\n--- SUMMARY ---')
avg_out = sum(len(v) for v in outgoing.values()) / max(len(outgoing), 1)
avg_in = sum(len(v) for v in incoming.values()) / max(len(incoming), 1)
print(f'  Average outgoing blog links: {avg_out:.1f}')
print(f'  Average incoming blog links: {avg_in:.1f}')
print(f'  Articles with tour links: {sum(1 for v in tour_links.values() if v > 0)}/{len(blog_slugs)}')
