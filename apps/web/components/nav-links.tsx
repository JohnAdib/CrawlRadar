"use client"

import { cn } from "@crawlradar/ui/lib/utils"
import { Globe, LayoutDashboard } from "lucide-react"
import { motion } from "motion/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sites", label: "Sites", icon: Globe },
]

/** Main navigation; the active pill glides between links. */
export function NavLinks() {
  const pathname = usePathname()
  return (
    <nav className="flex items-center gap-1" aria-label="Main">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative inline-flex h-8 items-center gap-1.5 rounded-md px-3 font-medium text-sm transition-colors [&_svg]:size-4",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {active && (
              <motion.span
                layoutId="nav-pill"
                className="absolute inset-0 rounded-md bg-accent"
                transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
              />
            )}
            <Icon className="relative" />
            <span className="relative">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
