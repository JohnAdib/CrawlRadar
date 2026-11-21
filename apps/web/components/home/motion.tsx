"use client"

import { cn } from "@crawlradar/ui/lib/utils"
import { motion, useReducedMotion } from "motion/react"
import { useEffect, useRef } from "react"

const EASE = [0.22, 1, 0.36, 1] as const

/** Fades, lifts and un-blurs its children once they scroll into view. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

/** Headline that reveals word by word. */
export function HeroTitle({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const reduce = useReducedMotion()
  const words = text.split(" ").map((word, index) => ({ word, index }))
  return (
    <h1 className={className}>
      {words.map(({ word, index: i }) => (
        <motion.span
          key={`${i}:${word}`}
          className="inline-block"
          initial={reduce ? false : { opacity: 0, y: 18, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.1 + i * 0.07, ease: EASE }}
        >
          {word}
          {i < words.length - 1 && " "}
        </motion.span>
      ))}
    </h1>
  )
}

/** The demo window: tilts back in 3D, then settles flat as it scrolls into view. */
export function DemoStage({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion()
  if (reduce) return <div>{children}</div>
  return (
    <div className="[perspective:1600px]">
      <motion.div
        initial={{ opacity: 0.3, rotateX: 14, scale: 0.94, y: 40 }}
        whileInView={{ opacity: 1, rotateX: 0, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 1.1, ease: EASE }}
        style={{ transformOrigin: "50% 0%" }}
      >
        {children}
      </motion.div>
    </div>
  )
}

/** A card with a soft light that follows the cursor. */
export function SpotlightCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  // Decorative only: track the pointer to position the light, no interaction semantics.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const move = (e: PointerEvent) => {
      const box = el.getBoundingClientRect()
      el.style.setProperty("--x", `${e.clientX - box.left}px`)
      el.style.setProperty("--y", `${e.clientY - box.top}px`)
    }
    el.addEventListener("pointermove", move)
    return () => el.removeEventListener("pointermove", move)
  }, [])
  return (
    <div
      ref={ref}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card p-6 transition-colors duration-300 hover:border-foreground/15",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(420px circle at var(--x) var(--y), color-mix(in oklch, var(--chart-1) 14%, transparent), transparent 60%)",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}
