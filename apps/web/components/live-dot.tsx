import { cn } from "@crawlradar/ui/lib/utils"

const TONES = {
  live: "bg-green-500",
  waiting: "bg-amber-500",
} as const

/** A status dot with a soft, continuous pulse (static for reduced-motion users). */
export function LiveDot({
  tone = "live",
  className,
}: {
  tone?: keyof typeof TONES
  className?: string
}) {
  return (
    <span
      className={cn("relative inline-flex size-2 shrink-0", className)}
      aria-hidden
    >
      <span
        className={cn(
          "absolute inline-flex size-full animate-ping rounded-full opacity-75 motion-reduce:hidden",
          TONES[tone]
        )}
      />
      <span
        className={cn(
          "relative inline-flex size-full rounded-full",
          TONES[tone]
        )}
      />
    </span>
  )
}
