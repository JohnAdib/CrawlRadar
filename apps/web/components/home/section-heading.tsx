import { Reveal } from "@/components/home/motion"

/** Eyebrow, title and lead for a home page section. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string
  title: string
  lead: string
}) {
  return (
    <Reveal className="mx-auto mb-14 max-w-2xl text-center">
      <p className="font-medium text-chart-1 text-sm">{eyebrow}</p>
      <h2 className="mt-2 text-balance font-semibold text-3xl tracking-tight sm:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-pretty text-muted-foreground sm:text-lg">
        {lead}
      </p>
    </Reveal>
  )
}
