// Classifies one hit as an AI crawler, a search engine, another bot, an AI referral,
// or ordinary human traffic (null). Runs in the Edge Function (Deno) and in Vitest (Node).
import { isbot } from "isbot"

import { AI_BOTS } from "./ai-bots.ts"
import {
  type BotEntry,
  type Classification,
  tokenPattern,
} from "./bot-types.ts"
import { AI_REFERRERS } from "./referrers.ts"
import { SEARCH_ENGINES } from "./search-engines.ts"

export type { BotType, Classification } from "./bot-types.ts"

const KNOWN = [...AI_BOTS, ...SEARCH_ENGINES].map(
  ([name, platform, type, pattern]: BotEntry) => ({
    name,
    platform,
    type,
    pattern: pattern ?? tokenPattern(name),
  })
)

// Generic words in a user agent that never name the bot itself.
const NOISE =
  /^(mozilla|compatible|applewebkit|khtml|like|gecko|chrome|safari|version|mobile|\+?https?:)/i
const BOT_WORD = /bot|crawl|spider|scrape|fetch|headless|agent/i

/** Best-effort name for a bot we don't know, e.g. "NewAIcrawler" from "NewAIcrawler/0.1". */
export function unknownBotName(userAgent: string): string {
  const tokens = userAgent
    .split(/[\s;()]+/)
    .filter((t) => t && !NOISE.test(t))
    .map((t) => t.split("/")[0] as string)
  const name = tokens.find((t) => BOT_WORD.test(t)) ?? tokens[0]
  return name ? name.slice(0, 100) : "Unknown"
}

function hostOf(value: string | null | undefined): string | null {
  if (!value) return null
  try {
    const url = value.includes("://") ? value : `https://${value}`
    return new URL(url).hostname.toLowerCase()
  } catch {
    return null
  }
}

function utmSource(pageUrl: string | null | undefined): string | null {
  try {
    return pageUrl ? new URL(pageUrl).searchParams.get("utm_source") : null
  } catch {
    return null
  }
}

/** A person arriving from an AI assistant, by referrer host or utm_source. */
function aiReferrer(
  referrer?: string | null,
  pageUrl?: string | null
): Classification | null {
  for (const candidate of [hostOf(referrer), hostOf(utmSource(pageUrl))]) {
    const hit = candidate && AI_REFERRERS.find((r) => r.host.test(candidate))
    if (hit) return { name: hit.name, platform: hit.platform, type: "referral" }
  }
  return null
}

/** Classify one hit. Returns null for ordinary human traffic, which is not stored. */
export function classify(
  userAgent: string,
  referrer?: string | null,
  pageUrl?: string | null
): Classification | null {
  const known = KNOWN.find((bot) => bot.pattern.test(userAgent))
  if (known) {
    return { name: known.name, platform: known.platform, type: known.type }
  }
  // Any other bot, recognised by the `isbot` library's maintained pattern list (FR-2.4).
  if (isbot(userAgent)) {
    return {
      name: unknownBotName(userAgent),
      platform: "Unknown",
      type: "unknown",
    }
  }
  return aiReferrer(referrer, pageUrl)
}
