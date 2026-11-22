import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@crawlradar/ui/components/card"

import { InstallMethods } from "@/components/install/install-methods"

/** Settings: the two install methods for this site. */
export function InstallCard({
  domain,
  origin,
  siteId,
}: {
  domain: string
  origin: string
  siteId: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Install</CardTitle>
        <CardDescription>
          Add the tracking code to every page on {domain}. Hybrid works for
          every visitor; the table shows what each method records.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <InstallMethods origin={origin} siteId={siteId} />
      </CardContent>
    </Card>
  )
}
