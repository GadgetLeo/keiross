/**
 * Keiross website → Google Sheet lead log + Gmail alert.
 *
 * Every enquiry from the website:
 *   1. is added as a row to the "Leads" tab of this sheet, and
 *   2. is emailed to NOTIFY_EMAIL from this Google account (Reply goes to the customer).
 *
 * Setup (full steps in docs/LEADS.md):
 *   - Paste this into Extensions → Apps Script of your "Keiross Leads" sheet.
 *   - Change SECRET below to a long random string. Save.
 *   - Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone) → authorise.
 *   - Send the web-app URL (…/exec) and the SECRET to whoever manages the website
 *     (they go into Vercel as LEADS_SHEET_WEBHOOK and LEADS_SHEET_SECRET).
 *   - After editing this script later: Deploy → Manage deployments → ✎ → Version: New → Deploy.
 */
const SECRET = "change-me-to-a-long-random-string";
const NOTIFY_EMAIL = "keirosslifesciencepvtltd@gmail.com";   // comma-separate for more people

const HEADERS = ["Reference", "Received (IST)", "Name", "Firm", "Buyer type", "Phone", "Email", "City / State",
                 "Products", "Message", "Submitted from", "Location (approx.)", "Status", "Assigned to", "Notes"];

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.secret !== SECRET) return out({ ok: false, error: "forbidden" });

    // 1. Log to the sheet
    const ss = SpreadsheetApp.getActive();
    const sh = ss.getSheetByName("Leads") || ss.insertSheet("Leads");
    const lock = LockService.getScriptLock(); lock.waitLock(10000);
    try {
      if (sh.getLastRow() === 0) {
        sh.appendRow(HEADERS);
        sh.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#0b4f8a").setFontColor("#ffffff");
        sh.setFrozenRows(1);
        sh.getRange("M2:M").setDataValidation(SpreadsheetApp.newDataValidation()
          .requireValueInList(["New", "Called", "Quoted", "Won", "Lost", "Not reachable"], true).build());
      }
      // "'" prefix keeps phone numbers as text (no lost leading zeros / scientific notation)
      sh.appendRow([d.id, d.received, d.name, d.firm, d.buyer, "'" + d.phone, d.email, d.city,
                    d.products, d.msg, d.source, d.geo, "New", "", ""]);
    } finally { lock.releaseLock(); }

    // 2. Email alert (a failure here must not lose the row above)
    let emailed = false;
    try { sendAlert(d, ss.getUrl()); emailed = true; } catch (err) { console.error("email failed: " + err); }

    return out({ ok: true, emailed: emailed });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}

function sendAlert(d, sheetUrl) {
  const rows = [["Reference", d.id], ["Name", d.name], ["Firm", d.firm], ["Buyer type", d.buyer], ["Phone", d.phone],
                ["Email", d.email], ["City / State", d.city], ["Products", d.products], ["Message", d.msg],
                ["Submitted from", d.source], ["Received", d.received], ["Location (approx.)", d.geo]];
  const esc = s => String(s || "—").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  let num = String(d.phone || "").replace(/\D/g, "").replace(/^0+/, "");
  if (num.length === 10) num = "91" + num;
  const waText = encodeURIComponent("Hello " + d.name + ", thank you for your enquiry with Keiross Lifescience (ref " + d.id + ").");
  const html =
    '<div style="font-family:Arial,sans-serif;max-width:620px">' +
    '<h2 style="color:#0b4f8a;margin:0 0 4px">New enquiry — ' + esc(d.buyer) + '</h2>' +
    '<p style="color:#5b6c7d;margin:0 0 16px">' + esc(d.name) + (d.firm ? " · " + esc(d.firm) : "") + (d.city ? " · " + esc(d.city) : "") + '</p>' +
    '<table style="border-collapse:collapse;width:100%;font-size:14px">' +
    rows.map(r => '<tr><td style="padding:8px 10px;border-bottom:1px solid #e5edf3;color:#5b6c7d;width:150px;vertical-align:top">' + r[0] +
                  '</td><td style="padding:8px 10px;border-bottom:1px solid #e5edf3;white-space:pre-wrap">' + esc(r[1]) + '</td></tr>').join("") +
    '</table><p style="margin:20px 0 0">' +
    '<a href="tel:+' + num + '" style="background:#0b4f8a;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;margin-right:8px">Call</a>' +
    '<a href="https://wa.me/' + num + '?text=' + waText + '" style="background:#10a393;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;margin-right:8px">Reply on WhatsApp</a>' +
    '<a href="' + sheetUrl + '" style="color:#0b4f8a">Open lead sheet</a></p></div>';
  const opts = { to: NOTIFY_EMAIL, subject: "[Lead " + d.id + "] " + d.buyer + ": " + d.name + (d.city ? ", " + d.city : ""),
                 htmlBody: html, body: rows.map(r => r[0] + ": " + (r[1] || "—")).join("\n"), name: "Keiross Website" };
  if (d.email) opts.replyTo = d.email;
  MailApp.sendEmail(opts);
}

/** Run once from the editor (▶ testSetup) to grant permissions and see a sample row + email. */
function testSetup() {
  const r = doPost({ postData: { contents: JSON.stringify({ secret: SECRET, id: "KL-TEST", received: new Date().toString(),
    name: "Test Lead", firm: "Test Pharma", buyer: "Distributor", phone: "9110131716", email: "", city: "Ahmedabad",
    products: "Keifix-O", msg: "Setup test — delete this row", source: "Apps Script test", geo: "" }) } });
  Logger.log(r.getContent());
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
