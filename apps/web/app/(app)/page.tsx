import { Badge } from "@crawlradar/ui/components/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@crawlradar/ui/components/card"
import {
  Empty,
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
import { Activity, Bot, FileText, Layers, Radar } from "lucide-react"
import { redirect } from "next/navigation"

import { PlatformChart, TimelineChart } from "@/components/charts"
import { DashboardFilters } from "@/components/dashboard-filters"
import {
  BOT_TYPES,
  type BotType,
  parseFilters,
  RANGES,
  sinceFor,
} from "@/lib/filters"
import { formatNumber, timeAgo } from "@/lib/format"
import { createClient } from "@/lib/supabase/server"

// Shape of the jsonb returned by the crawler_stats() SQL function.
interface Stats {
  platforms: string[]
  total: number
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
    .select("id, timestamp, bot_name, platform, bot_type, page_path, referrer")
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

  const topPlatform = stats.by_platform[0]
  const topPage = stats.top_pages[0]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          AI crawler activity
        </h1>
        <p className="text-muted-foreground">
          {site.domain} · last {RANGES[filters.range].label}
        </p>
      </div>

      <DashboardFilters
        filters={{ ...filters, site: site.id }}
        sites={sites}
        platforms={stats.platforms}
      />

      {stats.total === 0 ? (
        <Empty className="border border-dashed bg-background">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Radar />
            </EmptyMedia>
            <EmptyTitle>No crawler visits in this range</EmptyTitle>
            <EmptyDescription>
              Install the snippet from Sites &amp; install, widen the date
              range, or clear filters. Locally, run <code>pnpm simulate</code>{" "}
              to send test hits.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Activity}
              label="Total visits"
              value={formatNumber(stats.total)}
            />
            <StatCard
              icon={Bot}
              label="Active bots"
              value={String(stats.active_bots)}
            />
            <StatCard
              icon={Layers}
              label="Top platform"
              value={topPlatform?.platform ?? "-"}
              hint={topPlatform && `${formatNumber(topPlatform.visits)} visits`}
            />
            <StatCard
              icon={FileText}
              label="Top page"
              value={topPage?.page_path ?? "-"}
              hint={topPage && `${formatNumber(topPage.visits)} visits`}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Crawler activity over time</CardTitle>
              <CardDescription>
                Visits per {filters.range === "24h" ? "hour" : "day"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TimelineChart
                data={stats.timeline}
                hourly={filters.range === "24h"}
              />
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Page</TableHead>
                      <TableHead className="text-right">Visits</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.top_pages.map((p) => (
                      <TableRow key={p.page_path ?? ""}>
                        <TableCell className="max-w-0 truncate font-mono text-xs">
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

          <div className="grid gap-4 lg:grid-cols-5">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Bots</CardTitle>
                <CardDescription>Every crawler seen, by type</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bot</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Visits</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.by_bot.map((b) => (
                      <TableRow key={b.bot_name + b.platform}>
                        <TableCell>
                          <div className="font-medium">{b.bot_name}</div>
                          <div className="text-xs text-muted-foreground">
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>When</TableHead>
                      <TableHead>Bot</TableHead>
                      <TableHead>Page</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell
                          className="whitespace-nowrap text-muted-foreground"
                          title={new Date(e.timestamp).toLocaleString()}
                        >
                          {timeAgo(e.timestamp)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{e.bot_name}</span>
                            <TypeBadge type={e.bot_type as BotType} />
                          </div>
                        </TableCell>
                        <TableCell className="max-w-0 truncate font-mono text-xs">
                          {e.page_path}
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
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  hint?: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          <Icon className="size-4" /> {label}
        </CardDescription>
        <CardTitle className="truncate text-2xl tabular-nums" title={value}>
          {value}
        </CardTitle>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardHeader>
    </Card>
  )
}

function TypeBadge({ type }: { type: BotType }) {
  return (
    <Badge
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
