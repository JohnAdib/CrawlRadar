// AI crawler signatures and AI-assistant referrers.
// Runs in the Edge Function (Deno) and in tests (Node or Deno). No dependencies.

export type BotType = "training" | "search" | "assistant" | "referral" | "unknown";

export interface Classification {
  name: string;
  platform: string;
  type: BotType;
}

interface BotPattern extends Classification {
  pattern: RegExp;
}

// Order matters: first match wins, so keep more specific patterns first.
// To add a bot, add one line here and a test case in bots.test.ts.
export const BOT_PATTERNS: BotPattern[] = [
  { pattern: /GPTBot/i, name: "GPTBot", platform: "OpenAI", type: "training" },
  { pattern: /ChatGPT-User/i, name: "ChatGPT-User", platform: "OpenAI", type: "assistant" },
  { pattern: /OAI-SearchBot/i, name: "OAI-SearchBot", platform: "OpenAI", type: "search" },
  { pattern: /ClaudeBot/i, name: "ClaudeBot", platform: "Anthropic", type: "training" },
  { pattern: /Claude-User/i, name: "Claude-User", platform: "Anthropic", type: "assistant" },
  { pattern: /Claude-SearchBot/i, name: "Claude-SearchBot", platform: "Anthropic", type: "search" },
  { pattern: /Claude-Web/i, name: "Claude-Web", platform: "Anthropic", type: "assistant" },
  // Google-Extended and Applebot-Extended are robots.txt tokens; real requests rarely carry them
  // in the User-Agent. Kept so any request that does is recognised (PRD AC-1).
  { pattern: /Google-Extended/i, name: "Google-Extended", platform: "Google", type: "training" },
  { pattern: /Google-CloudVertexBot/i, name: "Google-CloudVertexBot", platform: "Google", type: "training" },
  { pattern: /Perplexity-User/i, name: "Perplexity-User", platform: "Perplexity", type: "assistant" },
  { pattern: /PerplexityBot/i, name: "PerplexityBot", platform: "Perplexity", type: "search" },
  { pattern: /Meta-ExternalAgent/i, name: "Meta-ExternalAgent", platform: "Meta", type: "training" },
  { pattern: /Meta-ExternalFetcher/i, name: "Meta-ExternalFetcher", platform: "Meta", type: "assistant" },
  { pattern: /Applebot-Extended/i, name: "Applebot-Extended", platform: "Apple", type: "training" },
  { pattern: /CCBot/i, name: "CCBot", platform: "Common Crawl", type: "training" },
  { pattern: /Bytespider/i, name: "Bytespider", platform: "Bytedance", type: "training" },
  { pattern: /Amazonbot/i, name: "Amazonbot", platform: "Amazon", type: "training" },
  { pattern: /DuckAssistBot/i, name: "DuckAssistBot", platform: "DuckDuckGo", type: "assistant" },
  { pattern: /MistralAI-User/i, name: "MistralAI-User", platform: "Mistral", type: "assistant" },
];

// Human visitors arriving from an AI assistant (by referrer host or utm_source).
export const AI_REFERRERS: { host: RegExp; name: string; platform: string }[] = [
  { host: /(^|\.)(chatgpt\.com|chat\.openai\.com)$/, name: "ChatGPT", platform: "OpenAI" },
  { host: /(^|\.)perplexity\.ai$/, name: "Perplexity", platform: "Perplexity" },
  { host: /(^|\.)claude\.ai$/, name: "Claude", platform: "Anthropic" },
  { host: /^gemini\.google\.com$/, name: "Gemini", platform: "Google" },
  { host: /^copilot\.microsoft\.com$/, name: "Copilot", platform: "Microsoft" },
  { host: /(^|\.)meta\.ai$/, name: "Meta AI", platform: "Meta" },
  { host: /(^|\.)chat\.deepseek\.com$/, name: "DeepSeek", platform: "DeepSeek" },
];

// Anything self-identifying as a bot that we don't know yet (FR-2.4).
const GENERIC_BOT = /bot|crawl|spider|scrape|fetch/i;

function hostOf(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value.includes("://") ? value : `https://${value}`).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function aiReferrer(referrer?: string | null, pageUrl?: string | null): Classification | null {
  let utm: string | null = null;
  try {
    utm = pageUrl ? new URL(pageUrl).searchParams.get("utm_source") : null;
  } catch {
    // ignore malformed page URLs
  }
  for (const candidate of [hostOf(referrer), hostOf(utm)]) {
    if (!candidate) continue;
    const hit = AI_REFERRERS.find((r) => r.host.test(candidate));
    if (hit) return { name: hit.name, platform: hit.platform, type: "referral" };
  }
  return null;
}

/**
 * Classify one hit. Returns null for ordinary human traffic, which is not stored.
 */
export function classify(
  userAgent: string,
  referrer?: string | null,
  pageUrl?: string | null,
): Classification | null {
  for (const bot of BOT_PATTERNS) {
    if (bot.pattern.test(userAgent)) {
      return { name: bot.name, platform: bot.platform, type: bot.type };
    }
  }
  if (GENERIC_BOT.test(userAgent)) return { name: "Unknown", platform: "Unknown", type: "unknown" };
  return aiReferrer(referrer, pageUrl);
}
