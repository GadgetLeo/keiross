/* ============================================================
   POST /api/lead — receives enquiries from the website forms.

   Delivers each lead to every channel that is configured
   (Vercel → Project → Settings → Environment Variables):

     LEADS_SHEET_WEBHOOK   Google Apps Script web-app URL: logs a row to the
     LEADS_SHEET_SECRET    "Keiross Leads" sheet AND emails the lead from Gmail
                           (script: tools/leads-sheet.gs)
     CALLMEBOT             WhatsApp alert via CallMeBot, as "phone:apikey"
                           e.g. "919110131716:123456" (comma-separate for more people)
     RESEND_API_KEY        Optional extra email channel (https://resend.com)
     LEADS_TO / LEADS_FROM Recipient / sender for the Resend channel

   The request succeeds if at least one channel accepts the lead.
   If none is configured or all fail, it returns 503 and the page
   offers WhatsApp / email as a fallback so the lead is not lost.
   See docs/LEADS.md for setup.
   ============================================================ */

const LIMITS = { name: 80, firm: 120, phone: 20, email: 120, buyer: 40, city: 80, products: 600, msg: 2000, source: 200, product: 120 };
const BUYERS = ["Distributor", "Stockist", "Pharmacy / Medical store", "Hospital", "Clinic", "Healthcare professional", "Other"];

const clean = (v, max) => String(v == null ? "" : v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim().slice(0, max);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function leadId() {
  const d = new Date(Date.now() + 5.5 * 3600e3); // IST
  const ymd = d.toISOString().slice(2, 10).replace(/-/g, "");
  return `KL-${ymd}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function validate(b) {
  const L = {};
  for (const k of Object.keys(LIMITS)) L[k] = clean(b[k], LIMITS[k]);
  const digits = L.phone.replace(/\D/g, "");
  const errors = [];
  if (L.name.length < 2) errors.push("name");
  if (digits.length < 10 || digits.length > 13) errors.push("phone");
  if (L.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(L.email)) errors.push("email");
  if (!BUYERS.includes(L.buyer)) L.buyer = "Other";
  if (b.consent !== true && b.consent !== "on" && b.consent !== "true") errors.push("consent");
  return { L, errors };
}

async function sendEmail(lead, meta) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ch: "email", skipped: true };
  const to = (process.env.LEADS_TO || "keirosslifesciencepvtltd@gmail.com").split(",").map(s => s.trim()).filter(Boolean);
  const from = process.env.LEADS_FROM || "Keiross Website <onboarding@resend.dev>";
  const rows = [
    ["Reference", meta.id], ["Name", lead.name], ["Firm", lead.firm || "—"], ["Buyer type", lead.buyer],
    ["Phone", lead.phone], ["Email", lead.email || "—"], ["City / State", lead.city || "—"],
    ["Products", lead.products || "—"], ["Message", lead.msg || "—"],
    ["Submitted from", lead.source || "—"], ["Received", meta.when], ["Location (approx.)", meta.geo || "—"]
  ];
  const wa = lead.phone.replace(/\D/g, "").replace(/^0+/, "");
  const waNum = wa.length === 10 ? "91" + wa : wa;
  const html = `<div style="font-family:Arial,sans-serif;max-width:620px">
    <h2 style="color:#0b4f8a;margin:0 0 4px">New enquiry — ${esc(lead.buyer)}</h2>
    <p style="color:#5b6c7d;margin:0 0 16px">${esc(lead.name)}${lead.firm ? " · " + esc(lead.firm) : ""}${lead.city ? " · " + esc(lead.city) : ""}</p>
    <table style="border-collapse:collapse;width:100%;font-size:14px">${rows.map(([k, v]) =>
      `<tr><td style="padding:8px 10px;border-bottom:1px solid #e5edf3;color:#5b6c7d;width:150px;vertical-align:top">${k}</td><td style="padding:8px 10px;border-bottom:1px solid #e5edf3;white-space:pre-wrap">${esc(v)}</td></tr>`).join("")}</table>
    <p style="margin:20px 0 0">
      <a href="tel:+${esc(waNum)}" style="background:#0b4f8a;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;margin-right:8px">Call</a>
      <a href="https://wa.me/${esc(waNum)}?text=${encodeURIComponent(`Hello ${lead.name}, thank you for your enquiry with Keiross Lifescience (ref ${meta.id}).`)}" style="background:#10a393;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Reply on WhatsApp</a>
    </p></div>`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    signal: AbortSignal.timeout(8000),
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from, to, subject: `[Lead ${meta.id}] ${lead.buyer}: ${lead.name}${lead.city ? ", " + lead.city : ""}`,
      html, text, ...(lead.email ? { reply_to: lead.email } : {})
    })
  });
  if (!r.ok) throw new Error(`email ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return { ch: "email", ok: true };
}

async function logSheet(lead, meta) {
  const url = process.env.LEADS_SHEET_WEBHOOK;
  if (!url) return { ch: "sheet", skipped: true };
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: process.env.LEADS_SHEET_SECRET || "", id: meta.id, received: meta.when, geo: meta.geo, ...lead }),
    redirect: "follow",
    signal: AbortSignal.timeout(9000)
  });
  const body = await r.text();
  if (!r.ok || !/"ok"\s*:\s*true/.test(body)) throw new Error(`sheet ${r.status}: ${body.slice(0, 200)}`);
  return { ch: "sheet", ok: true };
}

async function whatsappAlert(lead, meta) {
  const list = (process.env.CALLMEBOT || "").split(",").map(s => s.trim()).filter(Boolean);
  if (!list.length) return { ch: "whatsapp", skipped: true };
  const text = [
    `New lead ${meta.id}`,
    `${lead.name} (${lead.buyer})`,
    [lead.firm, lead.city].filter(Boolean).join(", "),
    `Phone: ${lead.phone}`,
    lead.email && `Email: ${lead.email}`,
    lead.products && `Products: ${lead.products.slice(0, 200)}`,
    lead.msg && `Msg: ${lead.msg.slice(0, 300)}`
  ].filter(Boolean).join("\n");
  const results = await Promise.allSettled(list.map(async entry => {
    const [phone, apikey] = entry.split(":").map(s => s.trim());
    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent("+" + phone.replace(/\D/g, ""))}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apikey || "")}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const body = await r.text();
    if (!r.ok || /error|invalid|not (active|allowed)/i.test(body)) throw new Error(`callmebot ${r.status}: ${body.replace(/<[^>]+>/g, " ").slice(0, 160)}`);
  }));
  const failed = results.filter(r => r.status === "rejected");
  if (failed.length === results.length) throw failed[0].reason;
  return { ch: "whatsapp", ok: true };
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ ok: false, error: "method" }); }

  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch { b = {}; } }
  b = b || {};

  // Spam traps: hidden honeypot field, and forms submitted faster than a human could.
  const elapsed = Number(b.t) ? Date.now() - Number(b.t) : 1e9;
  if (b.website || elapsed < 2500) return res.status(200).json({ ok: true, id: leadId() });

  const { L, errors } = validate(b);
  if (errors.length) return res.status(400).json({ ok: false, error: "invalid", fields: errors });

  const h = req.headers || {};
  const meta = {
    id: leadId(),
    when: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) + " IST",
    geo: [h["x-vercel-ip-city"], h["x-vercel-ip-country-region"], h["x-vercel-ip-country"]].filter(Boolean).map(decodeURIComponent).join(", ")
  };

  const results = await Promise.allSettled([logSheet(L, meta), whatsappAlert(L, meta), sendEmail(L, meta)]);
  const delivered = results.filter(r => r.status === "fulfilled" && r.value.ok).map(r => r.value.ch);
  results.filter(r => r.status === "rejected").forEach(r => console.error("lead delivery failed:", meta.id, r.reason && r.reason.message));

  if (!delivered.length) {
    console.error("lead NOT delivered:", meta.id, JSON.stringify(L));
    return res.status(503).json({ ok: false, error: "unavailable", id: meta.id });
  }
  return res.status(200).json({ ok: true, id: meta.id, delivered });
};
