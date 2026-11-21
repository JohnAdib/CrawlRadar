import type { BotEntry } from "./bot-types.ts"

// Known AI crawler user-agent tokens, cross-checked with the community list at
// https://github.com/ai-robots-txt/ai.robots.txt. Matching is a case-insensitive substring
// match, so version changes (GPTBot/1.2 -> GPTBot/2.0) keep matching.
// First match wins: keep a token before any shorter token it contains.
// To add a bot: add one line here and a case in bots.test.ts.
export const AI_BOTS: BotEntry[] = [
  // OpenAI
  ["GPTBot", "OpenAI", "training"],
  ["ChatGPT-User", "OpenAI", "assistant"],
  ["ChatGPT Agent", "OpenAI", "assistant", /ChatGPT[ -]Agent/i],
  ["OAI-SearchBot", "OpenAI", "search"],
  // Anthropic
  ["ClaudeBot", "Anthropic", "training"],
  ["Claude-User", "Anthropic", "assistant"],
  ["Claude-SearchBot", "Anthropic", "search"],
  ["Claude-Web", "Anthropic", "assistant"],
  ["anthropic-ai", "Anthropic", "training"],
  // Google. Google-Extended is mostly a robots.txt token, kept for the PRD's AC-1.
  ["Google-Extended", "Google", "training"],
  ["Google-CloudVertexBot", "Google", "training"],
  ["Gemini-Deep-Research", "Google", "assistant"],
  ["Google-NotebookLM", "Google", "assistant"],
  ["GoogleAgent-URLContext", "Google", "assistant"],
  ["GoogleOther", "Google", "training"],
  // Perplexity
  ["Perplexity-User", "Perplexity", "assistant"],
  ["PerplexityBot", "Perplexity", "search"],
  // Meta
  ["Meta-ExternalAgent", "Meta", "training"],
  ["Meta-ExternalFetcher", "Meta", "assistant"],
  ["meta-webindexer", "Meta", "search"],
  ["FacebookBot", "Meta", "training"],
  // Apple: before the Applebot search-engine entry, which it contains.
  ["Applebot-Extended", "Apple", "training"],
  // Amazon
  ["Amazonbot", "Amazon", "training"],
  ["Amzn-SearchBot", "Amazon", "search"],
  ["Amzn-User", "Amazon", "assistant"],
  // xAI, Mistral, Cohere, DuckDuckGo
  ["GrokBot", "xAI", "search"],
  ["MistralAI-User", "Mistral", "assistant"],
  ["MistralAI-Index", "Mistral", "search"],
  ["cohere-training-data-crawler", "Cohere", "training"],
  ["cohere-ai", "Cohere", "assistant"],
  ["DuckAssistBot", "DuckDuckGo", "assistant"],
  // Chinese AI platforms
  ["DeepSeekBot", "DeepSeek", "training"],
  ["DoubaoBot", "Bytedance", "assistant"],
  ["Bytespider", "Bytedance", "training"],
  ["TikTokSpider", "Bytedance", "training"],
  ["QwenBot", "Alibaba", "training"],
  ["TongyiBot", "Alibaba", "assistant"],
  ["Kimi-SearchBot", "Moonshot AI", "search"],
  ["Kimi-User", "Moonshot AI", "assistant"],
  ["KimiBot", "Moonshot AI", "training"],
  ["MoonshotBot", "Moonshot AI", "training"],
  ["ERNIEBot", "Baidu", "training"],
  ["Hunyuan", "Tencent", "training"],
  ["ChatGLM-Spider", "Zhipu AI", "training"],
  ["PanguBot", "Huawei", "training"],
  ["MiniMaxAgent", "MiniMax", "assistant"],
  ["Manus-User", "Manus", "assistant"],
  // AI search engines, assistants and dataset crawlers
  ["AI2Bot", "Ai2", "training"],
  ["Diffbot", "Diffbot", "training"],
  ["YouBot", "You.com", "search"],
  ["PhindBot", "Phind", "assistant"],
  ["kagi-fetcher", "Kagi", "assistant"],
  ["ExaBot", "Exa", "search"],
  ["iaskspider", "iAsk", "search"],
  ["Timpibot", "Timpi", "training"],
  ["omgili", "Webz.io", "training"],
  ["ImagesiftBot", "ImageSift", "training"],
  ["img2dataset", "img2dataset", "training"],
  ["CCBot", "Common Crawl", "training"],
]
