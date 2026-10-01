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

  /* Product image slider: one image at a time, moved by the number buttons, arrows or a swipe. */
  document.querySelectorAll("[data-slider]").forEach(g => {
    const strip = g.querySelector(".pstrip"), slides = [...strip.children], nums = [...g.querySelectorAll(".pnums button")];
    const arrows = [...g.querySelectorAll(".parr")];
    if (!nums.length) return;
    let cur = 0;
    const show = i => {
      cur = Math.max(0, Math.min(slides.length - 1, i));
      strip.style.transform = `translateX(${-100 * cur}%)`;
      slides.forEach((s, j) => { s.toggleAttribute("aria-hidden", j !== cur); s.tabIndex = j === cur ? 0 : -1; });
      nums.forEach((b, j) => j === cur ? b.setAttribute("aria-current", "true") : b.removeAttribute("aria-current"));
      arrows[0].disabled = cur === 0; arrows[1].disabled = cur === slides.length - 1;
    };
    nums.forEach((b, j) => b.addEventListener("click", () => show(j)));
    arrows.forEach(b => b.addEventListener("click", () => show(cur + +b.dataset.step)));
    let x0 = null;
    strip.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
    strip.addEventListener("touchend", e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1)); });
    show(0);
  });
});
