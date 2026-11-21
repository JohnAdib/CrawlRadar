import type { Metadata } from "next"

import { DetailsCard } from "@/components/site/details-card"
import { ExportCard } from "@/components/site/export-card"
import { InstallCard } from "@/components/site/install-card"
import { PreviewCard, RemoveCard } from "@/components/site/side-cards"
import { SiteStatus } from "@/components/site-status"
import { appOrigin } from "@/lib/origin"
import { siteActivity } from "@/lib/sites"
import { pixel, snippet } from "@/lib/snippet"

import { loadDashboard, type SearchParams } from "../data"

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false },
}

/** Settings (PRD 7.1): the install snippet, CSV export and the site itself. */
export default async function SettingsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const ctx = await loadDashboard(searchParams)
  const { site } = ctx
  const [activity, origin] = await Promise.all([
    siteActivity(ctx.supabase, site.id),
    appOrigin(),
  ])
  return (
    <div className="fade-in grid animate-in items-start gap-6 duration-300 motion-reduce:animate-none lg:grid-cols-3">
      <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
        <InstallCard
          domain={site.domain}
          code={snippet(origin, site.id)}
          pixel={pixel(origin, site.id)}
        />
        <ExportCard siteId={site.id} />
        <DetailsCard
          site={site}
          visits30d={activity.visits30d}
          status={
            <SiteStatus
              lastSeen={activity.lastSeen}
              installed={Boolean(site.installed_at)}
            />
          }
        />
      </div>
      <div className="flex min-w-0 flex-col gap-6">
        <PreviewCard domain={site.domain} />
        <RemoveCard id={site.id} domain={site.domain} />
      </div>
    </div>
  )
}
