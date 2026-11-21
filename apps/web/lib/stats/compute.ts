// Dashboard statistics. The server gets these from the crawler_stats() SQL function;
// computeStats() is its TypeScript twin, used by the home page demo (mock data) and tests.
import { DAY, isAi, matches, timeOf } from "./helpers"
import {
  heatmap,
  rankBots,
  rankPlatforms,
  rankReferrers,
  topPages,
} from "./rankings"
import { buildTimelines } from "./timeline"
import type { CrawlerEvent, Stats, StatsOptions } from "./types"

const isReferral = (e: CrawlerEvent) => e.bot_type === "referral"

/** Fixed 24h / 7d / 30d AI crawler totals, independent of the selected range. */
function fixedTotals(events: CrawlerEvent[], now: number): Stats["totals"] {
  const last30 = events.filter((e) => isAi(e) && timeOf(e) >= now - 30 * DAY)
  return {
    "24h": last30.filter((e) => timeOf(e) >= now - DAY).length,
    "7d": last30.filter((e) => timeOf(e) >= now - 7 * DAY).length,
    "30d": last30.length,
  }
}

export function computeStats(
  events: CrawlerEvent[],
  options: StatsOptions
): Stats {
  const now = options.now.getTime()
  const since = options.since.getTime()
  const prevSince = since - (now - since)

  const matching = events.filter((e) => matches(e, options))
  const current = matching.filter((e) => timeOf(e) >= since)
  const previous = matching.filter(
    (e) => timeOf(e) >= prevSince && timeOf(e) < since
  )
  const crawls = current.filter(isAi)
  const referrals = current.filter(isReferral)
  const { timeline, platformTimeline } = buildTimelines(current, since, now)

  return {
    platforms: [...new Set(events.map((e) => e.platform))].sort(),
    total: current.length,
    crawls: crawls.length,
    prev_crawls: previous.filter(isAi).length,
    referrals: referrals.length,
    prev_referrals: previous.filter(isReferral).length,
    search_engine_visits: current.filter((e) => e.bot_type === "search_engine")
      .length,
    active_bots: new Set(crawls.map((e) => e.bot_name)).size,
    active_platforms: new Set(crawls.map((e) => e.platform)).size,
    pages: new Set(crawls.map((e) => e.page_path)).size,
    totals: fixedTotals(matching, now),
    by_platform: rankPlatforms(current),
    referrers: rankReferrers(referrals),
    by_bot: rankBots(current),
    top_pages: topPages(current),
    timeline,
    platform_timeline: platformTimeline,
    heatmap: heatmap(crawls),
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
    .filter((e) => timeOf(e) >= since && matches(e, options))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit)
}
