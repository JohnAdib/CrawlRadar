// Classifies hits and records them through record_hit(), which counts each page view once
// across the script, the pixel and server-side.
import { createClient } from "npm:@supabase/supabase-js@2"
import { classify } from "../_shared/bots.ts"
import { belongsToSite, hitBelongsToSite } from "../_shared/origin.ts"
import {
  browserSource,
  parseServerHit,
  type Source,
  sha256,
} from "../_shared/server-hit.ts"

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } }
)
const SALT =
  Deno.env.get("IP_HASH_SALT") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Salted SHA-256 with a salt that changes daily: visits can be grouped within a day,
// but the raw IP is never stored and hashes can't be joined across days.
function hashIp(ip: string): Promise<string> {
  const day = new Date().toISOString().slice(0, 10)
  return sha256(`${SALT}:${day}:${ip}`)
}

interface Site {
  id: string
  domain: string
  installed: boolean
}

// Sites rarely change: cache lookups for a minute per function instance (so a replaced
// server key may keep working for up to a minute).
const sites = new Map<string, { site: Site | null; at: number }>()
async function findSite(
  column: "id" | "server_key_hash",
  value: string
): Promise<Site | null> {
  const key = `${column}:${value}`
  const cached = sites.get(key)
  if (cached && Date.now() - cached.at < 60_000) return cached.site
  const { data } = await supabase
    .from("sites")
    .select("id, domain, installed_at")
    .eq(column, value)
    .maybeSingle()
  const site = data
    ? {
        id: data.id,
        domain: data.domain,
        installed: Boolean(data.installed_at),
      }
    : null
  sites.set(key, { site, at: Date.now() })
  return site
}

// The first hit from the site (any visitor, any method) proves tracking is installed.
// Onboarding waits for this signal.
async function markInstalled(site: Site): Promise<void> {
  if (site.installed) return
  site.installed = true
  await supabase
    .from("sites")
    .update({ installed_at: new Date().toISOString() })
    .eq("id", site.id)
    .is("installed_at", null)
}

function pathOf(url: string): string | null {
  try {
    return new URL(url).pathname.slice(0, 500)
  } catch {
    return null
  }
}

interface Hit {
  site: Site
  source: Source
  pageUrl: string
  userAgent: string
  referrer: string | null
  ip: string | null
}

/** Records a bot or AI-referral hit once; ordinary human visits are "ignored". */
async function store(hit: Hit): Promise<"recorded" | "duplicate" | "ignored"> {
  const bot = classify(hit.userAgent, hit.referrer, hit.pageUrl)
  if (!bot) return "ignored"
  const { data, error } = await supabase.rpc("record_hit", {
    p_site_id: hit.site.id,
    p_source: hit.source,
    p_user_agent: hit.userAgent,
    p_bot_name: bot.name,
    p_platform: bot.platform,
    p_bot_type: bot.type,
    p_page_url: hit.pageUrl,
    p_page_path: pathOf(hit.pageUrl),
    p_referrer: hit.referrer,
    p_ip_hash: hit.ip ? await hashIp(hit.ip) : null,
  })
  if (error) throw error
  return data
}

/** The browser hit's fields: the POST body, or the query string for GET. */
async function fieldsOf(req: Request, url: URL): Promise<URLSearchParams> {
  if (req.method !== "POST") return url.searchParams
  return new URLSearchParams((await req.text()).slice(0, 8000))
}

/** The script's or the pixel's hit. The User-Agent comes from the header, never the payload. */
export async function recordBrowserHit(req: Request, url: URL): Promise<void> {
  const fields = await fieldsOf(req, url)
  const sid = fields.get("sid") ?? ""
  // Image requests carry the embedding page as Referer; `u` is the explicit page URL.
  const pageUrl = (fields.get("u") || req.headers.get("referer") || "").slice(
    0,
    2000
  )
  if (!UUID.test(sid) || !pageUrl) return

  // Only count hits from the site's own domain, so a copied snippet can't inject data.
  const site = await findSite("id", sid)
  const origin = req.headers.get("origin")
  if (!site || !hitBelongsToSite(pageUrl, origin, site.domain)) return
  await markInstalled(site)

  await store({
    site,
    source: browserSource(req.method, url.searchParams.get("t")),
    pageUrl,
    userAgent: (req.headers.get("user-agent") ?? "").slice(0, 1000),
    referrer: fields.get("r")?.slice(0, 2000) || null,
    ip: req.headers.get("x-forwarded-for")?.split(",")[0].trim() || null,
  })
}

const json = (status: number, body: object) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  })

/** A server-side hit: the site is identified by its secret key, the visitor by the payload. */
export async function recordServerHit(req: Request): Promise<Response> {
  const key = req.headers.get("x-crawlradar-key") ?? ""
  const site =
    key.length <= 200
      ? await findSite("server_key_hash", await sha256(key))
      : null
  if (!site)
    return json(401, {
      error:
        "Unknown server key. Create one under Settings > Install > Server-side.",
    })
  const hit = parseServerHit((await req.text()).slice(0, 8000))
  if ("error" in hit) return json(400, hit)
  if (!belongsToSite(hit.url, site.domain))
    return json(422, { error: `url must be a page on ${site.domain}` })
  await markInstalled(site)
  try {
    const status = await store({
      site,
      source: "server",
      pageUrl: hit.url,
      userAgent: hit.userAgent,
      referrer: hit.referrer,
      ip: hit.ip,
    })
    return json(202, { status })
  } catch (error) {
    console.error("server hit failed", error)
    return json(500, { error: "Couldn't record the hit, try again" })
  }
}
