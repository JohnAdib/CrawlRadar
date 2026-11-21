"use client"

import { cn } from "@crawlradar/ui/lib/utils"
import dynamic from "next/dynamic"
import { useSyncExternalStore } from "react"

import radar from "@/components/animations/radar.json"
import success from "@/components/animations/success.json"

// The animation engine touches `document`, so it only loads in the browser.
// The SVG build is the smaller one and is all these animations need.
const LottieSvg = dynamic(
  () => import("lottie-react").then((m) => m.LottieSvg),
  { ssr: false }
)

const ANIMATIONS = { radar, success }

const motionQuery = "(prefers-reduced-motion: reduce)"
function useReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(motionQuery)
      query.addEventListener("change", onChange)
      return () => query.removeEventListener("change", onChange)
    },
    () => window.matchMedia(motionQuery).matches,
    () => false
  )
}

/** Decorative Lottie animation. Shows a still last frame for users who prefer reduced motion. */
export function Animation({
  name,
  className,
}: {
  name: keyof typeof ANIMATIONS
  className?: string
}) {
  const reduced = useReducedMotion()
  const data = ANIMATIONS[name]

  return (
    <div className={cn("size-28", className)} aria-hidden>
      <LottieSvg
        src={data}
        loop={name === "radar" && !reduced}
        autoplay={!reduced}
        segment={reduced ? [data.op - 1, data.op] : undefined}
      />
    </div>
  )
}
