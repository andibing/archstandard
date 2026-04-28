"""Live HTTP integrity check against production.

Walks the production sitemap, plus a curated list of redirect rules and
top-level static assets, and HEAD-requests each one. Reports any URL whose
final response (after redirects) is not 200 OK.

Run any time after deploy. Network-bound; takes a couple of minutes.
"""

from __future__ import annotations
import re
import sys
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor, as_completed

ORIGIN = "https://archstandard.org"
SITEMAP = f"{ORIGIN}/v1/sitemap-index.xml"

# Cloudflare bot-blocks the default urllib UA. Identify as a real browser.
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0 Safari/537.36 archstandard-link-check/1"
)

# URLs we expect to redirect (status 301/302) and ultimately land on 200.
REDIRECT_CASES = [
    "/",
    "/standard/",
    "/standard/overview/",
    "/templates/",
    "/cheat-cards/",
    "/prompts/",
    "/v1/standard/",
    "/v1/templates/",
    "/v1/cheat-cards/",
    "/v1/prompts/",
    "/v1/schema/",
]

# Direct-serve assets we expect 200 on.
DIRECT_ASSETS = [
    "/schema/v1.0.0/ads.schema.json",
    "/v1/templates/sad-template.json",
    "/v1/templates/sad-template.yaml",
    "/v1/templates/sad-template.md",
    "/v1/templates/sad-template.docx",
    "/v1/examples/employee-directory.json",
    "/v1/examples/customer-api-platform.json",
    "/v1/examples/cloud-migration.json",
    "/v1/examples/medwick-healthcare.json",
    "/v1/examples/northwind-retail.json",
    "/v1/examples/stellar-platform.json",
    "/v1/examples/archstandard-org.json",
    "/robots.txt",
    "/v1/sitemap-index.xml",
    "/v1/sitemap-0.xml",
]


def _open(url: str, method: str = "GET", timeout: int = 20):
    req = urllib.request.Request(url, method=method, headers={"User-Agent": UA})
    return urllib.request.urlopen(req, timeout=timeout)


def fetch_sitemap_urls() -> list[str]:
    urls: list[str] = []
    with _open(SITEMAP) as r:
        tree = ET.fromstring(r.read())
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    for sm in tree.findall("sm:sitemap/sm:loc", ns):
        with _open(sm.text) as r:
            sub = ET.fromstring(r.read())
        for u in sub.findall("sm:url/sm:loc", ns):
            urls.append(u.text)
    return urls


def check(url: str) -> tuple[str, int, str]:
    """Request a URL, follow redirects, return (url, final_status, final_url).

    Some servers/CDNs return 403 or 405 on HEAD; fall back to GET in that case.
    """
    for method in ("HEAD", "GET"):
        try:
            with _open(url, method=method, timeout=15) as resp:
                return url, resp.status, resp.geturl()
        except urllib.error.HTTPError as e:
            if method == "HEAD" and e.code in (403, 405):
                continue
            return url, e.code, url
        except (urllib.error.URLError, TimeoutError) as e:
            return url, 0, str(e)
    return url, 0, "exhausted"


def main() -> int:
    print(f"Fetching sitemap: {SITEMAP}")
    sitemap_urls = fetch_sitemap_urls()
    print(f"  {len(sitemap_urls)} URLs in sitemap")

    redirect_urls = [ORIGIN + p for p in REDIRECT_CASES]
    direct_urls = [ORIGIN + p for p in DIRECT_ASSETS]
    all_urls = sitemap_urls + redirect_urls + direct_urls
    # de-dup, preserve order
    seen: set[str] = set()
    queue: list[str] = []
    for u in all_urls:
        if u not in seen:
            seen.add(u)
            queue.append(u)
    print(f"Checking {len(queue)} URLs (sitemap + redirects + assets)...")

    bad: list[tuple[str, int, str]] = []
    with ThreadPoolExecutor(max_workers=8) as ex:
        futures = {ex.submit(check, u): u for u in queue}
        for i, fut in enumerate(as_completed(futures), 1):
            url, status, final = fut.result()
            if status != 200:
                bad.append((url, status, final))
            if i % 25 == 0:
                print(f"  {i}/{len(queue)}...")

    print(f"\nDone. Checked {len(queue)} URLs.")
    if not bad:
        print("All URLs return 200 OK (after any redirects).")
        return 0

    print(f"\n{len(bad)} URL(s) did NOT return 200:")
    for url, status, final in sorted(bad):
        print(f"  {status}  {url}")
        if final != url:
            print(f"        -> {final}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
