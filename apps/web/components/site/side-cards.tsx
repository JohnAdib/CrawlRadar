import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@crawlradar/ui/components/card"

import { RemoveSiteButton } from "@/components/remove-site-button"
import { Favicon, SitePreview } from "@/components/site-preview"

/** A screenshot of the site with its favicon and a link out. */
export function PreviewCard({ domain }: { domain: string }) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <SitePreview domain={domain} className="border-b" />
      <CardHeader className="py-4">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Favicon domain={domain} />
          <a
            href={`https://${domain}`}
            target="_blank"
            rel="noreferrer"
            className="truncate underline-offset-4 hover:underline"
          >
            {domain}
          </a>
        </CardTitle>
      </CardHeader>
    </Card>
  )
}

/** Deletes the site and all of its data, after confirmation. */
export function RemoveCard({ id, domain }: { id: string; domain: string }) {
  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle>Remove site</CardTitle>
        <CardDescription>
          Deletes {domain} and all of its crawler data. This can&apos;t be
          undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RemoveSiteButton id={id} domain={domain} />
      </CardContent>
    </Card>
  )
}
