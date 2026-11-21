// Run: pnpm test
import assert from "node:assert/strict"
import { test } from "vitest"
import { AI_BOTS } from "./ai-bots.ts"
import { classify, unknownBotName } from "./bots.ts"
import { SEARCH_ENGINES } from "./search-engines.ts"

const BROWSER =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0 Safari/537.36"

test("detects the PRD acceptance-criteria bots (AC-1)", () => {
  const cases: [string, string, string][] = [
    [
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot",
      "GPTBot",
      "OpenAI",
    ],
    [
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
      "ClaudeBot",
      "Anthropic",
    ],
    [
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
      "PerplexityBot",
      "Perplexity",
    ],
    ["Mozilla/5.0 (compatible; Google-Extended)", "Google-Extended", "Google"],
  ]
  for (const [ua, name, platform] of cases) {
    const hit = classify(ua)
    assert.equal(hit?.name, name)
    assert.equal(hit?.platform, platform)
  }
})

test("assigns bot types", () => {
  assert.equal(classify("ChatGPT-User/1.0")?.type, "assistant")
  assert.equal(classify("OAI-SearchBot/1.0")?.type, "search")
  assert.equal(classify("CCBot/2.0")?.type, "training")
})

test("is case-insensitive", () => {
  assert.equal(classify("meta-externalagent/1.1")?.name, "Meta-ExternalAgent")
})

test("flags bots we don't know as Unknown, named from the user agent (FR-2.4)", () => {
  assert.deepEqual(classify("Mozilla/5.0 (compatible; NewAIcrawler/0.1)"), {
    name: "NewAIcrawler",
    platform: "Unknown",
    type: "unknown",
  })
  assert.equal(classify("curl/8.4.0")?.name, "curl")
  assert.equal(
    classify(
      "Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)"
    )?.name,
    "AhrefsBot"
  )
  assert.equal(unknownBotName("Mozilla/5.0 (compatible)"), "Unknown")
})

test("every known token classifies to its own entry (no shadowing)", () => {
  for (const [name, platform, type] of [...AI_BOTS, ...SEARCH_ENGINES]) {
    const ua = `Mozilla/5.0 (compatible; ${name === "Sogou Spider" ? "Sogou web spider" : name === "Yeti" ? "Yeti" : name}/1.0; +https://example.com/bot)`
    assert.deepEqual(classify(ua), { name, platform, type }, name)
  }
})

test("recognises Chinese AI crawlers", () => {
  assert.equal(
    classify("Mozilla/5.0 (compatible; DeepSeekBot/1.0)")?.platform,
    "DeepSeek"
  )
  assert.equal(
    classify("Mozilla/5.0 (compatible; QwenBot/1.0)")?.platform,
    "Alibaba"
  )
  assert.equal(
    classify("Mozilla/5.0 (compatible; Kimi-User/1.0)")?.type,
    "assistant"
  )
  assert.equal(
    classify("Mozilla/5.0 (compatible; ERNIEBot/1.0)")?.platform,
    "Baidu"
  )
})

test("keeps search engines apart from AI crawlers", () => {
  const google = classify(
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
  )
  assert.deepEqual(google, {
    name: "Googlebot",
    platform: "Google",
    type: "search_engine",
  })
  assert.equal(
    classify("Mozilla/5.0 (compatible; bingbot/2.0)")?.platform,
    "Microsoft"
  )
  // Applebot-Extended (AI training) wins over the shorter Applebot (search) token.
  assert.equal(classify("Applebot-Extended/0.1")?.type, "training")
  assert.equal(classify("Mozilla/5.0 (Applebot/0.1)")?.type, "search_engine")
})

test("ignores ordinary human traffic", () => {
  assert.equal(classify(BROWSER), null)
  assert.equal(classify(BROWSER, "https://www.google.com/"), null)
})

test("detects visitors referred by AI assistants", () => {
  assert.deepEqual(classify(BROWSER, "https://chatgpt.com/"), {
    name: "ChatGPT",
    platform: "OpenAI",
    type: "referral",
  })
  assert.equal(
    classify(BROWSER, "https://www.perplexity.ai/search?q=x")?.name,
    "Perplexity"
  )
  assert.equal(
    classify(BROWSER, null, "https://site.com/?utm_source=chatgpt.com")?.name,
    "ChatGPT"
  )
  assert.equal(classify(BROWSER, "https://notclaude.ai/"), null)
  assert.equal(
    classify(BROWSER, "https://chat.deepseek.com/")?.name,
    "DeepSeek"
  )
  assert.equal(
    classify(BROWSER, "https://www.kimi.com/")?.platform,
    "Moonshot AI"
  )
  assert.equal(classify(BROWSER, "https://chat.qwen.ai/")?.name, "Qwen")
})

test("survives malformed input", () => {
  assert.equal(classify("", "not a url", "::::"), null)
})
