#!/usr/bin/env node
/* Generates one static page per product (products/<slug>.html), about.html and
   sitemap.xml from data/*.js. Run from the repo root:  node tools/build.js          */
const fs = require("fs"), path = require("path"), vm = require("vm");

const ROOT = path.join(__dirname, "..");
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, "data/products.js"), "utf8"), ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, "data/site.js"), "utf8"), ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, "data/team.js"), "utf8"), ctx);
const { AREAS, PRODUCTS, SITE, TEAM } = ctx.window;
const BASE = (SITE.url || "").replace(/\/$/, "");

const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const FORM_PL = { Tablet:"Tablets", Capsule:"Capsules", Softgel:"Softgel Capsules", Syrup:"Syrup", Suspension:"Suspension", Injection:"Injection", "Dry Syrup":"Dry Syrup" };
const formLabel = p => p.formLabel || FORM_PL[p.form] || p.form;
const TYPE = { rx:"Prescription medicine (℞)", ayurvedic:"Ayurvedic proprietary medicine", nutra:"Nutraceutical" };
const containsLbl = p => ({ Tablet:"Each tablet contains", Capsule:"Each capsule contains", Softgel:"Each softgel capsule contains", Injection:"Each vial contains", Syrup:"Composition", Suspension:"Each 5 ml contains" }[p.form] || "Composition");

const LOGO = `<img class="mk" src="../images/brand/logo-mark.png" alt="" width="44" height="44">`;
const I = {
  pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
  phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
  wa:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .3-3.4-.7-2.8-1.2-4.6-4.1-4.8-4.3-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 .9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5 9-10"/></svg>'
};

/* ---------------- SEO: shared <head> + schema.org graph ----------------
   Every page gets one JSON-LD @graph that links to the same Organization
   and WebSite entities by @id, plus a WebPage node and breadcrumbs. */
const ORG_ID = `${BASE}/#organization`, WEBSITE_ID = `${BASE}/#website`;
const ADDRESS = { "@type":"PostalAddress", "streetAddress":"304 Block-H, Merlin Sparsh, Opp. Koyli Talav, B/H Narol", "addressLocality":"Daskroi, Ahmedabad", "addressRegion":"Gujarat", "postalCode":"382405", "addressCountry":"IN" };
const SPECIALTY = { anti:"Infectious", resp:"Pulmonary", gastro:"Gastroenterologic", pain:"Rheumatologic", bone:"Rheumatologic", neuro:"Neurologic", nutra:"DietNutrition", uro:"Urologic" };

/* width/height of a local JPEG or PNG (for og:image and ImageObject) */
function imgSize(rel){
  const d = fs.readFileSync(path.join(ROOT, rel));
  if (d.readUInt32BE(0) === 0x89504e47) return [d.readUInt32BE(16), d.readUInt32BE(20)];
  for (let i = 2; i < d.length;){
    if (d[i] !== 0xff){ i++; continue; }
    const m = d[i+1];
    if (m >= 0xc0 && m <= 0xc2) return [d.readUInt16BE(i+7), d.readUInt16BE(i+5)];
    i += 2 + d.readUInt16BE(i+2);
  }
  return [0, 0];
}
const imageObj = rel => { const [w, h] = imgSize(rel); return { "@type":"ImageObject", "url": `${BASE}/${rel}`, "width": w, "height": h }; };
const clip = (s, n) => s.length <= n ? s : s.slice(0, s.lastIndexOf(" ", n - 1)).replace(/[,.;:—-]+$/, "") + "…";
/* "Cefixime 200 mg + Ofloxacin 200 mg" -> "Cefixime + Ofloxacin" (max 3 molecules) */
const shortGeneric = p => {
  const parts = p.composition.split(/\s*\+\s*/).map(x => x.replace(/\s*\(.*?\)/g, "").replace(/\s+[\d.,]+\s*(mg|mcg|g|iu|IU|ml)\b.*$/i, "").replace(/\s+per\s+.*$/i, "").trim()).filter(Boolean);
  return parts.length > 3 ? parts.slice(0, 2).join(" + ") + " + more" : parts.join(" + ");
};

function orgNode(){
  return {
    "@type": "Corporation", "@id": ORG_ID,
    "name": "Keiross Lifescience", "legalName": "Keiross Lifescience Private Limited", "alternateName": ["Keiross", "Keiross Lifescience Pvt. Ltd."],
    "url": `${BASE}/`, "logo": imageObj("images/brand/logo-mark.png"), "image": imageObj("images/products/cover.jpg"),
    "slogan": "Caring for Healthy Life",
    "description": "Ahmedabad-based pharmaceutical company marketing own-brand prescription medicines, pharmaceutical formulations and nutraceuticals to distributors, stockists, pharmacies, hospitals and clinics across India.",
    "foundingDate": "2026-02-18", "foundingLocation": { "@type":"Place", "name":"Ahmedabad, Gujarat, India" },
    "identifier": { "@type":"PropertyValue", "propertyID":"CIN", "value":"U46497GJ2026PTC173763" },
    "taxID": SITE.gstin || undefined, "email": SITE.email || undefined, "telephone": SITE.phone || undefined,
    "address": ADDRESS,
    "contactPoint": [{ "@type":"ContactPoint", "contactType":"sales", "telephone": SITE.phone || undefined, "email": SITE.email || undefined, "areaServed":"IN", "availableLanguage":["English","Hindi","Gujarati"], "url": `${BASE}/contact.html` }],
    "areaServed": { "@type":"Country", "name":"India" },
    "knowsAbout": Object.keys(AREAS).filter(k => PRODUCTS.some(p => p.area===k)).map(k => AREAS[k].label),
    "numberOfEmployees": undefined,
    "member": TEAM.map(m => ({ "@type":"OrganizationRole", "roleName": m.role, "member": { "@type":"Person", "@id": `${BASE}/about.html#${m.name.toLowerCase().replace(/[^a-z]+/g, "-")}`, "name": m.name, "jobTitle": m.role } })),
    "sameAs": (SITE.sameAs || []).length ? SITE.sameAs : undefined
  };
}
function websiteNode(){
  return { "@type":"WebSite", "@id": WEBSITE_ID, "url": `${BASE}/`, "name":"Keiross Lifescience", "alternateName":"Keiross", "publisher": { "@id": ORG_ID }, "inLanguage":"en-IN" };
}

/* opts: r (root prefix), path (e.g. "products/keifix-o.html"), title, desc, type (WebPage subtype),
         image (site-relative path), ogType, crumbs [[name, path], ...], main (node or @id), extra (nodes), noindex */
function pageHead(o){
  const r = o.r == null ? "../" : o.r;
  const url = `${BASE}/${o.path || ""}`;
  const img = imageObj(o.image || "images/products/cover.jpg");
  const desc = clip(o.desc, 158);
  const graph = [orgNode(), websiteNode()];
  const page = {
    "@type": o.type || "WebPage", "@id": `${url}#webpage`, "url": url, "name": o.title, "description": desc,
    "isPartOf": { "@id": WEBSITE_ID }, "inLanguage":"en-IN", "primaryImageOfPage": img,
    "about": { "@id": ORG_ID }
  };
  if (o.crumbs){
    page.breadcrumb = { "@id": `${url}#breadcrumb` };
    graph.push({ "@type":"BreadcrumbList", "@id": `${url}#breadcrumb`, "itemListElement": o.crumbs.map(([name, p], i) => ({ "@type":"ListItem", "position": i+1, "name": name, "item": `${BASE}/${p}` })) });
  }
  if (o.main){ page.mainEntity = typeof o.main === "string" ? { "@id": o.main } : { "@id": o.main["@id"] }; if (typeof o.main !== "string") graph.push(o.main); }
  graph.push(page, ...(o.extra || []));
  const ld = JSON.stringify({ "@context":"https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="${o.noindex ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1"}">
${o.noindex ? "" : `<link rel="canonical" href="${url}">\n`}${SITE.googleVerification ? `<meta name="google-site-verification" content="${esc(SITE.googleVerification)}">\n` : ""}${SITE.bingVerification ? `<meta name="msvalidate.01" content="${esc(SITE.bingVerification)}">\n` : ""}<meta property="og:site_name" content="Keiross Lifescience">
<meta property="og:locale" content="en_IN">
<meta property="og:type" content="${o.ogType || "website"}">
<meta property="og:title" content="${esc(o.ogTitle || o.title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${img.url}">
<meta property="og:image:width" content="${img.width}">
<meta property="og:image:height" content="${img.height}">
<meta property="og:image:alt" content="${esc(o.imageAlt || o.title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(o.ogTitle || o.title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${img.url}">
<meta name="theme-color" content="#ffffff">
<link rel="icon" type="image/png" href="${r}images/brand/favicon.png">
<link rel="apple-touch-icon" href="${r}images/brand/logo-mark.png">
<link rel="manifest" href="${r}site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Open+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${r}assets/site.css">
<script type="application/ld+json">${ld}</script>`;
}

/* r = path from the page to the site root: "../" for products/, "" for root pages */
const rel = (html, r) => r === "../" ? html : html.replaceAll('href="../', `href="${r}`).replaceAll('src="../', `src="${r}`);

function header(r = "../"){
  return rel(`
<div class="topstrip"><div class="wrap">
  <div class="grp"><span class="i">${I.pin}Ahmedabad, Gujarat, India</span><span class="i hide-m">${I.mail}<span data-cfg="email"></span></span></div>
  <div class="grp"><span class="i">${I.phone}<span data-cfg="phone"></span></span></div>
</div></div>
<header class="hdr"><div class="wrap">
  <a class="logo" href="../index.html" aria-label="Keiross Lifescience home">${LOGO}<span><b>KEIROSS</b><small>Lifescience</small></span></a>
  <button class="burger" id="burger" aria-label="Open menu" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
  <nav class="menu" id="menu">
    <a href="../index.html">Home</a>
    <a href="../about.html">About Us</a>
    <div class="dd"><a href="../products/">Products ▾</a><div class="drop">
      <a href="../products/">All Products</a>
      ${Object.keys(AREAS).filter(k => PRODUCTS.some(p => p.area===k)).map(k => `<a href="../products/#${k}">${esc(AREAS[k].label)}</a>`).join("")}
    </div></div>
    <a href="../index.html#serve">Distributors</a>
    <a href="../contact.html">Contact Us</a>
    <a class="btn" href="../contact.html">Enquire Now</a>
  </nav>
</div></header>`, r);
}

function footer(r = "../"){
  return rel(`
<footer>
  <div class="wrap fmain">
    <div>
      <a class="logo" href="../index.html" style="margin-bottom:18px">${LOGO}<span><b>KEIROSS</b><small>Lifescience</small></span></a>
      <p>Caring for healthy life. Own-brand prescription medicines, pharmaceutical formulations and nutraceuticals for the trade.</p>
    </div>
    <div><h4>Therapy Areas</h4><ul>${Object.keys(AREAS).filter(k => PRODUCTS.some(p => p.area===k)).map(k => `<li><a href="../products/#${k}">${esc(AREAS[k].label)}</a></li>`).join("")}</ul></div>
    <div><h4>Company</h4><ul><li><a href="../about.html">About Us</a></li><li><a href="../products/">Products</a></li><li><a href="../index.html#serve">Distributors</a></li><li><a href="../contact.html">Contact Us</a></li></ul></div>
    <div><h4>Registered Office</h4>
      <p>304 Block-H, Merlin Sparsh, Opp. Koyli Talav, B/H Narol, Daskroi, Ahmedabad – 382405, Gujarat, India</p>
      <p><span data-cfg="phone"></span></p><p><span data-cfg="email"></span></p>
      <p>CIN: U46497GJ2026PTC173763<br>GSTIN: <span data-cfg="gstin"></span></p>
    </div>
  </div>
  <div class="fbot"><div class="wrap">
    <span>© <span id="yr">2026</span> Keiross Lifescience Pvt. Ltd. All rights reserved.</span>
    <span>Product information is intended for registered medical practitioners and the pharmaceutical trade.</span>
  </div></div>
</footer>`, r);
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
  const desc = `${p.brand} ${formLabel(p)} (${p.composition}) by Keiross Lifescience for ${p.indications.slice(0,4).join(", ").toLowerCase()}.`;
  const related = PRODUCTS.filter(x => x.area===p.area && x.slug!==p.slug).concat(PRODUCTS.filter(x => x.area!==p.area)).slice(0,4);
  const route = { Tablet:"Oral", Capsule:"Oral", Softgel:"Oral", Syrup:"Oral", Suspension:"Oral" }[p.form];
  const product = {
    "@type": p.type==="nutra" ? "DietarySupplement" : "Drug", "@id": `${url}#product`,
    "name": p.brand, "proprietaryName": p.brand, "nonProprietaryName": shortGeneric(p), "isProprietary": true,
    "url": url, "image": imageObj(`images/products/${p.slug}.jpg`), "description": desc,
    "activeIngredient": p.composition, "dosageForm": formLabel(p), "administrationRoute": route,
    "prescriptionStatus": p.type==="rx" ? "https://schema.org/PrescriptionOnly" : "https://schema.org/OTC",
    "relevantSpecialty": SPECIALTY[p.area] ? `https://schema.org/${SPECIALTY[p.area]}` : undefined,
    "mainEntityOfPage": { "@id": `${url}#webpage` }
  };
  const extra = p.variants.map((v, i) => ({ "@type":"Drug", "@id": `${url}#variant-${i+1}`, "name": v.brand, "proprietaryName": v.brand,
    "isProprietary": true, "activeIngredient": v.composition, "dosageForm": v.form, "subjectOf": { "@id": `${url}#webpage` } }));
  const t1 = `${p.brand} ${formLabel(p)} (${shortGeneric(p)}) | Keiross`;
  const title = t1.length <= 65 ? t1 : `${p.brand} ${formLabel(p)} | Keiross Lifescience`;
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
        ${p.variants.map(v=>`<div class="vcard"><b>${esc(v.brand)}</b><span class="fb">${esc(FORM_PL[v.form]||v.form)}</span><p>${esc(v.composition)}</p><a class="btn line-dark sm" href="../contact.html?product=${encodeURIComponent(v.brand)}">Enquire</a></div>`).join("")}
      </div></section>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
${pageHead({ r:"../", path:`products/${p.slug}.html`, title, ogTitle:`${p.brand} ${formLabel(p)} — Keiross Lifescience`, desc, type:"ItemPage", ogType:"product",
  image:`images/products/${p.slug}.jpg`, imageAlt:`${p.brand} — ${p.composition}`,
  crumbs:[["Home",""],["Products","products/"],[a.label,`products/#${p.area}`],[p.brand,`products/${p.slug}.html`]], main:product, extra })}
</head>
<body class="ppage" style="--area:${a.hex}">
${header()}
<main>
  <div class="crumbs"><div class="wrap"><a href="../index.html">Home</a><span>/</span><a href="../products/">Products</a><span>/</span><a href="../products/#${p.area}">${esc(a.label)}</a><span>/</span><b>${esc(p.brand)}</b></div></div>

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
        <a class="btn blue" href="../contact.html?product=${encodeURIComponent(p.brand)}">Send Enquiry</a>
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
        <a class="btn full" href="../contact.html?product=${encodeURIComponent(p.brand)}">Request trade price</a>
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
  if (!send(m.text, m.subject, b ? b.dataset.via : "wa")) location.href = "../contact.html?product=" + encodeURIComponent(item.brand);
});
</script>
</body>
</html>
`;
}

fs.mkdirSync(path.join(ROOT, "products"), { recursive: true });
for (const p of PRODUCTS) fs.writeFileSync(path.join(ROOT, "products", p.slug + ".html"), page(p));

/* ---------------- about.html ---------------- */
function aboutPage(){
  const areas = Object.keys(AREAS).filter(k => PRODUCTS.some(p => p.area===k));
  const initials = n => { const w = n.split(/\s+/).filter(Boolean); return (w[0][0] + (w.length > 1 ? w[w.length-1][0] : "")).toUpperCase(); };
  const person = m => `
      <article class="person">
        <div class="ph">${m.photo ? `<img src="${esc(m.photo)}" alt="${esc(m.name)}" width="600" height="600" loading="lazy">` : `<span aria-hidden="true">${esc(initials(m.name))}</span>`}</div>
        <div class="pb">
          <h3>${esc(m.name)}</h3>
          <div class="role">${esc(m.role)}</div>
          ${m.din ? `<div class="din">DIN: ${esc(m.din)}</div>` : ""}
          ${m.bio && m.bio.length ? m.bio.map(t => `<p>${esc(t)}</p>`).join("") : `<p class="soon">Profile coming soon.</p>`}
        </div>
      </article>`;
  const fact = (k, v) => `<tr><td>${k}</td><td>${v}</td></tr>`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
${pageHead({ r:"", path:"about.html", title:"About Us | Keiross Lifescience Pvt. Ltd.", ogTitle:"About Keiross Lifescience",
  desc:`Keiross Lifescience Private Limited is an Ahmedabad-based pharmaceutical company marketing ${PRODUCTS.length} own-brand medicines across ${areas.length} therapy areas. Meet our directors.`,
  type:"AboutPage", crumbs:[["Home",""],["About Us","about.html"]], main:ORG_ID })}
</head>
<body>
${header("")}
<main>
  <section class="pagehero">
    <div class="wrap">
      <div class="crumb"><a href="index.html">Home</a><span>/</span>About Us</div>
      <h1>Caring for <span>healthy life</span></h1>
      <p>A young pharmaceutical company building a trusted portfolio of own-brand medicines for doctors, pharmacies and distributors across India.</p>
    </div>
  </section>

  <section class="sec">
    <div class="wrap about">
      <div class="pic">
        <img src="images/products/cover.jpg" alt="Keiross Lifescience product catalogue cover" width="1600" height="904" style="aspect-ratio:auto;object-fit:contain;background:#fff">
        <div class="badge"><b>2026</b><span>Incorporated in Ahmedabad, Gujarat</span></div>
      </div>
      <div>
        <span class="kick">Who we are</span>
        <h2>Keiross Lifescience <span>Pvt. Ltd.</span></h2>
        <p>Keiross Lifescience Private Limited is a pharmaceutical healthcare company engaged in marketing quality pharmaceutical formulations and healthcare products under its own brand names.</p>
        <p>Our portfolio of ${PRODUCTS.length} brands spans ${areas.length} therapy areas — from anti-infectives and respiratory care to neurology, bone health and nutrition — in tablets, capsules, syrups, suspensions and injections. Every product is manufactured through approved, qualified pharmaceutical manufacturing partners.</p>
        <ul class="ticks">
          <li>${PRODUCTS.length} own brands, plus paediatric and strength variants</li>
          <li>Supplying distributors, stockists, pharmacies, hospitals and clinics</li>
          <li>Registered office in Ahmedabad, Gujarat; GST-registered in Jharkhand</li>
        </ul>
        <a class="btn blue" href="products/">View our products</a>
      </div>
    </div>
  </section>

  <section class="sec alt" id="leadership">
    <div class="wrap">
      <div class="title">
        <span class="kick">Leadership</span>
        <h2>Our <span>Directors</span></h2>
        <p>The people steering Keiross Lifescience.</p>
        <div class="bar-line"></div>
      </div>
      <div class="people">${TEAM.map(person).join("")}
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="wrap facts2">
      <div>
        <span class="kick">Company details</span>
        <h2>Registration <span>&amp; compliance</span></h2>
        <p>Keiross Lifescience is a private limited company registered with the Ministry of Corporate Affairs, Government of India.</p>
        <h3 class="ta">Therapy areas</h3>
        <div class="chips">${areas.map(k => `<a class="chip" style="--area:${AREAS[k].hex}" href="products/#${k}">${esc(AREAS[k].label)}</a>`).join("")}</div>
      </div>
      <div class="ftable">
        <table>
          ${fact("Legal name", "Keiross Lifescience Private Limited")}
          ${fact("CIN", "U46497GJ2026PTC173763")}
          ${fact("Incorporated", "18 February 2026")}
          ${fact("GSTIN", `<span data-cfg="gstin"></span>`)}
          ${fact("Drug licence no.", `<span data-cfg="dlno"></span>`)}
          ${fact("Registered office", "304 Block-H, Merlin Sparsh, Opp. Koyli Talav, B/H Narol, Daskroi, Ahmedabad – 382405, Gujarat")}
          ${fact("Phone / WhatsApp", `<span data-cfg="phone"></span>`)}
          ${fact("Email", `<span data-cfg="email"></span>`)}
          ${fact("Directors", TEAM.map(m => esc(m.name)).join(", "))}
        </table>
      </div>
    </div>
  </section>

  <section class="cta-band">
    <div class="wrap">
      <h2>Looking to partner with a growing pharmaceutical brand?</h2>
      <p>Distributors, stockists and institutional buyers are welcome to send us an enquiry.</p>
      <a class="btn" href="contact.html">Contact Us</a>
    </div>
  </section>
</main>
${footer("")}
<script src="data/site.js"></script>
<script src="assets/common.js"></script>
</body>
</html>
`;
}
fs.writeFileSync(path.join(ROOT, "about.html"), aboutPage());

/* ---------------- products/index.html (catalogue hub) ---------------- */
function productsHub(){
  const areas = Object.keys(AREAS).filter(k => PRODUCTS.some(p => p.area===k));
  const url = `${BASE}/products/`;
  const variantCount = PRODUCTS.reduce((n, p) => n + p.variants.length, 0);
  const desc = `Keiross Lifescience product catalogue: ${PRODUCTS.length} brands and ${variantCount} variants across ${areas.length} therapy areas — ${areas.map(k => AREAS[k].label).join(", ")}.`;
  const section = k => {
    const list = PRODUCTS.filter(p => p.area===k);
    return `
    <section class="area" id="${k}" style="--area:${AREAS[k].hex}">
      <div class="ahead">
        <h2>${esc(AREAS[k].label)} <span>${list.length} brand${list.length>1?"s":""}</span></h2>
        <p>${esc(AREAS[k].intro || "")}</p>
      </div>
      <div class="pgrid">${list.map(card).join("")}</div>
    </section>`;
  };
  return `<!DOCTYPE html>
<html lang="en">
<head>
${pageHead({ r:"../", path:"products/", title:`Products | ${PRODUCTS.length} Brands, ${areas.length} Therapy Areas | Keiross Lifescience`, ogTitle:"Keiross Lifescience Products",
  desc, type:"CollectionPage", crumbs:[["Home",""],["Products","products/"]],
  main:{ "@type":"ItemList", "@id":`${url}#itemlist`, "name":"Keiross Lifescience products", "numberOfItems":PRODUCTS.length,
    "itemListElement": areas.flatMap(k => PRODUCTS.filter(p => p.area===k)).map((p, i) => ({ "@type":"ListItem", "position":i+1, "name":p.brand, "url":`${BASE}/products/${p.slug}.html` })) } })}
</head>
<body>
${header()}
<main>
  <section class="pagehero">
    <div class="wrap">
      <div class="crumb"><a href="../index.html">Home</a><span>/</span>Products</div>
      <h1>Our <span>Products</span></h1>
      <p>${PRODUCTS.length} own brands and ${variantCount} variants across ${areas.length} therapy areas — tablets, capsules, syrups, suspensions and injections for distributors, pharmacies, hospitals and clinics.</p>
    </div>
  </section>

  <div class="hubbar"><div class="wrap">
    <nav class="jump" aria-label="Therapy areas">${areas.map(k => `<a href="#${k}" style="--area:${AREAS[k].hex}">${esc(AREAS[k].label)} <b>${PRODUCTS.filter(p=>p.area===k).length}</b></a>`).join("")}</nav>
    <input id="hq" type="search" placeholder="Search brand, molecule or condition" aria-label="Search products">
  </div></div>

  <div class="wrap hub">
    ${areas.map(section).join("")}
    <div class="empty" id="hempty" hidden>No products match your search. <a href="../contact.html" style="color:var(--teal);font-weight:600">Ask us directly →</a></div>
    <p class="pnote">Pack sizes and trade terms are shared on enquiry. Prescription medicines are supplied to licensed trade buyers only.</p>
  </div>

  <section class="cta-band">
    <div class="wrap">
      <h2>Need a product or a price list?</h2>
      <p>Send us your requirement and our team will share availability, pack sizes and trade terms.</p>
      <a class="btn" href="../contact.html">Send an Enquiry</a>
    </div>
  </section>
</main>
${footer()}
<script src="../data/site.js"></script>
<script src="../data/products.js"></script>
<script src="../assets/common.js"></script>
<script>
/* Client-side search over the static list; the HTML itself stays fully crawlable. */
const text = {};
PRODUCTS.forEach(p => text[p.slug] = [p.brand, p.composition, p.indications.join(" "), p.variants.map(v => v.brand + " " + v.composition).join(" ")].join(" ").toLowerCase());
$("#hq").addEventListener("input", e => {
  const q = e.target.value.trim().toLowerCase(); let any = false;
  document.querySelectorAll(".area").forEach(sec => {
    let n = 0;
    sec.querySelectorAll(".pc").forEach(c => { const slug = c.querySelector("h3 a").getAttribute("href").replace(".html",""); const ok = !q || text[slug].includes(q); c.hidden = !ok; n += ok; });
    sec.hidden = !n; any = any || n > 0;
  });
  $("#hempty").hidden = any;
});
</script>
</body>
</html>
`;
}
fs.writeFileSync(path.join(ROOT, "products", "index.html"), productsHub());

/* ---------------- contact.html ---------------- */
function contactPage(){
  const areas = Object.keys(AREAS).filter(k => PRODUCTS.some(p => p.area===k));
  const buyers = ["Distributor", "Stockist", "Pharmacy / Medical store", "Hospital", "Clinic", "Healthcare professional", "Other"];
  const addr = "304 Block-H, Merlin Sparsh, Opp. Koyli Talav, B/H Narol, Daskroi, Ahmedabad – 382405, Gujarat, India";
  const mapQ = encodeURIComponent("Merlin Sparsh, Koyli Talav, Narol, Ahmedabad 382405");
  const ic = {
    phone: I.phone.replace('stroke-width="2"', 'stroke-width="1.8"'),
    wa: I.wa,
    mail: I.mail.replace('stroke-width="2"', 'stroke-width="1.8"'),
    pin: I.pin.replace('stroke-width="2"', 'stroke-width="1.8"'),
  };
  return `<!DOCTYPE html>
<html lang="en">
<head>
${pageHead({ r:"", path:"contact.html", title:"Contact Us | Trade Enquiries | Keiross Lifescience", ogTitle:"Contact Keiross Lifescience",
  desc:`Contact Keiross Lifescience for distributorship, stockist, pharmacy and hospital enquiries, price lists and trade terms. Call or WhatsApp ${SITE.phone || ""}.`,
  type:"ContactPage", crumbs:[["Home",""],["Contact Us","contact.html"]], main:ORG_ID })}
</head>
<body>
${header("")}
<main>
  <section class="pagehero">
    <div class="wrap">
      <div class="crumb"><a href="index.html">Home</a><span>/</span>Contact Us</div>
      <h1>Let's <span>work together</span></h1>
      <p>Distributorship, stockist and institutional enquiries, product availability, price lists and trade terms — send us your requirement and our team will get back to you within one business day.</p>
    </div>
  </section>

  <div class="quick"><div class="wrap">
    <a class="qc" href="tel:${esc((SITE.phone||"").replace(/\s/g,""))}"><span class="ic">${ic.phone}</span><span><small>Call us</small><b>${esc(SITE.phone || "Phone")}</b></span></a>
    <a class="qc wa" href="https://wa.me/${esc((SITE.whatsapp||"").replace(/\D/g,""))}?text=${encodeURIComponent("Hello Keiross Lifescience, I have a business enquiry.")}" target="_blank" rel="noopener"><span class="ic">${ic.wa}</span><span><small>WhatsApp</small><b>Chat with us</b></span></a>
    <a class="qc em" href="mailto:${esc(SITE.email||"")}"><span class="ic">${ic.mail}</span><span><small>Email</small><b>${esc(SITE.email || "Email")}</b></span></a>
  </div></div>

  <section class="sec">
    <div class="wrap contact2">
      <div>
        <form class="enq lead" data-lead novalidate>
          <h2>Send an enquiry</h2>
          <p class="sub">Fields marked * are required. We use your details only to respond to this enquiry.</p>
          <label class="fl">Full name *<input name="name" autocomplete="name" required maxlength="80"></label>
          <label class="fl">Phone / WhatsApp *<input name="phone" type="tel" inputmode="tel" autocomplete="tel" required maxlength="20" placeholder="10-digit mobile number"></label>
          <label class="fl">Firm / organisation<input name="firm" autocomplete="organization" maxlength="120"></label>
          <label class="fl">Email<input name="email" type="email" autocomplete="email" maxlength="120"></label>
          <label class="fl">You are a *
            <select name="buyer">${buyers.map(b => `<option>${esc(b)}</option>`).join("")}</select>
          </label>
          <label class="fl">City &amp; state<input name="city" autocomplete="address-level2" maxlength="80" placeholder="e.g. Ranchi, Jharkhand"></label>
          <details class="picker full">
            <summary>Products of interest <span>(optional — tap to choose)</span></summary>
            ${areas.map(k => `<fieldset><legend>${esc(AREAS[k].label)}</legend>${PRODUCTS.filter(p=>p.area===k).map(p => `<label class="pk"><input type="checkbox" name="pick" value="${esc(p.brand)}"><span>${esc(p.brand)}</span></label>`).join("")}</fieldset>`).join("")}
          </details>
          <label class="fl full">Other products / quantities<input name="products" maxlength="400" placeholder="e.g. 50 boxes Keifix-O, full range price list"></label>
          <label class="fl full">Message<textarea name="msg" maxlength="2000" placeholder="Your requirement, delivery location, or any questions"></textarea></label>
          <label class="hp" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>
          <input type="hidden" name="t">
          <label class="consent full"><input type="checkbox" name="consent"> <span>I agree to be contacted by Keiross Lifescience by phone, WhatsApp or email about this enquiry. *</span></label>
          <div class="factions">
            <button class="btn" type="submit">Send Enquiry</button>
            <span data-status role="status" aria-live="polite"></span>
          </div>
        </form>
      </div>

      <aside class="cside">
        <div class="next">
          <h3>What happens next</h3>
          <ol>
            <li><b>We receive your enquiry</b><span>It goes straight to our sales team, with a reference number for you.</span></li>
            <li><b>We call you back</b><span>Within one business day, on the number you share.</span></li>
            <li><b>Price list &amp; terms</b><span>Availability, pack sizes and trade terms for your region.</span></li>
          </ol>
        </div>
        <div class="office">
          <h3>Registered office</h3>
          <p>${esc(addr)}</p>
          <p class="hrs"><b>Business hours:</b> <span data-cfg="hours"></span></p>
          <div class="map"><iframe title="Keiross Lifescience office location" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=${mapQ}&z=15&output=embed"></iframe></div>
          <a class="ml" href="https://www.google.com/maps/search/?api=1&query=${mapQ}" target="_blank" rel="noopener">Open in Google Maps →</a>
        </div>
      </aside>
    </div>
  </section>
</main>
${footer("")}
<script src="data/site.js"></script>
<script src="assets/common.js"></script>
<script src="assets/lead.js"></script>
</body>
</html>
`;
}
fs.writeFileSync(path.join(ROOT, "contact.html"), contactPage());

/* ---------------- index.html <head> (between SEO markers) ---------------- */
{
  const f = path.join(ROOT, "index.html");
  const html = fs.readFileSync(f, "utf8");
  const areas = Object.keys(AREAS).filter(k => PRODUCTS.some(p => p.area===k));
  const head = pageHead({ r:"", path:"", title:"Keiross Lifescience Pvt. Ltd. | Pharmaceutical Company, Ahmedabad",
    ogTitle:"Keiross Lifescience — Caring for Healthy Life",
    desc:`Keiross Lifescience markets ${PRODUCTS.length} own-brand medicines and nutraceuticals across ${areas.length} therapy areas to distributors, stockists, pharmacies, hospitals and clinics across India.`,
    image:"images/products/cover.jpg", imageAlt:"Keiross Lifescience — Caring for Healthy Life", main:ORG_ID });
  fs.writeFileSync(f, html.replace(/<!-- SEO:START[^>]*-->[\s\S]*?<!-- SEO:END -->/, m => m.slice(0, m.indexOf("-->") + 3) + "\n" + head + "\n<!-- SEO:END -->"));
}

/* ---------------- 404.html ---------------- */
fs.writeFileSync(path.join(ROOT, "404.html"), `<!DOCTYPE html>
<html lang="en">
<head>
${pageHead({ r:"/", path:"404.html", title:"Page not found | Keiross Lifescience", desc:"The page you were looking for could not be found. Browse our products or contact Keiross Lifescience.", noindex:true })}
</head>
<body>
${header("/")}
<main>
  <section class="sec"><div class="wrap nf">
    <b>404</b>
    <h1>Page not found</h1>
    <p>The page you're looking for may have moved. Try our product catalogue or get in touch.</p>
    <div class="acts"><a class="btn" href="/products/">Browse products</a><a class="btn line-dark" href="/contact.html">Contact us</a><a class="btn line-dark" href="/">Home</a></div>
  </div></section>
</main>
${footer("/")}
<script src="/data/site.js"></script>
<script src="/assets/common.js"></script>
</body>
</html>
`);

/* ---------------- site.webmanifest ---------------- */
fs.writeFileSync(path.join(ROOT, "site.webmanifest"), JSON.stringify({
  name: "Keiross Lifescience", short_name: "Keiross", start_url: "/", display: "browser",
  background_color: "#ffffff", theme_color: "#0b4f8a",
  icons: [{ src: "/images/brand/logo-mark.png", sizes: "194x194", type: "image/png" }, { src: "/images/brand/favicon.png", sizes: "64x64", type: "image/png" }]
}, null, 2) + "\n");

const today = new Date().toISOString().slice(0,10);
const smImg = (rel, title) => `<image:image><image:loc>${BASE}/${rel}</image:loc><image:title>${esc(title)}</image:title></image:image>`;
const smUrl = (p, pri, imgs = "") => `  <url><loc>${BASE}/${p}</loc><lastmod>${today}</lastmod><priority>${pri}</priority>${imgs}</url>`;
fs.writeFileSync(path.join(ROOT, "sitemap.xml"),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${[
  smUrl("", "1.0", smImg("images/products/cover.jpg", "Keiross Lifescience")),
  smUrl("products/", "0.9"),
  ...PRODUCTS.map(p => smUrl(`products/${p.slug}.html`, "0.8", smImg(`images/products/${p.slug}.jpg`, `${p.brand} ${formLabel(p)} — ${p.composition}`))),
  smUrl("about.html", "0.6"),
  smUrl("contact.html", "0.7")
].join("\n")}
</urlset>
`);
fs.writeFileSync(path.join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${BASE}/sitemap.xml\n`);
console.log(`Built ${PRODUCTS.length} product pages + products/index.html + about.html + contact.html + index <head> + 404 + sitemap.xml`);
