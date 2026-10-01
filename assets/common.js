/* Shared helpers for the home page and product pages. Needs data/site.js loaded first. */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const SLOT = { phone:"Phone to be added", whatsapp:"WhatsApp to be added", email:"Email to be added", hours:"Hours to be added", gstin:"To be added" };

function fillConfig(){
  document.querySelectorAll("[data-cfg]").forEach(el => {
    const k = el.dataset.cfg, v = SITE[k];
    if (!v && el.closest("[data-optional]")) { el.closest("[data-optional]").hidden = true; return; }
    if (!v) { el.innerHTML = `<span class="slot">${SLOT[k]}</span>`; return; }
    if (k==="phone") el.innerHTML = `<a href="tel:${esc(v.replace(/\s/g,""))}">${esc(v)}</a>`;
    else if (k==="whatsapp") el.innerHTML = `<a href="https://wa.me/${esc(v.replace(/\D/g,""))}" target="_blank" rel="noopener">WhatsApp: +${esc(v.replace(/\D/g,""))}</a>`;
    else if (k==="email") el.innerHTML = `<a href="mailto:${esc(v)}">${esc(v)}</a>`;
    else el.textContent = v;
  });
}

/* Opens WhatsApp or email with a prefilled message. Returns false when neither is configured. */
function send(text, subject, via){
  const wa = SITE.whatsapp.replace(/\D/g,"");
  if (via!=="mail" && wa){ window.open(`https://wa.me/${wa}?text=${encodeURIComponent(text)}`,"_blank","noopener"); return true; }
  if (SITE.email){ location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`; return true; }
  if (wa){ window.open(`https://wa.me/${wa}?text=${encodeURIComponent(text)}`,"_blank","noopener"); return true; }
  return false;
}

function enquiryText(p){
  const t = `${p.brand} (${p.composition})`;
  return { t, text:`Hello Keiross, I would like to enquire about ${t}. Please share availability, pack sizes and trade terms.`, subject:`Product enquiry: ${p.brand}` };
}

document.addEventListener("DOMContentLoaded", () => {
  fillConfig();
  const yr = $("#yr"); if (yr) yr.textContent = new Date().getFullYear();
  const menu = $("#menu"), burger = $("#burger");
  if (menu && burger){
    burger.addEventListener("click", () => { const o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    menu.addEventListener("click", e => {
      // mobile: the chevron next to "Products" expands the category list
      const t = e.target.closest(".ddt,.subt");
      if (t){ const box = t.parentElement, o = box.classList.toggle("open"); t.setAttribute("aria-expanded", o); return; }
      if (e.target.closest("a")) { menu.classList.remove("open"); burger.setAttribute("aria-expanded", false); }
    });
  }

  /* Product image gallery: scroll-snap track with arrows and dots. */
  document.querySelectorAll("[data-gal]").forEach(g => {
    const t = g.querySelector(".gtrack"), dots = [...g.querySelectorAll(".gdots button")];
    const prev = g.querySelector(".gprev"), next = g.querySelector(".gnext"), n = t.children.length;
    const cur = () => Math.round(t.scrollLeft / t.clientWidth);
    const go = i => t.scrollTo({ left: Math.max(0, Math.min(n - 1, i)) * t.clientWidth });
    const sync = () => { const i = cur(); dots.forEach((d, j) => j === i ? d.setAttribute("aria-current", "true") : d.removeAttribute("aria-current"));
      if (prev) { prev.disabled = i === 0; next.disabled = i === n - 1; } };
    dots.forEach((d, j) => d.addEventListener("click", () => go(j)));
    if (prev) { prev.addEventListener("click", () => go(cur() - 1)); next.addEventListener("click", () => go(cur() + 1)); }
    t.addEventListener("keydown", e => { if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); go(cur() + (e.key === "ArrowRight" ? 1 : -1)); } });
    t.addEventListener("scroll", () => requestAnimationFrame(sync), { passive: true });
    sync();
  });
});
