"use client"

import { Button } from "@crawlradar/ui/components/button"
import { Spinner } from "@crawlradar/ui/components/spinner"
import { ArrowLeft, ExternalLink, RefreshCw } from "lucide-react"
import { useEffect, useState, useTransition } from "react"

import { checkInstall, installStatus } from "@/app/onboarding/actions"
import { Animation } from "@/components/animation"
import { LiveDot } from "@/components/live-dot"
import { StepCard } from "@/components/onboarding/step-card"

/** Step 4: wait for the first hit from the site (or find the tag in its HTML). */
export function StepVerify({
  site,
  onBack,
  onVerified,
}: {
  site: { id: string; domain: string }
  onBack: () => void
  onVerified: () => void
}) {
  const [checking, startCheck] = useTransition()
  const [missed, setMissed] = useState(false)

  // The track function marks the site installed on its first hit: poll for that.
  useEffect(() => {
    const id = setInterval(() => {
      // A failed poll is simply tried again on the next tick.
      installStatus(site.id).then(
        (ok) => ok && onVerified(),
        () => {}
      )
    }, 3000)
    return () => clearInterval(id)
  }, [site.id, onVerified])

  const checkNow = () =>
    startCheck(async () => {
      if (await checkInstall(site.id).catch(() => false)) onVerified()
      else setMissed(true)
    })

  return (
    <StepCard
      title="Check it works"
      description={`Open ${site.domain} in a new tab. The snippet reports in on the first page view, and this step completes on its own.`}
      footer={
        <>
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft /> Back
          </Button>
          <Button variant="outline" onClick={checkNow} disabled={checking}>
            {checking ? <Spinner /> : <RefreshCw />} Check now
          </Button>
          <Button asChild>
            <a href={`https://${site.domain}`} target="_blank" rel="noreferrer">
              Open {site.domain} <ExternalLink />
            </a>
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <Animation name="radar" className="size-32" />
        <p className="flex items-center gap-2 font-medium text-sm">
          <LiveDot /> Waiting for the first signal from {site.domain}
        </p>
        {missed && (
          <p className="max-w-md text-muted-foreground text-sm" role="status">
            Not found yet. Make sure the tag is published (not only saved as a
            draft) and on the live site, then open a page again.
          </p>
        )}
      </div>
    </StepCard>
  )
}
