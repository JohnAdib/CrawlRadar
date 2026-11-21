import { byVisitsThen, groupBy, newest } from "./helpers"
import type { BotRow, CrawlerEvent, Stats } from "./types"

export function rankPlatforms(events: CrawlerEvent[]): Stats["by_platform"] {
  return [...groupBy(events, (e) => e.platform)]
    .map(([platform, list]) => ({ platform, visits: list.length }))
    .sort(byVisitsThen((x) => x.platform))
}

export function rankReferrers(referrals: CrawlerEvent[]): Stats["referrers"] {
  return [...groupBy(referrals, (e) => `${e.bot_name}\u0000${e.platform}`)]
    .map(([, list]) => ({
      source: list[0]!.bot_name,
      platform: list[0]!.platform,
      visits: list.length,
    }))
    .sort(byVisitsThen((x) => x.source))
}

export function rankBots(events: CrawlerEvent[]): BotRow[] {
  return [
    ...groupBy(
      events,
      (e) => `${e.bot_name}\u0000${e.platform}\u0000${e.bot_type}`
    ),
  ]
    .map(([, list]) => ({
      bot_name: list[0]!.bot_name,
      platform: list[0]!.platform,
      bot_type: list[0]!.bot_type,
      visits: list.length,
      last_seen: newest(list),
    }))
    .sort(byVisitsThen((x) => x.bot_name))
}

export function topPages(events: CrawlerEvent[]): Stats["top_pages"] {
  return [...groupBy(events, (e) => e.page_path ?? "")]
    .map(([, list]) => ({ page_path: list[0]!.page_path, visits: list.length }))
    .sort(byVisitsThen((x) => x.page_path ?? ""))
    .slice(0, 10)
}

/** ISO weekday (1 = Monday) x UTC hour. */
export function heatmap(crawls: CrawlerEvent[]): Stats["heatmap"] {
  const cells = groupBy(crawls, (e) => {
    const d = new Date(e.timestamp)
    return `${((d.getUTCDay() + 6) % 7) + 1}:${d.getUTCHours()}`
  })
  return [...cells]
    .map(([key, list]) => {
      const [dow, hour] = key.split(":").map(Number) as [number, number]
      return { dow, hour, visits: list.length }
    })
    .sort((a, b) => a.dow - b.dow || a.hour - b.hour)
}
