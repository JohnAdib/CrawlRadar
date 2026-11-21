import {
  Bot,
  Download,
  FileText,
  Lock,
  MousePointerClick,
  TrendingUp,
} from "lucide-react"

import { Reveal, SpotlightCard } from "@/components/home/motion"
import { SectionHeading } from "@/components/home/section-heading"

const FEATURES = [
  {
    icon: Bot,
    title: "Know every AI crawler",
    text: "GPTBot, ClaudeBot, PerplexityBot, DeepSeekBot and 50+ more, grouped by platform and by purpose: training, search or assistant.",
  },
  {
    icon: MousePointerClick,
    title: "See AI referrals",
    text: "Count the people who click through to you from ChatGPT, Perplexity, Claude, Gemini, DeepSeek and more.",
  },
  {
    icon: FileText,
    title: "Reports for every page",
    text: "Open any page or platform for its own report: who reads it, when, and how often.",
  },
  {
    icon: TrendingUp,
    title: "Spot the trend",
    text: "Changes against the previous period, traffic by platform or type, and a weekday-by-hour heatmap.",
  },
  {
    icon: Download,
    title: "Export to CSV",
    text: "Download the current view or a site's full history for reports and spreadsheets.",
  },
  {
    icon: Lock,
    title: "Private by design",
    text: "Human visits are dropped, IPs are hashed with a daily salt, and every account is isolated.",
  },
]

export function Features() {
  return (
    <section
      id="features"
      className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6"
    >
      <SectionHeading
        eyebrow="Features"
        title="Analytics for the AI web"
        lead="Normal analytics tools filter bots out. CrawlRadar does the opposite."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, text }, i) => (
          <Reveal key={title} delay={(i % 3) * 0.08}>
            <SpotlightCard className="h-full">
              <span className="mb-4 flex size-10 items-center justify-center rounded-xl border bg-background text-chart-1 shadow-sm">
                <Icon className="size-5" />
              </span>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                {text}
              </p>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
