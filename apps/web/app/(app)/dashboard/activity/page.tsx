import type { Metadata } from "next"

import { LiveFrame } from "@/components/dashboard/live-frame"
import { LiveActivity } from "@/components/dashboard/live-views"
import { DashboardShell } from "@/components/dashboard/shell"
import { ExportMenu } from "@/components/export-menu"

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

const PAGE_SIZE = 50

/** Activity log (PRD 7.1, FR-3.6): every recorded visit, filterable and paginated. */
export default async function ActivityPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const ctx = await loadDashboard(searchParams)
  const page = Math.max(
    1,
    Number.parseInt(String(ctx.params.p ?? "1"), 10) || 1
  )
  const [log, stats] = await Promise.all([
    loadEvents(ctx, page, PAGE_SIZE),
    loadStats(ctx),
  ])
  return (
    <DashboardShell filters={ctx.filters}>
      <LiveFrame
        domain={ctx.site.domain}
        sites={ctx.sites}
        platforms={stats.platforms}
        actions={<ExportMenu filters={ctx.filters} />}
      >
        <LiveActivity
          events={log.events}
          total={log.total}
          page={page}
          pageSize={PAGE_SIZE}
        />
      </LiveFrame>
    </DashboardShell>
  )
}
