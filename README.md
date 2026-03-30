# ADS: Architecture Description Standard

A prescriptive standard defining the structure, content, and quality requirements for Solution Architecture Documents (SADs).

**Website:** [archstandard.org](https://archstandard.org) (once deployed)

## Quick Start

```bash
npm install
npm run dev        # Local dev server at localhost:4321
npm run build      # Production build to ./dist/
```

## Deploying to Cloudflare Pages

### Prerequisites

- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier is sufficient)
- This repo pushed to GitHub (already done: `github.com/andibing/archstandard`)

### Step 1: Create a Cloudflare Pages Project

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your account from the left sidebar
3. Navigate to **Workers & Pages** in the left sidebar
4. Click **Create** (top right)
5. Select the **Pages** tab
6. Click **Connect to Git**

### Step 2: Connect Your GitHub Repository

1. If prompted, authorise Cloudflare to access your GitHub account
2. Select the **andibing/archstandard** repository
3. Click **Begin setup**

### Step 3: Configure Build Settings

Set the following build configuration:

| Setting | Value |
|---------|-------|
| **Project name** | `archstandard` |
| **Production branch** | `main` |
| **Framework preset** | **Astro** |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |

Under **Environment variables**, add:

| Variable | Value |
|----------|-------|
| `NODE_VERSION` | `20` |

Click **Save and Deploy**.

### Step 4: Wait for First Deployment

The first build takes 1-2 minutes. You can watch the build log in real time.

Once complete, your site will be live at:
`https://archstandard.pages.dev`

### Step 5: Add Custom Domain (archstandard.org)

1. In your Cloudflare Pages project, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter `archstandard.org`
4. Follow the DNS configuration instructions:
   - If the domain is already on Cloudflare DNS: it will auto-configure
   - If elsewhere: add a CNAME record pointing to `archstandard.pages.dev`
5. Also add `www.archstandard.org` as a redirect to the apex domain

### Step 6: Verify

After DNS propagation (usually minutes, up to 48 hours):
- `https://archstandard.org` should serve the site
- SSL certificate is automatic
- Every push to `main` will auto-deploy

### Troubleshooting

| Issue | Fix |
|-------|-----|
| **Build fails with Node error** | Ensure `NODE_VERSION=20` is set in environment variables |
| **Build fails with Wrangler error** | Ensure Framework preset is set to **Astro** (not None) |
| **Build succeeds but 404** | Check build output directory is `dist` |
| **Custom domain not working** | Check DNS propagation with `dig archstandard.org` |
| **Old content showing** | Cloudflare caches aggressively; try purging cache in the dashboard |

## Project Structure

```
.
├── src/
│   ├── content/docs/          # All standard pages (.mdx)
│   │   ├── index.mdx          # Landing page
│   │   └── standard/          # Standard sections (0-7)
│   ├── assets/                # Images and SVGs
│   └── styles/custom.css      # Custom styles
├── public/
│   └── templates/             # Downloadable SAD templates (MD, YAML, JSON)
├── schema/
│   └── ads.schema.json  # JSON Schema for validation
├── astro.config.mjs           # Site configuration and sidebar
└── package.json
```

## Commands

| Command | Action |
|---------|--------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview production build locally |

## Licence

This standard is published by ArchStandard. Licence details TBC.
