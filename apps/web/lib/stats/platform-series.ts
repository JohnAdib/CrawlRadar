import type { PlatformPoint, TimelinePoint } from "./types"

export interface Series {
  /** CSS-safe key (platform names have spaces), used for chart colours. */
  key: string
  label: string
}

export type SeriesRow = { bucket: string } & Record<string, number | string>

/**
 * Pivots per-platform points into one row per bucket for a stacked chart: the `top`
 * busiest platforms get their own series, the rest are summed into "Other".
 */
export function platformSeries(
  timeline: TimelinePoint[],
  points: PlatformPoint[],
  top = 5
): { series: Series[]; rows: SeriesRow[] } {
  const totals = new Map<string, number>()
  for (const p of points) {
    totals.set(p.platform, (totals.get(p.platform) ?? 0) + p.visits)
  }
  const ranked = [...totals]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([platform]) => platform)
  const named = ranked.slice(0, top)
  const series: Series[] = named.map((label, i) => ({ key: `p${i}`, label }))
  if (ranked.length > top) series.push({ key: "other", label: "Other" })

  const keyOf = new Map(series.map((s) => [s.label, s.key]))
  const rows = new Map<string, SeriesRow>(
    timeline.map((t) => [
      t.bucket,
      {
        bucket: t.bucket,
        ...Object.fromEntries(series.map((s) => [s.key, 0])),
      },
    ])
  )
  for (const p of points) {
    const row = rows.get(p.bucket)
    if (!row) continue
    const key = keyOf.get(p.platform) ?? "other"
    row[key] = (row[key] as number) + p.visits
  }
  return { series, rows: [...rows.values()] }
}
