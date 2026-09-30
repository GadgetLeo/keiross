# Hosting — Cloudflare Workers (free)

> The project is a **Cloudflare Worker with static assets** (Cloudflare's current
> recommendation; it replaced Pages for new projects). `wrangler.jsonc` configures it,
> `src/worker.js` handles `/api/*` and serves every other path from the repo's files.
> `.assetsignore` keeps source/docs out of the public site.


The site is a static site plus one serverless function (`functions/api/lead.js`, the
enquiry form). Cloudflare hosts both for free, allows commercial use, and
redeploys automatically on every push to the `main` branch on GitHub.

Workflow once set up: ask Claude for a change → Claude edits, runs `node tools/build.js`,
tests and pushes → Cloudflare publishes in ~1 minute. Pushes to other branches get a preview version link.

## Current setup (done)

* Worker **keiross** on account vbarnwal68, connected to GitHub **GadgetLeo/keiross**
  (Workers Builds, production branch `main`, deploy command `npx wrangler deploy`).
* Live at `https://keiross.vbarnwal68.workers.dev`.
* `LEADS_SHEET_WEBHOOK` is set in `wrangler.jsonc`. Secrets are added in the dashboard:
  **Workers & Pages → keiross → Settings → Variables and Secrets → + Add** (type **Secret**):

  | Name | Value |
  |---|---|
  | `LEADS_SHEET_SECRET` | the same secret as in the Apps Script |
  | `CALLMEBOT` *(optional)* | `919110131716:APIKEY` for WhatsApp alerts |

  `keep_vars` in wrangler.jsonc stops deploys from wiping dashboard values.

## Custom domain

**keiross → Settings → Domains & Routes → + Add → Custom domain**:
* **Domain bought on Cloudflare** (Domain Registration → Register; `.com` at cost ≈ $10/yr): connects automatically.
* **Domain bought elsewhere**: add it as a site in Cloudflare (free plan), change the domain's
  **nameservers** at the registrar to the two shown, then add it (and `www.`) as a custom domain.

Then tell Claude the domain: `data/site.js → url` gets updated and the site rebuilt so canonical
URLs, the sitemap and social previews use it. After that, retire Vercel (project → Settings → Delete).

## Notes

* URLs are extension-less (`/about`, `/contact`, `/products/keifix-o`). Cloudflare serves
  `about.html` for `/about` and redirects any old `.html` link to the clean URL.
* `_headers` sets caching and basic security headers (Cloudflare only).
* `404.html` is served automatically for unknown URLs.
* Logs for the lead function: **Workers & Pages → keiross → Observability**
  (look for `lead delivery failed`).
* Free-plan limits: unlimited bandwidth and requests for pages; 100,000 Worker requests/day
  (static files are free and unlimited); 3,000 build minutes/month — far above this site's needs.
