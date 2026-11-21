import Link from "next/link"

import { HeaderGlow } from "@/components/header-glow"
import { Logo } from "@/components/logo"
import { NavLinks } from "@/components/nav-links"
import { SignOutButton } from "@/components/sign-out-button"
import { ThemeToggle } from "@/components/theme-toggle"

/** The signed-in header. During onboarding (`nav={false}`) the app's sections are hidden. */
export function AppHeader({
  email,
  nav = true,
}: {
  email?: string
  nav?: boolean
}) {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4 sm:gap-6 sm:px-6">
        <Link href="/" aria-label="CrawlRadar home" className="shrink-0">
          <Logo compactOnMobile />
        </Link>
        {nav && <NavLinks />}
        <div className="ml-auto flex items-center gap-1">
          <span className="hidden max-w-48 truncate pr-2 text-sm text-muted-foreground lg:inline">
            {email}
          </span>
          <ThemeToggle />
          <SignOutButton />
        </div>
      </div>
      <HeaderGlow />
    </header>
  )
}
