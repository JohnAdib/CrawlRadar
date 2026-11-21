// Deterministic mock crawler traffic for the home page demo. Same seed + same `now`
// gives the same events on the server and in the browser, so hydration matches.
import type { BotType } from "@/lib/filters"
import type { CrawlerEvent } from "@/lib/stats"

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

interface Visitor {
  bot_name: string
  platform: string
  bot_type: BotType
  user_agent: string
  referrer?: string
  weight: number
}

const BROWSER =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 15_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Safari/605.1.15"

export const DEMO_VISITORS: Visitor[] = [
  {
    bot_name: "GPTBot",
    platform: "OpenAI",
    bot_type: "training",
    user_agent:
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot",
    weight: 30,
  },
  {
    bot_name: "OAI-SearchBot",
    platform: "OpenAI",
    bot_type: "search",
    user_agent:
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot",
    weight: 13,
  },
  {
    bot_name: "ChatGPT-User",
    platform: "OpenAI",
    bot_type: "assistant",
    user_agent:
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot",
    weight: 11,
  },
  {
    bot_name: "ClaudeBot",
    platform: "Anthropic",
    bot_type: "training",
    user_agent:
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
    weight: 22,
  },
  {
    bot_name: "Claude-User",
    platform: "Anthropic",
    bot_type: "assistant",
    user_agent:
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-User/1.0; +Claude-User@anthropic.com)",
    weight: 7,
  },
  {
    bot_name: "PerplexityBot",
    platform: "Perplexity",
    bot_type: "search",
    user_agent:
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
    weight: 15,
  },
  {
    bot_name: "Google-Extended",
    platform: "Google",
    bot_type: "training",
    user_agent: "Mozilla/5.0 (compatible; Google-Extended)",
    weight: 8,
  },
  {
    bot_name: "Meta-ExternalAgent",
    platform: "Meta",
    bot_type: "training",
    user_agent:
      "meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)",
    weight: 9,
  },
  {
    bot_name: "Bytespider",
    platform: "Bytedance",
    bot_type: "training",
    user_agent:
      "Mozilla/5.0 (compatible; Bytespider; spider-feedback@bytedance.com)",
    weight: 6,
  },
  {
    bot_name: "Amazonbot",
    platform: "Amazon",
    bot_type: "training",
    user_agent:
      "Mozilla/5.0 (compatible; Amazonbot/0.1; +https://developer.amazon.com/support/amazonbot)",
    weight: 4,
  },
  {
    bot_name: "CCBot",
    platform: "Common Crawl",
    bot_type: "training",
    user_agent: "CCBot/2.0 (https://commoncrawl.org/faq/)",
    weight: 4,
  },
  {
    bot_name: "Applebot-Extended",
    platform: "Apple",
    bot_type: "training",
    user_agent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15 (Applebot-Extended/0.1; +http://www.apple.com/go/applebot)",
    weight: 4,
  },
  {
    bot_name: "MistralAI-User",
    platform: "Mistral",
    bot_type: "assistant",
    user_agent:
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; MistralAI-User/1.0; +https://docs.mistral.ai/robots)",
    weight: 3,
  },
  {
    bot_name: "Unknown",
    platform: "Unknown",
    bot_type: "unknown",
    user_agent:
      "Mozilla/5.0 (compatible; NewAIcrawler/0.3; +https://example.com/bot)",
    weight: 3,
  },
  {
    bot_name: "ChatGPT",
    platform: "OpenAI",
    bot_type: "referral",
    user_agent: BROWSER,
    referrer: "https://chatgpt.com/",
    weight: 9,
  },
  {
    bot_name: "Perplexity",
    platform: "Perplexity",
    bot_type: "referral",
    user_agent: BROWSER,
    referrer: "https://www.perplexity.ai/",
    weight: 4,
  },
  {
    bot_name: "Claude",
    platform: "Anthropic",
    bot_type: "referral",
    user_agent: BROWSER,
    referrer: "https://claude.ai/",
    weight: 3,
  },
  {
    bot_name: "Gemini",
    platform: "Google",
    bot_type: "referral",
    user_agent: BROWSER,
    referrer: "https://gemini.google.com/",
    weight: 2,
  },
]

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
  const DAY = 86_400_000
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
    const timestamp = Math.min(
      now - 1000,
      dayStart + hour * 3_600_000 + Math.floor(rand() * 3_600_000)
    )
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
