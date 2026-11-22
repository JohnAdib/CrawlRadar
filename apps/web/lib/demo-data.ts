// Deterministic mock crawler traffic for the home page demo. Same seed + same `now`
// gives the same events on the server and in the browser, so hydration matches.
import { DEMO_VISITORS } from "@/lib/demo-visitors"
import type { CrawlerEvent } from "@/lib/stats"

export { DEMO_VISITORS } from "@/lib/demo-visitors"

/** Small, fast seeded PRNG (mulberry32). Returns floats in [0, 1). */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const DEMO_PAGES: [string, number][] = [
  ["/", 18],
  ["/blog/ai-search-guide", 15],
  ["/pricing", 12],
  ["/docs/getting-started", 10],
  ["/blog/llms-txt-explained", 9],
  ["/blog/robots-txt-for-ai", 8],
  ["/docs/api", 7],
  ["/changelog", 4],
  ["/about", 3],
  ["/contact", 2],
]

export const DEMO_DOMAIN = "acme-shop.com"

const HOUR = 3_600_000
const DAY = 24 * HOUR

/**
 * The demo's clock: 20:00 UTC on the current day. "Today" then always holds most of a
 * day's traffic, whatever time someone opens the page (just after midnight included).
 */
export function demoClock(realNow: number): number {
  return Math.floor(realNow / DAY) * DAY + 20 * HOUR
}

export function pick<T>(
  items: T[],
  weight: (item: T) => number,
  rand: () => number
): T {
  const total = items.reduce((sum, item) => sum + weight(item), 0)
  let r = rand() * total
  for (const item of items) {
    r -= weight(item)
    if (r < 0) return item
  }
  return items[items.length - 1]!
}

/**
 * About `count` events spread over the 60 days before `now` (so 30-day views have a
 * previous period to compare against), growing over time and busier at night (UTC).
 */
export function generateDemoEvents(
  now: number,
  count = 4000,
  seed = 42
): CrawlerEvent[] {
  const rand = seededRandom(seed)
  const events: CrawlerEvent[] = []

  for (let i = 0; i < count; i++) {
    // Skew toward recent days: traffic grows over the period.
    const ageDays = 60 * (1 - Math.sqrt(rand()))
    const dayStart = Math.floor((now - ageDays * DAY) / DAY) * DAY
    // Crawlers favour off-peak hours; referrals follow human daytime.
    const visitor = pick(DEMO_VISITORS, (v) => v.weight, rand)
    const human = visitor.bot_type === "referral"
    const hour = human
      ? 8 + Math.floor(rand() * 12)
      : Math.floor(rand() < 0.6 ? rand() * 8 : rand() * 24)
    let timestamp = dayStart + hour * HOUR + Math.floor(rand() * HOUR)
    // An hour that hasn't happened yet today lands on the day before instead.
    if (timestamp >= now) timestamp -= DAY
    const [path] = pick(DEMO_PAGES, ([, w]) => w, rand)
    events.push({
      id: `demo-${i}`,
      timestamp: new Date(timestamp).toISOString(),
      bot_name: visitor.bot_name,
      platform: visitor.platform,
      bot_type: visitor.bot_type,
      page_path: path,
      page_url: `https://${DEMO_DOMAIN}${path}`,
      user_agent: visitor.user_agent,
      referrer: visitor.referrer ?? null,
    })
  }
  return events.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}
