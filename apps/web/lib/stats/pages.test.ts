import { describe, expect, test } from "vitest"

import { computePages, computeStats } from "."
import { EVENTS, event, week } from "./fixtures"

describe("search engines", () => {
  const withGoogle = [
    ...EVENTS,
    event(1, {
      bot_name: "Googlebot",
      platform: "Google",
      bot_type: "search_engine",
    }),
  ]
  const stats = computeStats(withGoogle, week)

  test("are counted on their own and kept out of AI totals", () => {
    expect(stats.search_engine_visits).toBe(1)
    expect(stats.crawls).toBe(4)
    expect(stats.totals["24h"]).toBe(3)
    expect(stats.timeline.at(-1)!.search_engine).toBe(1)
  })
})

describe("platform timeline", () => {
  test("counts crawler visits per platform per bucket, without referrals", () => {
    const stats = computeStats(EVENTS, week)
    const today = stats.timeline.at(-1)!.bucket
    expect(stats.platform_timeline.filter((p) => p.bucket === today)).toEqual([
      { bucket: today, platform: "Anthropic", visits: 1 },
      { bucket: today, platform: "OpenAI", visits: 2 },
    ])
  })
})

describe("computePages", () => {
  test("lists every page with crawler, referral and platform detail", () => {
    const pages = computePages(EVENTS, { ...week, page: "/ignored" })
    expect(pages.map((p) => p.page_path)).toEqual(["/", "/pricing", "/blog"])
    expect(pages[0]).toEqual({
      page_path: "/",
      visits: 3,
      ai_visits: 2,
      referrals: 1,
      bots: 2,
      top_platform: "OpenAI",
      last_seen: EVENTS[0]!.timestamp,
    })
    expect(pages[1]).toMatchObject({ bots: 2, referrals: 0 })
  })

  test("groups pages without a path together", () => {
    const pages = computePages([event(1, { page_path: null })], week)
    expect(pages).toEqual([
      expect.objectContaining({ page_path: null, visits: 1 }),
    ])
  })

  test("breaks ties by path, unknown pages first", () => {
    const pages = computePages(
      [event(1, { page_path: "/b" }), event(2, { page_path: null })],
      week
    )
    expect(pages.map((p) => p.page_path)).toEqual([null, "/b"])
  })
})
