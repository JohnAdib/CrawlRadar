import type { NextRequest } from "next/server"

import { csvRow } from "@/lib/csv"
import { parseFilters, sinceFor } from "@/lib/filters"
import { createClient } from "@/lib/supabase/server"

// PRD appendix columns first, then the remaining fields.
const COLUMNS = [
  "timestamp",
  "page_url",
  "bot_name",
  "platform",
  "bot_type",
  "user_agent",
  "page_path",
  "referrer",
  "ip_hash",
] as const
const PAGE = 1000 // PostgREST's default max rows per request

/**
 * GET /export?site=<id>[&range=7d&platform=OpenAI&type=training]
 * Without `range` it exports the site's full history. RLS limits it to the caller's own sites.
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

  let csv = csvRow([...COLUMNS])
  for (let from = 0; ; from += PAGE) {
    let query = supabase
      .from("crawler_events")
      .select(COLUMNS.join(","))
      .eq("site_id", site.id)
      .order("timestamp", { ascending: false })
      .range(from, from + PAGE - 1)
    if (params.range) query = query.gte("timestamp", sinceFor(filters.range))
    if (filters.platform) query = query.eq("platform", filters.platform)
    if (filters.type) query = query.eq("bot_type", filters.type)

    const { data, error } =
      await query.overrideTypes<Record<(typeof COLUMNS)[number], unknown>[]>()
    if (error) return new Response(error.message, { status: 500 })
    for (const row of data) csv += csvRow(COLUMNS.map((c) => row[c]))
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
