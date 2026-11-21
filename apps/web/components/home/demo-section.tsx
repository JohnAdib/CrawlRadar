import { Badge } from "@crawlradar/ui/components/badge"

import { DemoDashboard } from "@/components/dashboard/demo"
import { DemoStage } from "@/components/home/motion"
import { LiveDot } from "@/components/live-dot"

/** The real dashboard running on example data, framed like a product shot. */
export function DemoSection({
  now,
  signedIn,
}: {
  now: number
  signedIn: boolean
}) {
  return (
    <div
      id="demo"
      className="mx-auto max-w-7xl scroll-mt-20 px-2 pb-24 sm:px-6"
    >
      <DemoStage>
        <div className="relative rounded-2xl border bg-muted/40 p-2 shadow-2xl shadow-chart-1/10 sm:p-3">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-b from-chart-1/30 via-transparent to-transparent opacity-60 [mask-image:linear-gradient(black,transparent_30%)]"
          />
          <div className="relative flex flex-wrap items-center justify-between gap-2 px-2 pt-1 pb-3 text-muted-foreground text-xs sm:px-3">
            <span className="flex items-center gap-2">
              <LiveDot />
              Live demo with example data. Try the filters, or click a page or
              platform.
            </span>
            <Badge variant="outline" className="bg-background">
              Example data
            </Badge>
          </div>
          <div className="relative rounded-xl border bg-background p-3 sm:p-6">
            <DemoDashboard now={now} signedIn={signedIn} />
          </div>
        </div>
      </DemoStage>
    </div>
  )
}
