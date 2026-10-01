/* Cloudflare Worker entry point.
   /api/lead -> enquiry form handler (functions/api/lead.js)
   everything else -> static files in this repo (clean URLs, 404.html, _headers) */
import { onRequestPost, onRequest } from "../functions/api/lead.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url), { pathname } = url;
    /* CANONICAL_HOST (wrangler.jsonc vars) is the real domain: www. always 301s to it, and
       the workers.dev address does too once REDIRECT_WORKERS_DEV is "true". Other hosts
       (preview URLs) are served with noindex so search engines index one copy only. */
    const canon = env.CANONICAL_HOST;
    if (canon && url.hostname !== canon) {
      const toCanon = url.hostname === `www.${canon}` ||
        (env.REDIRECT_WORKERS_DEV === "true" && /^keiross\.[^.]+\.workers\.dev$/.test(url.hostname));
      if (toCanon) {
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
