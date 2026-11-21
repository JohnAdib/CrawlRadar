"use client"

import { cn } from "@crawlradar/ui/lib/utils"
import {
  Activity,
  FileText,
  LayoutGrid,
  type LucideIcon,
  PieChart,
  Settings,
} from "lucide-react"
import { motion } from "motion/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { type Filters, toQuery } from "@/lib/filters"

export const SECTIONS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/dashboard/platforms", label: "Platforms", icon: PieChart },
  { href: "/dashboard/pages", label: "Pages", icon: FileText },
  { href: "/dashboard/activity", label: "Activity log", icon: Activity },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

/** The dashboard's five views (PRD 7.1). Links keep the site, range and filters. */
export function DashboardTabs({
  filters,
}: {
  filters: Filters & { site: string }
}) {
  const pathname = usePathname()
  const query = toQuery({
    site: filters.site,
    range: filters.range,
    platform: filters.platform,
    type: filters.type,
  })
  return (
    <nav
      aria-label="Dashboard sections"
      className="-mx-4 overflow-x-auto border-b px-4 [scrollbar-width:none] sm:mx-0 sm:px-0"
    >
      <ul className="flex min-w-max gap-1">
        {SECTIONS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <li key={href} className="relative">
              <Link
                href={`${href}${href.endsWith("settings") ? toQuery({ site: filters.site }) : query}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-10 items-center gap-2 px-3 font-medium text-sm transition-colors [&_svg]:size-4",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon /> {label}
              </Link>
              {active && (
                <motion.span
                  layoutId="dashboard-tab"
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-foreground"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
