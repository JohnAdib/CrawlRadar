import { BrandLogo } from "@/components/brand-logo"

const CRAWLERS: [string, string][] = [
  ["GPTBot", "OpenAI"],
  ["ClaudeBot", "Anthropic"],
  ["PerplexityBot", "Perplexity"],
  ["Google-Extended", "Google"],
  ["OAI-SearchBot", "OpenAI"],
  ["Meta-ExternalAgent", "Meta"],
  ["Claude-User", "Anthropic"],
  ["Applebot-Extended", "Apple"],
  ["Bytespider", "Bytedance"],
  ["ChatGPT-User", "OpenAI"],
  ["Amazonbot", "Amazon"],
  ["DeepSeekBot", "DeepSeek"],
  ["QwenBot", "Alibaba"],
  ["DoubaoBot", "Bytedance"],
  ["Kimi-User", "Moonshot AI"],
  ["GrokBot", "xAI"],
  ["MistralAI-User", "Mistral"],
  ["CCBot", "Common Crawl"],
]

/** An endless, edge-faded strip of crawler names; pauses on hover. */
export function CrawlerMarquee() {
  // Two copies back to back, so the strip loops seamlessly.
  const items = [0, 1].flatMap((copy) =>
    CRAWLERS.map(([bot, platform]) => ({
      key: `${copy}-${bot}`,
      bot,
      platform,
      hidden: copy === 1,
    }))
  )
  return (
    <div className="group relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
      <ul className="motion-reduce:animate-none flex w-max shrink-0 animate-[marquee_45s_linear_infinite] gap-3 group-hover:[animation-play-state:paused]">
        {items.map(({ key, bot, platform, hidden }) => (
          <li
            key={key}
            aria-hidden={hidden}
            className="flex items-center gap-2 rounded-full border bg-background/70 px-3.5 py-1.5 font-mono text-muted-foreground text-xs backdrop-blur"
          >
            <BrandLogo name={platform} />
            {bot}
          </li>
        ))}
      </ul>
    </div>
  )
}
