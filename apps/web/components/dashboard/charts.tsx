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

import { BOT_TYPES, type BotType } from "@/lib/filters"
import type { TimelinePoint } from "@/lib/stats"

const TYPE_COLORS: Record<BotType, string> = {
  training: "var(--chart-1)",
  search: "var(--chart-2)",
  assistant: "var(--chart-3)",
  referral: "var(--chart-4)",
  unknown: "var(--muted-foreground)",
}

const trafficConfig = Object.fromEntries(
  (Object.keys(BOT_TYPES) as BotType[]).map((t) => [
    t,
    { label: BOT_TYPES[t], color: TYPE_COLORS[t] },
  ])
) satisfies ChartConfig

/** AI traffic over time, stacked by bot type. Hides types with no visits in range. */
export function TrafficChart({
  data,
  hourly,
}: {
  data: TimelinePoint[]
  hourly: boolean
}) {
  const types = (Object.keys(BOT_TYPES) as BotType[]).filter((t) =>
    data.some((d) => d[t] > 0)
  )
  const format = (value: string) =>
    new Date(value).toLocaleString(
      "en",
      hourly ? { hour: "numeric" } : { month: "short", day: "numeric" }
    )

  return (
    <ChartContainer
      config={trafficConfig}
      className="aspect-auto h-64 w-full sm:h-72"
    >
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <defs>
          {types.map((t) => (
            <linearGradient
              key={t}
              id={`fill-${t}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor={`var(--color-${t})`}
                stopOpacity={0.55}
              />
              <stop
                offset="95%"
                stopColor={`var(--color-${t})`}
                stopOpacity={0.08}
              />
            </linearGradient>
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
        {types.map((t) => (
          <Area
            key={t}
            dataKey={t}
            type="monotone"
            stackId="traffic"
            fill={`url(#fill-${t})`}
            stroke={`var(--color-${t})`}
            strokeWidth={1.5}
          />
        ))}
        <ChartLegend content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  )
}
