import type { Metadata } from "next"
import { Listening } from "@/components/dashboard/listening"
import { LiveDashboard } from "@/components/dashboard/live"
import { DashboardShell } from "@/components/dashboard/shell"
import { LOG_PAGE_SIZE } from "@/lib/events"
import { appOrigin } from "@/lib/origin"
import { hybrid } from "@/lib/snippet"

import { loadDashboard, loadEvents, loadStats, type SearchParams } from "./data"

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false },
}

/** Overview (PRD 7.1): headline numbers, trends, top pages, platforms, recent activity. */
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const ctx = await loadDashboard(searchParams)
  const [stats, recent] = await Promise.all([
    loadStats(ctx),
    // A page report lists every visit to the page; the overview, the latest 10.
    loadEvents(ctx, ctx.filters.page ? LOG_PAGE_SIZE : 10),
  ])

  return (
    <DashboardShell filters={ctx.filters}>
      {stats.platforms.length === 0 ? (
        // No visit recorded yet: keep the install front and centre, without empty views.
        <Listening
          domain={ctx.site.domain}
          code={hybrid(await appOrigin(), ctx.site.id)}
        />
      ) : (
        <LiveDashboard
          stats={stats}
          events={recent.events}
          total={recent.total}
          domain={ctx.site.domain}
        />
      )}
    </DashboardShell>
  )
}
