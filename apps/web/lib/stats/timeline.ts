import { BOT_TYPES, type BotType } from "@/lib/filters"

import { DAY, HOUR, timeOf } from "./helpers"
import type { CrawlerEvent, PlatformPoint, TimelinePoint } from "./types"

function truncate(ms: number, unit: number): number {
  return Math.floor(ms / unit) * unit
}

function emptyPoint(t: number): TimelinePoint {
  const counts = Object.fromEntries(
    (Object.keys(BOT_TYPES) as BotType[]).map((type) => [type, 0])
  ) as Record<BotType, number>
  return { bucket: new Date(t).toISOString(), visits: 0, ...counts }
}

/** Hourly buckets for ranges up to a day, daily otherwise (matches the SQL). */
export function bucketUnit(since: number, now: number): number {
  return since > now - 25 * HOUR ? HOUR : DAY
}

/** Visits per bucket split by type, plus crawler visits per platform per bucket. */
export function buildTimelines(
  events: CrawlerEvent[],
  since: number,
  now: number
): { timeline: TimelinePoint[]; platformTimeline: PlatformPoint[] } {
  const unit = bucketUnit(since, now)
  const buckets = new Map<number, TimelinePoint>()
  for (let t = truncate(since, unit); t <= truncate(now, unit); t += unit) {
    buckets.set(t, emptyPoint(t))
  }
  const platforms = new Map<string, PlatformPoint>()
  for (const e of events) {
    const point = buckets.get(truncate(timeOf(e), unit))
    if (!point) continue
    point.visits++
    point[e.bot_type]++
    if (e.bot_type === "referral") continue
    const key = `${point.bucket}\u0000${e.platform}`
    const entry = platforms.get(key)
    if (entry) entry.visits++
    else
      platforms.set(key, {
        bucket: point.bucket,
        platform: e.platform,
        visits: 1,
      })
  }
  return {
    timeline: [...buckets.values()],
    platformTimeline: [...platforms.values()].sort(
      (a, b) =>
        a.bucket.localeCompare(b.bucket) || a.platform.localeCompare(b.platform)
    ),
  }
}
