"use server"

import { lookup } from "node:dns/promises"

import {
  isPublicAddress,
  isPublicHost,
  pageHasSnippet,
} from "@/lib/install-check"
import { createClient } from "@/lib/supabase/server"

const MAX_HTML = 512 * 1024

/** True for a public name that resolves only to public addresses. */
async function isSafeHost(host: string): Promise<boolean> {
  if (!isPublicHost(host)) return false
  // shortcut: checked before the fetch, so DNS rebinding could slip past; pin the IP if it matters.
  const addresses = await lookup(host, { all: true })
  return addresses.every((a) => isPublicAddress(a.address))
}

/** GETs `url`, following up to 3 redirects by hand so that every hop is checked. */
async function fetchPublic(url: URL, hops = 3): Promise<Response | null> {
  if (!/^https?:$/.test(url.protocol) || !(await isSafeHost(url.hostname)))
    return null
  const res = await fetch(url, {
    headers: { "user-agent": "CrawlRadar-InstallCheck/1.0" },
    redirect: "manual",
    cache: "no-store",
    signal: AbortSignal.timeout(6000),
  })
  const location = res.headers.get("location")
  if (res.status < 300 || res.status >= 400 || !location) return res
  return hops > 0 ? fetchPublic(new URL(location, url), hops - 1) : null
}

/** The start of the page, up to MAX_HTML characters, without downloading the rest. */
async function readStart(res: Response): Promise<string> {
  const reader = res.body?.getReader()
  if (!reader) return ""
  const decoder = new TextDecoder()
  let html = ""
  while (html.length < MAX_HTML) {
    const { done, value } = await reader.read()
    if (done) break
    html += decoder.decode(value, { stream: true })
  }
  await reader.cancel()
  return html
}

/** Fetches the site's home page and looks for its snippet. Never throws. */
async function snippetOnHomePage(domain: string, siteId: string) {
  try {
    const res = await fetchPublic(new URL(`https://${domain}/`))
    return res ? pageHasSnippet(await readStart(res), siteId) : false
  } catch {
    return false
  }
}

async function loadSite(siteId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("sites")
    .select("id, domain, installed_at")
    .eq("id", siteId)
    .maybeSingle()
  return { supabase, site: data }
}

/** Cheap poll: has the track function seen the snippet working yet? */
export async function installStatus(siteId: string): Promise<boolean> {
  const { site } = await loadSite(siteId)
  return Boolean(site?.installed_at)
}

/** "Check now": also looks for the snippet in the site's HTML, and records success. */
export async function checkInstall(siteId: string): Promise<boolean> {
  const { supabase, site } = await loadSite(siteId)
  if (!site) return false
  if (site.installed_at) return true
  if (!(await snippetOnHomePage(site.domain, site.id))) return false
  await supabase
    .from("sites")
    .update({ installed_at: new Date().toISOString() })
    .eq("id", site.id)
  return true
}
