import { Animation } from "@/components/animation"
import { Reveal } from "@/components/home/motion"

const STEPS = [
  { title: "Add your website", text: "Sign up and enter your domain." },
  { title: "Paste one line", text: "Drop the tag into your site's <head>." },
  {
    title: "Check it works",
    text: "Open your site once; setup confirms the snippet.",
  },
  {
    title: "Watch crawlers arrive",
    text: "AI visits appear on your dashboard in seconds.",
  },
]

export function InstallSection() {
  return (
    <section
      id="install"
      className="relative scroll-mt-20 border-y bg-muted/30"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2">
        <div className="flex flex-col gap-8">
          <Reveal>
            <p className="font-medium text-chart-1 text-sm">Install</p>
            <h2 className="mt-2 font-semibold text-3xl tracking-tight sm:text-5xl">
              Live in under five minutes
            </h2>
            <p className="mt-4 text-muted-foreground sm:text-lg">
              No SDK and no build step. One script tag, loaded asynchronously,
              so your pages stay fast.
            </p>
          </Reveal>
          <ol className="relative flex flex-col gap-6 before:absolute before:top-4 before:bottom-4 before:left-4 before:w-px before:bg-gradient-to-b before:from-chart-1/60 before:to-transparent">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={0.1 + i * 0.12}>
                <li className="relative flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-background font-mono text-sm shadow-sm">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium">{step.title}</p>
                    <p className="text-muted-foreground text-sm">{step.text}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
        <Reveal delay={0.2} className="flex justify-center">
          <div className="relative">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 rounded-full bg-chart-1/15 blur-3xl"
            />
            <Animation name="radar" className="size-64 sm:size-80" />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
