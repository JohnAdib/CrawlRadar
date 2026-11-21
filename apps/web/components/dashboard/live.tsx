"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"

import {
  DashboardView,
  type DashboardViewProps,
} from "@/components/dashboard/view"
import { ExportMenu } from "@/components/export-menu"
import { toQuery } from "@/lib/filters"

/** The real dashboard: filters live in the URL and the server re-renders with new data. */
export function LiveDashboard(
  props: Omit<DashboardViewProps, "onChange" | "pending" | "actions">
) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <DashboardView
      {...props}
      pending={pending}
      actions={<ExportMenu filters={props.filters} />}
      onChange={(change) =>
        startTransition(() =>
          router.push(`/dashboard${toQuery({ ...props.filters, ...change })}`, {
            scroll: false,
          })
        )
      }
    />
  )
}
