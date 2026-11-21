"use client"

import { DashboardTabs } from "@/components/dashboard/dashboard-tabs"
import type { SiteOption } from "@/components/dashboard/live-frame"
import {
  DashboardSiteSwitcher,
  useDashboardNav,
} from "@/components/dashboard/shell"
import {
  DashboardView,
  type DashboardViewProps,
} from "@/components/dashboard/view"
import { ExportMenu } from "@/components/export-menu"
import { toQuery } from "@/lib/filters"

/** The real overview: filters live in the URL and the server re-renders with new data. */
export function LiveDashboard({
  sites,
  ...props
}: Omit<
  DashboardViewProps,
  | "onChange"
  | "pending"
  | "actions"
  | "filters"
  | "switcher"
  | "tabs"
  | "platformsHref"
> & {
  sites: SiteOption[]
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
      tabs={<DashboardTabs filters={filters} />}
      platformsHref={`/dashboard/platforms${toQuery({ site: filters.site, range: filters.range, type: filters.type })}`}
    />
  )
}
