// AI assistants that send people to a site, matched on the referrer host or utm_source.

export interface Referrer {
  host: RegExp
  name: string
  platform: string
}

/** Matches `domain` or any subdomain of it. */
function on(...domains: string[]): RegExp {
  const hosts = domains.map((d) => d.replace(/\./g, "\\.")).join("|")
  return new RegExp(`(^|\\.)(${hosts})$`)
}

export const AI_REFERRERS: Referrer[] = [
  {
    host: on("chatgpt.com", "chat.openai.com"),
    name: "ChatGPT",
    platform: "OpenAI",
  },
  { host: on("perplexity.ai"), name: "Perplexity", platform: "Perplexity" },
  { host: on("claude.ai"), name: "Claude", platform: "Anthropic" },
  {
    host: on("gemini.google.com", "bard.google.com"),
    name: "Gemini",
    platform: "Google",
  },
  { host: on("copilot.microsoft.com"), name: "Copilot", platform: "Microsoft" },
  { host: on("meta.ai"), name: "Meta AI", platform: "Meta" },
  { host: on("grok.com"), name: "Grok", platform: "xAI" },
  { host: on("chat.mistral.ai"), name: "Le Chat", platform: "Mistral" },
  { host: on("chat.deepseek.com"), name: "DeepSeek", platform: "DeepSeek" },
  {
    host: on("kimi.com", "kimi.moonshot.cn"),
    name: "Kimi",
    platform: "Moonshot AI",
  },
  {
    host: on("chat.qwen.ai", "qianwen.com", "tongyi.aliyun.com"),
    name: "Qwen",
    platform: "Alibaba",
  },
  { host: on("doubao.com"), name: "Doubao", platform: "Bytedance" },
  { host: on("yuanbao.tencent.com"), name: "Yuanbao", platform: "Tencent" },
  { host: on("chatglm.cn"), name: "ChatGLM", platform: "Zhipu AI" },
  { host: on("yiyan.baidu.com"), name: "ERNIE", platform: "Baidu" },
  { host: on("poe.com"), name: "Poe", platform: "Quora" },
  { host: on("you.com"), name: "You.com", platform: "You.com" },
  { host: on("phind.com"), name: "Phind", platform: "Phind" },
]
