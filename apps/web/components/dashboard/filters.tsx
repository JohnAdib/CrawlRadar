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

import { BOT_TYPES, type Filters, RANGES } from "@/lib/filters"

const ALL = "all"
export type FilterChange = Partial<Filters>

export function FilterBar({
  filters,
  platforms,
  onChange,
  pending,
}: {
  filters: Filters
  platforms: string[]
  onChange: (change: FilterChange) => void
  pending?: boolean
}) {
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
          range && onChange({ range: range as Filters["range"] })
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
        onValueChange={(v) => onChange({ platform: v === ALL ? undefined : v })}
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
          onChange({ type: v === ALL ? undefined : (v as Filters["type"]) })
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
          onClick={() => onChange({ platform: undefined, type: undefined })}
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
        onChange({ site, platform: undefined, type: undefined })
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
