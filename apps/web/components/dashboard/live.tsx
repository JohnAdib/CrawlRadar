"use client"

import { useDashboardNav } from "@/components/dashboard/shell"
import {
  DashboardView,
  type DashboardViewProps,
} from "@/components/dashboard/view"
import { toQuery } from "@/lib/filters"

/** The live Overview: filters live in the URL and the server re-renders with new data. */
export function LiveDashboard(
  props: Omit<
    DashboardViewProps,
    "onChange" | "pending" | "filters" | "platformsHref"
  >
) {
  const { filters, pending, navigate } = useDashboardNav()
  const { site, range, type } = filters
  return (
    <DashboardView
      {...props}
      filters={filters}
      pending={pending}
      onChange={navigate}
      platformsHref={`/dashboard/platforms${toQuery({ site, range, type })}`}
    />
  )
}
