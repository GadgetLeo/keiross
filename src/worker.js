/* Cloudflare Worker entry point.
   /api/lead -> enquiry form handler (functions/api/lead.js)
   everything else -> static files in this repo (clean URLs, 404.html, _headers) */
import { onRequestPost, onRequest } from "../functions/api/lead.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url), { pathname } = url;
    /* Once CANONICAL_HOST is set (wrangler.jsonc vars), send the workers.dev address and
       www. to the real domain with a 301 so search engines index one copy only. */
    const canon = env.CANONICAL_HOST;
    if (canon && url.hostname !== canon) {
      if (url.hostname === `www.${canon}` || /^keiross\.[^.]+\.workers\.dev$/.test(url.hostname)) {
        url.hostname = canon; url.protocol = "https:"; url.port = "";
        return Response.redirect(url.toString(), 301);
      }
    }
    if (pathname === "/api/lead" || pathname === "/api/lead/") {
      return request.method === "POST" ? onRequestPost({ request, env }) : onRequest();
    }
    if (pathname.startsWith("/api/")) {
      return new Response('{"ok":false,"error":"not_found"}', { status: 404, headers: { "Content-Type": "application/json" } });
    }
    const res = await env.ASSETS.fetch(request);
    if (!canon || url.hostname === canon) return res;
    const out = new Response(res.body, res);   // preview URLs and any other host: keep out of search
    out.headers.set("X-Robots-Tag", "noindex");
    return out;
  }
};
