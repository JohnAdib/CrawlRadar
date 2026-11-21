"use client"

// Thin client wrappers that connect each view to the URL-driven dashboard navigation.
import { useRouter } from "next/navigation"

import { moreEvents } from "@/app/(app)/dashboard/activity/actions"
import { ActivityLog } from "@/components/dashboard/activity-log"
import type { LogEvent } from "@/components/dashboard/activity-table"
import { NoResults } from "@/components/dashboard/no-results"
import { PagesView } from "@/components/dashboard/pages-view"
import { Panel } from "@/components/dashboard/panel"
import { PlatformsView } from "@/components/dashboard/platforms-view"
import { useDashboardNav } from "@/components/dashboard/shell"
import { LOG_PAGE_SIZE } from "@/lib/events"
import { type Filters, toQuery } from "@/lib/filters"
import { visits } from "@/lib/format"
import type { PageRow, Stats } from "@/lib/stats"

/** Opens the overview as a page or platform report. */
function useOpenReport() {
  const router = useRouter()
  const { filters } = useDashboardNav()
  return (change: Partial<Filters>) =>
    router.push(`/dashboard${toQuery({ ...filters, ...change })}`)
}

export function LivePlatforms({ stats }: { stats: Stats }) {
  const { filters, navigate } = useDashboardNav()
  const open = useOpenReport()
  return (
    <PlatformsView
      stats={stats}
      filters={filters}
      onChange={navigate}
      onOpenPlatform={(platform) => open({ platform })}
    />
  )
}

export function LivePages({ pages }: { pages: PageRow[] }) {
  const { filters, navigate } = useDashboardNav()
  const open = useOpenReport()
  return (
    <PagesView
      pages={pages}
      filters={filters}
      onChange={navigate}
      onOpenPage={(page) => open({ page })}
    />
  )
}

export function LiveActivity({
  events,
  total,
}: {
  events: LogEvent[]
  total: number
}) {
  const { filters, navigate } = useDashboardNav()
  const open = useOpenReport()
  if (total === 0) return <NoResults filters={filters} onChange={navigate} />
  const { site, ...params } = filters
  return (
    <Panel
      title="Activity log"
      description={`Every recorded visit, newest first · ${visits(total)}`}
    >
      <ActivityLog
        // A new filter starts a new list.
        key={toQuery(filters)}
        initial={events}
        total={total}
        pageSize={LOG_PAGE_SIZE}
        loadMore={(cursor) => moreEvents(site, params, cursor)}
        onSelectPage={(page) => open({ page })}
      />
    </Panel>
  )
}
