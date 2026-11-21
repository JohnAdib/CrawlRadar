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

export type Section =
  | "overview"
  | "platforms"
  | "pages"
  | "activity"
  | "settings"

export const SECTIONS: {
  id: Section
  href: string
  label: string
  icon: LucideIcon
}[] = [
  { id: "overview", href: "/dashboard", label: "Overview", icon: LayoutGrid },
  {
    id: "platforms",
    href: "/dashboard/platforms",
    label: "Platforms",
    icon: PieChart,
  },
  { id: "pages", href: "/dashboard/pages", label: "Pages", icon: FileText },
  {
    id: "activity",
    href: "/dashboard/activity",
    label: "Activity log",
    icon: Activity,
  },
  {
    id: "settings",
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
  },
]

/** The section for a dashboard URL path. */
export function sectionFor(pathname: string): Section {
  return SECTIONS.find((s) => s.href === pathname)?.id ?? "overview"
}

const TAB =
  "flex h-10 items-center gap-2 px-3 font-medium text-sm transition-colors [&_svg]:size-4"

type TabProps = {
  section: (typeof SECTIONS)[number]
  current: boolean
  hrefFor?: (section: Section) => string
  onSelect?: (section: Section) => void
}

/** One tab: a link in the live app, a button in the demo. */
function Tab({ section, current, hrefFor, onSelect }: TabProps) {
  const { id, label, icon: Icon } = section
  const props = {
    "aria-current": current ? ("page" as const) : undefined,
    className: cn(
      TAB,
      current
        ? "text-foreground"
        : "text-muted-foreground hover:text-foreground"
    ),
  }
  const content = (
    <>
      <Icon /> {label}
    </>
  )
  return hrefFor ? (
    <Link href={hrefFor(id)} {...props}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={() => onSelect?.(id)} {...props}>
      {content}
    </button>
  )
}

/**
 * The dashboard's five views (PRD 7.1). Live, each tab is a link (`hrefFor`); in the
 * home page demo, a button (`onSelect`).
 */
export function DashboardTabs({
  active,
  hrefFor,
  onSelect,
}: {
  active: Section
  hrefFor?: (section: Section) => string
  onSelect?: (section: Section) => void
}) {
  return (
    <nav
      aria-label="Dashboard sections"
      className="-mx-4 overflow-x-auto border-b px-4 [scrollbar-width:none] sm:mx-0 sm:px-0"
    >
      <ul className="flex min-w-max gap-1">
        {SECTIONS.map((section) => (
          <li key={section.id} className="relative">
            <Tab
              section={section}
              current={section.id === active}
              hrefFor={hrefFor}
              onSelect={onSelect}
            />
            {section.id === active && (
              <motion.span
                layoutId={hrefFor ? "dashboard-tab" : "demo-tab"}
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-foreground"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
