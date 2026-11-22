// Tracking endpoint. Three ways in, one way to store:
//
//   POST  body sid=…&u=…&r=…                 the JavaScript tag's beacon          (script)
//   GET   ?sid=…&u=…&r=…&t=js|img             the script's fallback, or the pixel  (script, pixel)
//   POST  JSON, x-crawlradar-key: <key>       server-side, via /api/v1/hits        (server)
//
// Browser hits take the User-Agent from the request header, never the payload, so a page
// script can't fake it. Server-side hits are trusted because they carry the site's secret key.
// Every hit goes through record_hit(), which counts a page view once across the three methods.
// Ordinary human visits are classified as null and not stored.
import { recordBrowserHit, recordServerHit } from "./record.ts"

const GIF = Uint8Array.from(
  atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"),
  (c) => c.charCodeAt(0)
)
const NO_CACHE = {
  "cache-control": "no-store, max-age=0",
  "access-control-allow-origin": "*",
}

Deno.serve(async (req) => {
  if (req.headers.has("x-crawlradar-key")) return recordServerHit(req)

  const url = new URL(req.url)
  try {
    await recordBrowserHit(req, url)
  } catch (err) {
    // Logged, never thrown: tracking must not break the customer's page.
    console.error(err)
  }
  if (req.method === "POST")
    return new Response(null, { status: 204, headers: NO_CACHE })
  return url.searchParams.get("t") === "img"
    ? new Response(GIF, {
        headers: { ...NO_CACHE, "content-type": "image/gif" },
      })
    : new Response("", {
        headers: { ...NO_CACHE, "content-type": "application/javascript" },
      })
})
