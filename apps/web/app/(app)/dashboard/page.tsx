import { Card, CardContent } from "@crawlradar/ui/components/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@crawlradar/ui/components/empty"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { Animation } from "@/components/animation"
import { AutoRefresh } from "@/components/auto-refresh"
import { CopyBlock } from "@/components/copy-block"
import { LiveDashboard } from "@/components/dashboard/live"
import { parseFilters, sinceFor } from "@/lib/filters"
import { appOrigin, snippet } from "@/lib/snippet"
import type { Stats } from "@/lib/stats"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Dashboard · CrawlRadar" }

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const filters = parseFilters(await searchParams)
  const supabase = await createClient()

  const { data: sites } = await supabase
    .from("sites")
    .select("id, domain")
    .order("created_at")
  if (!sites?.length) redirect("/sites")
  const site = sites.find((s) => s.id === filters.site) ?? sites[0]!
  const since = sinceFor(filters.range)

  let recent = supabase
    .from("crawler_events")
    .select("id, timestamp, bot_name, platform, bot_type, page_path")
    .eq("site_id", site.id)
    .gte("timestamp", since)
    .order("timestamp", { ascending: false })
    .limit(12)
  if (filters.platform) recent = recent.eq("platform", filters.platform)
  if (filters.type) recent = recent.eq("bot_type", filters.type)

  const [statsRes, recentRes] = await Promise.all([
    supabase.rpc("crawler_stats", {
      p_site_id: site.id,
      p_since: since,
      p_platform: filters.platform,
      p_bot_type: filters.type,
    }),
    recent,
  ])
  if (statsRes.error) throw statsRes.error
  const stats = statsRes.data as unknown as Stats

  // No data has ever arrived for this site: guide the install instead of showing empty charts.
  if (stats.platforms.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            AI crawler activity
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            {site.domain}
          </p>
        </div>
        <AutoRefresh seconds={10} />
        <Card>
          <CardContent>
            <Empty className="py-8">
              <EmptyHeader className="max-w-md">
                <EmptyMedia>
                  <Animation name="radar" className="size-36" />
                </EmptyMedia>
                <EmptyTitle className="text-xl">
                  Listening for AI crawlers
                </EmptyTitle>
                <EmptyDescription>
                  Add this tag to the &lt;head&gt; of{" "}
                  <a
                    href={`https://${site.domain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-foreground underline underline-offset-4"
                  >
                    {site.domain}
                  </a>
                  . The first GPTBot, ClaudeBot or ChatGPT referral appears here
                  on its own.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent className="w-full max-w-xl">
                <CopyBlock
                  code={snippet(await appOrigin(), site.id)}
                  label="Snippet"
                  className="w-full text-left"
                />
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-500 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-green-500" />
                  </span>
                  Checking for new visits every 10 seconds
                </p>
              </EmptyContent>
            </Empty>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <LiveDashboard
      stats={stats}
      events={recentRes.data ?? []}
      filters={{ ...filters, site: site.id }}
      domain={site.domain}
      sites={sites}
    />
  )
}
