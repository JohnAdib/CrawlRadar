// Who visits the demo site, and how often (relative weights).
import type { BotType } from "@/lib/filters"

export interface Visitor {
  bot_name: string
  platform: string
  bot_type: BotType
  user_agent: string
  referrer?: string
  weight: number
}

const BROWSER =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 15_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Safari/605.1.15"
const compatible = (token: string) =>
  `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ${token}; +https://example.com/bot)`

type Row = [
  name: string,
  platform: string,
  type: BotType,
  weight: number,
  ua: string,
]

const CRAWLERS: Row[] = [
  ["GPTBot", "OpenAI", "training", 30, compatible("GPTBot/1.2")],
  ["OAI-SearchBot", "OpenAI", "search", 13, compatible("OAI-SearchBot/1.0")],
  ["ChatGPT-User", "OpenAI", "assistant", 11, compatible("ChatGPT-User/1.0")],
  ["ClaudeBot", "Anthropic", "training", 22, compatible("ClaudeBot/1.0")],
  ["Claude-User", "Anthropic", "assistant", 7, compatible("Claude-User/1.0")],
  [
    "PerplexityBot",
    "Perplexity",
    "search",
    15,
    compatible("PerplexityBot/1.0"),
  ],
  [
    "Google-Extended",
    "Google",
    "training",
    8,
    "Mozilla/5.0 (compatible; Google-Extended)",
  ],
  [
    "Meta-ExternalAgent",
    "Meta",
    "training",
    9,
    "meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)",
  ],
  [
    "Bytespider",
    "Bytedance",
    "training",
    6,
    "Mozilla/5.0 (compatible; Bytespider; spider-feedback@bytedance.com)",
  ],
  ["DeepSeekBot", "DeepSeek", "training", 4, compatible("DeepSeekBot/1.0")],
  ["Amazonbot", "Amazon", "training", 4, compatible("Amazonbot/0.1")],
  [
    "CCBot",
    "Common Crawl",
    "training",
    4,
    "CCBot/2.0 (https://commoncrawl.org/faq/)",
  ],
  [
    "Applebot-Extended",
    "Apple",
    "training",
    4,
    compatible("Applebot-Extended/0.1"),
  ],
  [
    "MistralAI-User",
    "Mistral",
    "assistant",
    3,
    compatible("MistralAI-User/1.0"),
  ],
  ["Kimi-User", "Moonshot AI", "assistant", 2, compatible("Kimi-User/1.0")],
  [
    "Googlebot",
    "Google",
    "search_engine",
    9,
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  ],
  [
    "Bingbot",
    "Microsoft",
    "search_engine",
    4,
    "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
  ],
  [
    "NewAIcrawler",
    "Unknown",
    "unknown",
    3,
    "Mozilla/5.0 (compatible; NewAIcrawler/0.3; +https://example.com/bot)",
  ],
]

// People arriving from AI assistants (classified by referrer, with a normal browser).
const REFERRALS: [
  name: string,
  platform: string,
  referrer: string,
  weight: number,
][] = [
  ["ChatGPT", "OpenAI", "https://chatgpt.com/", 9],
  ["Perplexity", "Perplexity", "https://www.perplexity.ai/", 4],
  ["Claude", "Anthropic", "https://claude.ai/", 3],
  ["Gemini", "Google", "https://gemini.google.com/", 2],
]

export const DEMO_VISITORS: Visitor[] = [
  ...CRAWLERS.map(([bot_name, platform, bot_type, weight, ua]) => ({
    bot_name,
    platform,
    bot_type,
    weight,
    user_agent: ua,
  })),
  ...REFERRALS.map(([bot_name, platform, referrer, weight]) => ({
    bot_name,
    platform,
    bot_type: "referral" as const,
    weight,
    user_agent: BROWSER,
    referrer,
  })),
]
