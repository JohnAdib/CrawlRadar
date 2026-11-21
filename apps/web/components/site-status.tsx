import { Badge } from "@crawlradar/ui/components/badge"

import { LiveDot } from "@/components/live-dot"
import { timeAgo } from "@/lib/format"

/** "Last hit 5 minutes ago" with a live dot, or "Waiting for first hit". */
export function SiteStatus({ lastSeen }: { lastSeen: string | null }) {
  return lastSeen ? (
    <Badge variant="secondary" className="gap-1.5">
      <LiveDot className="size-1.5" />
      Last hit {timeAgo(lastSeen)}
    </Badge>
  ) : (
    <Badge variant="outline" className="gap-1.5">
      <LiveDot tone="waiting" className="size-1.5" />
      Waiting for first hit
    </Badge>
  )
}
