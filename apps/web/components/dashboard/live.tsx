"use client"

import {
  DashboardSiteSwitcher,
  useDashboardNav,
} from "@/components/dashboard/shell"
import {
  DashboardView,
  type DashboardViewProps,
} from "@/components/dashboard/view"
import { ExportMenu } from "@/components/export-menu"

/** The real dashboard: filters live in the URL and the server re-renders with new data. */
export function LiveDashboard({
  sites,
  ...props
}: Omit<
  DashboardViewProps,
  "onChange" | "pending" | "actions" | "filters" | "switcher"
> & {
  sites: { id: string; domain: string }[]
}) {
  const { filters, pending, navigate } = useDashboardNav()
  return (
    <DashboardView
      {...props}
      filters={filters}
      pending={pending}
      onChange={navigate}
      switcher={<DashboardSiteSwitcher sites={sites} />}
      actions={<ExportMenu filters={filters} />}
    />
  )
}
