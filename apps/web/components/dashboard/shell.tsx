"use client"

import { usePathname, useRouter } from "next/navigation"
import { createContext, useContext, useTransition } from "react"

import type { FilterChange } from "@/components/dashboard/filters"
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

/** Filter state for one live view. Changes keep the current view dimmed while loading. */
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

  function navigate(change: FilterChange) {
    startTransition(() =>
      router.push(`${pathname}${toQuery({ ...filters, ...change })}`, {
        scroll: false,
      })
    )
  }

  return (
    <Nav.Provider value={{ filters, pending, navigate }}>
      {children}
    </Nav.Provider>
  )
}
