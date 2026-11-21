import { Button } from "@crawlradar/ui/components/button"
import Link from "next/link"

import { GitHubIcon } from "@/components/github-icon"
import { HeaderGlow } from "@/components/header-glow"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"

export const REPO = "https://github.com/JohnAdib/CrawlRadar"

const LINKS = [
  { href: "#demo", label: "Demo" },
  { href: "#who", label: "Who it's for" },
  { href: "#features", label: "Features" },
  { href: "#install", label: "Install" },
]

/** The public site's sticky header. */
export function SiteHeader({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:px-6">
        <Link href="/" aria-label="CrawlRadar home">
          <Logo />
        </Link>
        <nav className="ml-6 hidden items-center gap-1 text-muted-foreground text-sm md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild>
            <a
              href={REPO}
              target="_blank"
              rel="noreferrer"
              aria-label="CrawlRadar on GitHub"
            >
              <GitHubIcon className="size-4" />
            </a>
          </Button>
          <ThemeToggle />
          <Button size="sm" className="ml-1" asChild>
            <Link href={signedIn ? "/dashboard" : "/login"}>
              {signedIn ? "Dashboard" : "Sign in"}
            </Link>
          </Button>
        </div>
      </div>
      <HeaderGlow />
    </header>
  )
}
