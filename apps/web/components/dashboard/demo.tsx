"use client"

import { Button } from "@crawlradar/ui/components/button"
import { Download } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { DashboardView } from "@/components/dashboard/view"
import { DEMO_DOMAIN, generateDemoEvents } from "@/lib/demo-data"
import { type Filters, RANGES } from "@/lib/filters"
import { computeStats, recentEvents } from "@/lib/stats"

/** The dashboard running entirely in the browser on generated example data. */
export function DemoDashboard({
  now,
  signedIn,
}: {
  now: number
  signedIn?: boolean
}) {
  const router = useRouter()
  const events = useMemo(() => generateDemoEvents(now), [now])
  const [filters, setFilters] = useState<Filters & { site: string }>({
    site: "demo",
    range: "7d",
  })

  // Back/forward restore the demo view recorded for that history entry.
  useEffect(() => {
    const restore = (event: PopStateEvent) =>
      setFilters(
        (event.state?.crawlradarDemo as typeof filters | undefined) ?? {
          site: "demo",
          range: "7d",
        }
      )
    window.addEventListener("popstate", restore)
    return () => window.removeEventListener("popstate", restore)
  }, [])

  const options = useMemo(
    () => ({
      now: new Date(now),
      since: new Date(now - RANGES[filters.range].ms),
      platform: filters.platform,
      type: filters.type,
      page: filters.page,
    }),
    [now, filters]
  )
  const stats = useMemo(() => computeStats(events, options), [events, options])
  const recent = useMemo(() => recentEvents(events, options), [events, options])

  function explainExport() {
    toast("This is example data", {
      description:
        "Add your own site to collect real crawler data, then export it as CSV.",
      action: {
        label: signedIn ? "Open dashboard" : "Get started",
        onClick: () => router.push(signedIn ? "/dashboard" : "/login"),
      },
    })
  }

  return (
    <DashboardView
      title="Example dashboard"
      stats={stats}
      events={recent}
      filters={filters}
      domain={DEMO_DOMAIN}
      now={now}
      onChange={(change) => {
        const next = { ...filters, ...change }
        // Opening or leaving a page/platform report is a navigation: record it so
        // the browser's Back button returns to the previous view of the demo.
        if (next.page !== filters.page || next.platform !== filters.platform) {
          window.history.pushState({ crawlradarDemo: next }, "")
        }
        setFilters(next)
      }}
      actions={
        <Button
          variant="outline"
          className="bg-background"
          onClick={explainExport}
        >
          <Download /> <span className="hidden sm:inline">Export</span> CSV
        </Button>
      }
    />
  )
}
