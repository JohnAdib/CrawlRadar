"use client"

import { Button } from "@crawlradar/ui/components/button"
import { cn } from "@crawlradar/ui/lib/utils"
import { Globe, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sites", label: "Sites", icon: Globe },
]

export function NavLinks() {
  const pathname = usePathname()
  return (
    <nav className="flex items-center gap-1" aria-label="Main">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href)
        return (
          <Button
            key={href}
            variant="ghost"
            size="sm"
            asChild
            className={cn(
              "text-muted-foreground",
              active && "bg-accent text-foreground"
            )}
          >
            <Link href={href} aria-current={active ? "page" : undefined}>
              <Icon />
              {label}
            </Link>
          </Button>
        )
      })}
    </nav>
  )
}
