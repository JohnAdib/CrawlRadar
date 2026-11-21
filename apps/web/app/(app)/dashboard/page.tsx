import type { Metadata } from "next"
import { Listening } from "@/components/dashboard/listening"
import { LiveDashboard } from "@/components/dashboard/live"
import { DashboardShell } from "@/components/dashboard/shell"
import { appOrigin } from "@/lib/origin"
import { snippet } from "@/lib/snippet"

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
    loadEvents(ctx, 10),
  ])

  return (
    <DashboardShell filters={ctx.filters}>
      {stats.platforms.length === 0 ? (
        // No visit recorded yet: keep the install front and centre, without empty views.
        <Listening
          domain={ctx.site.domain}
          code={snippet(await appOrigin(), ctx.site.id)}
        />
      ) : (
        <LiveDashboard
          stats={stats}
          events={recent.events}
          domain={ctx.site.domain}
        />
      )}
    </DashboardShell>
  )
}
