"use client"

import { Button } from "@crawlradar/ui/components/button"
import { Download } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import {
  DashboardTabs,
  type Section,
} from "@/components/dashboard/dashboard-tabs"
import { DemoView } from "@/components/dashboard/demo-views"
import type { FilterChange } from "@/components/dashboard/filters"
import { DEMO_DOMAIN, generateDemoEvents } from "@/lib/demo-data"
import type { Filters } from "@/lib/filters"

type DemoState = { section: Section; filters: Filters & { site: string } }

const START: DemoState = {
  section: "overview",
  filters: { site: "demo", range: "30d" },
}

/**
 * The real dashboard (the same five views, header and tabs) running entirely in the
 * browser on generated example data.
 */
export function DemoDashboard({
  now,
  origin,
  signedIn,
}: {
  now: number
  origin: string
  signedIn?: boolean
}) {
  const router = useRouter()
  const events = useMemo(() => generateDemoEvents(now), [now])
  const [state, setState] = useState<DemoState>(START)

  // Back/forward restore the demo view recorded for that history entry.
  useEffect(() => {
    const restore = (event: PopStateEvent) =>
      setState((event.state?.crawlradarDemo as DemoState | undefined) ?? START)
    window.addEventListener("popstate", restore)
    return () => window.removeEventListener("popstate", restore)
  }, [])

  // Switching views or opening a report is a navigation: Back returns to the last view.
  function go(section: Section, change: FilterChange = {}) {
    const next = { section, filters: { ...state.filters, ...change } }
    window.history.pushState({ crawlradarDemo: next }, "")
    setState(next)
  }
  function filter(change: FilterChange) {
    const { filters } = state
    const report = "page" in change || "platform" in change
    if (
      report &&
      (change.page !== filters.page || change.platform !== filters.platform)
    ) {
      return go(state.section, change)
    }
    setState({ ...state, filters: { ...filters, ...change } })
  }
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
    <div className="flex flex-col gap-4 sm:gap-6">
      <DashboardHeader
        title="AI crawler activity"
        subtitle={DEMO_DOMAIN}
        actions={
          state.section !== "settings" && (
            <Button
              variant="outline"
              className="bg-background"
              onClick={explainExport}
            >
              <Download /> <span className="hidden sm:inline">Export</span> CSV
            </Button>
          )
        }
      />
      <DashboardTabs
        active={state.section}
        onSelect={(section) => go(section)}
      />
      <DemoView
        section={state.section}
        events={events}
        filters={state.filters}
        now={now}
        origin={origin}
        onChange={filter}
        onOpen={go}
        onExport={explainExport}
      />
    </div>
  )
}
