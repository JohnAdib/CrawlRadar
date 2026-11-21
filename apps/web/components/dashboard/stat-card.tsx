import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@crawlradar/ui/components/card"

import { Delta } from "@/components/dashboard/delta"
import { Sparkline, type SparkPoint } from "@/components/dashboard/sparkline"

/** A headline number with its trend and an optional interactive sparkline. */
export function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  hint,
  spark,
  unit = "visits",
  color = "var(--chart-1)",
  index = 0,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: React.ReactNode
  delta?: { current: number; previous: number }
  hint?: string
  spark?: SparkPoint[]
  /** Word after the number in the sparkline tooltip, e.g. "crawls". */
  unit?: string
  color?: string
  /** Position in the row, used to stagger the entrance animation. */
  index?: number
}) {
  return (
    <Card
      className="fade-in slide-in-from-bottom-2 fill-mode-both animate-in gap-3 overflow-hidden py-4 transition-[border-color,box-shadow] duration-200 hover:border-foreground/20 hover:shadow-md motion-reduce:animate-none sm:py-5"
      style={{ animationDelay: `${index * 60}ms`, animationDuration: "500ms" }}
    >
      <CardHeader className="gap-1.5 px-4 sm:px-5">
        <CardDescription className="flex items-center gap-2 text-xs sm:text-sm">
          <Icon className="size-4 shrink-0" />
          <span className="truncate">{label}</span>
        </CardDescription>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <CardTitle className="font-semibold text-2xl tabular-nums sm:text-3xl">
            {value}
          </CardTitle>
          {delta && <Delta {...delta} />}
        </div>
        {hint && (
          // One line, so every card in the row keeps the same layout.
          <p className="truncate text-muted-foreground text-xs" title={hint}>
            {hint}
          </p>
        )}
      </CardHeader>
      {spark && (
        <div className="-mb-4 sm:-mb-5">
          <Sparkline points={spark} color={color} unit={unit} />
        </div>
      )}
    </Card>
  )
}
