import { Badge } from "@crawlradar/ui/components/badge"

import { BOT_TYPES, type BotType } from "@/lib/filters"

const VARIANT: Partial<Record<BotType, "default" | "outline">> = {
  referral: "default",
  unknown: "outline",
  search_engine: "outline",
}

/** The kind of visit: AI training, AI search, AI assistant, referral, search engine. */
export function TypeBadge({ type }: { type: BotType }) {
  return (
    <Badge className="shrink-0" variant={VARIANT[type] ?? "secondary"}>
      {BOT_TYPES[type] ?? type}
    </Badge>
  )
}
