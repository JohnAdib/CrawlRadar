"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import {
  DashboardTabs,
  SECTIONS,
  type Section,
  sectionFor,
} from "@/components/dashboard/dashboard-tabs"
import { SiteSwitcher } from "@/components/dashboard/site-switcher"
import { DashboardSkeleton } from "@/components/dashboard/skeleton"
import { ExportMenu } from "@/components/export-menu"
import { type Filters, parseFilters, toQuery } from "@/lib/filters"

export interface ChromeSite {
  id: string
  domain: string
  /** False until the first visit is recorded: the views stay hidden until then. */
  hasData: boolean
}

/**
 * The part of the dashboard that stays put across its views: title, site, site picker,
 * export and the section tabs. Only the content below changes (or shows a skeleton).
 */
/** The current view's filters: Platforms ignores platform and page, Pages ignores page. */
function exportFilters(filters: Filters, site: string, section: Section) {
  const pageApplies = section === "overview" || section === "activity"
  return {
    ...filters,
    site,
    platform: section === "platforms" ? undefined : filters.platform,
    page: pageApplies ? filters.page : undefined,
  }
}

export function DashboardChrome({
  sites,
  children,
}: {
  sites: ChromeSite[]
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [switching, startSwitch] = useTransition()
  const filters = parseFilters(Object.fromEntries(params))
  const site = sites.find((s) => s.id === filters.site) ?? sites[0]!
  const section = sectionFor(pathname)

  const hrefFor = (target: Section) => {
    const href = SECTIONS.find((s) => s.id === target)!.href
    if (target === "settings") return href + toQuery({ site: site.id })
    const { range, platform, type } = filters
    return href + toQuery({ site: site.id, range, platform, type })
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <DashboardHeader
        title="AI crawler activity"
        subtitle={site.domain}
        switcher={
          sites.length > 1 && (
            <SiteSwitcher
              value={site.id}
              sites={sites}
              onChange={(change) =>
                startSwitch(() =>
                  router.push(`${pathname}${toQuery({ site: change.site })}`)
                )
              }
            />
          )
        }
        actions={
          site.hasData && section !== "settings" ? (
            <ExportMenu filters={exportFilters(filters, site.id, section)} />
          ) : undefined
        }
      />
      {site.hasData && <DashboardTabs active={section} hrefFor={hrefFor} />}
      {switching ? <DashboardSkeleton /> : children}
    </div>
  )
}
