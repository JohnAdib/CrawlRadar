"use client"

import { MotionConfig } from "motion/react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import * as React from "react"

function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <ThemeHotkey />
      {/* Honour the OS "reduce motion" setting for every Motion animation. */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </NextThemesProvider>
  )
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

/** "d" on its own, outside a text field, toggles the theme. */
function isThemeHotkey(event: KeyboardEvent) {
  const modified = event.metaKey || event.ctrlKey || event.altKey
  return (
    !event.defaultPrevented &&
    !event.repeat &&
    !modified &&
    event.key.toLowerCase() === "d" &&
    !isTypingTarget(event.target)
  )
}

function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (isThemeHotkey(event)) {
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
      }
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [resolvedTheme, setTheme])

  return null
}

export { ThemeProvider }
