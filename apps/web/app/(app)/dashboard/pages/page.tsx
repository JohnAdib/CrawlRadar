import type { Metadata } from "next"

import { LiveFrame } from "@/components/dashboard/live-frame"
import { LivePages } from "@/components/dashboard/live-views"
import { DashboardShell } from "@/components/dashboard/shell"

import { loadDashboard, loadPages, loadStats, type SearchParams } from "../data"

export const metadata: Metadata = { title: "Pages", robots: { index: false } }

/** Pages (PRD 7.1, US-2): every page AI crawlers read, ranked by visits. */
export default async function PagesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const ctx = await loadDashboard(searchParams)
  const filters = { ...ctx.filters, page: undefined }
  const [pages, stats] = await Promise.all([
    loadPages({ ...ctx, filters }),
    loadStats({ ...ctx, filters }),
  ])
  return (
    <DashboardShell filters={filters}>
      <LiveFrame platforms={stats.platforms}>
        <LivePages pages={pages} />
      </LiveFrame>
    </DashboardShell>
  )
}
