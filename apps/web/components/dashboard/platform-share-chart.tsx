"use client"

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@crawlradar/ui/components/chart"
import { Cell, Label, Pie, PieChart } from "recharts"

import { formatNumber } from "@/lib/format"
import { platformColor } from "@/lib/platforms"

/** Donut of visits per platform, total in the middle. */
export function PlatformShareChart({
  platforms,
}: {
  platforms: { platform: string; visits: number }[]
}) {
  const total = platforms.reduce((sum, p) => sum + p.visits, 0)
  const config = Object.fromEntries(
    platforms.map((p) => [p.platform, { label: p.platform }])
  ) satisfies ChartConfig
  return (
    <ChartContainer config={config} className="mx-auto aspect-square h-56">
      <PieChart>
        <ChartTooltip
          content={<ChartTooltipContent nameKey="platform" hideLabel />}
        />
        <Pie
          data={platforms}
          dataKey="visits"
          nameKey="platform"
          innerRadius="62%"
          strokeWidth={2}
          stroke="var(--background)"
        >
          {platforms.map((p) => (
            <Cell key={p.platform} fill={platformColor(p.platform)} />
          ))}
          <Label
            content={({ viewBox }) => {
              if (!viewBox || !("cx" in viewBox)) return null
              return (
                <text
                  x={viewBox.cx}
                  y={viewBox.cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  <tspan
                    x={viewBox.cx}
                    y={viewBox.cy}
                    className="fill-foreground font-semibold text-2xl"
                  >
                    {formatNumber(total)}
                  </tspan>
                  <tspan
                    x={viewBox.cx}
                    y={(viewBox.cy ?? 0) + 22}
                    className="fill-muted-foreground text-xs"
                  >
                    visits
                  </tspan>
                </text>
              )
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
