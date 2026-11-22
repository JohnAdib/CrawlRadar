"use client"

import { moreEvents } from "@/app/(app)/dashboard/activity/actions"
import type { LogEvent } from "@/components/dashboard/activity-table"
import { PageVisits } from "@/components/dashboard/page-visits"
import { useDashboardNav } from "@/components/dashboard/shell"
import {
  DashboardView,
  type DashboardViewProps,
} from "@/components/dashboard/view"
import { toQuery } from "@/lib/filters"

/** The live Overview: filters live in the URL and the server re-renders with new data. */
export function LiveDashboard({
  total,
  ...props
}: Omit<
  DashboardViewProps,
  "onChange" | "pending" | "filters" | "platformsHref" | "events" | "pageVisits"
> & { events: LogEvent[]; total: number }) {
  const { filters, pending, navigate } = useDashboardNav()
  const { site, ...params } = filters
  const { range, type } = params
  return (
    <DashboardView
      {...props}
      pageVisits={
        filters.page && (
          <PageVisits
            page={filters.page}
            events={props.events}
            total={total}
            loadMore={(cursor) => moreEvents(site, params, cursor)}
          />
        )
      }
      filters={filters}
      pending={pending}
      onChange={navigate}
      platformsHref={`/dashboard/platforms${toQuery({ site, range, type })}`}
    />
  )
}
