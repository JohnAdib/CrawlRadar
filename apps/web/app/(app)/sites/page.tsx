import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@crawlradar/ui/components/card"
import { ChevronRight } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { AddSiteButton } from "@/components/add-site-dialog"
import { PageHeader } from "@/components/page-header"
import { Favicon, SitePreview } from "@/components/site-preview"
import { SiteStatus } from "@/components/site-status"
import { visits } from "@/lib/format"
import { siteActivity } from "@/lib/sites"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Sites",
  robots: { index: false },
}

export default async function SitesPage() {
  const supabase = await createClient()
  const { data: sites } = await supabase
    .from("sites")
    .select("id, domain, created_at, installed_at")
    .order("created_at")

  // The (app) layout guarantees at least one installed site.
  const list = sites ?? []
  const activity = await Promise.all(
    list.map((site) => siteActivity(supabase, site.id))
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Sites"
        description="The websites you track. Open one to install its snippet or manage it."
        action={<AddSiteButton />}
      />

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((site, i) => (
          <li
            key={site.id}
            className="animate-in fade-in motion-reduce:animate-none slide-in-from-bottom-2 fill-mode-both"
            style={{
              animationDelay: `${i * 50}ms`,
              animationDuration: "400ms",
            }}
          >
            <Link
              href={`/dashboard/settings?site=${site.id}`}
              className="group block h-full rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <Card className="h-full gap-0 overflow-hidden py-0 transition-[border-color,box-shadow] duration-200 group-hover:border-foreground/25 group-hover:shadow-lg">
                <SitePreview domain={site.domain} className="border-b" />
                <CardHeader className="gap-3 py-5">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background">
                      <Favicon domain={site.domain} />
                    </span>
                    <CardTitle className="min-w-0 flex-1 truncate">
                      {site.domain}
                    </CardTitle>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <SiteStatus
                      lastSeen={activity[i]!.lastSeen}
                      installed={Boolean(site.installed_at)}
                    />
                    <CardDescription className="tabular-nums">
                      {visits(activity[i]!.visits30d)} · 30d
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
