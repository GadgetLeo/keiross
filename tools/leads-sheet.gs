/**
 * Keiross website → Google Sheet lead log.
 * Paste into Extensions → Apps Script of your "Keiross Leads" sheet, set SECRET,
 * then Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone).
 * Put the web-app URL in Vercel as LEADS_SHEET_WEBHOOK and the same SECRET as LEADS_SHEET_SECRET.
 * Full steps: docs/LEADS.md
 */
const SECRET = "change-me-to-a-long-random-string";
const HEADERS = ["Reference", "Received (IST)", "Name", "Firm", "Buyer type", "Phone", "Email", "City / State",
                 "Products", "Message", "Submitted from", "Location (approx.)", "Status", "Assigned to", "Notes"];

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.secret !== SECRET) return out({ ok: false, error: "forbidden" });
    const sh = SpreadsheetApp.getActive().getSheetByName("Leads") || SpreadsheetApp.getActive().insertSheet("Leads");
    if (sh.getLastRow() === 0) {
      sh.appendRow(HEADERS);
      sh.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#0b4f8a").setFontColor("#ffffff");
      sh.setFrozenRows(1);
    }
    const lock = LockService.getScriptLock(); lock.waitLock(10000);
    try {
      // "'" prefix keeps phone numbers as text (no scientific notation / lost leading zeros)
      sh.appendRow([d.id, d.received, d.name, d.firm, d.buyer, "'" + d.phone, d.email, d.city,
                    d.products, d.msg, d.source, d.geo, "New", "", ""]);
    } finally { lock.releaseLock(); }
    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
