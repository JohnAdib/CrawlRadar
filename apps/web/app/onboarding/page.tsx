import type { Metadata } from "next"

import { AppHeader } from "@/components/app-header"
import { Onboarding } from "@/components/onboarding/onboarding"
import type { StepId } from "@/components/onboarding/steps"
import { appOrigin } from "@/lib/origin"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Get started",
  robots: { index: false },
}

/** Where a returning user picks up: no site yet, not installed yet, or done. */
function resume(sites: { installed_at: string | null }[]): StepId {
  if (sites.length === 0) return "site"
  return sites.some((s) => s.installed_at) ? "explore" : "install"
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  const [{ data: claims }, { data: sites }] = await Promise.all([
    supabase.auth.getClaims(),
    supabase
      .from("sites")
      .select("id, domain, installed_at")
      .order("created_at"),
  ])
  const list = sites ?? []
  const site = list.find((s) => s.installed_at) ?? list[0]

  return (
    <div className="min-h-svh bg-muted/40">
      <AppHeader email={claims?.claims.email} nav={false} />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-semibold text-3xl tracking-tight">
            Welcome to CrawlRadar
          </h1>
          <p className="text-muted-foreground">
            Five quick steps and you will see which AI bots read your website.
          </p>
        </div>
        <Onboarding
          origin={await appOrigin()}
          initialSite={site ? { id: site.id, domain: site.domain } : null}
          initialStep={resume(list)}
        />
      </main>
    </div>
  )
}
