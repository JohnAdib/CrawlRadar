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
import { Download } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

import { BOT_TYPES, type Filters, RANGES, toQuery } from "@/lib/filters"

const ALL = "all"

export function DashboardFilters({
  filters,
  sites,
  platforms,
}: {
  filters: Filters & { site: string }
  sites: { id: string; domain: string }[]
  platforms: string[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function update(change: Partial<Filters>) {
    startTransition(() => router.push(`/${toQuery({ ...filters, ...change })}`))
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2 data-[pending=true]:opacity-60"
      data-pending={pending}
    >
      {sites.length > 1 && (
        <Select value={filters.site} onValueChange={(site) => update({ site })}>
          <SelectTrigger aria-label="Site" className="w-48 bg-background">
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
      )}

      <ToggleGroup
        type="single"
        variant="outline"
        value={filters.range}
        onValueChange={(range) =>
          range && update({ range: range as Filters["range"] })
        }
        aria-label="Date range"
        className="bg-background"
      >
        {Object.keys(RANGES).map((r) => (
          <ToggleGroupItem key={r} value={r} className="px-3">
            {r}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <Select
        value={filters.platform ?? ALL}
        onValueChange={(v) => update({ platform: v === ALL ? undefined : v })}
      >
        <SelectTrigger aria-label="Platform" className="w-40 bg-background">
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
        <SelectTrigger aria-label="Bot type" className="w-40 bg-background">
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

      <Button variant="outline" className="ml-auto bg-background" asChild>
        <a href={`/export${toQuery(filters)}`} download>
          <Download /> Export CSV
        </a>
      </Button>
    </div>
  )
}
