"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"

import type { ActivityItem } from "@/components/dashboard/activity-feed"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { CrawlersTable } from "@/components/dashboard/crawlers-table"
import { Heatmap } from "@/components/dashboard/heatmap"
import { Panel } from "@/components/dashboard/panel"
import {
  Platforms,
  TypeBreakdown,
} from "@/components/dashboard/platforms-panel"
import { Referrers } from "@/components/dashboard/referrers"
import { StatRow } from "@/components/dashboard/stat-row"
import { TopPages } from "@/components/dashboard/top-pages"
import { TrafficChart } from "@/components/dashboard/traffic-chart"
import type { Filters } from "@/lib/filters"
import type { Stats } from "@/lib/stats"

const LIST_LIMIT = 10
const PLATFORM_LIMIT = 8

function MorePlatforms({ count, href }: { count: number; href?: string }) {
  if (count <= 0) return null
  const label = `+${count} more platform${count === 1 ? "" : "s"}`
  return href ? (
    <Link
      href={href}
      className="inline-flex items-center gap-1 self-start px-2.5 text-muted-foreground text-sm hover:text-foreground"
    >
      {label} <ArrowRight className="size-3.5" />
    </Link>
  ) : (
    <span className="px-2.5 text-muted-foreground text-sm">{label}</span>
  )
}

export interface OverviewProps {
  stats: Stats
  events: ActivityItem[]
  filters: Filters
  now?: number
  openPage: (page: string) => void
  openPlatform: (platform: string) => void
  /** Link to the full Platforms view (live dashboard only). */
  platformsHref?: string
}

/** Left column: numbers, traffic, timing and referrals. */
function MainColumn({
  stats,
  filters,
}: Pick<OverviewProps, "stats" | "filters">) {
  const hourly = filters.range === "24h"
  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-6 lg:col-span-8">
      <StatRow stats={stats} hourly={hourly} />
      <Panel
        index={0}
        title="AI traffic"
        description={`Visits per ${hourly ? "hour" : "day"}`}
      >
        <TrafficChart
          timeline={stats.timeline}
          platformTimeline={stats.platform_timeline}
          hourly={hourly}
        />
      </Panel>
      <Panel
        index={1}
        title="When crawlers visit"
        description="AI crawler visits by weekday and hour (UTC)"
      >
        <Heatmap cells={stats.heatmap} />
      </Panel>
      <Panel
        index={2}
        title="AI referrals by source"
        description="Assistants sending people to your site"
        className="lg:flex-1"
      >
        <Referrers referrers={stats.referrers} />
      </Panel>
    </div>
  )
}

/** Right column: what gets read and who reads it. */
function SideColumn({
  stats,
  filters,
  openPage,
  openPlatform,
  platformsHref,
}: Omit<OverviewProps, "events" | "now">) {
  return (
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
        className="lg:flex-1"
        description={
          filters.platform
            ? "This report covers one platform"
            : "Click a platform for its report"
        }
      >
        <div className="flex flex-1 flex-col gap-4">
          <Platforms
            platforms={stats.by_platform.slice(0, PLATFORM_LIMIT)}
            onSelect={filters.platform ? undefined : openPlatform}
          />
          <MorePlatforms
            count={stats.by_platform.length - PLATFORM_LIMIT}
            href={platformsHref}
          />
          {/* Pinned to the bottom so the panel ends level with the left column. */}
          <div className="mt-auto">
            <TypeBreakdown timeline={stats.timeline} />
          </div>
        </div>
      </Panel>
    </div>
  )
}

/** The overview: headline numbers, charts, rankings, crawlers and recent activity. */
export function Overview(props: OverviewProps) {
  const { stats, events, filters, now, openPage, openPlatform } = props
  const crawlers = stats.by_bot.length
  return (
    <>
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-12">
        <MainColumn stats={stats} filters={filters} />
        <SideColumn {...props} />
      </div>
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-12">
        <Panel
          index={5}
          title="Crawlers"
          description={
            crawlers > LIST_LIMIT
              ? `Top ${LIST_LIMIT} of ${crawlers} bots seen in this range`
              : "Every bot seen in this range"
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
  )
}
