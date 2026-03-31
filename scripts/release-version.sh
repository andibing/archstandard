#!/bin/bash
# ADS Version Release Script
#
# Snapshots the current site into a versioned directory so previous
# versions remain accessible when a new major version is released.
#
# Usage:
#   ./scripts/release-version.sh 1
#
# This will:
#   1. Build the current site
#   2. Copy the built output to public/v1/ (served at /v1/)
#   3. The current site continues to serve at the root URL
#
# After running this, the version is permanently accessible at:
#   https://archstandard.org/v1/
#
# When to run:
#   - Before releasing a new MAJOR version (e.g., before v2.0.0)
#   - This preserves the current version so SADs referencing it
#     remain valid

set -e

VERSION="${1}"

if [ -z "$VERSION" ]; then
    echo "Usage: ./scripts/release-version.sh <major-version>"
    echo "  e.g., ./scripts/release-version.sh 1"
    exit 1
fi

TARGET_DIR="public/v${VERSION}"

if [ -d "$TARGET_DIR" ]; then
    echo "Error: $TARGET_DIR already exists. Version $VERSION has already been snapshotted."
    exit 1
fi

echo "=== ADS Version Release ==="
echo ""
echo "Snapshotting current site as v${VERSION}..."
echo ""

# 1. Build the site
echo "[1/3] Building site..."
npm run build
echo ""

# 2. Copy built output to versioned directory
echo "[2/3] Copying dist/ to ${TARGET_DIR}/..."
mkdir -p "$TARGET_DIR"
cp -r dist/* "$TARGET_DIR/"
echo ""

# 3. Create a version marker file
echo "[3/3] Creating version marker..."
cat > "${TARGET_DIR}/version.json" << MARKER
{
  "version": "${VERSION}",
  "snapshotDate": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "note": "This is a frozen snapshot of ADS v${VERSION}. The latest version is at https://archstandard.org/"
}
MARKER

echo ""
echo "=== Done ==="
echo ""
echo "Version ${VERSION} snapshot saved to ${TARGET_DIR}/"
echo "It will be served at https://archstandard.org/v${VERSION}/"
echo ""
echo "Next steps:"
echo "  1. Commit the snapshot: git add ${TARGET_DIR} && git commit -m 'Snapshot v${VERSION}'"
echo "  2. Tag the release: git tag -a v${VERSION}.0.0 -m 'ADS v${VERSION} release'"
echo "  3. Push: git push origin main --tags"
