"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@crawlradar/ui/components/select"

import type { FilterChange } from "@/components/dashboard/filters"

/** Picks the site; switching clears filters that belong to the previous site. */
export function SiteSwitcher({
  value,
  sites,
  onChange,
}: {
  value: string
  sites: { id: string; domain: string }[]
  onChange: (change: FilterChange) => void
}) {
  return (
    <Select
      value={value}
      onValueChange={(site) =>
        onChange({
          site,
          platform: undefined,
          type: undefined,
          page: undefined,
        })
      }
    >
      <SelectTrigger aria-label="Site" className="w-full bg-background sm:w-52">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {sites.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            {s.domain}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
