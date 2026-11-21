import { Badge } from "@crawlradar/ui/components/badge"
import { Button } from "@crawlradar/ui/components/button"
import {
  ArrowRight,
  Bot,
  Download,
  FileText,
  Lock,
  MousePointerClick,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"

import { Animation } from "@/components/animation"
import { DemoDashboard } from "@/components/dashboard/demo"
import { GitHubIcon } from "@/components/github-icon"
import { Tag } from "@/components/head-tag"
import { HeaderGlow } from "@/components/header-glow"
import { HeroBackdrop } from "@/components/home/backdrop"
import { CrawlerMarquee } from "@/components/home/marquee"
import {
  DemoStage,
  HeroTitle,
  Reveal,
  SpotlightCard,
} from "@/components/home/motion"
import { LiveDot } from "@/components/live-dot"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { appOrigin, snippet } from "@/lib/snippet"
import { createClient } from "@/lib/supabase/server"

const REPO = "https://github.com/JohnAdib/CrawlRadar"

const FEATURES = [
  {
    icon: Bot,
    title: "Know every AI crawler",
    text: "GPTBot, ClaudeBot, PerplexityBot and more, grouped by platform and by purpose: training, search or assistant.",
  },
  {
    icon: MousePointerClick,
    title: "See AI referrals",
    text: "Count the people who click through to you from ChatGPT, Perplexity, Claude, Gemini and Copilot.",
  },
  {
    icon: FileText,
    title: "Reports for every page",
    text: "Open any page or platform for its own report: who reads it, when, and how often.",
  },
  {
    icon: TrendingUp,
    title: "Spot the trend",
    text: "Changes against the previous period, AI traffic by type, and a weekday-by-hour heatmap.",
  },
  {
    icon: Download,
    title: "Export to CSV",
    text: "Download the current view or a site's full history for reports and spreadsheets.",
  },
  {
    icon: Lock,
    title: "Private by design",
    text: "Only AI traffic is stored. IPs are hashed with a daily salt, and every account is isolated.",
  },
]

const STEPS = [
  { title: "Add your website", text: "Sign up and enter your domain." },
  { title: "Paste one line", text: "Drop the tag into your site's <head>." },
  {
    title: "Watch crawlers arrive",
    text: "Visits appear on your dashboard in seconds.",
  },
]

export default async function HomePage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const signedIn = Boolean(data?.claims)
  const origin = await appOrigin()
  // Rounded to the minute so the demo's relative times read cleanly.
  const now = Math.floor(Date.now() / 60_000) * 60_000
  const cta = signedIn
    ? { href: "/dashboard", label: "Open dashboard" }
    : { href: "/login", label: "Get started free" }

  return (
    <div className="min-h-svh overflow-x-clip bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:px-6">
          <Link href="/" aria-label="CrawlRadar home">
            <Logo />
          </Link>
          <nav className="ml-6 hidden items-center gap-1 text-muted-foreground text-sm md:flex">
            <a
              href="#demo"
              className="rounded-md px-3 py-1.5 transition-colors hover:text-foreground"
            >
              Demo
            </a>
            <a
              href="#features"
              className="rounded-md px-3 py-1.5 transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#install"
              className="rounded-md px-3 py-1.5 transition-colors hover:text-foreground"
            >
              Install
            </a>
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild>
              <a
                href={REPO}
                target="_blank"
                rel="noreferrer"
                aria-label="CrawlRadar on GitHub"
              >
                <GitHubIcon className="size-4" />
              </a>
            </Button>
            <ThemeToggle />
            <Button size="sm" className="ml-1" asChild>
              <Link href={signedIn ? "/dashboard" : "/login"}>
                {signedIn ? "Dashboard" : "Sign in"}
              </Link>
            </Button>
          </div>
        </div>
        <HeaderGlow />
      </header>

      <main>
        <section className="relative isolate">
          <HeroBackdrop />
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
                ChatGPT, Claude, Perplexity and Gemini crawl the web every day.
                CrawlRadar shows you which ones visit, what they read, and who
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
                  {snippet(origin, "YOUR_SITE_ID")}
                </code>
                <span className="text-muted-foreground text-xs">
                  The whole install: one line in your <Tag />
                </span>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.9} className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
            <CrawlerMarquee />
          </Reveal>

          <div
            id="demo"
            className="mx-auto max-w-7xl scroll-mt-20 px-2 pb-24 sm:px-6"
          >
            <DemoStage>
              <div className="relative rounded-2xl border bg-muted/40 p-2 shadow-2xl shadow-chart-1/10 sm:p-3">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-b from-chart-1/30 via-transparent to-transparent opacity-60 [mask-image:linear-gradient(black,transparent_30%)]"
                />
                <div className="relative flex flex-wrap items-center justify-between gap-2 px-2 pt-1 pb-3 text-muted-foreground text-xs sm:px-3">
                  <span className="flex items-center gap-2">
                    <LiveDot />
                    Live demo with example data. Try the filters, or click a
                    page or platform.
                  </span>
                  <Badge variant="outline" className="bg-background">
                    Example data
                  </Badge>
                </div>
                <div className="relative rounded-xl border bg-background p-3 sm:p-6">
                  <DemoDashboard now={now} signedIn={signedIn} />
                </div>
              </div>
            </DemoStage>
          </div>
        </section>

        <section
          id="features"
          className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6"
        >
          <Reveal className="mx-auto mb-14 max-w-2xl text-center">
            <p className="font-medium text-chart-1 text-sm">Features</p>
            <h2 className="mt-2 font-semibold text-3xl tracking-tight sm:text-5xl">
              Analytics for the AI web
            </h2>
            <p className="mt-4 text-muted-foreground sm:text-lg">
              Normal analytics tools filter bots out. CrawlRadar does the
              opposite.
            </p>
          </Reveal>
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

        <section
          id="install"
          className="relative scroll-mt-20 border-y bg-muted/30"
        >
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2">
            <div className="flex flex-col gap-8">
              <Reveal>
                <p className="font-medium text-chart-1 text-sm">Install</p>
                <h2 className="mt-2 font-semibold text-3xl tracking-tight sm:text-5xl">
                  Live in under five minutes
                </h2>
                <p className="mt-4 text-muted-foreground sm:text-lg">
                  No SDK and no build step. One script tag, loaded
                  asynchronously, so your pages stay fast.
                </p>
              </Reveal>
              <ol className="relative flex flex-col gap-6 before:absolute before:top-4 before:bottom-4 before:left-4 before:w-px before:bg-gradient-to-b before:from-chart-1/60 before:to-transparent">
                {STEPS.map((step, i) => (
                  <Reveal key={step.title} delay={0.1 + i * 0.12}>
                    <li className="relative flex gap-4">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-background font-mono text-sm shadow-sm">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-medium">{step.title}</p>
                        <p className="text-muted-foreground text-sm">
                          {step.text}
                        </p>
                      </div>
                    </li>
                  </Reveal>
                ))}
              </ol>
            </div>
            <Reveal delay={0.2} className="flex justify-center">
              <div className="relative">
                <div
                  aria-hidden
                  className="absolute inset-0 -z-10 rounded-full bg-chart-1/15 blur-3xl"
                />
                <Animation name="radar" className="size-64 sm:size-80" />
              </div>
            </Reveal>
          </div>
        </section>

        <section className="relative isolate overflow-hidden">
          <div
            aria-hidden
            className="motion-reduce:animate-none pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 animate-[aurora_20s_ease-in-out_infinite] rounded-full bg-chart-1/15 blur-[120px]"
          />
          <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-28 text-center sm:px-6">
            <h2 className="text-balance font-semibold text-3xl tracking-tight sm:text-5xl">
              Find out who&apos;s reading your site
            </h2>
            <p className="text-muted-foreground sm:text-lg">
              Free and open source. Self-host it, or start in a minute.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="group" asChild>
                <Link href={cta.href}>
                  {cta.label}
                  <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href={REPO} target="_blank" rel="noreferrer">
                  <GitHubIcon className="size-4" /> Star on GitHub
                </a>
              </Button>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-muted-foreground text-sm sm:flex-row sm:px-6">
          <Logo className="text-foreground" />
          <p>
            Open source under the MIT license ·{" "}
            <a
              href={REPO}
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
