import { Button } from "@crawlradar/ui/components/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@crawlradar/ui/components/tooltip"
import { LogOut } from "lucide-react"
import Link from "next/link"

import { signOut } from "@/app/login/actions"
import { Logo } from "@/components/logo"
import { NavLinks } from "@/components/nav-links"
import { ThemeToggle } from "@/components/theme-toggle"

export function AppHeader({ email }: { email?: string }) {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4 sm:gap-6 sm:px-6">
        <Link
          href="/dashboard"
          aria-label="CrawlRadar dashboard"
          className="shrink-0"
        >
          <Logo compactOnMobile />
        </Link>
        <NavLinks />
        <div className="ml-auto flex items-center gap-1">
          <span className="hidden max-w-48 truncate pr-2 text-sm text-muted-foreground lg:inline">
            {email}
          </span>
          <ThemeToggle />
          <form action={signOut}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  aria-label="Sign out"
                >
                  <LogOut />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Sign out</TooltipContent>
            </Tooltip>
          </form>
        </div>
      </div>
    </header>
  )
}
