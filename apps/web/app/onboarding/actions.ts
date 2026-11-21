"use server"

import { isPublicHost, pageHasSnippet } from "@/lib/install-check"
import { createClient } from "@/lib/supabase/server"

const MAX_HTML = 512 * 1024

/** Fetches the site's home page and looks for its snippet. Never throws. */
async function snippetOnHomePage(domain: string, siteId: string) {
  if (!isPublicHost(domain)) return false
  try {
    const res = await fetch(`https://${domain}/`, {
      headers: { "user-agent": "CrawlRadar-InstallCheck/1.0" },
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    })
    const html = (await res.text()).slice(0, MAX_HTML)
    return pageHasSnippet(html, siteId)
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
