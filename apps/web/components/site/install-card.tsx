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
          Add one tag to every page on {domain}: the JavaScript tag, or the
          pixel if you can&apos;t run scripts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <InstallMethods origin={origin} siteId={siteId} />
      </CardContent>
    </Card>
  )
}
