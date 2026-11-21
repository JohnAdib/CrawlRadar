import { BrandLogo } from "@/components/brand-logo"
import { EmptyNote } from "@/components/dashboard/empty-note"
import { ShareBar } from "@/components/dashboard/share-bar"
import { formatNumber } from "@/lib/format"
import { platformColor } from "@/lib/platforms"
import type { Stats } from "@/lib/stats"

/** People sent by AI assistants: share bar plus one tile per assistant. */
export function Referrers({ referrers }: { referrers: Stats["referrers"] }) {
  if (referrers.length === 0) {
    return (
      <EmptyNote>No visitors from AI assistants in this range yet.</EmptyNote>
    )
  }
  const total = referrers.reduce((sum, r) => sum + r.visits, 0)
  return (
    // Grows with the panel: the tiles stretch to keep both dashboard columns level.
    <div className="flex flex-1 flex-col gap-4">
      <ShareBar
        items={referrers.map((r) => ({
          key: r.source,
          label: r.source,
          value: r.visits,
          color: platformColor(r.platform),
        }))}
      />
      <ul className="grid flex-1 auto-rows-fr grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-3">
        {referrers.map((r) => (
          <li
            key={r.source}
            className="flex flex-col justify-between gap-2 rounded-lg border bg-muted/30 p-3 transition-colors hover:bg-muted/70"
          >
            <span className="flex items-center gap-2 font-medium text-sm">
              <BrandLogo name={r.source} /> {r.source}
            </span>
            <span className="flex items-baseline justify-between gap-2">
              <span className="font-semibold text-xl tabular-nums">
                {formatNumber(r.visits)}
              </span>
              <span className="text-muted-foreground text-xs tabular-nums">
                {Math.round((r.visits / total) * 100)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
