"use client"

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@crawlradar/ui/components/chart"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts"

const visitsConfig = {
  visits: { label: "Visits", color: "var(--chart-1)" },
} satisfies ChartConfig

export function TimelineChart({
  data,
  hourly,
}: {
  data: { bucket: string; visits: number }[]
  hourly: boolean
}) {
  const format = (value: string) =>
    new Date(value).toLocaleString(
      "en",
      hourly ? { hour: "numeric" } : { month: "short", day: "numeric" }
    )

  return (
    <ChartContainer config={visitsConfig} className="aspect-auto h-64 w-full">
      <AreaChart data={data} margin={{ left: 0, right: 8 }}>
        <defs>
          <linearGradient id="fillVisits" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-visits)"
              stopOpacity={0.6}
            />
            <stop
              offset="95%"
              stopColor="var(--color-visits)"
              stopOpacity={0.05}
            />
          </linearGradient>
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
          width={40}
          allowDecimals={false}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="dot"
              labelFormatter={(v) => format(String(v))}
            />
          }
        />
        <Area
          dataKey="visits"
          type="monotone"
          fill="url(#fillVisits)"
          stroke="var(--color-visits)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  )
}

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

export function PlatformChart({
  data,
}: {
  data: { platform: string; visits: number }[]
}) {
  return (
    <ChartContainer
      config={visitsConfig}
      className="aspect-auto w-full"
      style={{ height: 40 * data.length + 20 }}
    >
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <XAxis type="number" hide />
        <YAxis
          dataKey="platform"
          type="category"
          tickLine={false}
          axisLine={false}
          width={100}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel={false} />}
        />
        <Bar dataKey="visits" radius={6}>
          {data.map((d, i) => (
            <Cell key={d.platform} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
