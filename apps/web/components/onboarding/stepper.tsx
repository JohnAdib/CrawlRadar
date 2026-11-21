import { Progress } from "@crawlradar/ui/components/progress"
import { cn } from "@crawlradar/ui/lib/utils"
import { Check, Lock } from "lucide-react"

import { STEPS, type StepId, stepIndex } from "@/components/onboarding/steps"

function Marker({
  state,
  n,
}: {
  state: "done" | "current" | "locked"
  n: number
}) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full border font-medium text-sm transition-colors duration-300",
        state === "done" &&
          "border-transparent bg-primary text-primary-foreground",
        state === "current" &&
          "border-foreground bg-background ring-4 ring-foreground/10",
        state === "locked" && "bg-muted text-muted-foreground"
      )}
    >
      {state === "done" ? (
        <Check className="size-4" />
      ) : state === "locked" ? (
        <Lock className="size-3.5" />
      ) : (
        n
      )}
    </span>
  )
}

/** Progress through the five onboarding steps. Later steps stay locked. */
export function Stepper({ current }: { current: StepId }) {
  const at = stepIndex(current)
  const done = current === "explore" ? STEPS.length : at
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          Step {at + 1} of {STEPS.length}
          <span className="text-muted-foreground"> · {STEPS[at]!.title}</span>
        </span>
        <span className="text-muted-foreground tabular-nums">
          {Math.round((done / STEPS.length) * 100)}%
        </span>
      </div>
      <Progress
        value={(done / STEPS.length) * 100}
        aria-label="Onboarding progress"
      />
      <ol className="grid grid-cols-5 gap-2">
        {STEPS.map((step, i) => {
          const state =
            i < at || done === STEPS.length
              ? "done"
              : i === at
                ? "current"
                : "locked"
          return (
            <li
              key={step.id}
              aria-current={i === at ? "step" : undefined}
              className="flex flex-col items-center gap-2 text-center"
            >
              <Marker state={state} n={i + 1} />
              <span
                className={cn(
                  "hidden text-xs sm:block",
                  state === "locked" ? "text-muted-foreground" : "font-medium"
                )}
              >
                {step.short}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
