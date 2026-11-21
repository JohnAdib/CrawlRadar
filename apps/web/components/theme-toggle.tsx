"use client"

import { AnimatedThemeToggler } from "@crawlradar/ui/components/animated-theme-toggler"
import { buttonVariants } from "@crawlradar/ui/components/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@crawlradar/ui/components/tooltip"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

/** Theme switch with a circular reveal (View Transitions), driven by next-themes. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  // The theme is only known in the browser; render the light icon until mounted.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const theme = mounted && resolvedTheme === "dark" ? "dark" : "light"

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <AnimatedThemeToggler
          theme={theme}
          onThemeChange={setTheme}
          duration={550}
          aria-label="Toggle light and dark mode"
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        />
      </TooltipTrigger>
      <TooltipContent>Toggle theme (D)</TooltipContent>
    </Tooltip>
  )
}
