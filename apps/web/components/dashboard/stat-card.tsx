import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@crawlradar/ui/components/card"
import { cn } from "@crawlradar/ui/lib/utils"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"

import { percentChange } from "@/lib/stats"

function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null
  const max = Math.max(...values, 1)
  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * 100},${30 - (v / max) * 28}`)
    .join(" ")
  return (
    <svg
      viewBox="0 0 100 32"
      preserveAspectRatio="none"
      className="h-8 w-full"
      aria-hidden
    >
      <polyline
        points={`0,32 ${points} 100,32`}
        fill={color}
        fillOpacity={0.12}
        stroke="none"
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        className="animate-[sparkline-draw_900ms_ease-out_both] [stroke-dasharray:400] motion-reduce:animate-none"
      />
    </svg>
  )
}

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
      <span className="text-xs font-medium text-muted-foreground">New</span>
    ) : null
  }
  const up = change >= 0
  const Icon = up ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums",
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

export function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  hint,
  spark,
  color = "var(--chart-1)",
  index = 0,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: React.ReactNode
  delta?: { current: number; previous: number }
  hint?: string
  spark?: number[]
  color?: string
  /** Position in the row, used to stagger the entrance animation. */
  index?: number
}) {
  return (
    <Card
      className="gap-3 overflow-hidden py-4 transition-[border-color,box-shadow] duration-200 animate-in fade-in motion-reduce:animate-none slide-in-from-bottom-2 fill-mode-both hover:border-foreground/20 hover:shadow-md sm:py-5"
      style={{ animationDelay: `${index * 60}ms`, animationDuration: "500ms" }}
    >
      <CardHeader className="gap-1.5 px-4 sm:px-5">
        <CardDescription className="flex items-center gap-2 text-xs sm:text-sm">
          <Icon className="size-4 shrink-0" />
          <span className="truncate">{label}</span>
        </CardDescription>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <CardTitle className="text-2xl font-semibold tabular-nums sm:text-3xl">
            {value}
          </CardTitle>
          {delta && <Delta {...delta} />}
        </div>
        {hint && (
          <p className="text-xs text-pretty text-muted-foreground">{hint}</p>
        )}
      </CardHeader>
      {spark && (
        <div className="-mb-4 sm:-mb-5">
          <Sparkline values={spark} color={color} />
        </div>
      )}
    </Card>
  )
}
