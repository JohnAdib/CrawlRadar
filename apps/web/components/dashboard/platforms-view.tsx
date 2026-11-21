"use client"

import type { FilterChange } from "@/components/dashboard/filters"
import { NoResults } from "@/components/dashboard/no-results"
import { Panel } from "@/components/dashboard/panel"
import { PlatformShareChart } from "@/components/dashboard/platform-share-chart"
import { PlatformsTable } from "@/components/dashboard/platforms-table"
import { TrafficChart } from "@/components/dashboard/traffic-chart"
import type { Filters } from "@/lib/filters"
import { platformRows, type Stats } from "@/lib/stats"

/** Platforms view (PRD 7.1): share, trend and a row per platform. */
export function PlatformsView({
  stats,
  filters,
  now,
  onChange,
  onOpenPlatform,
}: {
  stats: Stats
  filters: Filters
  now?: number
  onChange: (change: FilterChange) => void
  onOpenPlatform: (platform: string) => void
}) {
  if (stats.total === 0)
    return <NoResults filters={filters} onChange={onChange} />
  const rows = platformRows(stats.by_bot)
  return (
    <>
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-12">
        <Panel
          index={0}
          title="Share of visits"
          description="All visits, by platform"
          className="lg:col-span-5"
        >
          <PlatformShareChart platforms={stats.by_platform} />
        </Panel>
        <Panel
          index={1}
          title="Crawler visits over time"
          description="Top platforms, stacked"
          className="lg:col-span-7"
        >
          <TrafficChart
            timeline={stats.timeline}
            platformTimeline={stats.platform_timeline}
            hourly={filters.range === "24h"}
          />
        </Panel>
      </div>
      <Panel
        index={2}
        title={`${rows.length} platform${rows.length === 1 ? "" : "s"}`}
        description="Click a platform for its full report"
      >
        <PlatformsTable rows={rows} now={now} onSelect={onOpenPlatform} />
      </Panel>
    </>
  )
}
