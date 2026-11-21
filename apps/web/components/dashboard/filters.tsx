"use client"

import { Button } from "@crawlradar/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@crawlradar/ui/components/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@crawlradar/ui/components/toggle-group"
import { X } from "lucide-react"

import { BrandLogo } from "@/components/brand-logo"
import { BOT_TYPES, type BotType, type Filters, RANGES } from "@/lib/filters"

const ALL = "all"
export type FilterChange = Partial<Filters>
type OnChange = (change: FilterChange) => void

const typeOf = (v: string) => (v === ALL ? undefined : (v as BotType))
const shortLabel = (label: string) =>
  label.replace(/^AI /, "").replace(/^./, (c) => c.toUpperCase())

function RangeToggle({
  value,
  onChange,
}: {
  value: Filters["range"]
  onChange: OnChange
}) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      value={value}
      onValueChange={(range) =>
        range && onChange({ range: range as Filters["range"] })
      }
      aria-label="Date range"
      className="col-span-2 w-full bg-background sm:w-auto"
    >
      {Object.entries(RANGES).map(([key, { label }]) => (
        <ToggleGroupItem
          key={key}
          value={key}
          className="flex-1 px-4"
          aria-label={`Last ${label}`}
        >
          {key}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

function PlatformSelect({
  value,
  platforms,
  onChange,
}: {
  value?: string
  platforms: string[]
  onChange: OnChange
}) {
  return (
    <Select
      value={value ?? ALL}
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
            <BrandLogo name={p} /> {p}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** A select on small screens; on wide screens every type is one click away. */
function TypeFilter({
  value,
  onChange,
}: {
  value?: BotType
  onChange: OnChange
}) {
  return (
    <>
      <Select
        value={value ?? ALL}
        onValueChange={(v) => onChange({ type: typeOf(v) })}
      >
        <SelectTrigger
          aria-label="Bot type"
          className="w-full bg-background sm:w-44 xl:hidden"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All bot types</SelectItem>
          {Object.entries(BOT_TYPES).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ToggleGroup
        type="single"
        variant="outline"
        value={value ?? ALL}
        onValueChange={(v) => v && onChange({ type: typeOf(v) })}
        aria-label="Bot type"
        className="hidden bg-background xl:flex"
      >
        <ToggleGroupItem value={ALL} className="px-3">
          All types
        </ToggleGroupItem>
        {Object.entries(BOT_TYPES).map(([key, label]) => (
          <ToggleGroupItem key={key} value={key} className="px-3">
            {shortLabel(label)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </>
  )
}

/** Date range, platform and bot type filters. They live in the URL. */
export function FilterBar({
  filters,
  platforms,
  onChange,
  pending,
  hidePlatform,
}: {
  filters: Filters
  platforms: string[]
  onChange: OnChange
  pending?: boolean
  hidePlatform?: boolean
}) {
  const filtered = Boolean(filters.platform || filters.type || filters.page)
  return (
    <div
      className="grid grid-cols-2 items-center gap-2 sm:flex sm:flex-wrap"
      data-pending={pending}
    >
      <RangeToggle value={filters.range} onChange={onChange} />
      {!hidePlatform && (
        <PlatformSelect
          value={filters.platform}
          platforms={platforms}
          onChange={onChange}
        />
      )}
      <TypeFilter value={filters.type} onChange={onChange} />
      {filtered && (
        <Button
          variant="ghost"
          size="sm"
          className="col-span-2 justify-self-start sm:col-span-1"
          onClick={() =>
            onChange({ platform: undefined, type: undefined, page: undefined })
          }
        >
          <X /> Clear filters
        </Button>
      )}
    </div>
  )
}
