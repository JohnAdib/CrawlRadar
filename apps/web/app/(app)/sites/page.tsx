import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@crawlradar/ui/components/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@crawlradar/ui/components/empty"
import { ChevronRight } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { AddSiteButton } from "@/components/add-site-dialog"
import { Animation } from "@/components/animation"
import { Tag } from "@/components/head-tag"
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
    .select("id, domain, created_at")
    .order("created_at")

  if (!sites?.length) {
    return (
      <Empty className="min-h-[70svh]">
        <EmptyHeader>
          <EmptyMedia>
            <Animation name="radar" className="size-36" />
          </EmptyMedia>
          <EmptyTitle className="text-xl">Add your first website</EmptyTitle>
          <EmptyDescription>
            CrawlRadar shows which AI crawlers, like GPTBot, ClaudeBot and
            PerplexityBot, read your site. Setup is one line in your <Tag />.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <AddSiteButton size="lg" />
        </EmptyContent>
      </Empty>
    )
  }

  const activity = await Promise.all(
    sites.map((site) => siteActivity(supabase, site.id))
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Sites"
        description="The websites you track. Open one to install its snippet or manage it."
        action={<AddSiteButton />}
      />

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sites.map((site, i) => (
          <li
            key={site.id}
            className="animate-in fade-in motion-reduce:animate-none slide-in-from-bottom-2 fill-mode-both"
            style={{
              animationDelay: `${i * 50}ms`,
              animationDuration: "400ms",
            }}
          >
            <Link
              href={`/sites/${site.id}`}
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
                    <SiteStatus lastSeen={activity[i]!.lastSeen} />
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
