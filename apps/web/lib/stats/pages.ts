// Every crawled page in range: the TypeScript twin of crawler_pages() in SQL.
import {
  byVisitsThen,
  groupBy,
  isAi,
  matches,
  mode,
  newest,
  timeOf,
} from "./helpers"
import type { CrawlerEvent, PageRow, StatsOptions } from "./types"

export function computePages(
  events: CrawlerEvent[],
  options: StatsOptions
): PageRow[] {
  const since = options.since.getTime()
  const current = events.filter(
    (e) => timeOf(e) >= since && matches(e, { ...options, page: undefined })
  )
  return [...groupBy(current, (e) => e.page_path ?? "")]
    .map(([, list]) => {
      const crawlers = list.filter((e) => e.bot_type !== "referral")
      return {
        page_path: list[0]!.page_path,
        visits: list.length,
        ai_visits: list.filter(isAi).length,
        referrals: list.length - crawlers.length,
        bots: new Set(crawlers.map((e) => e.bot_name)).size,
        top_platform: mode(list.map((e) => e.platform)),
        last_seen: newest(list),
      }
    })
    .sort(byVisitsThen((x) => x.page_path ?? ""))
    .slice(0, 500)
}
