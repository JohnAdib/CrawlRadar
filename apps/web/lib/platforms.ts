// Brand-ish colour per AI platform, used for chart bars, chips and dots.
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
}

export function platformColor(platform: string): string {
  return PLATFORM_COLORS[platform] ?? "#a1a1aa"
}
