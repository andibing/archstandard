# CI and deployment configuration

This directory holds the GitHub-side automation for the ADS site.

## What's here

| File | Purpose |
|------|---------|
| `workflows/build.yml` | Runs `npm run build` on every push / PR to `main` and `dev`. Catches build breakage before merge. Uploads `dist/` as an artefact for PR review. |
| `dependabot.yml` | Weekly npm bumps (grouped: Astro+Starlight as one PR, dev tooling as another) and monthly GitHub Actions bumps. |
| `ISSUE_TEMPLATE/` | Issue templates for bug reports, feature requests, etc. |

## Cloudflare Pages deploys

Cloudflare deploys from `main` and (with branch previews enabled) `dev`. The deploys are configured **in the Cloudflare dashboard**, not via GitHub Actions in this repo, because Cloudflare's GitHub integration is more efficient than running `wrangler` from CI.

### To enable commit status checks from Cloudflare → GitHub

By default, Cloudflare deploys silently. To get a green tick on each commit (visible in the GitHub UI and in PR status checks):

1. Open Cloudflare dashboard → **Workers & Pages → archstandard → Settings → Builds & deployments**
2. Find **GitHub integration** section
3. Toggle on **"Send deployment status to GitHub"** (the option may also be labelled "GitHub deployments" or "Status checks")
4. Save

Once enabled, each push will get a status check labelled something like `cloudflare-pages/archstandard` showing `pending → success` or `pending → failure` with a link to the deploy log.

This complements the `Build` GitHub Action — the Action validates the build can succeed; the Cloudflare status confirms the deploy actually shipped.

### Branch preview URLs

| Branch | Preview URL |
|--------|-------------|
| `main` | https://archstandard.org (production) |
| `dev`  | https://dev.archstandard.pages.dev/v1/ |
| Other  | https://&lt;branch-name&gt;.archstandard.pages.dev/v1/ (if branch previews are enabled for all non-prod branches) |

Per-commit immutable URLs follow `https://<7-char-sha>.archstandard.pages.dev/`.

## Adding a new workflow

Keep workflows minimal — every Action run uses GitHub Actions minutes (free tier is generous, but not unlimited for a public repo).

Good candidates:
- Lint (markdownlint, alex.js for inclusive-language sanity)
- Link checker (lychee runs once a week, opens issues for broken external links)
- Schema validation against examples (when the schema or any example changes, validate every example JSON against the schema)

Skip:
- Anything that duplicates Cloudflare's deploy
- Anything that runs on every push regardless of file changes (use path filters)

## Required permissions

The repository's GitHub App installation (Claude Code or otherwise) needs at minimum:
- **Contents:** Read & write (commits, branches)
- **Pull requests:** Read & write (PR creation/comments)
- **Metadata:** Read (default)

For workflows that post check statuses or comments:
- **Checks:** Read & write
- **Statuses:** Read & write

The workflows in this directory request the minimum needed and should not require additional secrets beyond `GITHUB_TOKEN` (auto-provided).
