import { Badge } from "@crawlradar/ui/components/badge"
import { Button } from "@crawlradar/ui/components/button"
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
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@crawlradar/ui/components/empty"
import { Download, Globe, LayoutDashboard, Trash2 } from "lucide-react"
import Link from "next/link"

import { AddSiteForm } from "@/components/add-site-form"
import { CopyBlock } from "@/components/copy-block"
import { timeAgo } from "@/lib/format"
import { bodySnippet, headSnippet } from "@/lib/snippet"
import { createClient } from "@/lib/supabase/server"
import { deleteSite } from "./actions"

export default async function SitesPage() {
  const supabase = await createClient()
  const { data: sites } = await supabase
    .from("sites")
    .select("id, domain, created_at")
    .order("created_at")

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Sites &amp; install
        </h1>
        <p className="text-muted-foreground">
          Add a domain, paste two snippets into your site, and crawler visits
          start showing up.
        </p>
      </div>

      <AddSiteForm />

      {!sites?.length && (
        <Empty className="border border-dashed bg-background">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Globe />
            </EmptyMedia>
            <EmptyTitle>No sites yet</EmptyTitle>
            <EmptyDescription>
              Add your first domain above to get a tracking snippet.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {sites?.map((site, i) => (
        <Card key={site.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="size-4 text-muted-foreground" />
              {site.domain}
              {lastSeen[i] ? (
                <Badge variant="secondary">
                  Last hit {timeAgo(lastSeen[i])}
                </Badge>
              ) : (
                <Badge variant="outline">Waiting for first hit</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Site ID <code className="font-mono">{site.id}</code>
            </CardDescription>
            <CardAction className="flex gap-1">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/?site=${site.id}`}>
                  <LayoutDashboard /> Dashboard
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={`/export?site=${site.id}`} download>
                  <Download /> Export all (CSV)
                </a>
              </Button>
              <form action={deleteSite}>
                <input type="hidden" name="id" value={site.id} />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Delete ${site.domain}`}
                >
                  <Trash2 />
                </Button>
              </form>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">
                1. Paste into <code>&lt;head&gt;</code>
              </p>
              <CopyBlock code={headSnippet(site.id)} label="Head snippet" />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">
                2. Paste right after <code>&lt;body&gt;</code>{" "}
                <span className="font-normal text-muted-foreground">
                  (counts crawlers that don&apos;t run JavaScript)
                </span>
              </p>
              <CopyBlock code={bodySnippet(site.id)} label="Body snippet" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
