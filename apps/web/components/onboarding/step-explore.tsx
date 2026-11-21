import { Button } from "@crawlradar/ui/components/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { Animation } from "@/components/animation"
import { SECTIONS } from "@/components/dashboard/dashboard-tabs"
import { StepCard } from "@/components/onboarding/step-card"

const WHAT = [
  "Totals, trends, top pages and the latest visits",
  "Which AI platforms visit, and with which crawlers",
  "Every page AI reads, ranked and searchable",
  "Every visit, filterable by platform and type",
  "Your snippet, CSV export and site details",
]

/** Step 5: done. A short tour of the five dashboard views, then the dashboard. */
export function StepExplore({
  site,
}: {
  site: { id: string; domain: string }
}) {
  return (
    <StepCard
      title={`${site.domain} is connected`}
      description="CrawlRadar is now listening. AI crawlers visit on their own schedule, so the first ones can take from minutes to a few days. Here is what you will find:"
      footer={
        <Button size="lg" asChild>
          <Link href={`/dashboard?site=${site.id}`}>
            Open my dashboard <ArrowRight />
          </Link>
        </Button>
      }
    >
      <div className="flex justify-center">
        <Animation name="success" className="size-24" />
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {SECTIONS.map(({ href, label, icon: Icon }, i) => (
          <li
            key={href}
            className="flex gap-3 rounded-lg border bg-muted/30 p-3"
          >
            <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <span className="flex flex-col">
              <span className="font-medium text-sm">{label}</span>
              <span className="text-muted-foreground text-sm">{WHAT[i]}</span>
            </span>
          </li>
        ))}
      </ul>
    </StepCard>
  )
}
