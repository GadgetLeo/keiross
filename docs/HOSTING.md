# Hosting — Cloudflare Pages (free)

The site is a static site plus one serverless function (`functions/api/lead.js`, the
enquiry form). Cloudflare Pages hosts both for free, allows commercial use, and
redeploys automatically on every push to the `main` branch on GitHub.

Workflow once set up: ask Claude for a change → Claude edits, runs `node tools/build.js`,
tests and pushes → Cloudflare publishes in ~1 minute. Pushes to other branches get a
preview link (e.g. `https://<branch>.keiross.pages.dev`).

## One-time setup (~10 minutes)

1. **Create a free account** at <https://dash.cloudflare.com/sign-up>.

2. **Create the Pages project**
   - Dashboard → **Workers & Pages** → **Create** → **Pages** tab → **Import an existing Git repository**
     (a.k.a. *Connect to Git*).
   - Authorise GitHub and pick **GadgetLeo/keiross**.
   - **Project name:** `keiross` (becomes `keiross.pages.dev`; if taken, pick another).
   - **Production branch:** `main`
   - **Framework preset:** None
   - **Build command:** *(leave empty — the pages are already built and committed)*
   - **Build output directory:** `/`

3. **Add the lead-form settings** — on the same screen open **Environment variables (advanced)**
   (or later: project → **Settings → Variables and Secrets**) and add:

   | Name | Value | Type |
   |---|---|---|
   | `LEADS_SHEET_WEBHOOK` | your Apps Script web-app URL (ends in `/exec`) | Text |
   | `LEADS_SHEET_SECRET` | the same secret as in the Apps Script | **Secret** |
   | `CALLMEBOT` *(optional)* | `919110131716:APIKEY` for WhatsApp alerts | Secret |

4. **Save and Deploy.** After ~1 minute the site is live at `https://keiross.pages.dev`.
   If you added variables *after* the first deploy: **Deployments → ⋯ → Retry deployment**.

5. **Test** — submit the form at `https://keiross.pages.dev/contact` with "Test" in the message.
   You should see the green *Thank you* screen, a new sheet row and the Gmail alert.

6. **Custom domain** — project → **Custom domains → Set up a custom domain**:
   * **Domain bought on Cloudflare** (Dashboard → Domain Registration → Register; `.com` at cost ≈ $10/yr):
     it connects automatically.
   * **Domain bought elsewhere** (GoDaddy/Hostinger, e.g. a `.in`): add it as a site in Cloudflare
     (free plan) and change the domain's **nameservers** at your registrar to the two Cloudflare
     nameservers shown. Then add it under Custom domains. Also add the `www.` version.
   Then tell Claude the domain — `data/site.js → url` gets updated and the site rebuilt so canonical
   URLs, the sitemap and social previews use it.

7. **Let Claude manage it** — connect the **"Cloudflare Developer Platform"** connector at
   <https://claude.ai/customize/connectors>, then start a new Claude session.

8. **Retire Vercel** once the custom domain works on Cloudflare (Vercel → project → Settings → Delete).

## Notes

* URLs are extension-less (`/about`, `/contact`, `/products/keifix-o`). Cloudflare serves
  `about.html` for `/about` and redirects any old `.html` link to the clean URL.
* `_headers` sets caching and basic security headers (Cloudflare only).
* `404.html` is served automatically for unknown URLs.
* Logs for the lead function: project → **Deployments → latest → Functions → Real-time logs**
  (look for `lead delivery failed`).
* Free-plan limits: unlimited bandwidth and requests for pages; 100,000 function calls/day;
  500 builds/month — far above this site's needs.
