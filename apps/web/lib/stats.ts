// Dashboard statistics. The server gets these from the crawler_stats() SQL function;
// computeStats() is its TypeScript twin, used by the home page demo (mock data) and tests.
import type { BotType } from "@/lib/filters"

export interface CrawlerEvent {
  id: string
  timestamp: string
  bot_name: string
  platform: string
  bot_type: BotType
  page_path: string | null
  page_url?: string
  user_agent?: string
  referrer?: string | null
}

export interface TimelinePoint {
  bucket: string
  visits: number
  training: number
  search: number
  assistant: number
  referral: number
  unknown: number
}

export interface Stats {
  platforms: string[]
  total: number
  crawls: number
  prev_crawls: number
  referrals: number
  prev_referrals: number
  active_bots: number
  active_platforms: number
  pages: number
  totals: { "24h": number; "7d": number; "30d": number }
  by_platform: { platform: string; visits: number }[]
  referrers: { source: string; platform: string; visits: number }[]
  by_bot: {
    bot_name: string
    platform: string
    bot_type: BotType
    visits: number
    last_seen: string
  }[]
  top_pages: { page_path: string | null; visits: number }[]
  timeline: TimelinePoint[]
  heatmap: { dow: number; hour: number; visits: number }[]
}

export interface StatsOptions {
  since: Date
  now: Date
  platform?: string
  type?: BotType
  page?: string
}

const HOUR = 3_600_000
const DAY = 24 * HOUR

/** Percent change from `previous` to `current`, or null when there is no baseline. */
export function percentChange(
  current: number,
  previous: number
): number | null {
  if (previous === 0) return null
  return Math.round(((current - previous) / previous) * 100)
}

function countBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>()
  for (const item of items) {
    const k = key(item)
    const group = groups.get(k)
    if (group) group.push(item)
    else groups.set(k, [item])
  }
  return groups
}

const byVisitsThen =
  <T extends { visits: number }>(name: (x: T) => string) =>
  (a: T, b: T) =>
    b.visits - a.visits || name(a).localeCompare(name(b))

function truncate(ms: number, unit: number): number {
  return Math.floor(ms / unit) * unit
}

export function computeStats(
  events: CrawlerEvent[],
  options: StatsOptions
): Stats {
  const now = options.now.getTime()
  const since = options.since.getTime()
  const prevSince = since - (now - since)

  const time = (e: CrawlerEvent) => new Date(e.timestamp).getTime()
  const matching = events.filter(
    (e) =>
      (!options.platform || e.platform === options.platform) &&
      (!options.type || e.bot_type === options.type) &&
      (!options.page || e.page_path === options.page)
  )
  const current = matching.filter((e) => time(e) >= since)
  const previous = matching.filter(
    (e) => time(e) >= prevSince && time(e) < since
  )
  const crawls = current.filter((e) => e.bot_type !== "referral")
  const referrals = current.filter((e) => e.bot_type === "referral")

  const unit = since > now - 25 * HOUR ? HOUR : DAY
  const buckets = new Map<number, TimelinePoint>()
  for (let t = truncate(since, unit); t <= truncate(now, unit); t += unit) {
    buckets.set(t, {
      bucket: new Date(t).toISOString(),
      visits: 0,
      training: 0,
      search: 0,
      assistant: 0,
      referral: 0,
      unknown: 0,
    })
  }
  for (const e of current) {
    const point = buckets.get(truncate(time(e), unit))
    if (!point) continue
    point.visits++
    point[e.bot_type]++
  }

  const heat = countBy(crawls, (e) => {
    const d = new Date(e.timestamp)
    return `${((d.getUTCDay() + 6) % 7) + 1}:${d.getUTCHours()}`
  })

  const last30 = matching.filter(
    (e) => e.bot_type !== "referral" && time(e) >= now - 30 * DAY
  )

  return {
    platforms: [...new Set(events.map((e) => e.platform))].sort(),
    total: current.length,
    crawls: crawls.length,
    prev_crawls: previous.filter((e) => e.bot_type !== "referral").length,
    referrals: referrals.length,
    prev_referrals: previous.filter((e) => e.bot_type === "referral").length,
    active_bots: new Set(crawls.map((e) => e.bot_name)).size,
    active_platforms: new Set(crawls.map((e) => e.platform)).size,
    pages: new Set(crawls.map((e) => e.page_path)).size,
    totals: {
      "24h": last30.filter((e) => time(e) >= now - DAY).length,
      "7d": last30.filter((e) => time(e) >= now - 7 * DAY).length,
      "30d": last30.length,
    },
    by_platform: [...countBy(current, (e) => e.platform)]
      .map(([platform, list]) => ({ platform, visits: list.length }))
      .sort(byVisitsThen((x) => x.platform)),
    referrers: [
      ...countBy(referrals, (e) => `${e.bot_name}\u0000${e.platform}`),
    ]
      .map(([, list]) => ({
        source: list[0]!.bot_name,
        platform: list[0]!.platform,
        visits: list.length,
      }))
      .sort(byVisitsThen((x) => x.source)),
    by_bot: [
      ...countBy(
        current,
        (e) => `${e.bot_name}\u0000${e.platform}\u0000${e.bot_type}`
      ),
    ]
      .map(([, list]) => ({
        bot_name: list[0]!.bot_name,
        platform: list[0]!.platform,
        bot_type: list[0]!.bot_type,
        visits: list.length,
        last_seen: list.reduce((a, b) => (time(b) > time(a) ? b : a)).timestamp,
      }))
      .sort(byVisitsThen((x) => x.bot_name)),
    top_pages: [...countBy(current, (e) => e.page_path ?? "")]
      .map(([, list]) => ({
        page_path: list[0]!.page_path,
        visits: list.length,
      }))
      .sort(byVisitsThen((x) => x.page_path ?? ""))
      .slice(0, 10),
    timeline: [...buckets.values()],
    heatmap: [...heat]
      .map(([key, list]) => {
        const [dow, hour] = key.split(":").map(Number) as [number, number]
        return { dow, hour, visits: list.length }
      })
      .sort((a, b) => a.dow - b.dow || a.hour - b.hour),
  }
}

/** Events matching the dashboard filters, newest first. */
export function recentEvents(
  events: CrawlerEvent[],
  options: StatsOptions,
  limit = 20
): CrawlerEvent[] {
  const since = options.since.getTime()
  return events
    .filter(
      (e) =>
        new Date(e.timestamp).getTime() >= since &&
        (!options.platform || e.platform === options.platform) &&
        (!options.type || e.bot_type === options.type) &&
        (!options.page || e.page_path === options.page)
    )
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit)
}
