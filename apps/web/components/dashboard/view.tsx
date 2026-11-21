"use client"

import { useRef } from "react"

import type { ActivityItem } from "@/components/dashboard/activity-feed"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { FilterBar, type FilterChange } from "@/components/dashboard/filters"
import { NoResults } from "@/components/dashboard/no-results"
import { Overview } from "@/components/dashboard/overview"
import { PendingArea, ProgressBar } from "@/components/dashboard/pending-area"
import { ReportHeader } from "@/components/dashboard/report-header"
import { type Filters, RANGES } from "@/lib/filters"
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
  /** Section tabs (live dashboard only). */
  tabs?: React.ReactNode
  /** Link to the full Platforms view (live dashboard only). */
  platformsHref?: string
  /** Fixed clock for relative times (keeps server and client render identical). */
  now?: number
  title?: string
}

/** The overview page, shared by the live dashboard and the home page demo. */
export function DashboardView({
  stats,
  events,
  filters,
  domain,
  onChange,
  pending,
  switcher,
  actions,
  tabs,
  platformsHref,
  now,
  title = "AI crawler activity",
}: DashboardViewProps) {
  const range = RANGES[filters.range].label
  const root = useRef<HTMLDivElement>(null)

  // Opening a report is a navigation: bring the top of the dashboard back into view.
  function open(change: FilterChange) {
    onChange(change)
    root.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div
      ref={root}
      className="group/dash flex scroll-mt-20 flex-col gap-4 sm:gap-6"
    >
      <ProgressBar active={pending} />
      <DashboardHeader
        title={title}
        subtitle={`${domain} · last ${range}`}
        switcher={switcher}
        actions={actions}
      />
      {tabs}
      <FilterBar
        filters={filters}
        platforms={stats.platforms}
        onChange={onChange}
        pending={pending}
      />
      <PendingArea>
        {(filters.page || filters.platform) && (
          <ReportHeader
            filters={filters}
            domain={domain}
            range={range}
            onBack={() => open({ page: undefined, platform: undefined })}
          />
        )}
        {stats.total === 0 ? (
          <NoResults filters={filters} onChange={onChange} />
        ) : (
          <Overview
            stats={stats}
            events={events}
            filters={filters}
            now={now}
            openPage={(page) => open({ page })}
            openPlatform={(platform) => open({ platform })}
            platformsHref={platformsHref}
          />
        )}
      </PendingArea>
    </div>
  )
}
