// Tracking endpoint. The JavaScript tag POSTs each hit as a beacon (form-encoded body);
// the pixel, and the script where beacons aren't available, send the same fields as a GET:
//
//   POST /functions/v1/track          body: sid=<site id>&u=<page url>&r=<document.referrer>
//   GET  /functions/v1/track?sid=…&u=…&r=…&t=img
//
// The User-Agent is read from the request header, never from the payload, so a page
// script can't fake it. Ordinary human visits are classified as null and not stored.
import { createClient } from "npm:@supabase/supabase-js@2"
import { classify } from "../_shared/bots.ts"
import { hitBelongsToSite } from "../_shared/origin.ts"

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

interface Site {
  domain: string | null
  installed: boolean
  at: number
}

// Sites rarely change; cache lookups for a minute per function instance.
const sites = new Map<string, Site>()
async function siteFor(sid: string): Promise<Site> {
  const cached = sites.get(sid)
  if (cached && Date.now() - cached.at < 60_000) return cached
  const { data } = await supabase
    .from("sites")
    .select("domain, installed_at")
    .eq("id", sid)
    .maybeSingle()
  const site = {
    domain: data?.domain ?? null,
    installed: Boolean(data?.installed_at),
    at: Date.now(),
  }
  sites.set(sid, site)
  return site
}

// The first hit from the site's own pages (any visitor) proves the snippet is installed.
// Onboarding waits for this signal.
async function markInstalled(sid: string, site: Site): Promise<void> {
  if (site.installed) return
  site.installed = true
  await supabase
    .from("sites")
    .update({ installed_at: new Date().toISOString() })
    .eq("id", sid)
    .is("installed_at", null)
}

function pathOf(url: string): string | null {
  try {
    return new URL(url).pathname.slice(0, 500)
  } catch {
    return null
  }
}

/** The hit's fields: the POST body, or the query string for GET. */
async function fieldsOf(req: Request, url: URL): Promise<URLSearchParams> {
  if (req.method !== "POST") return url.searchParams
  return new URLSearchParams((await req.text()).slice(0, 8000))
}

/** The hit's inputs, length-capped, or null when the request is unusable. */
function readHit(req: Request, fields: URLSearchParams) {
  const sid = fields.get("sid") ?? ""
  // Script/img requests carry the embedding page as Referer; `u` is the explicit fallback.
  const pageUrl = (fields.get("u") || req.headers.get("referer") || "").slice(
    0,
    2000
  )
  if (!UUID.test(sid) || !pageUrl) return null
  return {
    sid,
    pageUrl,
    userAgent: (req.headers.get("user-agent") ?? "").slice(0, 1000),
    referrer: fields.get("r")?.slice(0, 2000) || null,
  }
}

async function record(req: Request, url: URL): Promise<void> {
  const input = readHit(req, await fieldsOf(req, url))
  if (!input) return
  const { sid, pageUrl, userAgent, referrer } = input

  // Only count hits from the site's own domain, so a copied snippet can't inject data.
  const site = await siteFor(sid)
  const origin = req.headers.get("origin")
  if (!site.domain || !hitBelongsToSite(pageUrl, origin, site.domain)) return
  await markInstalled(sid, site)

  const hit = classify(userAgent, referrer, pageUrl)
  if (!hit) return

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
