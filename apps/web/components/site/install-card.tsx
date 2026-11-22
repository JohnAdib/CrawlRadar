import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@crawlradar/ui/components/card"

import { InstallMethods } from "@/components/install/install-methods"

/** Settings: the install methods for this site. */
export function InstallCard({
  domain,
  origin,
  siteId,
  hasServerKey,
  demo,
}: {
  domain: string
  origin: string
  siteId: string
  hasServerKey?: boolean
  demo?: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Install</CardTitle>
        <CardDescription>
          Add the tracking code to every page on {domain}. Hybrid works for
          every visitor; add Server-side to count crawlers that only read the
          HTML. Each page view is counted once, however many methods report it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <InstallMethods
          origin={origin}
          siteId={siteId}
          domain={domain}
          hasServerKey={hasServerKey}
          demo={demo}
        />
      </CardContent>
    </Card>
  )
}
