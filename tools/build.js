#!/usr/bin/env node
/* Generates one static page per product (products/<slug>.html) plus sitemap.xml
   from data/products.js. Run from the repo root:  node tools/build.js          */
const fs = require("fs"), path = require("path"), vm = require("vm");

const ROOT = path.join(__dirname, "..");
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, "data/products.js"), "utf8"), ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, "data/site.js"), "utf8"), ctx);
const { AREAS, PRODUCTS, SITE } = ctx.window;
const BASE = (SITE.url || "").replace(/\/$/, "");

const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const FORM_PL = { Tablet:"Tablets", Capsule:"Capsules", Softgel:"Softgel Capsules", Syrup:"Syrup", Suspension:"Suspension", Injection:"Injection", "Dry Syrup":"Dry Syrup" };
const formLabel = p => p.formLabel || FORM_PL[p.form] || p.form;
const TYPE = { rx:"Prescription medicine (℞)", ayurvedic:"Ayurvedic proprietary medicine", nutra:"Nutraceutical" };
const containsLbl = p => ({ Tablet:"Each tablet contains", Capsule:"Each capsule contains", Softgel:"Each softgel capsule contains", Injection:"Each vial contains", Syrup:"Composition", Suspension:"Each 5 ml contains" }[p.form] || "Composition");

const LOGO = `<svg class="mk" viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="12" fill="#0b4f8a"/><path d="M19 11h10v8h8v10h-8v8H19v-8h-8V19h8z" fill="#10a393"/><path d="M21.5 16v16M21.5 24l7-8M21.5 24l7 8" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;
const I = {
  pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
  phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
  wa:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .3-3.4-.7-2.8-1.2-4.6-4.1-4.8-4.3-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 .9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5 9-10"/></svg>'
};

function header(){
  return `
<div class="topstrip"><div class="wrap">
  <div class="grp"><span class="i">${I.pin}Ahmedabad, Gujarat, India</span><span class="i hide-m">${I.mail}<span data-cfg="email"></span></span></div>
  <div class="grp"><span class="i">${I.phone}<span data-cfg="phone"></span></span></div>
</div></div>
<header class="hdr"><div class="wrap">
  <a class="logo" href="../index.html" aria-label="Keiross Lifescience home">${LOGO}<span><b>KEIROSS</b><small>Lifescience</small></span></a>
  <button class="burger" id="burger" aria-label="Open menu" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
  <nav class="menu" id="menu">
    <a href="../index.html">Home</a>
    <a href="../index.html#about">About Us</a>
    <div class="dd"><a href="../index.html#products">Products ▾</a><div class="drop">
      <a href="../index.html#products">All Products</a>
      ${Object.keys(AREAS).filter(k => PRODUCTS.some(p => p.area===k)).map(k => `<a href="../index.html?area=${k}#products">${esc(AREAS[k].label)}</a>`).join("")}
    </div></div>
    <a href="../index.html#serve">Distributors</a>
    <a href="../index.html#contact">Contact Us</a>
    <a class="btn" href="../index.html#contact">Enquire Now</a>
  </nav>
</div></header>`;
}

function footer(){
  return `
<footer>
  <div class="wrap fmain">
    <div>
      <a class="logo" href="../index.html" style="margin-bottom:18px">${LOGO}<span><b>KEIROSS</b><small>Lifescience</small></span></a>
      <p>Caring for healthy life. Own-brand prescription medicines, pharmaceutical formulations and nutraceuticals for the trade.</p>
    </div>
    <div><h4>Therapy Areas</h4><ul>${Object.keys(AREAS).filter(k => PRODUCTS.some(p => p.area===k)).map(k => `<li><a href="../index.html?area=${k}#products">${esc(AREAS[k].label)}</a></li>`).join("")}</ul></div>
    <div><h4>Company</h4><ul><li><a href="../index.html#about">About Us</a></li><li><a href="../index.html#products">Products</a></li><li><a href="../index.html#serve">Distributors</a></li><li><a href="../index.html#contact">Contact Us</a></li></ul></div>
    <div><h4>Registered Office</h4>
      <p>304 Block-H, Merlin Sparsh, Opp. Koyli Talav, B/H Narol, Daskroi, Ahmedabad – 382405, Gujarat, India</p>
      <p><span data-cfg="phone"></span></p><p><span data-cfg="email"></span></p>
    </div>
  </div>
  <div class="fbot"><div class="wrap">
    <span>© <span id="yr">2026</span> Keiross Lifescience Pvt. Ltd. All rights reserved.</span>
    <span>Product information is intended for registered medical practitioners and the pharmaceutical trade.</span>
  </div></div>
</footer>`;
}

function card(p){
  const a = AREAS[p.area];
  return `<article class="pc" style="--area:${a.hex}">
    <a class="art" href="${p.slug}.html">${p.type==="rx"?'<span class="rxb">℞ Rx</span>':""}<img loading="lazy" src="../images/products/thumbs/${p.slug}.jpg" alt="${esc(p.brand)} product visual" width="640" height="414"></a>
    <div class="bd"><div class="ar">${esc(a.label)}</div><h3><a href="${p.slug}.html">${esc(p.brand)}</a></h3><div class="frm">${esc(formLabel(p))}</div><div class="cmp">${esc(p.composition)}</div>
    <div class="row"><a class="btn line-dark" href="${p.slug}.html">View details</a></div></div>
  </article>`;
}

function page(p){
  const a = AREAS[p.area];
  const url = `${BASE}/products/${p.slug}.html`;
  const desc = `${p.brand} ${formLabel(p)} — ${p.composition}. ${p.indications.slice(0,4).join(", ")}. Marketed by Keiross Lifescience.`;
  const related = PRODUCTS.filter(x => x.area===p.area && x.slug!==p.slug).concat(PRODUCTS.filter(x => x.area!==p.area)).slice(0,4);
  const ld = {
    "@context":"https://schema.org",
    "@graph":[
      Object.assign({
        "@type": p.type==="nutra" ? "DietarySupplement" : "Drug",
        "name": p.brand, "url": url, "image": `${BASE}/images/products/${p.slug}.jpg`,
        "description": desc, "activeIngredient": p.composition,
        "manufacturer": { "@type":"Organization", "name":"Keiross Lifescience Private Limited", "url": BASE || undefined }
      }, p.type==="rx" ? { "dosageForm": p.form, "prescriptionStatus":"https://schema.org/PrescriptionOnly" } : {}),
      { "@type":"BreadcrumbList", "itemListElement":[
        { "@type":"ListItem","position":1,"name":"Home","item":`${BASE}/` },
        { "@type":"ListItem","position":2,"name":"Products","item":`${BASE}/#products` },
        { "@type":"ListItem","position":3,"name":p.brand,"item":url }
      ]}
    ]
  };
  const benefits = p.benefits.map(b => `
        <div class="bcard">${b.title?`<h3>${esc(b.title)}</h3>`:""}${b.points.length?`<ul class="ticks sm">${b.points.map(t=>`<li>${esc(t)}</li>`).join("")}</ul>`:""}</div>`).join("");
  const table = p.table ? `
      <section class="psec"><h2>${esc(p.table.title)}</h2>
        <div class="tscroll"><table class="ctable"><thead><tr>${p.table.head.map(h=>`<th>${esc(h)}</th>`).join("")}</tr></thead>
        <tbody>${p.table.rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
        ${p.table.note?`<p class="note">${esc(p.table.note)}</p>`:""}
      </section>` : "";
  const variants = p.variants.length ? `
      <section class="psec"><h2>Also available</h2><div class="vgrid">
        ${p.variants.map(v=>`<div class="vcard"><b>${esc(v.brand)}</b><span class="fb">${esc(FORM_PL[v.form]||v.form)}</span><p>${esc(v.composition)}</p><button class="btn line-dark sm" data-enq-variant="${esc(v.brand)}|${esc(v.composition)}">Enquire</button></div>`).join("")}
      </div></section>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(p.brand)} ${esc(formLabel(p))} | ${esc(p.composition)} | Keiross Lifescience</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:title" content="${esc(p.brand)} ${esc(formLabel(p))} — Keiross Lifescience">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="product">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${BASE}/images/products/${p.slug}.jpg">
<meta name="theme-color" content="#0b4f8a">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' rx='12' fill='%230b4f8a'/%3E%3Cpath d='M19 11h10v8h8v10h-8v8H19v-8h-8V19h8z' fill='%2310a393'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Open+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/site.css">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body class="ppage" style="--area:${a.hex}">
${header()}
<main>
  <div class="crumbs"><div class="wrap"><a href="../index.html">Home</a><span>/</span><a href="../index.html#products">Products</a><span>/</span><a href="../index.html?area=${p.area}#products">${esc(a.label)}</a><span>/</span><b>${esc(p.brand)}</b></div></div>

  <section class="phero"><div class="wrap">
    <a class="pvis" href="../images/products/${p.slug}.jpg" target="_blank" rel="noopener" aria-label="Open full-size ${esc(p.brand)} brochure page">
      <img src="../images/products/${p.slug}.jpg" alt="${esc(p.brand)} — ${esc(p.composition)}" width="1400" height="906">
      <span class="zoom">Tap to enlarge</span>
    </a>
    <div class="pinfo">
      <div class="chips"><span class="chip area">${esc(a.label)}</span><span class="chip">${esc(formLabel(p))}</span>${p.type==="rx"?'<span class="chip rx">℞ Prescription</span>':p.type==="ayurvedic"?'<span class="chip">Ayurvedic</span>':""}</div>
      <h1>${esc(p.brand)}</h1>
      <p class="hl">${esc(p.headline)}</p>
      <div class="comp"><div class="lbl">${containsLbl(p)}</div><div>${esc(p.composition)}</div></div>
      <p class="tag">“${esc(p.tagline)}”</p>
      <div class="acts">
        <button class="btn" data-enq data-via="wa">${I.wa} WhatsApp Enquiry</button>
        <button class="btn blue" data-enq data-via="mail">Email Enquiry</button>
      </div>
      <small class="fine">${p.type==="rx"?"Prescription medicine — supplied to licensed trade buyers and for use under medical supervision only.":"Supplied to the trade. Read the label before use."}</small>
    </div>
  </div></section>

  <div class="wrap pbody">
    <div class="pmain">
      ${p.quote?`<blockquote class="pq">${esc(p.quote)}</blockquote>`:""}
      <section class="psec"><h2>Key benefits</h2><div class="bgrid">${benefits}
      </div></section>
      <section class="psec"><h2>${esc(p.indicationsTitle || "Indications")}</h2>
        <ul class="ind">${p.indications.map(t=>`<li>${I.check}${esc(t)}</li>`).join("")}</ul>
      </section>
      ${table}
      ${variants}
    </div>
    <aside class="pside">
      <div class="facts">
        <h3>Product facts</h3>
        <table>
          <tr><td>Brand</td><td>${esc(p.brand)}</td></tr>
          <tr><td>Dosage form</td><td>${esc(formLabel(p))}</td></tr>
          <tr><td>Therapy area</td><td>${esc(a.label)}</td></tr>
          <tr><td>Category</td><td>${esc(TYPE[p.type])}</td></tr>
          <tr><td>Pack size</td><td>On enquiry</td></tr>
          <tr><td>Marketed by</td><td>Keiross Lifescience Pvt. Ltd., Ahmedabad</td></tr>
        </table>
        <button class="btn full" data-enq data-via="wa">Request trade price</button>
      </div>
    </aside>
  </div>

  <section class="sec alt"><div class="wrap">
    <div class="title"><span class="kick">More from Keiross</span><h2>Related <span>Products</span></h2></div>
    <div class="pgrid">${related.map(card).join("")}</div>
  </div></section>
</main>
${footer()}
<script src="../data/site.js"></script>
<script src="../assets/common.js"></script>
<script>
const P = ${JSON.stringify({ brand:p.brand, composition:p.composition })};
document.addEventListener("click", e => {
  const b = e.target.closest("[data-enq]"), v = e.target.closest("[data-enq-variant]");
  if (!b && !v) return;
  let item = P;
  if (v){ const [brand, composition] = v.dataset.enqVariant.split("|"); item = { brand, composition }; }
  const m = enquiryText(item);
  if (!send(m.text, m.subject, b ? b.dataset.via : "wa")) location.href = "../index.html?product=" + encodeURIComponent(m.t) + "#contact";
});
</script>
</body>
</html>
`;
}

fs.mkdirSync(path.join(ROOT, "products"), { recursive: true });
for (const p of PRODUCTS) fs.writeFileSync(path.join(ROOT, "products", p.slug + ".html"), page(p));

const today = new Date().toISOString().slice(0,10);
fs.writeFileSync(path.join(ROOT, "sitemap.xml"),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${BASE}/</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>
${PRODUCTS.map(p => `  <url><loc>${BASE}/products/${p.slug}.html</loc><lastmod>${today}</lastmod><priority>0.8</priority></url>`).join("\n")}
</urlset>
`);
fs.writeFileSync(path.join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`);
console.log(`Built ${PRODUCTS.length} product pages + sitemap.xml`);
