import { Button } from "@crawlradar/ui/components/button"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { Tag } from "@/components/head-tag"
import { InstallMethods } from "@/components/install/install-methods"
import { PixelPlacement } from "@/components/install/placement"
import { StepCard } from "@/components/onboarding/step-card"

const PLATFORMS: { name: string; where: React.ReactNode }[] = [
  {
    name: "Any HTML site",
    where: (
      <>
        <PixelPlacement /> of every page, or once in your shared layout.
      </>
    ),
  },
  {
    name: "WordPress",
    where: "A “header and footer scripts” plugin (footer box), or footer.php.",
  },
  {
    name: "Shopify",
    where: (
      <>
        Online Store → Themes → Edit code → theme.liquid, just before{" "}
        <Tag name="/body" />.
      </>
    ),
  },
  {
    name: "Webflow / Squarespace / Wix",
    where: "Site settings → Custom code → Footer code.",
  },
  {
    name: "Next.js / React",
    where: (
      <>
        Your root layout, just before <Tag name="/body" />.
      </>
    ),
  },
]

/** Step 3: copy a tag (JavaScript or pixel), with where-to-paste tips per platform. */
export function StepInstall({
  domain,
  origin,
  siteId,
  onBack,
  onNext,
}: {
  domain: string
  origin: string
  siteId: string
  onBack: () => void
  onNext: () => void
}) {
  return (
    <StepCard
      title="Install the snippet"
      description={`Add the tracking code to every page on ${domain}. Hybrid is recommended: it works whether or not the visitor runs JavaScript.`}
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
      <InstallMethods origin={origin} siteId={siteId} domain={domain} />
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
