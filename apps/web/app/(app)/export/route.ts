import type { NextRequest } from "next/server"

import { CSV_HEADER, csvRows, type ExportEvent } from "@/lib/csv"
import { type Filters, parseFilters, sinceFor } from "@/lib/filters"
import { createClient } from "@/lib/supabase/server"

// Everything the PRD appendix format needs (page_path is written in the page_url column).
const COLUMNS =
  "timestamp, page_url, page_path, bot_name, platform, bot_type, user_agent"
const PAGE = 1000 // PostgREST's default max rows per request

type Client = Awaited<ReturnType<typeof createClient>>

/** One page of events, newest first, with the export's filters applied. */
function eventsPage(
  supabase: Client,
  siteId: string,
  filters: Filters,
  since: string | null,
  from: number
) {
  let query = supabase
    .from("crawler_events")
    .select(COLUMNS)
    .eq("site_id", siteId)
    .order("timestamp", { ascending: false })
    .range(from, from + PAGE - 1)
  if (since) query = query.gte("timestamp", since)
  if (filters.platform) query = query.eq("platform", filters.platform)
  if (filters.type) query = query.eq("bot_type", filters.type)
  if (filters.page) query = query.eq("page_path", filters.page)
  return query.overrideTypes<ExportEvent[]>()
}

/**
 * GET /export?site=<id>[&range=7d&platform=OpenAI&type=training]
 * CSV in the PRD appendix format. Without `range` it exports the site's full history.
 * RLS limits it to the caller's own sites.
 */
export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams)
  const filters = parseFilters(params)
  const supabase = await createClient()

  const { data: site } = await supabase
    .from("sites")
    .select("id, domain")
    .eq("id", filters.site ?? "")
    .maybeSingle()
  if (!site) return new Response("Site not found", { status: 404 })

  const since = params.range ? sinceFor(filters.range) : null
  let csv = CSV_HEADER
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await eventsPage(
      supabase,
      site.id,
      filters,
      since,
      from
    )
    if (error) return new Response(error.message, { status: 500 })
    csv += csvRows(data)
    if (data.length < PAGE) break
  }

  const name = `crawlradar-${site.domain}-${params.range ?? "all"}.csv`
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${name}"`,
    },
  })
}
