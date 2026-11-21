"use client"

import { useRef, useState } from "react"

import { formatNumber } from "@/lib/format"

export interface SparkPoint {
  label: string
  value: number
}

/** A mini area chart; hovering shows a cursor, a dot and the value at that point. */
export function Sparkline({
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
