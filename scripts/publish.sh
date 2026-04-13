#!/bin/bash
# ADS Publish Script
# Validates, regenerates, builds, and pushes to deploy.
#
# Usage:
#   ./scripts/publish.sh "commit message"
#   ./scripts/publish.sh                    # uses default message
#
# What it does:
#   1. Validates the project (terminology, files, schema, translations)
#   2. Regenerates templates from the JSON Schema
#   3. Builds the site to verify no errors
#   4. Stages all changes
#   5. Commits with the provided message
#   6. Pushes to origin/main (triggers Cloudflare auto-deploy)

set -e

COMMIT_MSG="${1:-Update ADS standard}"

echo "=== ADS Publish ==="
echo ""

# 1. Validate
echo "[1/6] Validating project..."
npm run validate
echo ""

# 2. Regenerate templates from schema
echo "[2/6] Regenerating templates from schema..."
npm run generate:templates
echo ""

# 3. Build the site
echo "[3/6] Building site..."
npm run build
echo ""

# 4. Stage all changes
echo "[4/6] Staging changes..."
git add -A
echo ""

# 5. Check if there are changes to commit
if git diff --cached --quiet; then
    echo "No changes to commit. Site is up to date."
    exit 0
fi

# Show what's being committed
echo "Changes to be committed:"
git diff --cached --stat
echo ""

# 6. Commit
echo "[5/6] Committing..."
git commit -m "$COMMIT_MSG"
echo ""

# 7. Push
echo "[6/6] Pushing to origin/main..."
git push origin main
echo ""

echo "=== Done ==="
echo "Cloudflare will auto-deploy from main."
echo "Check https://archstandard.org in a few minutes."
