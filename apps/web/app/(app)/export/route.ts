import type { NextRequest } from "next/server"

import { CSV_HEADER, csvRows, type ExportEvent } from "@/lib/csv"
import { afterCursor, type Cursor, cursorOf } from "@/lib/events"
import { type Filters, parseFilters, sinceFor } from "@/lib/filters"
import { createClient } from "@/lib/supabase/server"

// Everything the PRD appendix format needs (page_path is written in the page_url column),
// plus the id for keyset paging.
const COLUMNS =
  "id, timestamp, page_url, page_path, bot_name, platform, bot_type, user_agent"
const PAGE = 1000 // PostgREST's default max rows per request

type Client = Awaited<ReturnType<typeof createClient>>
type Row = ExportEvent & Cursor

/** The page of events after `after`, newest first, with the export's filters applied. */
function eventsPage(
  supabase: Client,
  siteId: string,
  filters: Filters,
  since: string | null,
  after: Cursor | null
) {
  let query = supabase
    .from("crawler_events")
    .select(COLUMNS)
    .eq("site_id", siteId)
    .order("timestamp", { ascending: false })
    .order("id", { ascending: false })
    .limit(PAGE)
  if (after) query = query.or(afterCursor(after))
  if (since) query = query.gte("timestamp", since)
  if (filters.platform) query = query.eq("platform", filters.platform)
  if (filters.type) query = query.eq("bot_type", filters.type)
  if (filters.page) query = query.eq("page_path", filters.page)
  return query.overrideTypes<Row[]>()
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
  const next = (after: Cursor | null) =>
    eventsPage(supabase, site.id, filters, since, after)

  // The first page is read up front, so a failure is still a proper error response.
  const first = await next(null)
  if (first.error) return new Response(first.error.message, { status: 500 })

  // Then streamed page by page: any size, never held in memory as one string.
  // Keyset paging stays exact even if visits arrive during the download.
  const encoder = new TextEncoder()
  let rows = first.data
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(CSV_HEADER + csvRows(rows)))
    },
    async pull(controller) {
      if (rows.length < PAGE) {
        controller.close()
        return
      }
      const { data, error } = await next(cursorOf(rows.at(-1)!))
      if (error) {
        controller.error(new Error(error.message))
        return
      }
      rows = data
      controller.enqueue(encoder.encode(csvRows(rows)))
    },
  })

  const name = `crawlradar-${site.domain}-${params.range ?? "all"}.csv`
  return new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${name}"`,
    },
  })
}
