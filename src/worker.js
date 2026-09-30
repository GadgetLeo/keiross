/* Cloudflare Worker entry point.
   /api/lead -> enquiry form handler (functions/api/lead.js)
   everything else -> static files in this repo (clean URLs, 404.html, _headers) */
import { onRequestPost, onRequest } from "../functions/api/lead.js";

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/lead" || pathname === "/api/lead/") {
      return request.method === "POST" ? onRequestPost({ request, env }) : onRequest();
    }
    if (pathname.startsWith("/api/")) {
      return new Response('{"ok":false,"error":"not_found"}', { status: 404, headers: { "Content-Type": "application/json" } });
    }
    return env.ASSETS.fetch(request);
  }
};
