import type { Metadata } from "next"

import { LiveFrame } from "@/components/dashboard/live-frame"
import { LivePlatforms } from "@/components/dashboard/live-views"
import { DashboardShell } from "@/components/dashboard/shell"
import { ExportMenu } from "@/components/export-menu"

import { loadDashboard, loadStats, type SearchParams } from "../data"

export const metadata: Metadata = {
  title: "Platforms",
  robots: { index: false },
}

/** Platforms (PRD 7.1, US-1): which AI platforms visit, how much, and with which bots. */
export default async function PlatformsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const ctx = await loadDashboard(searchParams)
  const filters = { ...ctx.filters, platform: undefined, page: undefined }
  const stats = await loadStats({ ...ctx, filters })
  return (
    <DashboardShell filters={filters}>
      <LiveFrame
        domain={ctx.site.domain}
        sites={ctx.sites}
        platforms={stats.platforms}
        hidePlatform
        actions={<ExportMenu filters={filters} />}
      >
        <LivePlatforms stats={stats} />
      </LiveFrame>
    </DashboardShell>
  )
}
