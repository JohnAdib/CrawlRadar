// Server-side loaders shared by the dashboard views. RLS scopes every query to the user.
import { redirect } from "next/navigation"

import { afterCursor, type Cursor } from "@/lib/events"
import { type Filters, parseFilters, sinceFor } from "@/lib/filters"
import type { PageRow, Stats } from "@/lib/stats"
import { createClient } from "@/lib/supabase/server"

export type SearchParams = Promise<
  Record<string, string | string[] | undefined>
>

/** The signed-in user's sites, the selected one, and the filters from the URL. */
export async function loadDashboard(searchParams: SearchParams) {
  const params = await searchParams
  const filters = parseFilters(params)
  const supabase = await createClient()
  const { data } = await supabase
    .from("sites")
    .select("id, domain, created_at, installed_at")
    .order("created_at")
  const sites = data ?? []
  const site = sites.find((s) => s.id === filters.site) ?? sites[0]
  // The (app) layout also checks this, but layout and page render in parallel.
  if (!site) redirect("/onboarding")
  return {
    supabase,
    params,
    site,
    sites: sites.map(({ id, domain }) => ({ id, domain })),
    filters: { ...filters, site: site.id },
    since: sinceFor(filters.range),
  }
}

type Loaded = Awaited<ReturnType<typeof loadDashboard>>

export async function loadStats({ supabase, site, filters, since }: Loaded) {
  const { data, error } = await supabase.rpc("crawler_stats", {
    p_site_id: site.id,
    p_since: since,
    p_platform: filters.platform,
    p_bot_type: filters.type,
    p_page_path: filters.page,
  })
  if (error) throw error
  return data as unknown as Stats
}

export async function loadPages({ supabase, site, filters, since }: Loaded) {
  const { data, error } = await supabase.rpc("crawler_pages", {
    p_site_id: site.id,
    p_since: since,
    p_platform: filters.platform,
    p_bot_type: filters.type,
  })
  if (error) throw error
  return data as unknown as PageRow[]
}

const EVENT_COLUMNS =
  "id, timestamp, bot_name, platform, bot_type, page_path, user_agent, referrer"

/** What loadEvents needs: a client, the site, its filters and the range start. */
export interface EventsQuery {
  supabase: Awaited<ReturnType<typeof createClient>>
  site: { id: string }
  filters: Filters
  since: string
}

/** One batch of the activity log, newest first; the first batch also counts the total. */
export async function loadEvents(
  { supabase, site, filters, since }: EventsQuery,
  pageSize: number,
  cursor?: Cursor
) {
  let query = supabase
    .from("crawler_events")
    .select(EVENT_COLUMNS, cursor ? undefined : { count: "exact" })
    .eq("site_id", site.id)
    .gte("timestamp", since)
    .order("timestamp", { ascending: false })
    .order("id", { ascending: false })
    .limit(pageSize)
  if (cursor) query = query.or(afterCursor(cursor))
  if (filters.platform) query = query.eq("platform", filters.platform)
  if (filters.type) query = query.eq("bot_type", filters.type)
  if (filters.page) query = query.eq("page_path", filters.page)
  const { data, count, error } = await query
  if (error) throw error
  return { events: data, total: count ?? 0 }
}
