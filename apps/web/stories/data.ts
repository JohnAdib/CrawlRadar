// Shared story data: the home page demo traffic on a fixed clock, so every story
// renders the same numbers and relative times.
import type { LogEvent } from "@/components/dashboard/activity-table"
import { DEMO_DOMAIN, generateDemoEvents } from "@/lib/demo-data"
import { RANGES, type Range } from "@/lib/filters"
import { pixel, snippet } from "@/lib/snippet"
import {
  computePages,
  computeStats,
  platformRows,
  recentEvents,
} from "@/lib/stats"

export { DEMO_DOMAIN }

// Late in the day: the demo generator clamps later hours of "today" to `now`.
export const NOW = Date.UTC(2026, 10, 21, 23, 30)
export const EVENTS = generateDemoEvents(NOW)

export const optionsFor = (range: Range) => ({
  now: new Date(NOW),
  since: new Date(NOW - RANGES[range].ms),
})

export const STATS = computeStats(EVENTS, optionsFor("7d"))
export const STATS_24H = computeStats(EVENTS, optionsFor("24h"))
export const PAGES = computePages(EVENTS, optionsFor("7d"))
export const PLATFORM_ROWS = platformRows(STATS.by_bot)
export const RECENT = recentEvents(EVENTS, optionsFor("7d"))
export const LOG: LogEvent[] = RECENT.map((e) => ({
  ...e,
  user_agent: e.user_agent ?? "",
  referrer: e.referrer ?? null,
}))

/** Daily visits for a StatCard sparkline. */
export const SPARK = STATS.timeline.map((p) => ({
  label: new Date(p.bucket).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
  }),
  value: p.visits,
}))

export const SITE = {
  id: "3f2a9c1e-7b4d-4e8a-9c2f-1a6b5d8e0f42",
  domain: DEMO_DOMAIN,
  created_at: "2026-09-02T09:14:00Z",
  installed_at: "2026-09-02T09:31:00Z",
}
export const ORIGIN = "https://crawlradar.vercel.app"
export const SNIPPET = snippet(ORIGIN, SITE.id)
export const PIXEL = pixel(ORIGIN, SITE.id)
