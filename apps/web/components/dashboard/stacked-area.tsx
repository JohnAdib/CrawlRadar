"use client"

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@crawlradar/ui/components/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

export interface AreaSeries {
  key: string
  label: string
  color: string
}

function Gradient({ id }: { id: string }) {
  return (
    <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={`var(--color-${id})`} stopOpacity={0.55} />
      <stop offset="95%" stopColor={`var(--color-${id})`} stopOpacity={0.08} />
    </linearGradient>
  )
}

/** A stacked area chart over time buckets, with legend and hover tooltip. */
export function StackedArea({
  rows,
  series,
  hourly,
}: {
  rows: Record<string, number | string>[]
  series: AreaSeries[]
  hourly: boolean
}) {
  const config = Object.fromEntries(
    series.map((s) => [s.key, { label: s.label, color: s.color }])
  ) satisfies ChartConfig
  const format = (value: string) =>
    new Date(value).toLocaleString(
      "en",
      hourly ? { hour: "numeric" } : { month: "short", day: "numeric" }
    )

  return (
    <ChartContainer config={config} className="aspect-auto h-48 w-full sm:h-56">
      <AreaChart data={rows} margin={{ left: 0, right: 8, top: 8 }}>
        <defs>
          {series.map((s) => (
            <Gradient key={s.key} id={s.key} />
          ))}
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="bucket"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={format}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={36}
          allowDecimals={false}
        />
        <ChartTooltip
          cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
          content={
            <ChartTooltipContent
              indicator="dot"
              labelFormatter={(v) => format(String(v))}
            />
          }
        />
        {series.map((s) => (
          <Area
            key={s.key}
            dataKey={s.key}
            type="monotone"
            stackId="stack"
            fill={`url(#fill-${s.key})`}
            stroke={`var(--color-${s.key})`}
            strokeWidth={1.5}
          />
        ))}
        <ChartLegend content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  )
}
