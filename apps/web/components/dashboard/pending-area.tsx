import { cn } from "@crawlradar/ui/lib/utils"

/** A thin animated bar under the header while new data loads. */
export function ProgressBar({ active }: { active?: boolean }) {
  if (!active) return null
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-14 z-30 h-0.5 overflow-hidden"
      aria-hidden
    >
      <div className="h-full w-1/4 animate-[progress-slide_1s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-chart-1 to-transparent" />
    </div>
  )
}

/**
 * Content that dims as one piece while the filter bar (`data-pending`) loads new data.
 * No per-card animation: restarting each card's entrance would ripple across the page.
 */
export function PendingArea({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 transition-[opacity,filter] duration-300 ease-out sm:gap-6",
        "group-has-[[data-pending=true]]/dash:pointer-events-none group-has-[[data-pending=true]]/dash:opacity-55 group-has-[[data-pending=true]]/dash:blur-[1px]",
        className
      )}
    >
      {children}
    </div>
  )
}
