"use client"

import { useMemo } from "react"

import { ActivityLog } from "@/components/dashboard/activity-log"
import type { LogEvent } from "@/components/dashboard/activity-table"
import type { Section } from "@/components/dashboard/dashboard-tabs"
import { FilterBar, type FilterChange } from "@/components/dashboard/filters"
import { PagesView } from "@/components/dashboard/pages-view"
import { Panel } from "@/components/dashboard/panel"
import { PlatformsView } from "@/components/dashboard/platforms-view"
import { DashboardView } from "@/components/dashboard/view"
import { ExportCard } from "@/components/site/export-card"
import { InstallCard } from "@/components/site/install-card"
import { DEMO_DOMAIN } from "@/lib/demo-data"
import { type Cursor, LOG_PAGE_SIZE } from "@/lib/events"
import { type Filters, RANGES } from "@/lib/filters"
import { visits } from "@/lib/format"
import {
  type CrawlerEvent,
  computePages,
  computeStats,
  recentEvents,
} from "@/lib/stats"

export interface DemoViewProps {
  section: Section
  events: CrawlerEvent[]
  filters: Filters & { site: string }
  now: number
  origin: string
  onChange: (change: FilterChange) => void
  onOpen: (section: Section, change: FilterChange) => void
  onExport: () => void
}

const toLog = (e: CrawlerEvent): LogEvent => ({
  ...e,
  user_agent: e.user_agent ?? "",
  referrer: e.referrer ?? null,
})

/** The activity log over the demo events, served in batches like the real one. */
function DemoActivity({
  list,
  now,
  onOpenPage,
}: {
  list: LogEvent[]
  now: number
  onOpenPage: (page: string) => void
}) {
  const after = async ({ id }: Cursor) => {
    const at = list.findIndex((e) => e.id === id)
    return list.slice(at + 1, at + 1 + LOG_PAGE_SIZE)
  }
  return (
    <Panel
      title="Activity log"
      description={`Every recorded visit, newest first · ${visits(list.length)}`}
    >
      <ActivityLog
        initial={list.slice(0, LOG_PAGE_SIZE)}
        total={list.length}
        pageSize={LOG_PAGE_SIZE}
        loadMore={after}
        now={now}
        onSelectPage={onOpenPage}
      />
    </Panel>
  )
}

/** One of the five views, computed in the browser from the demo events. */
export function DemoView(props: DemoViewProps) {
  const { section, events, filters, now, onChange, onOpen } = props
  const options = useMemo(
    () => ({
      now: new Date(now),
      since: new Date(now - RANGES[filters.range].ms),
      platform: section === "platforms" ? undefined : filters.platform,
      type: filters.type,
      page:
        section === "overview" || section === "activity"
          ? filters.page
          : undefined,
    }),
    [now, filters, section]
  )
  const stats = useMemo(() => computeStats(events, options), [events, options])
  const openPage = (page: string) => onOpen("overview", { page })

  if (section === "overview") {
    const recent = recentEvents(events, options, 10)
    return (
      <DashboardView
        stats={stats}
        events={recent}
        filters={filters}
        domain={DEMO_DOMAIN}
        now={now}
        onChange={onChange}
      />
    )
  }
  if (section === "settings") {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <InstallCard
          domain={DEMO_DOMAIN}
          origin={props.origin}
          siteId="YOUR_SITE_ID"
        />
        <ExportCard siteId="demo" onExport={props.onExport} />
      </div>
    )
  }
  const content =
    section === "platforms" ? (
      <PlatformsView
        stats={stats}
        filters={filters}
        now={now}
        onChange={onChange}
        onOpenPlatform={(platform) => onOpen("overview", { platform })}
      />
    ) : section === "pages" ? (
      <PagesView
        pages={computePages(events, options)}
        filters={filters}
        now={now}
        onChange={onChange}
        onOpenPage={openPage}
      />
    ) : (
      <DemoActivity
        key={JSON.stringify(options)}
        list={recentEvents(events, options, events.length).map(toLog)}
        now={now}
        onOpenPage={openPage}
      />
    )
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <FilterBar
        filters={filters}
        platforms={stats.platforms}
        onChange={onChange}
        hidePlatform={section === "platforms"}
      />
      {content}
    </div>
  )
}
