import { cn } from "@crawlradar/ui/lib/utils"
import { useId } from "react"

/** The CrawlRadar mark: a radar sweep with a detected blip. Same art as app/icon.svg. */
export function LogoMark({ className }: { className?: string }) {
  const id = useId()
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("size-7 shrink-0", className)}
      aria-hidden
    >
      <defs>
        <linearGradient
          id={id}
          x1="32"
          y1="12"
          x2="49"
          y2="26"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#93c5fd" stopOpacity="0.95" />
          <stop offset="1" stopColor="#3b82f6" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill="#0b1020" />
      <circle
        cx="32"
        cy="32"
        r="20"
        fill="none"
        stroke="#3b82f6"
        strokeOpacity="0.35"
        strokeWidth="2.2"
      />
      <circle
        cx="32"
        cy="32"
        r="11"
        fill="none"
        stroke="#3b82f6"
        strokeOpacity="0.55"
        strokeWidth="2.2"
      />
      <path d="M32 32 L32 12 A20 20 0 0 1 49.32 22 Z" fill={`url(#${id})`} />
      <circle cx="43.5" cy="41.5" r="2.8" fill="#60a5fa" />
      <circle cx="32" cy="32" r="3.6" fill="#ffffff" />
    </svg>
  )
}

export function Logo({
  className,
  compactOnMobile,
}: {
  className?: string
  compactOnMobile?: boolean
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-semibold tracking-tight",
        className
      )}
    >
      <LogoMark />
      <span className={cn(compactOnMobile && "hidden sm:inline")}>
        CrawlRadar
      </span>
    </span>
  )
}
