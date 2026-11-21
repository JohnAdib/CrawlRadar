import { BrandLogo } from "@/components/brand-logo"
import { BarList } from "@/components/dashboard/bar-list"
import { EmptyNote } from "@/components/dashboard/empty-note"
import { ShareBar } from "@/components/dashboard/share-bar"
import { BOT_TYPES, type BotType, TYPE_COLORS } from "@/lib/filters"
import type { Stats } from "@/lib/stats"

export function Platforms({
  platforms,
  onSelect,
}: {
  platforms: Stats["by_platform"]
  onSelect?: (platform: string) => void
}) {
  if (platforms.length === 0) {
    return <EmptyNote>No platforms in this range.</EmptyNote>
  }
  return (
    <BarList
      rows={platforms.map((p) => ({
        key: p.platform,
        label: (
          <span className="flex items-center gap-2">
            <BrandLogo name={p.platform} /> {p.platform}
          </span>
        ),
        value: p.visits,
        onSelect: onSelect && (() => onSelect(p.platform)),
      }))}
    />
  )
}

/** Share of visits per bot type: what the platforms came to do. */
export function TypeBreakdown({ timeline }: { timeline: Stats["timeline"] }) {
  const types = (Object.keys(BOT_TYPES) as BotType[])
    .map((type) => ({
      type,
      visits: timeline.reduce((sum, p) => sum + p[type], 0),
    }))
    .filter((t) => t.visits > 0)
  const total = types.reduce((sum, t) => sum + t.visits, 0)
  if (total === 0) return null
  return (
    <div className="flex flex-col gap-2.5 border-t pt-4">
      <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
        By type of visit
      </p>
      <ShareBar
        items={types.map((t) => ({
          key: t.type,
          label: BOT_TYPES[t.type],
          value: t.visits,
          color: TYPE_COLORS[t.type],
        }))}
      />
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {types.map((t) => (
          <li key={t.type} className="flex items-center gap-1.5">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: TYPE_COLORS[t.type] }}
            />
            {BOT_TYPES[t.type]}
            <span className="text-muted-foreground tabular-nums">
              {Math.round((t.visits / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
