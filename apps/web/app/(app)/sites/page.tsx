import { Badge } from "@crawlradar/ui/components/badge"
import {
  Card,
  CardAction,
  CardContent,
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
import { Globe } from "lucide-react"
import type { Metadata } from "next"

import { AddSiteDialog } from "@/components/add-site-dialog"
import { Animation } from "@/components/animation"
import { CopyBlock } from "@/components/copy-block"
import { PageHeader } from "@/components/page-header"
import { SiteMenu } from "@/components/site-menu"
import { timeAgo } from "@/lib/format"
import { appOrigin, snippet } from "@/lib/snippet"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Sites · CrawlRadar" }

export default async function SitesPage() {
  const supabase = await createClient()
  const [{ data: sites }, origin] = await Promise.all([
    supabase.from("sites").select("id, domain, created_at").order("created_at"),
    appOrigin(),
  ])

  const lastSeen = await Promise.all(
    (sites ?? []).map(async (site) => {
      const { data } = await supabase
        .from("crawler_events")
        .select("timestamp")
        .eq("site_id", site.id)
        .order("timestamp", { ascending: false })
        .limit(1)
        .maybeSingle()
      return data?.timestamp ?? null
    })
  )

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
            PerplexityBot, read your site. Setup takes one line of HTML.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <AddSiteDialog origin={origin} size="lg" />
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Sites"
        description="Paste a site's snippet into the <head> of every page. That's the whole install."
        action={<AddSiteDialog origin={origin} />}
      />

      <div className="grid gap-4">
        {sites.map((site, i) => (
          <Card key={site.id}>
            <CardHeader>
              <CardTitle className="flex min-w-0 flex-wrap items-center gap-2">
                <Globe className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{site.domain}</span>
                {lastSeen[i] ? (
                  <Badge variant="secondary" className="gap-1.5">
                    <span className="size-1.5 rounded-full bg-green-500" />
                    Last hit {timeAgo(lastSeen[i])}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1.5">
                    <span className="size-1.5 animate-pulse rounded-full bg-amber-500" />
                    Waiting for first hit
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Added{" "}
                {new Date(site.created_at).toLocaleDateString("en", {
                  dateStyle: "medium",
                })}
              </CardDescription>
              <CardAction>
                <SiteMenu id={site.id} domain={site.domain} />
              </CardAction>
            </CardHeader>
            <CardContent>
              <CopyBlock code={snippet(origin, site.id)} label="Snippet" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
