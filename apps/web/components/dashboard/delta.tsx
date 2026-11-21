import { cn } from "@crawlradar/ui/lib/utils"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"

import { percentChange } from "@/lib/stats"

/** Change against the previous period, as a green or red pill. */
export function Delta({
  current,
  previous,
}: {
  current: number
  previous: number
}) {
  const change = percentChange(current, previous)
  if (change === null) {
    return current > 0 ? (
      <span className="font-medium text-muted-foreground text-xs">New</span>
    ) : null
  }
  const up = change >= 0
  const Icon = up ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium text-xs tabular-nums",
        up
          ? "bg-green-500/10 text-green-700 dark:text-green-400"
          : "bg-red-500/10 text-red-700 dark:text-red-400"
      )}
      title="Compared with the previous period"
    >
      <Icon className="size-3" />
      {Math.abs(change) > 999 ? "999%+" : `${Math.abs(change)}%`}
    </span>
  )
}
