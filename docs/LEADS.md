# Where website enquiries go

Every enquiry form on the site (the **Contact** page and the **home page**) posts to
`/api/lead`, a serverless function in this repo — `functions/api/lead.js` on Cloudflare Pages
(`api/lead.js` is the equivalent for Vercel). Each new lead
reaches you three ways within seconds:

| Channel | What you get | Setup |
|---|---|---|
| **Google Sheet** | One row per lead in a *Keiross Leads* sheet, with a *Status* dropdown (New → Called → Quoted → Won/Lost) and *Assigned to* / *Notes* columns. | Part 1 (10 min, free) |
| **Gmail alert** | The same Google script emails the lead to `keirosslifesciencepvtltd@gmail.com` with **Call** / **Reply on WhatsApp** buttons. *Reply* goes straight to the customer. | included in Part 1 |
| **WhatsApp alert** | A WhatsApp message to your phone via CallMeBot with the lead's name, phone and requirement. | Part 2 (3 min, free) |
| Function logs (always on) | If every channel is down, the full lead is still written to the function log. | none |

The visitor always sees a result:

* **Success** → "Thank you" with a reference number (e.g. `KL-260930-7Q2M`) and an optional *Chat on WhatsApp* button.
* **Server unavailable** → the enquiry is prefilled into *Send on WhatsApp* / *Send by Email* buttons, so the lead is not lost.

Spam protection: a hidden honeypot field, a minimum fill-time check, and server-side validation.

---

## Part 1 — Google Sheet + Gmail alert

Do this while logged in to **keirosslifesciencepvtltd@gmail.com** (alerts are sent from, and to, this account).

1. Go to <https://sheets.new> and name the sheet **Keiross Leads**.
2. Menu **Extensions → Apps Script**. Delete everything in the editor and paste the whole of
   [`tools/leads-sheet.gs`](../tools/leads-sheet.gs).
3. On line `const SECRET = "change-me-…"`, replace the text inside the quotes with a long random
   password (e.g. from <https://www.random.org/strings/>). Click 💾 **Save**.
4. In the function dropdown at the top choose **testSetup** and click ▶ **Run**.
   Google asks for permission → **Review permissions** → choose the account →
   *"Google hasn't verified this app"* → **Advanced → Go to (unsafe)** → **Allow**.
   (It's your own script; this warning is normal.) You should get a test email and see a
   **Leads** tab with one test row — delete that row.
5. **Deploy → New deployment** → ⚙ **Select type → Web app**
   * *Execute as:* **Me**
   * *Who has access:* **Anyone**
   → **Deploy** → copy the **Web app URL** (ends in `/exec`).
6. Send the **Web app URL** and the **SECRET** to your web developer, or add them yourself in
   Vercel → project **keiross** → **Settings → Environment Variables**:
   (Cloudflare: project → Settings → Variables and Secrets — see docs/HOSTING.md)
   * `LEADS_SHEET_WEBHOOK` = the Web app URL
   * `LEADS_SHEET_SECRET` = the secret
   then redeploy.

To alert more people by email, change `NOTIFY_EMAIL` in the script to a comma-separated list, then
**Deploy → Manage deployments → ✎ Edit → Version: New version → Deploy** (the URL stays the same).

Gmail limit: 100 alert emails per day on a free Google account — far above normal lead volume.

## Part 2 — WhatsApp alerts (CallMeBot)

Do this on the phone that should receive alerts (e.g. 91101 31716).

1. Open <https://www.callmebot.com/blog/free-api-whatsapp-messages/> and save the **CallMeBot
   WhatsApp number shown there** in your phone contacts.
2. Send that contact this exact WhatsApp message:
   `I allow callmebot to send me messages`
3. Within a couple of minutes it replies with **your API key** (a number like `123456`).
4. Send the key to your web developer, or add it in Vercel as
   * `CALLMEBOT` = `919110131716:123456` (your number with 91, a colon, then the key)

   For several people: `919110131716:123456,91XXXXXXXXXX:654321` (each person does steps 1–3).

CallMeBot is a free, unofficial service meant for personal alerts; messages can occasionally be
delayed. The Sheet and Gmail alert are the reliable record.

## Optional — Resend email channel

If you later want emails sent from your own domain (e.g. `enquiries@keirosslifescience.com`),
add `RESEND_API_KEY` (and `LEADS_FROM`, `LEADS_TO`) from <https://resend.com>. It runs alongside the
other channels.

## Test it

Submit the form on `/contact.html` with your own details. Within seconds you should get the email,
the WhatsApp message and a new sheet row. If something doesn't arrive, check Vercel →
Deployments → latest → **Logs** for `lead delivery failed` messages.
