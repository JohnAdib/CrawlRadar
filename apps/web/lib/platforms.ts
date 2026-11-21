// Brand colour and logo per platform (the company) or assistant (the product).
const PLATFORM_COLORS: Record<string, string> = {
  OpenAI: "#10a37f",
  Anthropic: "#d97757",
  Perplexity: "#20b8cd",
  Google: "#4285f4",
  Meta: "#0866ff",
  Apple: "#8e8e93",
  Bytedance: "#fe2c55",
  "Common Crawl": "#f59e0b",
  Amazon: "#ff9900",
  Microsoft: "#00a4ef",
  DeepSeek: "#4d6bfe",
  Mistral: "#fa520f",
  DuckDuckGo: "#de5833",
  xAI: "#71717a",
  Alibaba: "#ff6a00",
  "Moonshot AI": "#6366f1",
  Tencent: "#0052d9",
  Baidu: "#2932e1",
  "Zhipu AI": "#3859ff",
  Huawei: "#c7000b",
  MiniMax: "#e2167e",
  Cohere: "#39594d",
  Yandex: "#fc3f1d",
  Yahoo: "#6001d2",
  Brave: "#fb542b",
  Quora: "#b92b27",
}

export function platformColor(platform: string): string {
  return PLATFORM_COLORS[platform] ?? "#a1a1aa"
}

// Logos live in public/logos (from LobeHub Icons, MIT). `mono` logos are black and
// get inverted in dark mode.
const MONO = new Set([
  ...["openai", "anthropic", "apple", "xai", "grok"],
  ...["moonshot", "yandex", "manus", "phind", "kagi"],
])
export const LOGOS: Record<string, string> = {
  OpenAI: "openai",
  ChatGPT: "openai",
  Anthropic: "anthropic",
  Claude: "claude-color",
  Perplexity: "perplexity-color",
  Google: "google-color",
  Gemini: "gemini-color",
  Meta: "meta-color",
  "Meta AI": "meta-color",
  Apple: "apple",
  Bytedance: "bytedance-color",
  Doubao: "doubao-color",
  Amazon: "aws-color",
  Microsoft: "microsoft-color",
  Copilot: "copilot-color",
  DeepSeek: "deepseek-color",
  Mistral: "mistral-color",
  "Le Chat": "mistral-color",
  xAI: "xai",
  Grok: "grok",
  Alibaba: "alibaba-color",
  Qwen: "qwen-color",
  "Moonshot AI": "moonshot",
  Kimi: "kimi-color",
  Tencent: "tencent-color",
  Yuanbao: "tencent-color",
  Baidu: "baidu-color",
  ERNIE: "wenxin-color",
  "Zhipu AI": "zhipu-color",
  ChatGLM: "chatglm-color",
  Huawei: "huawei-color",
  MiniMax: "minimax-color",
  Manus: "manus",
  Cohere: "cohere-color",
  Ai2: "ai2-color",
  Yandex: "yandex",
  Quora: "poe-color",
  Poe: "poe-color",
  Phind: "phind",
  Kagi: "kagi",
  Exa: "exa-color",
  Brave: "brave-color",
}

/** Logo for a platform or assistant name, or null when there isn't one. */
export function logoFor(name: string): { src: string; mono: boolean } | null {
  const file = LOGOS[name]
  if (!file) return null
  return { src: `/logos/${file}.svg`, mono: MONO.has(file) }
}
