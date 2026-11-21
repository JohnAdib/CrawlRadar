"use client"

import { useEffect, useRef, useState } from "react"

import { formatNumber } from "@/lib/format"

/**
 * A number that counts to its new value when it changes (e.g. switching filters).
 * Renders the final value on the server and for reduced-motion users.
 */
export function AnimatedNumber({ value }: { value: number }) {
  const [shown, setShown] = useState(value)
  const from = useRef(value)

  useEffect(() => {
    const start = from.current
    from.current = value
    if (start === value) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(value)
      return
    }
    const began = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const t = Math.min((now - began) / 600, 1)
      const eased = 1 - (1 - t) ** 3
      setShown(Math.round(start + (value - start) * eased))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value])

  return <>{formatNumber(shown)}</>
}
