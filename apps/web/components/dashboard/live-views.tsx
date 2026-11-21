"use client"

// Thin client wrappers that connect each view to the URL-driven dashboard navigation.
import { useRouter } from "next/navigation"

import {
  ActivityTable,
  type LogEvent,
} from "@/components/dashboard/activity-table"
import { NoResults } from "@/components/dashboard/no-results"
import { PagesView } from "@/components/dashboard/pages-view"
import { Pagination } from "@/components/dashboard/pagination"
import { Panel } from "@/components/dashboard/panel"
import { PlatformsView } from "@/components/dashboard/platforms-view"
import { useDashboardNav } from "@/components/dashboard/shell"
import { type Filters, toQuery } from "@/lib/filters"
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
  page,
  pageSize,
}: {
  events: LogEvent[]
  total: number
  page: number
  pageSize: number
}) {
  const { filters, navigate } = useDashboardNav()
  const open = useOpenReport()
  if (total === 0) return <NoResults filters={filters} onChange={navigate} />
  return (
    <Panel
      title="Activity log"
      description="Every recorded visit, newest first"
    >
      <ActivityTable events={events} onSelectPage={(p) => open({ page: p })} />
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        href={(p) =>
          `/dashboard/activity${toQuery({ ...filters, p: p > 1 ? p : undefined })}`
        }
      />
    </Panel>
  )
}
