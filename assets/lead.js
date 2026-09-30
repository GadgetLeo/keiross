/* Enquiry forms (form[data-lead]) → POST /api/lead.
   Shows a confirmation with the lead reference; if the server can't take the
   lead, offers WhatsApp / email with the enquiry prefilled so it is never lost.
   Needs data/site.js and assets/common.js loaded first. */
(function(){
  const forms = document.querySelectorAll("form[data-lead]");
  if (!forms.length) return;
  const api = (document.querySelector('meta[name="lead-api"]') || {}).content || "/api/lead";
  const params = new URLSearchParams(location.search);

  forms.forEach(form => {
    const status = form.querySelector("[data-status]");
    const btn = form.querySelector('button[type="submit"]');
    form.querySelector('input[name="t"]').value = Date.now();

    // Prefill from ?product= / ?type=
    const prod = params.get("product"), type = params.get("type");
    if (prod && form.products){
      const box = form.querySelector(`input[name="pick"][value="${CSS.escape(prod)}"]`);
      if (box){ box.checked = true; const d = box.closest("details"); if (d) d.open = true; }
      else form.products.value = prod;
    }
    if (type && form.buyer && [...form.buyer.options].some(o => o.value === type)) form.buyer.value = type;

    const setStatus = (msg, kind) => { if (status){ status.textContent = msg; status.dataset.kind = kind || ""; } };

    form.addEventListener("submit", async e => {
      e.preventDefault();
      form.querySelectorAll(".bad").forEach(x => x.classList.remove("bad"));
      const f = new FormData(form);
      const picks = f.getAll("pick");
      const data = {
        name: f.get("name"), firm: f.get("firm"), phone: f.get("phone"), email: f.get("email"),
        buyer: f.get("buyer"), city: f.get("city"), msg: f.get("msg"),
        products: [picks.join(", "), f.get("products")].filter(Boolean).join(", "),
        consent: !!f.get("consent"), website: f.get("website"), t: f.get("t"),
        source: document.title.split("|")[0].trim() + " — " + location.pathname + (location.search || "")
      };

      // quick client-side checks (the server validates again)
      const bad = [];
      if (!data.name || data.name.trim().length < 2) bad.push("name");
      const digits = (data.phone || "").replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 13) bad.push("phone");
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) bad.push("email");
      if (!data.consent) bad.push("consent");
      if (bad.length){
        bad.forEach(n => { const el = form.elements[n]; if (el) (el.closest("label") || el).classList.add("bad"); });
        setStatus(bad.includes("consent") && bad.length === 1 ? "Please tick the consent box to continue." : "Please check the highlighted fields.", "err");
        const first = form.elements[bad[0]]; if (first) first.focus();
        return;
      }

      btn.disabled = true; const label = btn.textContent; btn.textContent = "Sending…"; setStatus("");
      let res = null;
      try {
        const r = await fetch(api, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        res = await r.json().catch(() => null);
        if (r.status === 400 && res && res.fields){
          res.fields.forEach(n => { const el = form.elements[n]; if (el) (el.closest("label") || el).classList.add("bad"); });
          setStatus("Please check the highlighted fields.", "err");
          btn.disabled = false; btn.textContent = label; return;
        }
      } catch (_) { res = null; }
      btn.disabled = false; btn.textContent = label;

      const summary = [
        `Enquiry for Keiross Lifescience${res && res.id ? " (ref " + res.id + ")" : ""}`,
        `Name: ${data.name}`, `Firm: ${data.firm || "-"}`, `Type: ${data.buyer}`, `City/State: ${data.city || "-"}`,
        `Phone: ${data.phone}`, `Email: ${data.email || "-"}`, `Products: ${data.products || "-"}`, `Message: ${data.msg || "-"}`
      ].join("\n");
      const wa = (SITE.whatsapp || "").replace(/\D/g, "");
      const waUrl = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(summary)}` : "";
      const mailUrl = SITE.email ? `mailto:${SITE.email}?subject=${encodeURIComponent("Business enquiry from " + data.name)}&body=${encodeURIComponent(summary)}` : "";

      const done = document.createElement("div");
      done.className = "leaddone";
      if (res && res.ok){
        done.innerHTML = `<div class="tick" aria-hidden="true">✓</div>
          <h3>Thank you, ${esc(data.name.split(" ")[0])}!</h3>
          <p>We've received your enquiry. Our team will call you on <b>${esc(data.phone)}</b> within one business day.</p>
          <p class="ref">Reference: <b>${esc(res.id)}</b></p>
          <div class="acts">${waUrl ? `<a class="btn" href="${waUrl}" target="_blank" rel="noopener">Need it urgently? Chat on WhatsApp</a>` : ""}
          <button type="button" class="btn line-dark" data-again>Send another enquiry</button></div>`;
        if (window.gtag) gtag("event", "generate_lead", { lead_type: data.buyer });
      } else {
        done.innerHTML = `<div class="tick warn" aria-hidden="true">!</div>
          <h3>Almost there — one more tap</h3>
          <p>We couldn't submit the form just now. Please send your enquiry directly — it's already filled in for you:</p>
          <div class="acts">${waUrl ? `<a class="btn" href="${waUrl}" target="_blank" rel="noopener">Send on WhatsApp</a>` : ""}
          ${mailUrl ? `<a class="btn blue" href="${mailUrl}">Send by Email</a>` : ""}
          <button type="button" class="btn line-dark" data-again>Back to form</button></div>
          ${SITE.phone ? `<p class="ref">Or call us: <a href="tel:${esc(SITE.phone.replace(/\s/g, ""))}">${esc(SITE.phone)}</a></p>` : ""}`;
      }
      form.hidden = true;
      form.after(done);
      done.scrollIntoView({ block: "center", behavior: "smooth" });
      done.querySelector("[data-again]").addEventListener("click", () => {
        done.remove(); form.hidden = false;
        if (res && res.ok){ form.reset(); form.querySelector('input[name="t"]').value = Date.now(); }
        setStatus("");
      });
    });
  });
})();
