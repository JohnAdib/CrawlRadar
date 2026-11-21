"use client"

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@crawlradar/ui/components/toggle-group"
import { useState } from "react"

import { StackedArea } from "@/components/dashboard/stacked-area"
import { BOT_TYPES, type BotType, TYPE_COLORS } from "@/lib/filters"
import { platformColor } from "@/lib/platforms"
import type { PlatformPoint, TimelinePoint } from "@/lib/stats"
import { platformSeries } from "@/lib/stats"

export type TrafficSplit = "platform" | "type"

function byType(timeline: TimelinePoint[]) {
  const types = (Object.keys(BOT_TYPES) as BotType[]).filter((t) =>
    timeline.some((d) => d[t] > 0)
  )
  return {
    rows: timeline,
    series: types.map((t) => ({
      key: t,
      label: BOT_TYPES[t],
      color: TYPE_COLORS[t],
    })),
  }
}

function byPlatform(timeline: TimelinePoint[], points: PlatformPoint[]) {
  const { series, rows } = platformSeries(timeline, points)
  return {
    rows,
    series: series.map((s) => ({
      ...s,
      color:
        s.key === "other" ? "var(--muted-foreground)" : platformColor(s.label),
    })),
  }
}

/** Traffic over time, stacked by platform (who) or by bot type (why). */
export function TrafficChart({
  timeline,
  platformTimeline,
  hourly,
  initialSplit = "platform",
}: {
  timeline: TimelinePoint[]
  platformTimeline: PlatformPoint[]
  hourly: boolean
  initialSplit?: TrafficSplit
}) {
  const [split, setSplit] = useState<TrafficSplit>(initialSplit)
  const chart =
    split === "platform"
      ? byPlatform(timeline, platformTimeline)
      : byType(timeline)
  return (
    <div className="flex flex-col gap-3">
      <ToggleGroup
        type="single"
        size="sm"
        variant="outline"
        value={split}
        onValueChange={(v) => v && setSplit(v as TrafficSplit)}
        aria-label="Split traffic by"
        className="self-start"
      >
        <ToggleGroupItem value="platform" className="px-3">
          By platform
        </ToggleGroupItem>
        <ToggleGroupItem value="type" className="px-3">
          By type
        </ToggleGroupItem>
      </ToggleGroup>
      <StackedArea rows={chart.rows} series={chart.series} hourly={hourly} />
    </div>
  )
}
