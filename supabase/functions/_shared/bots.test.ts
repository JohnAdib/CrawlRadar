// Run: pnpm test   (uses node:test, also runs under `deno test`)
import assert from "node:assert/strict";
import { test } from "node:test";
import { classify } from "./bots.ts";

const BROWSER =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0 Safari/537.36";

test("detects the PRD acceptance-criteria bots (AC-1)", () => {
  const cases: [string, string, string][] = [
    ["Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot", "GPTBot", "OpenAI"],
    ["Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)", "ClaudeBot", "Anthropic"],
    ["Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)", "PerplexityBot", "Perplexity"],
    ["Mozilla/5.0 (compatible; Google-Extended)", "Google-Extended", "Google"],
  ];
  for (const [ua, name, platform] of cases) {
    const hit = classify(ua);
    assert.equal(hit?.name, name);
    assert.equal(hit?.platform, platform);
  }
});

test("assigns bot types", () => {
  assert.equal(classify("ChatGPT-User/1.0")?.type, "assistant");
  assert.equal(classify("OAI-SearchBot/1.0")?.type, "search");
  assert.equal(classify("CCBot/2.0")?.type, "training");
});

test("is case-insensitive", () => {
  assert.equal(classify("meta-externalagent/1.1")?.name, "Meta-ExternalAgent");
});

test("flags unknown self-declared bots as Unknown (FR-2.4)", () => {
  assert.deepEqual(classify("Mozilla/5.0 (compatible; NewAIcrawler/0.1)"), {
    name: "Unknown",
    platform: "Unknown",
    type: "unknown",
  });
});

test("ignores ordinary human traffic", () => {
  assert.equal(classify(BROWSER), null);
  assert.equal(classify(BROWSER, "https://www.google.com/"), null);
});

test("detects visitors referred by AI assistants", () => {
  assert.deepEqual(classify(BROWSER, "https://chatgpt.com/"), {
    name: "ChatGPT",
    platform: "OpenAI",
    type: "referral",
  });
  assert.equal(classify(BROWSER, "https://www.perplexity.ai/search?q=x")?.name, "Perplexity");
  assert.equal(classify(BROWSER, null, "https://site.com/?utm_source=chatgpt.com")?.name, "ChatGPT");
  assert.equal(classify(BROWSER, "https://notclaude.ai/"), null);
});

test("survives malformed input", () => {
  assert.equal(classify("", "not a url", "::::"), null);
});
