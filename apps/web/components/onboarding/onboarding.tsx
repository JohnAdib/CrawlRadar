"use client"

import { useCallback, useState } from "react"

import { type AddedSite, DomainForm } from "@/components/domain-form"
import { StepCard } from "@/components/onboarding/step-card"
import { StepExplore } from "@/components/onboarding/step-explore"
import { StepInstall } from "@/components/onboarding/step-install"
import { StepVerify } from "@/components/onboarding/step-verify"
import { Stepper } from "@/components/onboarding/stepper"
import type { StepId } from "@/components/onboarding/steps"
import { snippet } from "@/lib/snippet"

/**
 * Five steps, one at a time: account, website, install, verify, explore. The dashboard
 * stays locked until the snippet has been seen working on the site.
 */
export function Onboarding({
  origin,
  initialSite,
  initialStep,
}: {
  origin: string
  initialSite: AddedSite | null
  initialStep: StepId
}) {
  const [step, setStep] = useState<StepId>(initialStep)
  const [site, setSite] = useState<AddedSite | null>(initialSite)
  const added = useCallback((s: AddedSite) => {
    setSite(s)
    setStep("install")
  }, [])
  const verified = useCallback(() => setStep("explore"), [])

  return (
    <div className="flex flex-col gap-8">
      <Stepper current={step} />
      {step === "site" || !site ? (
        <StepCard
          title="Add your website"
          description="The domain you want to watch, like example.com. Subdomains count as separate sites."
        >
          <DomainForm onAdded={added} submitLabel="Continue" />
        </StepCard>
      ) : step === "install" ? (
        <StepInstall
          domain={site.domain}
          code={snippet(origin, site.id)}
          onBack={() => setStep("site")}
          onNext={() => setStep("verify")}
        />
      ) : step === "verify" ? (
        <StepVerify
          site={site}
          onBack={() => setStep("install")}
          onVerified={verified}
        />
      ) : (
        <StepExplore site={site} />
      )}
    </div>
  )
}
