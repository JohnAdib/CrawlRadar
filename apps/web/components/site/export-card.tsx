import { Button } from "@crawlradar/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@crawlradar/ui/components/card"
import { Download } from "lucide-react"

import { toQuery } from "@/lib/filters"

const EXPORTS = [
  { label: "All data", range: undefined },
  { label: "Last 30 days", range: "30d" },
  { label: "Last 7 days", range: "7d" },
] as const

/** CSV downloads of the raw crawler data (FR-4.1, US-5). */
export function ExportCard({
  siteId,
  onExport,
}: {
  siteId: string
  /** Replaces the downloads (the home page demo explains instead). */
  onExport?: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Export</CardTitle>
        <CardDescription>
          Every recorded visit as CSV: time, page, crawler, platform, type and
          user agent. Opens in Excel, Sheets or any BI tool.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {EXPORTS.map(({ label, range }) =>
          onExport ? (
            <Button
              key={label}
              variant={range ? "outline" : "default"}
              onClick={onExport}
            >
              <Download /> {label}
            </Button>
          ) : (
            <Button key={label} variant={range ? "outline" : "default"} asChild>
              <a href={`/export${toQuery({ site: siteId, range })}`} download>
                <Download /> {label}
              </a>
            </Button>
          )
        )}
      </CardContent>
    </Card>
  )
}
