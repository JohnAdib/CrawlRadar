"use client"

import { Button } from "@crawlradar/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@crawlradar/ui/components/select"
import { Spinner } from "@crawlradar/ui/components/spinner"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@crawlradar/ui/components/toggle-group"
import { X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

import { BOT_TYPES, type Filters, RANGES, toQuery } from "@/lib/filters"

const ALL = "all"
type Current = Filters & { site: string }

function useFilterNavigation(filters: Current) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const update = (change: Partial<Filters>) =>
    startTransition(() =>
      router.push(`/dashboard${toQuery({ ...filters, ...change })}`, {
        scroll: false,
      })
    )
  return { pending, update }
}

export function DashboardFilters({
  filters,
  platforms,
}: {
  filters: Current
  platforms: string[]
}) {
  const { pending, update } = useFilterNavigation(filters)
  const filtered = Boolean(filters.platform || filters.type)

  return (
    <div
      className="grid grid-cols-2 items-center gap-2 sm:flex sm:flex-wrap"
      data-pending={pending}
    >
      <ToggleGroup
        type="single"
        variant="outline"
        value={filters.range}
        onValueChange={(range) =>
          range && update({ range: range as Filters["range"] })
        }
        aria-label="Date range"
        className="col-span-2 w-full bg-background sm:w-auto"
      >
        {Object.entries(RANGES).map(([value, { label }]) => (
          <ToggleGroupItem
            key={value}
            value={value}
            className="flex-1 px-4"
            aria-label={`Last ${label}`}
          >
            {value}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <Select
        value={filters.platform ?? ALL}
        onValueChange={(v) => update({ platform: v === ALL ? undefined : v })}
      >
        <SelectTrigger
          aria-label="Platform"
          className="w-full bg-background sm:w-44"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All platforms</SelectItem>
          {platforms.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.type ?? ALL}
        onValueChange={(v) =>
          update({ type: v === ALL ? undefined : (v as Filters["type"]) })
        }
      >
        <SelectTrigger
          aria-label="Bot type"
          className="w-full bg-background sm:w-44"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All bot types</SelectItem>
          {Object.entries(BOT_TYPES).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {filtered && (
        <Button
          variant="ghost"
          size="sm"
          className="col-span-2 justify-self-start sm:col-span-1"
          onClick={() => update({ platform: undefined, type: undefined })}
        >
          <X /> Clear filters
        </Button>
      )}
      {pending && (
        <Spinner className="text-muted-foreground" aria-label="Updating" />
      )}
    </div>
  )
}

export function SiteSwitcher({
  filters,
  sites,
}: {
  filters: Current
  sites: { id: string; domain: string }[]
}) {
  const { update } = useFilterNavigation(filters)
  return (
    <Select
      value={filters.site}
      onValueChange={(site) =>
        update({ site, platform: undefined, type: undefined })
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
