// Tracking endpoint. Called by the site snippet as a <script> (JS-capable visitors)
// or as a <noscript> <img> pixel (crawlers that don't run JavaScript).
//
//   GET /functions/v1/track?sid=<site id>&u=<page url>&r=<document.referrer>[&t=img]
//
// The User-Agent is read from the request header, never from the query string, so a page
// script can't fake it. Ordinary human visits are classified as null and not stored.
import { createClient } from "npm:@supabase/supabase-js@2"
import { classify } from "../_shared/bots.ts"
import { belongsToSite } from "../_shared/origin.ts"

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } }
)
const SALT =
  Deno.env.get("IP_HASH_SALT") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const GIF = Uint8Array.from(
  atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"),
  (c) => c.charCodeAt(0)
)
const NO_CACHE = {
  "cache-control": "no-store, max-age=0",
  "access-control-allow-origin": "*",
}

// Salted SHA-256 with a salt that changes daily: visits can be grouped within a day,
// but the raw IP is never stored and hashes can't be joined across days.
async function hashIp(ip: string): Promise<string> {
  const day = new Date().toISOString().slice(0, 10)
  const bytes = new TextEncoder().encode(`${SALT}:${day}:${ip}`)
  const digest = await crypto.subtle.digest("SHA-256", bytes)
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0")
  ).join("")
}

// Site domains rarely change; cache lookups for a minute per function instance.
const domains = new Map<string, { domain: string | null; at: number }>()
async function siteDomain(sid: string): Promise<string | null> {
  const cached = domains.get(sid)
  if (cached && Date.now() - cached.at < 60_000) return cached.domain
  const { data } = await supabase
    .from("sites")
    .select("domain")
    .eq("id", sid)
    .maybeSingle()
  const domain = data?.domain ?? null
  domains.set(sid, { domain, at: Date.now() })
  return domain
}

function pathOf(url: string): string | null {
  try {
    return new URL(url).pathname.slice(0, 500)
  } catch {
    return null
  }
}

async function record(req: Request, url: URL): Promise<void> {
  const sid = url.searchParams.get("sid") ?? ""
  if (!UUID.test(sid)) return

  const userAgent = (req.headers.get("user-agent") ?? "").slice(0, 1000)
  // Script/img requests carry the embedding page as Referer; `u` is the explicit fallback.
  const pageUrl = (
    url.searchParams.get("u") ||
    req.headers.get("referer") ||
    ""
  ).slice(0, 2000)
  const referrer = url.searchParams.get("r")?.slice(0, 2000) || null
  if (!pageUrl) return

  const hit = classify(userAgent, referrer, pageUrl)
  if (!hit) return

  // Only count hits from the site's own domain, so a copied snippet can't inject data.
  const domain = await siteDomain(sid)
  if (!domain || !belongsToSite(pageUrl, domain)) return

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? ""
  const { error } = await supabase.from("crawler_events").insert({
    site_id: sid,
    user_agent: userAgent,
    bot_name: hit.name,
    platform: hit.platform,
    bot_type: hit.type,
    page_url: pageUrl,
    page_path: pathOf(pageUrl),
    referrer,
    ip_hash: ip ? await hashIp(ip) : null,
  })
  // Logged, never thrown: tracking must not break the customer's page.
  if (error) console.error("insert failed", error)
}

Deno.serve(async (req) => {
  const url = new URL(req.url)
  try {
    await record(req, url)
  } catch (err) {
    console.error(err)
  }
  return url.searchParams.get("t") === "img"
    ? new Response(GIF, {
        headers: { ...NO_CACHE, "content-type": "image/gif" },
      })
    : new Response("", {
        headers: { ...NO_CACHE, "content-type": "application/javascript" },
      })
})
