import { Badge } from "@crawlradar/ui/components/badge"
import { Button } from "@crawlradar/ui/components/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { HeroTitle, Reveal } from "@/components/home/motion"
import { ScriptPlacement } from "@/components/install/placement"
import { LiveDot } from "@/components/live-dot"

export type Cta = { href: string; label: string }

/** Headline, pitch, calls to action and the one-line install. */
export function Hero({ cta, code }: { cta: Cta; code: string }) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 pt-20 pb-14 text-center sm:px-6 sm:pt-28">
      <Reveal>
        <Badge
          variant="outline"
          className="gap-1.5 bg-background/60 px-3 py-1 backdrop-blur"
        >
          <LiveDot className="size-1.5" />
          Open source · MIT licensed
        </Badge>
      </Reveal>
      <HeroTitle
        text="See which AI bots read your website"
        className="max-w-4xl text-balance font-semibold text-4xl tracking-tight sm:text-6xl lg:text-7xl"
      />
      <Reveal delay={0.45}>
        <p className="max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
          ChatGPT, Claude, Perplexity, Gemini and DeepSeek crawl the web every
          day. CrawlRadar shows you which ones visit, what they read, and who
          they send back to you.
        </p>
      </Reveal>
      <Reveal delay={0.6} className="w-full sm:w-auto">
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button
            size="lg"
            className="group shadow-chart-1/20 shadow-lg"
            asChild
          >
            <Link href={cta.href}>
              {cta.label}
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="bg-background/60 backdrop-blur"
            asChild
          >
            <a href="#demo">See the live demo</a>
          </Button>
        </div>
      </Reveal>
      <Reveal delay={0.75} className="max-w-full">
        <div className="flex max-w-full flex-col items-center gap-1.5">
          <code className="max-w-full truncate rounded-lg border bg-background/60 px-3 py-2 font-mono text-muted-foreground text-xs backdrop-blur">
            {code}
          </code>
          <span className="text-muted-foreground text-xs">
            The whole install: one line, <ScriptPlacement />
          </span>
        </div>
      </Reveal>
    </div>
  )
}
