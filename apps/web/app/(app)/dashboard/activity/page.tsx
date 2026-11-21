import type { Metadata } from "next"

import { LiveFrame } from "@/components/dashboard/live-frame"
import { LiveActivity } from "@/components/dashboard/live-views"
import { DashboardShell } from "@/components/dashboard/shell"
import { LOG_PAGE_SIZE } from "@/lib/events"

import {
  loadDashboard,
  loadEvents,
  loadStats,
  type SearchParams,
} from "../data"

export const metadata: Metadata = {
  title: "Activity log",
  robots: { index: false },
}

/** Activity log (PRD 7.1, FR-3.6): every recorded visit, filterable, loading as you scroll. */
export default async function ActivityPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const ctx = await loadDashboard(searchParams)
  const [log, stats] = await Promise.all([
    loadEvents(ctx, LOG_PAGE_SIZE),
    loadStats(ctx),
  ])
  return (
    <DashboardShell filters={ctx.filters}>
      <LiveFrame platforms={stats.platforms}>
        <LiveActivity events={log.events} total={log.total} />
      </LiveFrame>
    </DashboardShell>
  )
}
