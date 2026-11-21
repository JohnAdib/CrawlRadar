import { Badge } from "@crawlradar/ui/components/badge"
import { Button } from "@crawlradar/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@crawlradar/ui/components/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@crawlradar/ui/components/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@crawlradar/ui/components/table"
import { Activity, Bot, FileText, Layers, SearchX } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { Animation } from "@/components/animation"
import { AutoRefresh } from "@/components/auto-refresh"
import { PlatformChart, TimelineChart } from "@/components/charts"
import { CopyBlock } from "@/components/copy-block"
import { DashboardFilters, SiteSwitcher } from "@/components/dashboard-filters"
import { ExportMenu } from "@/components/export-menu"
import {
  BOT_TYPES,
  type BotType,
  parseFilters,
  type Range,
  RANGES,
  sinceFor,
  toQuery,
} from "@/lib/filters"
import { formatNumber, timeAgo, visits } from "@/lib/format"
import { appOrigin, snippet } from "@/lib/snippet"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Dashboard · CrawlRadar" }

// Shape of the jsonb returned by the crawler_stats() SQL function.
interface Stats {
  platforms: string[]
  total: number
  totals: Record<Range, number>
  active_bots: number
  by_platform: { platform: string; visits: number }[]
  by_bot: {
    bot_name: string
    platform: string
    bot_type: BotType
    visits: number
  }[]
  top_pages: { page_path: string | null; visits: number }[]
  timeline: { bucket: string; visits: number }[]
}

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
    .limit(20)
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
  const events = recentRes.data ?? []
  const current = { ...filters, site: site.id }

  const header = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          AI crawler activity
        </h1>
        <p className="truncate text-sm text-muted-foreground sm:text-base">
          {site.domain}
          {stats.platforms.length > 0 &&
            ` · last ${RANGES[filters.range].label}`}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {sites.length > 1 && <SiteSwitcher filters={current} sites={sites} />}
        {stats.platforms.length > 0 && <ExportMenu filters={current} />}
      </div>
    </div>
  )

  // No data has ever arrived for this site: guide the install instead of showing empty charts.
  if (stats.platforms.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        {header}
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
                  Add this tag to the &lt;head&gt; of {site.domain}. The first
                  GPTBot, ClaudeBot or ChatGPT referral appears here on its own.
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

  const topPlatform = stats.by_platform[0]
  const topPage = stats.top_pages[0]
  const filtered = Boolean(filters.platform || filters.type)

  return (
    <div className="group/dash flex flex-col gap-6">
      {header}
      <DashboardFilters filters={current} platforms={stats.platforms} />

      <div className="flex flex-col gap-4 transition-opacity duration-200 group-has-[[data-pending=true]]/dash:opacity-50 sm:gap-6">
        {stats.total === 0 ? (
          <Card>
            <CardContent>
              <Empty className="py-10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <SearchX />
                  </EmptyMedia>
                  <EmptyTitle>No visits match these filters</EmptyTitle>
                  <EmptyDescription>
                    Nothing in the last {RANGES[filters.range].label}
                    {filtered && " for this platform and bot type"}. Try a
                    longer range{filtered && " or clear the filters"}.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="flex-row justify-center">
                  {filters.range !== "30d" && (
                    <Button variant="outline" asChild>
                      <Link
                        href={`/dashboard${toQuery({ ...current, range: "30d" })}`}
                      >
                        Show 30 days
                      </Link>
                    </Button>
                  )}
                  {filtered && (
                    <Button variant="outline" asChild>
                      <Link
                        href={`/dashboard${toQuery({ site: site.id, range: filters.range })}`}
                      >
                        Clear filters
                      </Link>
                    </Button>
                  )}
                </EmptyContent>
              </Empty>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <StatCard
                icon={Activity}
                label="Total visits"
                value={formatNumber(stats.total)}
                hint={(Object.keys(RANGES) as Range[])
                  .map((r) => `${r} ${formatNumber(stats.totals[r])}`)
                  .join(" · ")}
              />
              <StatCard
                icon={Bot}
                label="Active bots"
                value={String(stats.active_bots)}
                hint={`${stats.by_platform.length} platform${stats.by_platform.length === 1 ? "" : "s"}`}
              />
              <StatCard
                icon={Layers}
                label="Top platform"
                value={topPlatform?.platform ?? "-"}
                hint={topPlatform && visits(topPlatform.visits)}
              />
              <StatCard
                icon={FileText}
                label="Top page"
                value={topPage?.page_path ?? "-"}
                hint={topPage && visits(topPage.visits)}
                mono
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Crawler activity over time</CardTitle>
                <CardDescription>
                  Visits per {filters.range === "24h" ? "hour" : "day"}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2 sm:px-6">
                <TimelineChart
                  data={stats.timeline}
                  hourly={filters.range === "24h"}
                />
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Visits by platform</CardTitle>
                  <CardDescription>
                    Which AI companies crawl you most
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PlatformChart data={stats.by_platform} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top pages</CardTitle>
                  <CardDescription>
                    Pages ranked by crawler visits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table className="table-fixed">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Page</TableHead>
                        <TableHead className="w-20 text-right">
                          Visits
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.top_pages.map((p) => (
                        <TableRow key={p.page_path ?? ""}>
                          <TableCell
                            className="truncate font-mono text-xs"
                            title={p.page_path ?? ""}
                          >
                            {p.page_path}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatNumber(p.visits)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-5">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Bots</CardTitle>
                  <CardDescription>Every crawler seen, by type</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table className="table-fixed">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bot</TableHead>
                        <TableHead className="w-28">Type</TableHead>
                        <TableHead className="w-16 text-right">
                          Visits
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.by_bot.map((b) => (
                        <TableRow key={b.bot_name + b.platform}>
                          <TableCell className="truncate">
                            <div className="truncate font-medium">
                              {b.bot_name}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              {b.platform}
                            </div>
                          </TableCell>
                          <TableCell>
                            <TypeBadge type={b.bot_type} />
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatNumber(b.visits)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Recent activity</CardTitle>
                  <CardDescription>Latest 20 crawler visits</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table className="table-fixed">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bot</TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Page
                        </TableHead>
                        <TableHead className="w-24 text-right">When</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell className="truncate">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="truncate font-medium">
                                {e.bot_name}
                              </span>
                              <TypeBadge type={e.bot_type as BotType} />
                            </div>
                            <div className="truncate font-mono text-xs text-muted-foreground sm:hidden">
                              {e.page_path}
                            </div>
                          </TableCell>
                          <TableCell
                            className="hidden truncate font-mono text-xs sm:table-cell"
                            title={e.page_path ?? ""}
                          >
                            {e.page_path}
                          </TableCell>
                          <TableCell
                            className="text-right whitespace-nowrap text-muted-foreground"
                            title={new Date(e.timestamp).toLocaleString()}
                          >
                            {timeAgo(e.timestamp)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  mono,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  hint?: string
  mono?: boolean
}) {
  return (
    <Card className="gap-2 py-4 sm:py-6">
      <CardHeader className="px-4 sm:px-6">
        <CardDescription className="flex items-center gap-2 text-xs sm:text-sm">
          <Icon className="size-4 shrink-0" /> {label}
        </CardDescription>
        <CardTitle
          className={`truncate text-xl tabular-nums sm:text-2xl ${mono ? "font-mono" : ""}`}
          title={value}
        >
          {value}
        </CardTitle>
        {hint && (
          <p className="text-xs text-pretty text-muted-foreground">{hint}</p>
        )}
      </CardHeader>
    </Card>
  )
}

function TypeBadge({ type }: { type: BotType }) {
  return (
    <Badge
      className="shrink-0"
      variant={
        type === "referral"
          ? "default"
          : type === "unknown"
            ? "outline"
            : "secondary"
      }
    >
      {BOT_TYPES[type] ?? type}
    </Badge>
  )
}
