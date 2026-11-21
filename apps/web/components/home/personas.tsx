import { cn } from "@crawlradar/ui/lib/utils"
import {
  Check,
  Globe,
  type LucideIcon,
  Megaphone,
  PenLine,
  Search,
  Wrench,
} from "lucide-react"

import { Reveal, SpotlightCard } from "@/components/home/motion"
import { SectionHeading } from "@/components/home/section-heading"

interface Persona {
  icon: LucideIcon
  role: string
  title: string
  text: string
  points: string[]
  view: string
}

// One per user story in the PRD (US-1 to US-5).
const PERSONAS: Persona[] = [
  {
    icon: Globe,
    role: "Website owners",
    title: "Know exactly who is reading",
    text: "AI assistants answer questions with your content every day. See which platforms come, how often, and which of their crawlers do the reading.",
    points: [
      "OpenAI, Anthropic, Google, DeepSeek and 30+ more",
      "Training, search and assistant bots told apart",
      "Live within seconds of a visit",
    ],
    view: "Platforms",
  },
  {
    icon: Search,
    role: "SEO professionals",
    title: "Optimise what AI actually reads",
    text: "Every page ranked by AI visits, with the crawlers and platforms behind it. Find the content that feeds AI answers, and the pages AI never touches.",
    points: [
      "Every crawled page, ranked and searchable",
      "A full report for any page",
      "Search-engine bots shown alongside",
    ],
    view: "Pages",
  },
  {
    icon: PenLine,
    role: "Content strategists",
    title: "Watch the trend, not a snapshot",
    text: "Daily AI traffic by platform or by purpose, compared with the previous period. See whether a new guide gets picked up for training, search or live answers.",
    points: [
      "Trends against the previous period",
      "When crawlers visit, by weekday and hour",
      "Hourly detail for the last 24 hours",
    ],
    view: "Overview",
  },
  {
    icon: Wrench,
    role: "Website administrators",
    title: "One line. Five minutes. Done.",
    text: "A few hundred bytes, loaded asynchronously, never blocks rendering. A guided five-step setup checks that it works before you move on.",
    points: [
      "Works with any site, CMS or framework",
      "Optional pixel for crawlers without JavaScript",
      "Hits from copied snippets are rejected",
    ],
    view: "Onboarding",
  },
  {
    icon: Megaphone,
    role: "Marketing managers",
    title: "Numbers you can take to the meeting",
    text: "AI referrals count the people ChatGPT, Perplexity, Claude and Gemini send you. Export any view to CSV for decks, spreadsheets and BI tools.",
    points: [
      "AI referrals by assistant",
      "CSV export of every field",
      "Shareable links to any filtered view",
    ],
    view: "Export",
  },
]

function PersonaCard({ persona, wide }: { persona: Persona; wide?: boolean }) {
  const { icon: Icon } = persona
  return (
    <SpotlightCard
      className={cn("flex h-full flex-col gap-4", wide && "lg:p-8")}
    >
      <span className="flex items-center gap-2 font-medium text-chart-1 text-sm">
        <span className="flex size-8 items-center justify-center rounded-lg border bg-background shadow-sm">
          <Icon className="size-4" />
        </span>
        {persona.role}
      </span>
      <h3
        className={cn(
          "text-balance font-semibold text-xl",
          wide && "lg:text-2xl"
        )}
      >
        {persona.title}
      </h3>
      <p className="text-pretty text-muted-foreground text-sm leading-relaxed">
        {persona.text}
      </p>
      <ul className="mt-auto flex flex-col gap-2 pt-2 text-sm">
        {persona.points.map((point) => (
          <li key={point} className="flex gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-chart-2" />
            {point}
          </li>
        ))}
      </ul>
      <span className="self-start rounded-full border bg-background px-2.5 py-0.5 text-muted-foreground text-xs">
        {persona.view}
      </span>
    </SpotlightCard>
  )
}

/** Who CrawlRadar is for: one card per user story. */
export function Personas() {
  return (
    <section
      id="who"
      className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6"
    >
      <SectionHeading
        eyebrow="Who it's for"
        title="Built for everyone who owns the AI web"
        lead="Search used to send people. Now AI reads your site and answers for you. Five teams need to see that happen."
      />
      <div className="grid gap-4 lg:grid-cols-6">
        {PERSONAS.map((persona, i) => (
          <Reveal
            key={persona.role}
            delay={(i % 3) * 0.08}
            className={i < 2 ? "lg:col-span-3" : "lg:col-span-2"}
          >
            <PersonaCard persona={persona} wide={i < 2} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
