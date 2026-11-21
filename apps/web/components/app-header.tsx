import { Button } from "@crawlradar/ui/components/button"
import { LogOut } from "lucide-react"
import Link from "next/link"

import { signOut } from "@/app/login/actions"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"

export function AppHeader({ email }: { email?: string }) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">Dashboard</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/sites">Sites &amp; install</Link>
          </Button>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-sm text-muted-foreground md:inline">
            {email}
          </span>
          <ThemeToggle />
          <form action={signOut}>
            <Button variant="ghost" size="icon" aria-label="Sign out">
              <LogOut />
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
