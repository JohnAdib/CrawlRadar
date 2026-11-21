"use client"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs"
import { FilterBar } from "@/components/dashboard/filters"
import { PendingArea, ProgressBar } from "@/components/dashboard/pending-area"
import {
  DashboardSiteSwitcher,
  useDashboardNav,
} from "@/components/dashboard/shell"
import { RANGES } from "@/lib/filters"

export type SiteOption = { id: string; domain: string }

/**
 * Header, section tabs and filters around one dashboard view (Platforms, Pages, Activity,
 * Settings). Filters live in the URL; the server re-renders the view with new data.
 */
export function LiveFrame({
  domain,
  sites,
  platforms,
  filters: show = true,
  hidePlatform,
  actions,
  children,
}: {
  domain: string
  sites: SiteOption[]
  platforms: string[]
  filters?: boolean
  hidePlatform?: boolean
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  const { filters, pending, navigate } = useDashboardNav()
  const subtitle = show
    ? `${domain} · last ${RANGES[filters.range].label}`
    : domain
  return (
    <div className="group/dash flex flex-col gap-4 sm:gap-6">
      <ProgressBar active={pending} />
      <DashboardHeader
        title="AI crawler activity"
        subtitle={subtitle}
        switcher={<DashboardSiteSwitcher sites={sites} />}
        actions={actions}
      />
      <DashboardTabs filters={filters} />
      {show && (
        <FilterBar
          filters={filters}
          platforms={platforms}
          onChange={navigate}
          pending={pending}
          hidePlatform={hidePlatform}
        />
      )}
      <PendingArea>{children}</PendingArea>
    </div>
  )
}
