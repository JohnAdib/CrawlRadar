"use client"

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
import { cn } from "@crawlradar/ui/lib/utils"
import {
  Activity,
  Bot,
  FileStack,
  MousePointerClick,
  SearchX,
} from "lucide-react"

import { AnimatedNumber } from "@/components/animated-number"
import { TrafficChart } from "@/components/dashboard/charts"
import { FilterBar, type FilterChange } from "@/components/dashboard/filters"
import {
  ActivityFeed,
  type ActivityItem,
  CrawlersTable,
  Heatmap,
  Platforms,
  Referrers,
  TopPages,
} from "@/components/dashboard/panels"
import { StatCard } from "@/components/dashboard/stat-card"
import { type Filters, RANGES } from "@/lib/filters"
import { formatNumber } from "@/lib/format"
import type { Stats } from "@/lib/stats"

export interface DashboardViewProps {
  stats: Stats
  events: ActivityItem[]
  filters: Filters & { site: string }
  domain: string
  onChange: (change: FilterChange) => void
  pending?: boolean
  /** Site picker, shown next to the actions when the user has several sites. */
  switcher?: React.ReactNode
  actions?: React.ReactNode
  /** Fixed clock for relative times (keeps server and client render identical). */
  now?: number
  title?: string
}

function Panel({
  title,
  description,
  children,
  className,
  bodyClassName,
  index = 0,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  /** Fixed body height keeps paired panels the same size. */
  bodyClassName?: string
  index?: number
}) {
  return (
    <Card
      className={cn(
        "transition-[border-color,box-shadow] duration-200 animate-in fade-in motion-reduce:animate-none slide-in-from-bottom-3 fill-mode-both hover:border-foreground/15 hover:shadow-md",
        className
      )}
      style={{
        animationDelay: `${120 + index * 60}ms`,
        animationDuration: "500ms",
      }}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className={cn("min-h-0", bodyClassName)}>
        {children}
      </CardContent>
    </Card>
  )
}

export function DashboardView({
  stats,
  events,
  filters,
  domain,
  onChange,
  pending,
  switcher,
  actions,
  now,
  title = "AI crawler activity",
}: DashboardViewProps) {
  const range = RANGES[filters.range].label
  const filtered = Boolean(filters.platform || filters.type)
  const hourly = filters.range === "24h"
  const period = hourly ? "hour" : "day"

  return (
    <div className="group/dash flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="truncate text-sm text-muted-foreground sm:text-base">
            {domain} · last {range}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {switcher}
          {actions}
        </div>
      </div>

      <FilterBar
        filters={filters}
        platforms={stats.platforms}
        onChange={onChange}
        pending={pending}
      />

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
                    Nothing in the last {range}
                    {filtered && " for this platform and bot type"}. Try a
                    longer range
                    {filtered && " or clear the filters"}.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="flex-row justify-center">
                  {filters.range !== "30d" && (
                    <Button
                      variant="outline"
                      onClick={() => onChange({ range: "30d" })}
                    >
                      Show 30 days
                    </Button>
                  )}
                  {filtered && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        onChange({ platform: undefined, type: undefined })
                      }
                    >
                      Clear filters
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
                index={0}
                icon={Activity}
                label="AI crawler visits"
                value={<AnimatedNumber value={stats.crawls} />}
                delta={{ current: stats.crawls, previous: stats.prev_crawls }}
                hint={`24h ${formatNumber(stats.totals["24h"])} · 7d ${formatNumber(stats.totals["7d"])} · 30d ${formatNumber(stats.totals["30d"])}`}
                spark={stats.timeline.map((p) => p.visits - p.referral)}
              />
              <StatCard
                index={1}
                icon={MousePointerClick}
                label="AI referrals"
                value={<AnimatedNumber value={stats.referrals} />}
                delta={{
                  current: stats.referrals,
                  previous: stats.prev_referrals,
                }}
                hint="People sent to you by AI assistants"
                spark={stats.timeline.map((p) => p.referral)}
                color="var(--chart-4)"
              />
              <StatCard
                index={2}
                icon={Bot}
                label="Active crawlers"
                value={<AnimatedNumber value={stats.active_bots} />}
                hint={`Across ${stats.active_platforms} platform${stats.active_platforms === 1 ? "" : "s"}`}
              />
              <StatCard
                index={3}
                icon={FileStack}
                label="Pages crawled"
                value={<AnimatedNumber value={stats.pages} />}
                hint={
                  stats.crawls > 0
                    ? `${(stats.crawls / Math.max(stats.pages, 1)).toFixed(1)} crawls per page`
                    : "No crawler visits in range"
                }
              />
            </div>

            <Panel
              index={0}
              title="AI traffic"
              description={`Visits per ${period}, by type of AI bot`}
            >
              <TrafficChart data={stats.timeline} hourly={hourly} />
            </Panel>

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              <Panel
                index={1}
                title="Visits by platform"
                description="Which AI companies crawl you most"
                bodyClassName="h-[22.5rem] overflow-y-auto"
              >
                <Platforms platforms={stats.by_platform} />
              </Panel>
              <Panel
                index={2}
                title="Top pages"
                description="Pages ranked by AI visits"
                bodyClassName="h-[22.5rem] overflow-y-auto"
              >
                <TopPages pages={stats.top_pages} />
              </Panel>
            </div>

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              <Panel
                index={3}
                title="AI referrals by source"
                description="Assistants sending people to your site"
                bodyClassName="h-44 overflow-y-auto"
              >
                <Referrers referrers={stats.referrers} />
              </Panel>
              <Panel
                index={4}
                title="When crawlers visit"
                description="Crawler visits by weekday and hour (UTC)"
                bodyClassName="h-44"
              >
                <Heatmap cells={stats.heatmap} />
              </Panel>
            </div>

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-5">
              <Panel
                index={5}
                title="Crawlers"
                description="Every AI bot seen in this range"
                className="lg:col-span-3"
                bodyClassName="h-[26rem] overflow-y-auto"
              >
                <CrawlersTable bots={stats.by_bot} now={now} />
              </Panel>
              <Panel
                index={6}
                title="Recent activity"
                description="Latest visits"
                className="lg:col-span-2"
                bodyClassName="h-[26rem] overflow-y-auto"
              >
                <ActivityFeed events={events.slice(0, 12)} now={now} />
              </Panel>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
