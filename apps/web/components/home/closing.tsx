import { Button } from "@crawlradar/ui/components/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { GitHubIcon } from "@/components/github-icon"
import type { Cta } from "@/components/home/hero"
import { Reveal } from "@/components/home/motion"
import { REPO } from "@/components/home/site-header"
import { Logo } from "@/components/logo"

/** The last call to action. */
export function FinalCta({ cta }: { cta: Cta }) {
  return (
    <section className="relative isolate overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 animate-[aurora_20s_ease-in-out_infinite] rounded-full bg-chart-1/15 blur-[120px] motion-reduce:animate-none"
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
  )
}

const LINK = "underline-offset-4 hover:text-foreground hover:underline"

export function SiteFooter({ version }: { version: string }) {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-muted-foreground text-sm sm:flex-row sm:px-6">
        <Logo className="text-foreground" />
        <p>
          Open source under the MIT license ·{" "}
          <a href={REPO} className={LINK}>
            GitHub
          </a>{" "}
          ·{" "}
          <a
            href={`${REPO}/releases/tag/v${version}`}
            className={`tabular-nums ${LINK}`}
          >
            v{version}
          </a>
        </p>
      </div>
    </footer>
  )
}
