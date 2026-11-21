import { cn } from "@crawlradar/ui/lib/utils"
import { ChevronRight } from "lucide-react"

import { formatNumber } from "@/lib/format"

export interface BarRow {
  key: string
  label: React.ReactNode
  value: number
  title?: string
  mono?: boolean
  onSelect?: () => void
}

const ROW =
  "group relative flex h-8 w-full items-center gap-3 rounded-md px-2.5 text-left text-sm transition-colors hover:bg-muted/70"

function BarContent({ row, max }: { row: BarRow; max: number }) {
  return (
    <>
      <span
        className="absolute inset-y-1 left-0 rounded-md bg-chart-1/15 transition-[width,background-color] duration-500 group-hover:bg-chart-1/25"
        style={{ width: `${Math.max((row.value / max) * 100, 2)}%` }}
        aria-hidden
      />
      <span
        className={cn(
          "relative min-w-0 truncate",
          row.mono && "font-mono text-xs"
        )}
      >
        {row.label}
      </span>
      <span className="relative ml-auto flex shrink-0 items-center gap-1 tabular-nums">
        {formatNumber(row.value)}
        {row.onSelect && (
          <ChevronRight className="-mr-1 size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </span>
    </>
  )
}

/**
 * A ranked list; each row has a proportional bar behind it and highlights on hover.
 * Rows with `onSelect` are buttons that open a report.
 */
export function BarList({ rows }: { rows: BarRow[] }) {
  const max = Math.max(...rows.map((r) => r.value), 1)
  return (
    <ul className="flex flex-col gap-1">
      {rows.map((row) => (
        <li key={row.key} title={row.title}>
          {row.onSelect ? (
            <button
              type="button"
              className={cn(
                ROW,
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
              onClick={row.onSelect}
            >
              <BarContent row={row} max={max} />
            </button>
          ) : (
            <div className={ROW}>
              <BarContent row={row} max={max} />
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
