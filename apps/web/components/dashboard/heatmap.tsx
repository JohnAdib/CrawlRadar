import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@crawlradar/ui/components/tooltip"

import { EmptyNote } from "@/components/dashboard/empty-note"
import { visits } from "@/lib/format"
import type { Stats } from "@/lib/stats"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const HOURS = Array.from({ length: 24 }, (_, hour) => hour)

function Cell({
  day,
  hour,
  value,
  max,
}: {
  day: string
  hour: number
  value: number
  max: number
}) {
  return (
    <Tooltip delayDuration={0} disableHoverableContent>
      <TooltipTrigger asChild>
        <span
          className="h-3.5 rounded-[3px] bg-muted transition-transform duration-150 hover:scale-110 hover:ring-2 hover:ring-chart-1/50"
          style={
            value
              ? {
                  backgroundColor: "var(--chart-1)",
                  opacity: 0.15 + 0.85 * (value / max),
                }
              : undefined
          }
        />
      </TooltipTrigger>
      <TooltipContent side="top">
        <span className="font-medium">
          {day} {String(hour).padStart(2, "0")}:00 UTC
        </span>
        <span className="ml-2 tabular-nums opacity-80">{visits(value)}</span>
      </TooltipContent>
    </Tooltip>
  )
}

/** When crawlers visit: weekday x hour (UTC), darker = more visits. */
export function Heatmap({ cells }: { cells: Stats["heatmap"] }) {
  if (cells.length === 0) {
    return <EmptyNote>No crawler visits in this range.</EmptyNote>
  }
  const grid = new Map(cells.map((c) => [`${c.dow}:${c.hour}`, c.visits]))
  const max = Math.max(...cells.map((c) => c.visits), 1)
  return (
    <div className="overflow-x-auto">
      <div className="grid w-full min-w-[440px] grid-cols-[2.25rem_repeat(24,minmax(0,1fr))] gap-[3px] text-[10px] text-muted-foreground">
        {DAYS.map((day, d) => (
          <div key={day} className="contents">
            <span className="flex items-center">{day}</span>
            {HOURS.map((hour) => (
              <Cell
                key={hour}
                day={day}
                hour={hour}
                value={grid.get(`${d + 1}:${hour}`) ?? 0}
                max={max}
              />
            ))}
          </div>
        ))}
        <span />
        {HOURS.map((hour) => (
          <span key={hour} className="text-center">
            {hour % 6 === 0 ? hour : ""}
          </span>
        ))}
      </div>
    </div>
  )
}
