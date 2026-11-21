"use client"

import { Button } from "@crawlradar/ui/components/button"
import { Download } from "lucide-react"
import { useMemo, useState } from "react"

import { DashboardView } from "@/components/dashboard/view"
import { csvRow } from "@/lib/csv"
import { DEMO_DOMAIN, generateDemoEvents } from "@/lib/demo-data"
import { type Filters, RANGES } from "@/lib/filters"
import { computeStats, recentEvents } from "@/lib/stats"

const COLUMNS = [
  "timestamp",
  "page_url",
  "bot_name",
  "platform",
  "bot_type",
  "user_agent",
] as const

/** The dashboard running entirely in the browser on generated example data. */
export function DemoDashboard({ now }: { now: number }) {
  const events = useMemo(() => generateDemoEvents(now), [now])
  const [filters, setFilters] = useState<Filters & { site: string }>({
    site: "demo",
    range: "7d",
  })

  const options = useMemo(
    () => ({
      now: new Date(now),
      since: new Date(now - RANGES[filters.range].ms),
      platform: filters.platform,
      type: filters.type,
    }),
    [now, filters]
  )
  const stats = useMemo(() => computeStats(events, options), [events, options])
  const recent = useMemo(() => recentEvents(events, options), [events, options])

  function exportCsv() {
    const rows = recentEvents(events, options, Number.POSITIVE_INFINITY)
    const csv =
      csvRow([...COLUMNS]) +
      rows.map((r) => csvRow(COLUMNS.map((c) => r[c]))).join("")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
    const link = Object.assign(document.createElement("a"), {
      href: url,
      download: `crawlradar-demo-${filters.range}.csv`,
    })
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardView
      title="Example dashboard"
      stats={stats}
      events={recent}
      filters={filters}
      domain={DEMO_DOMAIN}
      now={now}
      onChange={(change) => setFilters((f) => ({ ...f, ...change }))}
      actions={
        <Button variant="outline" className="bg-background" onClick={exportCsv}>
          <Download /> <span className="hidden sm:inline">Export</span> CSV
        </Button>
      }
    />
  )
}
