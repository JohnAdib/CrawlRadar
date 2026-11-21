import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@crawlradar/ui/components/card"

import { visits } from "@/lib/format"

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="min-w-0 text-sm">{children}</dd>
    </div>
  )
}

const date = (iso: string) =>
  new Date(iso).toLocaleDateString("en", { dateStyle: "long" })

/** Site ID, dates and recent volume. */
export function DetailsCard({
  site,
  visits30d,
}: {
  site: { id: string; created_at: string; installed_at: string | null }
  visits30d: number
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Details</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="divide-y">
          <Row label="Site ID">
            <code className="break-all font-mono text-xs">{site.id}</code>
          </Row>
          <Row label="Added">{date(site.created_at)}</Row>
          <Row label="Snippet first seen">
            {site.installed_at ? date(site.installed_at) : "Not yet"}
          </Row>
          <Row label="Last 30 days">{visits(visits30d)}</Row>
        </dl>
      </CardContent>
    </Card>
  )
}
