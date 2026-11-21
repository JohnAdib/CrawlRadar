import { Badge } from "@crawlradar/ui/components/badge"

import { LiveDot } from "@/components/live-dot"
import { timeAgo } from "@/lib/format"

/** "Last hit 5 minutes ago", "Installed, waiting for AI crawlers" or "Not installed yet". */
export function SiteStatus({
  lastSeen,
  installed,
}: {
  lastSeen: string | null
  installed?: boolean
}) {
  if (lastSeen) {
    return (
      <Badge variant="secondary" className="gap-1.5">
        <LiveDot className="size-1.5" />
        Last hit {timeAgo(lastSeen)}
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="gap-1.5">
      <LiveDot tone="waiting" className="size-1.5" />
      {installed
        ? "Installed, waiting for AI crawlers"
        : "Waiting for first hit"}
    </Badge>
  )
}
