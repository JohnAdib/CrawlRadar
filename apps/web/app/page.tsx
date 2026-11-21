import { HeroBackdrop } from "@/components/home/backdrop"
import { FinalCta, SiteFooter } from "@/components/home/closing"
import { DemoSection } from "@/components/home/demo-section"
import { Features } from "@/components/home/features"
import { Hero } from "@/components/home/hero"
import { InstallSection } from "@/components/home/install-section"
import { CrawlerMarquee } from "@/components/home/marquee"
import { Reveal } from "@/components/home/motion"
import { Personas } from "@/components/home/personas"
import { SiteHeader } from "@/components/home/site-header"
import { appOrigin } from "@/lib/origin"
import { snippet } from "@/lib/snippet"
import { createClient } from "@/lib/supabase/server"
import { version } from "../package.json"

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
      <SiteHeader signedIn={signedIn} />
      <main>
        <section className="relative isolate">
          <HeroBackdrop />
          <Hero cta={cta} code={snippet(origin, "YOUR_SITE_ID")} />
          <Reveal delay={0.9} className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
            <CrawlerMarquee />
          </Reveal>
          <DemoSection now={now} origin={origin} signedIn={signedIn} />
        </section>
        <Personas />
        <Features />
        <InstallSection />
        <FinalCta cta={cta} />
      </main>
      <SiteFooter version={version} />
    </div>
  )
}
