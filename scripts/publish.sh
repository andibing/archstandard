#!/bin/bash
# ADS Publish Script
# Regenerates templates from schema, builds the site, and pushes to deploy.
#
# Usage:
#   ./scripts/publish.sh "commit message"
#   ./scripts/publish.sh                    # uses default message
#
# What it does:
#   1. Regenerates templates from the JSON Schema
#   2. Builds the site to verify no errors
#   3. Stages all changes
#   4. Commits with the provided message
#   5. Pushes to origin/main (triggers Cloudflare auto-deploy)

set -e

COMMIT_MSG="${1:-Update ADS standard}"

echo "=== ADS Publish ==="
echo ""

# 1. Regenerate templates from schema
echo "[1/5] Regenerating templates from schema..."
npm run generate:templates
echo ""

# 2. Build the site
echo "[2/5] Building site..."
npm run build
echo ""

# 3. Stage all changes
echo "[3/5] Staging changes..."
git add -A
echo ""

# 4. Check if there are changes to commit
if git diff --cached --quiet; then
    echo "No changes to commit. Site is up to date."
    exit 0
fi

# Show what's being committed
echo "Changes to be committed:"
git diff --cached --stat
echo ""

# 5. Commit
echo "[4/5] Committing..."
git commit -m "$COMMIT_MSG"
echo ""

# 6. Push
echo "[5/5] Pushing to origin/main..."
git push origin main
echo ""

echo "=== Done ==="
echo "Cloudflare will auto-deploy from main."
echo "Check https://archstandard.org in a few minutes."
