import type { CrawlerEvent, StatsOptions } from "./types"

export const HOUR = 3_600_000
export const DAY = 24 * HOUR

/** Percent change from `previous` to `current`, or null when there is no baseline. */
export function percentChange(
  current: number,
  previous: number
): number | null {
  if (previous === 0) return null
  return Math.round(((current - previous) / previous) * 100)
}

/** AI crawler traffic: everything except human referrals and classic search engines. */
export function isAi(event: Pick<CrawlerEvent, "bot_type">): boolean {
  return event.bot_type !== "referral" && event.bot_type !== "search_engine"
}

export function timeOf(event: CrawlerEvent): number {
  return new Date(event.timestamp).getTime()
}

/** True when the event passes the platform, type and page filters. */
export function matches(event: CrawlerEvent, options: StatsOptions): boolean {
  return (
    (!options.platform || event.platform === options.platform) &&
    (!options.type || event.bot_type === options.type) &&
    (!options.page || event.page_path === options.page)
  )
}

export function groupBy<T>(
  items: T[],
  key: (item: T) => string
): Map<string, T[]> {
  const groups = new Map<string, T[]>()
  for (const item of items) {
    const k = key(item)
    const group = groups.get(k)
    if (group) group.push(item)
    else groups.set(k, [item])
  }
  return groups
}

/** Sort by visits descending, then by name. */
export const byVisitsThen =
  <T extends { visits: number }>(name: (x: T) => string) =>
  (a: T, b: T) =>
    b.visits - a.visits || name(a).localeCompare(name(b))

export function newest(events: CrawlerEvent[]): string {
  return events.reduce((a, b) => (timeOf(b) > timeOf(a) ? b : a)).timestamp
}

/** The most frequent value (ties go to the first seen). */
export function mode(values: string[]): string {
  const counts = groupBy(values, (v) => v)
  return [...counts].sort((a, b) => b[1].length - a[1].length)[0]![0]
}
