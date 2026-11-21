import { Badge } from "@crawlradar/ui/components/badge"
import { Button } from "@crawlradar/ui/components/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@crawlradar/ui/components/card"
import {
  ArrowRight,
  Bot,
  Download,
  FileText,
  Lock,
  MousePointerClick,
  TrendingUp,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Animation } from "@/components/animation"
import { GitHubIcon } from "@/components/github-icon"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { createClient } from "@/lib/supabase/server"

const REPO = "https://github.com/JohnAdib/CrawlRadar"

const BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-User",
  "PerplexityBot",
  "Google-Extended",
  "Meta-ExternalAgent",
  "Applebot-Extended",
  "Bytespider",
  "CCBot",
  "Amazonbot",
]

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
    title: "Find your top pages",
    text: "Learn which pages AI systems read most, so you know what to keep sharp.",
  },
  {
    icon: TrendingUp,
    title: "Spot the trend",
    text: "Hourly and daily timelines for the last 24 hours, 7 days or 30 days, with filters.",
  },
  {
    icon: Download,
    title: "Export to CSV",
    text: "Download the current view or a site's full history for reports and spreadsheets.",
  },
  {
    icon: Lock,
    title: "Private by design",
    text: "Only AI traffic is stored. IP addresses are hashed with a daily salt and never kept.",
  },
]

const STEPS = [
  { title: "Add your website", text: "Sign up and enter your domain." },
  {
    title: "Paste one line",
    text: "Drop the snippet into your site's <head>.",
  },
  {
    title: "Watch crawlers arrive",
    text: "Visits appear on your dashboard in seconds.",
  },
]

export default async function HomePage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const signedIn = Boolean(data?.claims)
  const cta = signedIn
    ? { href: "/dashboard", label: "Open dashboard" }
    : { href: "/login", label: "Get started free" }

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:px-6">
          <Link href="/" aria-label="CrawlRadar home">
            <Logo />
          </Link>
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
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 mx-auto h-[480px] max-w-3xl rounded-full bg-[radial-gradient(closest-side,var(--chart-1),transparent)] opacity-20 blur-3xl"
          />
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 pt-16 pb-12 text-center sm:px-6 sm:pt-24">
            <Badge
              variant="outline"
              className="gap-1.5 bg-background/60 px-3 py-1"
            >
              <span className="size-1.5 rounded-full bg-green-500" />
              Open source · MIT licensed
            </Badge>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
              See which AI bots read your website
            </h1>
            <p className="max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
              ChatGPT, Claude, Perplexity and Gemini crawl the web every day.
              CrawlRadar shows you which ones visit, what they read, and who
              they send back to you.
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button size="lg" asChild>
                <Link href={cta.href}>
                  {cta.label} <ArrowRight />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href={REPO} target="_blank" rel="noreferrer">
                  <GitHubIcon className="size-4" /> Star on GitHub
                </a>
              </Button>
            </div>
            <code className="mt-2 max-w-full truncate rounded-lg border bg-muted/60 px-3 py-2 font-mono text-xs text-muted-foreground">
              &lt;script async
              src=&quot;…/t.js?s=your-site&quot;&gt;&lt;/script&gt;
            </code>
          </div>

          <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
            <div className="rounded-xl border bg-muted/40 p-1.5 shadow-2xl shadow-primary/5 sm:p-2">
              <Image
                src="/dashboard-light.png"
                alt="CrawlRadar dashboard showing AI crawler visits by platform"
                width={2880}
                height={2000}
                priority
                sizes="(min-width: 1152px) 1152px, 100vw"
                className="rounded-lg border dark:hidden"
              />
              <Image
                src="/dashboard-dark.png"
                alt="CrawlRadar dashboard showing AI crawler visits by platform"
                width={2880}
                height={2000}
                priority
                sizes="(min-width: 1152px) 1152px, 100vw"
                className="hidden rounded-lg border dark:block"
              />
            </div>
          </div>
        </section>

        <section className="border-y bg-muted/30">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-10 sm:px-6">
            <p className="text-sm text-muted-foreground">
              Detects crawlers including
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {BOTS.map((bot) => (
                <Badge
                  key={bot}
                  variant="secondary"
                  className="font-mono text-xs"
                >
                  {bot}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Analytics for the AI web
            </h2>
            <p className="mt-3 text-muted-foreground">
              Normal analytics tools filter bots out. CrawlRadar does the
              opposite.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <Card key={title} className="transition-colors hover:bg-muted/40">
                <CardHeader>
                  <span className="mb-2 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {text}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-t bg-muted/30">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Set up in under five minutes
                </h2>
                <p className="mt-3 text-muted-foreground">
                  No SDK, no build step. One script tag, loaded asynchronously,
                  so your pages stay fast.
                </p>
              </div>
              <ol className="flex flex-col gap-5">
                {STEPS.map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-background font-mono text-sm">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium">{step.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {step.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
              <Button size="lg" className="self-start" asChild>
                <Link href={cta.href}>
                  {cta.label} <ArrowRight />
                </Link>
              </Button>
            </div>
            <div className="flex justify-center">
              <Animation name="radar" className="size-64 sm:size-80" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
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
