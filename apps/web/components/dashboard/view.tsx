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
  ArrowLeft,
  Bot,
  ExternalLink,
  FileStack,
  FileText,
  MousePointerClick,
  SearchX,
} from "lucide-react"
import { useRef } from "react"

import { AnimatedNumber } from "@/components/animated-number"
import { BrandLogo } from "@/components/brand-logo"
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

const LIST_LIMIT = 10

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
  index = 0,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  index?: number
}) {
  return (
    <Card
      className={cn(
        "fade-in slide-in-from-bottom-3 fill-mode-both animate-in transition-[border-color,box-shadow] duration-200 hover:border-foreground/15 hover:shadow-md motion-reduce:animate-none",
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
      <CardContent>{children}</CardContent>
    </Card>
  )
}

/** Header shown on a page or platform report, with a way back to the overview. */
function ReportHeader({
  filters,
  domain,
  range,
  onBack,
}: {
  filters: Filters
  domain: string
  range: string
  onBack: () => void
}) {
  const page = filters.page
  return (
    <Card className="fade-in slide-in-from-top-2 animate-in duration-300 motion-reduce:animate-none">
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-muted/50">
          {page ? (
            <FileText className="size-5 text-muted-foreground" />
          ) : (
            <BrandLogo name={filters.platform!} className="size-6" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-xs uppercase tracking-wide">
            {page ? "Page report" : "Platform report"}
          </p>
          <h2 className="truncate font-semibold text-lg">
            {page ? (
              <span className="font-mono">{page}</span>
            ) : (
              filters.platform
            )}
          </h2>
          <p className="text-muted-foreground text-sm">
            {page
              ? `Every AI visit to this page in the last ${range}`
              : `Everything ${filters.platform} did on ${domain} in the last ${range}`}
            {page && filters.platform ? `, from ${filters.platform}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {page && (
            <Button variant="outline" size="sm" asChild>
              <a
                href={`https://${domain}${page}`}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink /> Open page
              </a>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft /> Overview
          </Button>
        </div>
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
  const filtered = Boolean(filters.platform || filters.type || filters.page)
  const hourly = filters.range === "24h"
  const period = hourly ? "hour" : "day"
  const report = Boolean(filters.page || filters.platform)
  const root = useRef<HTMLDivElement>(null)

  function open(change: FilterChange) {
    onChange(change)
    root.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }
  const openPage = (page: string) => open({ page })
  const openPlatform = (platform: string) => open({ platform })
  const overview = () => open({ page: undefined, platform: undefined })

  return (
    <div
      ref={root}
      className="group/dash flex scroll-mt-20 flex-col gap-4 sm:gap-6"
    >
      {pending && (
        <div
          className="pointer-events-none fixed inset-x-0 top-14 z-30 h-0.5 overflow-hidden"
          aria-hidden
        >
          <div className="h-full w-1/4 animate-[progress-slide_1s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-chart-1 to-transparent" />
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="font-semibold text-2xl tracking-tight">{title}</h1>
          <p className="truncate text-muted-foreground text-sm sm:text-base">
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

      <div
        className={cn(
          "flex flex-col gap-4 transition-[opacity,filter] duration-300 sm:gap-6",
          "group-has-[[data-pending=true]]/dash:opacity-60 group-has-[[data-pending=true]]/dash:saturate-50",
          "group-has-[[data-pending=true]]/dash:[&_[data-slot=card]]:animate-pulse"
        )}
      >
        {report && (
          <ReportHeader
            filters={filters}
            domain={domain}
            range={range}
            onBack={overview}
          />
        )}

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
                    {filtered && " with these filters"}. Try a longer range
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
                        onChange({
                          platform: undefined,
                          type: undefined,
                          page: undefined,
                        })
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
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-12">
              <div className="flex min-w-0 flex-col gap-4 sm:gap-6 lg:col-span-8">
                <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                  <StatCard
                    index={0}
                    icon={Activity}
                    label="AI crawler visits"
                    value={<AnimatedNumber value={stats.crawls} />}
                    delta={{
                      current: stats.crawls,
                      previous: stats.prev_crawls,
                    }}
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
                    hint="People sent by AI assistants"
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

                <Panel
                  index={1}
                  title="When crawlers visit"
                  description="Crawler visits by weekday and hour (UTC)"
                >
                  <Heatmap cells={stats.heatmap} />
                </Panel>

                <Panel
                  index={2}
                  title="AI referrals by source"
                  description="Assistants sending people to your site"
                >
                  <Referrers referrers={stats.referrers} />
                </Panel>
              </div>

              <div className="flex min-w-0 flex-col gap-4 sm:gap-6 lg:col-span-4">
                {!filters.page && (
                  <Panel
                    index={3}
                    title="Top pages"
                    description="Click a page for its report"
                  >
                    <TopPages pages={stats.top_pages} onSelect={openPage} />
                  </Panel>
                )}
                <Panel
                  index={4}
                  title="Visits by platform"
                  description={
                    filters.platform
                      ? "This report covers one platform"
                      : "Click a platform for its report"
                  }
                >
                  <Platforms
                    platforms={stats.by_platform}
                    onSelect={filters.platform ? undefined : openPlatform}
                  />
                </Panel>
              </div>
            </div>

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-12">
              <Panel
                index={5}
                title="Crawlers"
                description={
                  stats.by_bot.length > LIST_LIMIT
                    ? `Top ${LIST_LIMIT} of ${stats.by_bot.length} bots seen in this range`
                    : "Every AI bot seen in this range"
                }
                className="lg:col-span-7"
              >
                <CrawlersTable
                  bots={stats.by_bot.slice(0, LIST_LIMIT)}
                  now={now}
                  onSelectPlatform={filters.platform ? undefined : openPlatform}
                />
              </Panel>
              <Panel
                index={6}
                title="Recent activity"
                description="The latest 10 visits"
                className="lg:col-span-5"
              >
                <ActivityFeed
                  events={events.slice(0, LIST_LIMIT)}
                  now={now}
                  onSelectPage={filters.page ? undefined : openPage}
                />
              </Panel>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
