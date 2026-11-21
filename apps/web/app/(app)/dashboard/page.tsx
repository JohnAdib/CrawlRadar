import type { Metadata } from "next"
import { Listening } from "@/components/dashboard/listening"
import { LiveDashboard } from "@/components/dashboard/live"
import { LiveFrame } from "@/components/dashboard/live-frame"
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
    loadEvents(ctx, 1, 10),
  ])

  return (
    <DashboardShell filters={ctx.filters}>
      {stats.platforms.length === 0 ? (
        // No data has ever arrived for this site: keep the install front and centre.
        <LiveFrame
          domain={ctx.site.domain}
          sites={ctx.sites}
          platforms={[]}
          filters={false}
        >
          <Listening
            domain={ctx.site.domain}
            code={snippet(await appOrigin(), ctx.site.id)}
          />
        </LiveFrame>
      ) : (
        <LiveDashboard
          stats={stats}
          events={recent.events}
          domain={ctx.site.domain}
          sites={ctx.sites}
        />
      )}
    </DashboardShell>
  )
}
