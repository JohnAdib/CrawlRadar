// Shared events for the stats tests.
import type { CrawlerEvent } from "./types"

export const NOW = new Date("2026-01-31T12:30:00Z")
export const DAY = 86_400_000

let n = 0
export function event(
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

export const EVENTS: CrawlerEvent[] = [
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

export const week = { now: NOW, since: new Date(NOW.getTime() - 7 * DAY) }
