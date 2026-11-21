"use client"

import { usePathname, useRouter } from "next/navigation"
import { createContext, useContext, useState, useTransition } from "react"

import type { FilterChange } from "@/components/dashboard/filters"
import { SiteSwitcher } from "@/components/dashboard/site-switcher"
import { DashboardSkeleton } from "@/components/dashboard/skeleton"
import { type Filters, toQuery } from "@/lib/filters"

type Current = Filters & { site: string }

const Nav = createContext<{
  filters: Current
  pending: boolean
  navigate: (change: FilterChange) => void
} | null>(null)

/** Navigation state for the live dashboard. */
export function useDashboardNav() {
  const nav = useContext(Nav)
  if (!nav)
    throw new Error("useDashboardNav must be used inside DashboardShell")
  return nav
}

/**
 * Wraps the live dashboard (or its install state). Filter changes keep the current
 * view dimmed while loading; switching sites shows the full skeleton instead.
 */
export function DashboardShell({
  filters,
  children,
}: {
  filters: Current
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()
  const [switching, setSwitching] = useState(false)

  function navigate(change: FilterChange) {
    setSwitching(Boolean(change.site && change.site !== filters.site))
    startTransition(() =>
      router.push(`${pathname}${toQuery({ ...filters, ...change })}`, {
        scroll: false,
      })
    )
  }

  return (
    <Nav.Provider value={{ filters, pending, navigate }}>
      {pending && switching ? <DashboardSkeleton /> : children}
    </Nav.Provider>
  )
}

/** Site picker bound to the dashboard URL. */
export function DashboardSiteSwitcher({
  sites,
}: {
  sites: { id: string; domain: string }[]
}) {
  const { filters, navigate } = useDashboardNav()
  if (sites.length < 2) return null
  return <SiteSwitcher value={filters.site} sites={sites} onChange={navigate} />
}
