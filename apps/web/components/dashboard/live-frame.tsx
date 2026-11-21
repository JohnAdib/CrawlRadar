"use client"

import { FilterBar } from "@/components/dashboard/filters"
import { PendingArea, ProgressBar } from "@/components/dashboard/pending-area"
import { useDashboardNav } from "@/components/dashboard/shell"

/**
 * Filters and content of one live view, under the fixed header and tabs. Filters live in
 * the URL; the server re-renders the view, and the content dims while it loads.
 */
export function LiveFrame({
  platforms,
  filters: show = true,
  hidePlatform,
  children,
}: {
  platforms: string[]
  filters?: boolean
  hidePlatform?: boolean
  children: React.ReactNode
}) {
  const { filters, pending, navigate } = useDashboardNav()
  return (
    <div className="group/dash flex flex-col gap-4 sm:gap-6">
      <ProgressBar active={pending} />
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
