"use client"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@crawlradar/ui/components/card"
import { cn } from "@crawlradar/ui/lib/utils"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { useRef, useState } from "react"

import { formatNumber } from "@/lib/format"
import { percentChange } from "@/lib/stats"

export interface SparkPoint {
  label: string
  value: number
}

/** A mini area chart; hovering shows a cursor, a dot and the value at that point. */
function Sparkline({
  points,
  color,
  unit,
}: {
  points: SparkPoint[]
  color: string
  unit: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<number | null>(null)
  if (points.length < 2) return null

  const max = Math.max(...points.map((p) => p.value), 1)
  const x = (i: number) => (i / (points.length - 1)) * 100
  const y = (v: number) => 30 - (v / max) * 28
  const line = points.map((p, i) => `${x(i)},${y(p.value)}`).join(" ")

  function track(clientX: number) {
    const box = ref.current?.getBoundingClientRect()
    if (!box?.width) return
    const ratio = Math.min(Math.max((clientX - box.left) / box.width, 0), 1)
    setActive(Math.round(ratio * (points.length - 1)))
  }

  const point = active === null ? null : points[active]
  const left = active === null ? 0 : x(active)

  return (
    <div
      ref={ref}
      className="relative h-8 w-full cursor-crosshair touch-pan-y"
      onPointerMove={(e) => track(e.clientX)}
      onPointerDown={(e) => track(e.clientX)}
      onPointerLeave={() => setActive(null)}
    >
      <svg
        viewBox="0 0 100 32"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full"
        aria-hidden
      >
        <polyline
          points={`0,32 ${line} 100,32`}
          fill={color}
          fillOpacity={0.12}
          stroke="none"
        />
        <polyline
          points={line}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          className="animate-[sparkline-draw_900ms_ease-out_both] [stroke-dasharray:400] motion-reduce:animate-none"
        />
      </svg>
      {point && (
        <>
          <span
            className="pointer-events-none absolute inset-y-0 w-px bg-foreground/25"
            style={{ left: `${left}%` }}
          />
          <span
            className="-translate-x-1/2 -translate-y-1/2 pointer-events-none absolute size-2 rounded-full border-2 border-background"
            style={{
              left: `${left}%`,
              top: `${(y(point.value) / 32) * 100}%`,
              backgroundColor: color,
            }}
          />
          <span
            className="-translate-x-1/2 pointer-events-none absolute bottom-full mb-1 whitespace-nowrap rounded-md border bg-popover px-2 py-1 text-popover-foreground text-xs shadow-md"
            // Keep the label inside the card near the edges.
            style={{ left: `${Math.min(Math.max(left, 22), 78)}%` }}
          >
            <span className="text-muted-foreground">{point.label}</span>
            <span className="ml-2 font-medium tabular-nums">
              {formatNumber(point.value)} {unit}
            </span>
          </span>
        </>
      )}
    </div>
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
