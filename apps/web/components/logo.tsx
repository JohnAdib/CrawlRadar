import { cn } from "@crawlradar/ui/lib/utils"
import { Radar } from "lucide-react"

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-semibold tracking-tight",
        className
      )}
    >
      <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Radar className="size-4" />
      </span>
      CrawlRadar
    </span>
  )
}
