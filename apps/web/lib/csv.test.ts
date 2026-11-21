import { expect, test } from "vitest"

import { CSV_HEADER, csvRows, csvTimestamp } from "./csv"

const event = {
  page_url: "https://site.test/blog/post-1",
  page_path: "/blog/post-1",
  bot_name: "GPTBot",
  platform: "OpenAI",
  bot_type: "training",
}

test("matches the PRD appendix exactly", () => {
  const csv =
    CSV_HEADER +
    csvRows([
      {
        ...event,
        timestamp: "2026-01-31T10:23:45.123456+00:00",
        user_agent: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko)...",
      },
      {
        ...event,
        timestamp: "2026-01-31T10:24:12+00:00",
        page_url: "https://site.test/docs/api",
        page_path: "/docs/api",
        bot_name: "ClaudeBot",
        platform: "Anthropic",
        user_agent: "ClaudeBot/1.0...",
      },
    ])
  expect(csv).toBe(
    [
      "timestamp,page_url,bot_name,platform,bot_type,user_agent",
      '2026-01-31T10:23:45Z,/blog/post-1,GPTBot,OpenAI,training,"Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko)..."',
      '2026-01-31T10:24:12Z,/docs/api,ClaudeBot,Anthropic,training,"ClaudeBot/1.0..."',
      "",
    ].join("\n")
  )
})

test("timestamps are UTC with whole seconds", () => {
  expect(csvTimestamp("2026-11-21T23:30:05.999+02:00")).toBe(
    "2026-11-21T21:30:05Z"
  )
})

test("falls back to the full URL when the path is unknown, and escapes quotes", () => {
  const csv = csvRows([
    {
      ...event,
      page_path: null,
      timestamp: "2026-01-31T10:23:45Z",
      user_agent: 'Bot "quoted"',
    },
  ])
  expect(csv).toBe(
    '2026-01-31T10:23:45Z,https://site.test/blog/post-1,GPTBot,OpenAI,training,"Bot ""quoted"""\n'
  )
})

test("neutralises spreadsheet formulas from untrusted input", () => {
  const csv = csvRows([
    {
      ...event,
      timestamp: "2026-01-31T10:23:45Z",
      user_agent: "=HYPERLINK(1)",
    },
  ])
  expect(csv).toContain(`"'=HYPERLINK(1)"`)
})

test("an empty batch writes nothing", () => {
  expect(csvRows([])).toBe("")
})
