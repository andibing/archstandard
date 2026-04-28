"""Quick link integrity check on built site.

Walks dist/ HTML files, pulls every href/src starting with /, and verifies the
target resolves to a file or directory inside dist/.

Run after `npm run build`. Skips external URLs, data URIs, and fragments.
"""

import re
import sys
from pathlib import Path

DIST = Path("dist")


def url_to_fs(url: str) -> list[Path]:
    """Candidate filesystem paths a URL could resolve to."""
    target = url.lstrip("/").split("?")[0].split("#")[0]
    p = DIST / target
    candidates = [p]
    if not target.endswith(".html"):
        candidates.append(p / "index.html")
        candidates.append(Path(str(p) + ".html"))
    return candidates


def main() -> int:
    if not DIST.exists():
        print(f"{DIST} does not exist; run `npm run build` first")
        return 1

    broken: dict[str, list[str]] = {}
    for html in DIST.rglob("*.html"):
        text = html.read_text(encoding="utf-8", errors="ignore")
        for m in re.finditer(r'(?:href|src)=["\'](/[^"\'#?\s]*)', text):
            url = m.group(1)
            if url.startswith("//") or url.startswith("/data:"):
                continue
            candidates = url_to_fs(url)
            if not any(c.exists() for c in candidates):
                rel = str(html.relative_to(DIST)).replace("\\", "/")
                broken.setdefault(url, []).append(rel)

    if not broken:
        print("No broken internal links found.")
        return 0

    print(f"Found {len(broken)} broken URLs:\n")
    for url, sources in sorted(broken.items()):
        print(f"  BROKEN: {url}")
        for s in sources[:3]:
            print(f"    referenced from: {s}")
        if len(sources) > 3:
            print(f"    ... and {len(sources) - 3} more")
        print()
    return 1


if __name__ == "__main__":
    sys.exit(main())
