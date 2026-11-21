import { describe, expect, test } from "vitest"

import {
  type CrawlerEvent,
  computeStats,
  percentChange,
  recentEvents,
} from "./stats"

const NOW = new Date("2026-01-31T12:30:00Z")
const DAY = 86_400_000

let n = 0
function event(
  hoursAgo: number,
  overrides: Partial<CrawlerEvent> = {}
): CrawlerEvent {
  return {
    id: `e${n++}`,
    timestamp: new Date(NOW.getTime() - hoursAgo * 3_600_000).toISOString(),
    bot_name: "GPTBot",
    platform: "OpenAI",
    bot_type: "training",
    page_path: "/",
    ...overrides,
  }
}

const EVENTS: CrawlerEvent[] = [
  event(1),
  event(2, { page_path: "/pricing" }),
  event(3, {
    bot_name: "ClaudeBot",
    platform: "Anthropic",
    page_path: "/pricing",
  }),
  event(5, { bot_name: "ChatGPT", bot_type: "referral", page_path: "/blog" }),
  event(6, { bot_name: "Claude", platform: "Anthropic", bot_type: "referral" }),
  event(30, {
    bot_name: "PerplexityBot",
    platform: "Perplexity",
    bot_type: "search",
  }),
  event(24 * 8), // previous 7-day window
  event(24 * 9, { bot_name: "ChatGPT", bot_type: "referral" }),
  event(24 * 40), // older than 30 days
]

const week = { now: NOW, since: new Date(NOW.getTime() - 7 * DAY) }

describe("percentChange", () => {
  test("rounds the relative change", () => {
    expect(percentChange(150, 100)).toBe(50)
    expect(percentChange(50, 100)).toBe(-50)
  })
  test("has no baseline when the previous value is zero", () => {
    expect(percentChange(5, 0)).toBeNull()
  })
})

describe("computeStats", () => {
  const stats = computeStats(EVENTS, week)

  test("splits crawls and referrals, with the previous period", () => {
    expect(stats.total).toBe(6)
    expect(stats.crawls).toBe(4)
    expect(stats.referrals).toBe(2)
    expect(stats.prev_crawls).toBe(1)
    expect(stats.prev_referrals).toBe(1)
  })

  test("counts crawlers, platforms and pages from crawls only", () => {
    expect(stats.active_bots).toBe(3)
    expect(stats.active_platforms).toBe(3)
    expect(stats.pages).toBe(2)
  })

  test("lists every platform ever seen, sorted", () => {
    expect(stats.platforms).toEqual(["Anthropic", "OpenAI", "Perplexity"])
  })

  test("fixed 24h/7d/30d totals count crawls only", () => {
    expect(stats.totals).toEqual({ "24h": 3, "7d": 4, "30d": 5 })
  })

  test("ranks platforms, referrers, bots and pages by visits then name", () => {
    expect(stats.by_platform).toEqual([
      { platform: "OpenAI", visits: 3 },
      { platform: "Anthropic", visits: 2 },
      { platform: "Perplexity", visits: 1 },
    ])
    expect(stats.referrers).toEqual([
      { source: "ChatGPT", platform: "OpenAI", visits: 1 },
      { source: "Claude", platform: "Anthropic", visits: 1 },
    ])
    expect(stats.by_bot[0]).toEqual({
      bot_name: "GPTBot",
      platform: "OpenAI",
      bot_type: "training",
      visits: 2,
      last_seen: EVENTS[0]!.timestamp,
    })
    expect(stats.top_pages).toEqual([
      { page_path: "/", visits: 3 },
      { page_path: "/pricing", visits: 2 },
      { page_path: "/blog", visits: 1 },
    ])
  })

  test("last_seen is the newest visit whatever the input order", () => {
    const older = event(10)
    const newer = event(2)
    expect(computeStats([older, newer], week).by_bot[0]!.last_seen).toBe(
      newer.timestamp
    )
  })

  test("builds one daily bucket per day, split by type", () => {
    expect(stats.timeline).toHaveLength(8)
    const today = stats.timeline.at(-1)!
    expect(today).toMatchObject({
      visits: 5,
      training: 3,
      referral: 2,
      search: 0,
    })
    expect(stats.timeline.reduce((sum, p) => sum + p.visits, 0)).toBe(6)
  })

  test("uses hourly buckets for the last 24 hours", () => {
    const day = computeStats(EVENTS, {
      now: NOW,
      since: new Date(NOW.getTime() - DAY),
    })
    expect(day.timeline).toHaveLength(25)
    expect(day.timeline.at(-2)).toMatchObject({ visits: 1, training: 1 })
  })

  test("builds a weekday x hour heatmap of crawls", () => {
    // 2026-01-31 is a Saturday (ISO weekday 6).
    expect(stats.heatmap).toContainEqual({ dow: 6, hour: 11, visits: 1 })
    expect(stats.heatmap.reduce((sum, c) => sum + c.visits, 0)).toBe(4)
  })

  test("applies platform and type filters", () => {
    const filtered = computeStats(EVENTS, { ...week, platform: "Anthropic" })
    expect(filtered.total).toBe(2)
    const referrals = computeStats(EVENTS, { ...week, type: "referral" })
    expect(referrals.crawls).toBe(0)
    expect(referrals.referrals).toBe(2)
  })

  test("applies the page filter (page reports)", () => {
    const pricing = computeStats(EVENTS, { ...week, page: "/pricing" })
    expect(pricing.total).toBe(2)
    expect(pricing.top_pages).toEqual([{ page_path: "/pricing", visits: 2 }])
    expect(
      recentEvents(EVENTS, { ...week, page: "/pricing" }).map(
        (e) => e.page_path
      )
    ).toEqual(["/pricing", "/pricing"])
  })

  test("ignores events newer than the last bucket and handles unknown pages", () => {
    const stats = computeStats(
      [event(-48), event(1, { page_path: null })],
      week
    )
    expect(stats.total).toBe(2)
    expect(stats.timeline.reduce((sum, p) => sum + p.visits, 0)).toBe(1)
    expect(stats.top_pages).toContainEqual({ page_path: null, visits: 1 })
  })
})

describe("recentEvents", () => {
  test("returns matching events newest first, limited", () => {
    const recent = recentEvents(EVENTS, { ...week, platform: "OpenAI" }, 2)
    expect(recent.map((e) => e.id)).toEqual([EVENTS[0]!.id, EVENTS[1]!.id])
  })

  test("filters by type and drops events outside the range", () => {
    const recent = recentEvents(EVENTS, { ...week, type: "referral" })
    expect(recent).toHaveLength(2)
  })
})
