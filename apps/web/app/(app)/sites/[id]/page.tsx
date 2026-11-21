import { Button } from "@crawlradar/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@crawlradar/ui/components/card"
import { ArrowLeft, LayoutDashboard } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CopyBlock } from "@/components/copy-block"
import { Tag } from "@/components/head-tag"
import { RemoveSiteButton } from "@/components/remove-site-button"
import { Favicon, SitePreview } from "@/components/site-preview"
import { SiteStatus } from "@/components/site-status"
import { visits } from "@/lib/format"
import { siteActivity } from "@/lib/sites"
import { appOrigin, snippet } from "@/lib/snippet"
import { createClient } from "@/lib/supabase/server"

// The tab shows the domain to its owner; crawlers never get here (they are sent to sign-in).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from("sites")
    .select("domain")
    .eq("id", id)
    .maybeSingle()
  return { title: data?.domain ?? "Site", robots: { index: false } }
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-sm">{children}</dd>
    </div>
  )
}

export default async function SitePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: site } = await supabase
    .from("sites")
    .select("id, domain, created_at")
    .eq("id", id)
    .maybeSingle()
  if (!site) notFound()

  const [activity, origin] = await Promise.all([
    siteActivity(supabase, site.id),
    appOrigin(),
  ])
  const code = snippet(origin, site.id)

  return (
    <div className="flex flex-col gap-6 animate-in fade-in motion-reduce:animate-none slide-in-from-bottom-2 duration-500">
      <Button variant="ghost" size="sm" className="-ml-2 self-start" asChild>
        <Link href="/sites">
          <ArrowLeft /> All sites
        </Link>
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="truncate text-2xl font-semibold tracking-tight">
            {site.domain}
          </h1>
          <SiteStatus lastSeen={activity.lastSeen} />
        </div>
        <Button asChild>
          <Link href={`/dashboard?site=${site.id}`}>
            <LayoutDashboard /> Open dashboard
          </Link>
        </Button>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Install</CardTitle>
              <CardDescription>
                Paste this tag into the <Tag /> of every page on {site.domain}.
                It loads asynchronously and won&apos;t slow your pages down.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <CopyBlock code={code} label="Snippet" />
              <ol className="grid gap-3 text-sm sm:grid-cols-3">
                {[
                  { id: "copy", text: "Copy the tag above" },
                  {
                    id: "paste",
                    text: (
                      <>
                        Paste it inside <Tag />
                      </>
                    ),
                  },
                  { id: "watch", text: "Visits show up within seconds" },
                ].map((step, i) => (
                  <li
                    key={step.id}
                    className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-background font-mono text-xs ring-1 ring-border">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground">{step.text}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="divide-y">
                <Row label="Site ID">
                  <code className="font-mono text-xs break-all">{site.id}</code>
                </Row>
                <Row label="Added">
                  {new Date(site.created_at).toLocaleDateString("en", {
                    dateStyle: "long",
                  })}
                </Row>
                <Row label="Last 30 days">{visits(activity.visits30d)}</Row>
              </dl>
            </CardContent>
          </Card>
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <Card className="gap-0 overflow-hidden py-0">
            <SitePreview domain={site.domain} className="border-b" />
            <CardHeader className="py-4">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Favicon domain={site.domain} />
                <a
                  href={`https://${site.domain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate underline-offset-4 hover:underline"
                >
                  {site.domain}
                </a>
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle>Remove site</CardTitle>
              <CardDescription>
                Deletes {site.domain} and all of its crawler data. This
                can&apos;t be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RemoveSiteButton id={site.id} domain={site.domain} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
