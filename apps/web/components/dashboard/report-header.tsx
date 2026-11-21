import { Button } from "@crawlradar/ui/components/button"
import { Card, CardContent } from "@crawlradar/ui/components/card"
import { ArrowLeft, ExternalLink, FileText } from "lucide-react"

import { BrandLogo } from "@/components/brand-logo"
import type { Filters } from "@/lib/filters"

function describe(filters: Filters, domain: string, range: string): string {
  if (!filters.page) {
    return `Everything ${filters.platform} did on ${domain} in the last ${range}`
  }
  const from = filters.platform ? `, from ${filters.platform}` : ""
  return `Every AI visit to this page in the last ${range}${from}`
}

/** Header shown on a page or platform report, with a way back to the overview. */
export function ReportHeader({
  filters,
  domain,
  range,
  onBack,
}: {
  filters: Filters
  domain: string
  range: string
  onBack: () => void
}) {
  const page = filters.page
  return (
    <Card className="fade-in slide-in-from-top-2 animate-in duration-300 motion-reduce:animate-none">
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-muted/50">
          {page ? (
            <FileText className="size-5 text-muted-foreground" />
          ) : (
            <BrandLogo name={filters.platform!} className="size-6" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-xs uppercase tracking-wide">
            {page ? "Page report" : "Platform report"}
          </p>
          <h2 className="truncate font-semibold text-lg">
            {page ? (
              <span className="font-mono">{page}</span>
            ) : (
              filters.platform
            )}
          </h2>
          <p className="text-muted-foreground text-sm">
            {describe(filters, domain, range)}
          </p>
        </div>
        <div className="flex gap-2">
          {page && (
            <Button variant="outline" size="sm" asChild>
              <a
                href={`https://${domain}${page}`}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink /> Open page
              </a>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft /> Overview
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
