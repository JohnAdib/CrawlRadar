import { expect, test } from "vitest"

import { platformRows } from "./platform-rows"
import type { BotRow } from "./types"

const bot = (overrides: Partial<BotRow>): BotRow => ({
  bot_name: "GPTBot",
  platform: "OpenAI",
  bot_type: "training",
  visits: 1,
  last_seen: "2026-01-01T00:00:00Z",
  ...overrides,
})

test("sums visits per platform by kind and keeps the crawlers behind them", () => {
  const rows = platformRows([
    bot({ visits: 5 }),
    bot({
      bot_name: "ChatGPT",
      bot_type: "referral",
      visits: 2,
      last_seen: "2026-01-03T00:00:00Z",
    }),
    bot({
      bot_name: "Googlebot",
      platform: "Google",
      bot_type: "search_engine",
      visits: 9,
    }),
  ])
  expect(rows.map((r) => r.platform)).toEqual(["Google", "OpenAI"])
  expect(rows[1]).toMatchObject({
    visits: 7,
    ai_visits: 5,
    referrals: 2,
    search_engine_visits: 0,
    last_seen: "2026-01-03T00:00:00Z",
  })
  expect(rows[1]!.bots.map((b) => b.bot_name)).toEqual(["GPTBot"])
  expect(rows[0]).toMatchObject({ search_engine_visits: 9, ai_visits: 0 })
})

test("platforms with equal visits are sorted by name", () => {
  const rows = platformRows([
    bot({ platform: "Zeta" }),
    bot({ platform: "Alpha" }),
  ])
  expect(rows.map((r) => r.platform)).toEqual(["Alpha", "Zeta"])
})
