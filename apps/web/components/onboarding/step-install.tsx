import { Button } from "@crawlradar/ui/components/button"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { CopyBlock } from "@/components/copy-block"
import { Tag } from "@/components/head-tag"
import { StepCard } from "@/components/onboarding/step-card"

const PLATFORMS = [
  {
    name: "Any HTML site",
    where: (
      <>
        Paste it inside <Tag /> on every page, or in your shared layout.
      </>
    ),
  },
  {
    name: "WordPress",
    where:
      "Use a “header scripts” plugin, or add it to your theme’s header.php.",
  },
  {
    name: "Shopify",
    where: "Online Store → Themes → Edit code → theme.liquid, before </head>.",
  },
  {
    name: "Webflow / Squarespace / Wix",
    where: "Site settings → Custom code → Head code.",
  },
  {
    name: "Next.js / React",
    where: "Add the tag to your root layout’s <head>.",
  },
]

/** Step 3: copy the snippet, with where-to-paste tips for common platforms. */
export function StepInstall({
  domain,
  code,
  onBack,
  onNext,
}: {
  domain: string
  code: string
  onBack: () => void
  onNext: () => void
}) {
  return (
    <StepCard
      title="Install the snippet"
      description={
        <>
          Add this one tag to {domain}. It is a few hundred bytes, loads
          asynchronously and never slows your pages. Put it in the <Tag />:
          starting early catches crawlers that leave quickly.
        </>
      }
      footer={
        <>
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft /> Back
          </Button>
          <Button onClick={onNext}>
            I&apos;ve added it <ArrowRight />
          </Button>
        </>
      }
    >
      <CopyBlock code={code} label="Snippet" />
      <dl className="divide-y rounded-lg border text-sm">
        {PLATFORMS.map((p) => (
          <div
            key={p.name}
            className="flex flex-col gap-1 p-3 sm:flex-row sm:gap-4"
          >
            <dt className="shrink-0 font-medium sm:w-56">{p.name}</dt>
            <dd className="text-muted-foreground">{p.where}</dd>
          </div>
        ))}
      </dl>
    </StepCard>
  )
}
