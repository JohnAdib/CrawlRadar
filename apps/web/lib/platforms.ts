// Brand colour and logo per AI platform or assistant.
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

// Logos live in public/logos (from LobeHub Icons, MIT). `mono` logos are black and
// get inverted in dark mode.
const LOGOS: Record<string, { file: string; mono?: boolean }> = {
  OpenAI: { file: "openai", mono: true },
  ChatGPT: { file: "openai", mono: true },
  Anthropic: { file: "anthropic", mono: true },
  Claude: { file: "claude-color" },
  Perplexity: { file: "perplexity-color" },
  Google: { file: "google-color" },
  Gemini: { file: "gemini-color" },
  Meta: { file: "meta-color" },
  "Meta AI": { file: "meta-color" },
  Apple: { file: "apple", mono: true },
  Bytedance: { file: "bytedance-color" },
  Amazon: { file: "aws-color" },
  Microsoft: { file: "microsoft-color" },
  Copilot: { file: "copilot-color" },
  DeepSeek: { file: "deepseek-color" },
  Mistral: { file: "mistral-color" },
}

/** Logo for a platform or assistant name, or null when there isn't one. */
export function logoFor(name: string): { src: string; mono: boolean } | null {
  const logo = LOGOS[name]
  return logo
    ? { src: `/logos/${logo.file}.svg`, mono: Boolean(logo.mono) }
    : null
}
