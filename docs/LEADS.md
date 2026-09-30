# Where website enquiries go

Every enquiry form on the site (the **Contact** page and the **home page**) posts to
`/api/lead`, a Vercel serverless function in this repo (`api/lead.js`). It delivers
each lead to every channel you've switched on:

| Channel | What you get | Setup |
|---|---|---|
| **Email** (Resend) | A formatted email per lead with **Call** and **Reply on WhatsApp** buttons. Hitting *Reply* answers the customer directly. | 5 min, free |
| **Google Sheet** | One row per lead with a *Status* column (New → Called → Quoted → Won/Lost) so nothing falls through the cracks. | 10 min, free |
| **Vercel logs** (always on) | If both channels are down, the full lead is still written to the function log. | none |

The visitor always sees a result:

* **Success** → "Thank you" with a reference number (e.g. `KL-260930-7Q2M`) and an optional *Chat on WhatsApp* button.
* **Server unavailable** → the enquiry is prefilled into *Send on WhatsApp* / *Send by Email* buttons, so the lead is not lost.

Spam protection: a hidden honeypot field, a minimum fill-time check, and server-side validation.

---

## 1. Email alerts (Resend)

1. Sign up at <https://resend.com> **using `keirosslifesciencepvtltd@gmail.com`**.
   (Until you verify your own domain, Resend can only send to the address you signed up with — that's exactly where leads should go.)
2. Resend dashboard → **API Keys** → *Create API key* (permission: *Sending access*). Copy it.
3. Vercel → project **keiross** → **Settings → Environment Variables** → add
   * `RESEND_API_KEY` = the key (Environments: Production, Preview)
4. Redeploy (Deployments → ⋯ → Redeploy), or just push any change.

Optional:
* `LEADS_TO` — send to other/extra addresses, comma-separated (needs a verified domain in Resend).
* `LEADS_FROM` — once your domain (e.g. `keirosslifescience.com`) is verified in Resend, set to
  `Keiross Website <enquiries@keirosslifescience.com>`.

## 2. Google Sheet lead log

1. Create a Google Sheet named **Keiross Leads** (in the company Google account).
2. **Extensions → Apps Script**. Delete the sample code, paste in `tools/leads-sheet.gs` from this repo.
3. Change `SECRET` at the top to a long random string (e.g. from <https://www.random.org/strings/>). Save.
4. **Deploy → New deployment** → type **Web app** → *Execute as:* **Me** → *Who has access:* **Anyone** → Deploy → authorise.
5. Copy the **Web app URL** (ends in `/exec`).
6. In Vercel add:
   * `LEADS_SHEET_WEBHOOK` = the web app URL
   * `LEADS_SHEET_SECRET` = the same secret string
7. Redeploy. The first lead creates a **Leads** tab with headers automatically.

Tip: share the sheet with the sales team and turn on **Tools → Notification settings → Any changes** to get a Google alert per new row.

## 3. Test it

Submit the form on `/contact.html` with your own details. You should get the email and a new row within a few seconds.
If nothing arrives, check Vercel → Deployments → latest → **Logs** for `lead delivery failed` messages.
