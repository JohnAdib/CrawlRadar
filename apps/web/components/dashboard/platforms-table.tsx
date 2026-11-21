import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@crawlradar/ui/components/table"
import { ChevronRight } from "lucide-react"

import { BrandLogo } from "@/components/brand-logo"
import { formatNumber, timeAgo } from "@/lib/format"
import type { PlatformRow } from "@/lib/stats"

function Crawlers({ row }: { row: PlatformRow }) {
  const names = row.bots.map((b) => b.bot_name)
  const shown = names.slice(0, 3).join(", ")
  return (
    <span
      className="truncate text-muted-foreground text-xs"
      title={names.join(", ")}
    >
      {names.length ? shown : "Referrals only"}
      {names.length > 3 && ` +${names.length - 3}`}
    </span>
  )
}

/** Every platform with its visits, share and the crawlers behind them. */
export function PlatformsTable({
  rows,
  now,
  onSelect,
}: {
  rows: PlatformRow[]
  now?: number
  onSelect?: (platform: string) => void
}) {
  const total = rows.reduce((sum, r) => sum + r.visits, 0) || 1
  return (
    <Table className="table-fixed">
      <TableHeader>
        <TableRow>
          <TableHead>Platform</TableHead>
          <TableHead className="w-20 text-right">Visits</TableHead>
          <TableHead className="hidden w-36 sm:table-cell">Share</TableHead>
          <TableHead className="hidden w-24 text-right md:table-cell">
            AI crawls
          </TableHead>
          <TableHead className="hidden w-24 text-right md:table-cell">
            Referrals
          </TableHead>
          <TableHead className="hidden w-28 text-right lg:table-cell">
            Last seen
          </TableHead>
          <TableHead className="w-8" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const share = (row.visits / total) * 100
          return (
            <TableRow key={row.platform} className="relative">
              <TableCell>
                <div className="flex min-w-0 items-center gap-2.5">
                  <BrandLogo name={row.platform} className="size-5" />
                  <div className="flex min-w-0 flex-col">
                    {onSelect ? (
                      // Stretched over the whole row, so the row is one keyboard-reachable target.
                      <button
                        type="button"
                        className="truncate text-left font-medium after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring"
                        onClick={() => onSelect(row.platform)}
                      >
                        {row.platform}
                      </button>
                    ) : (
                      <span className="truncate font-medium">
                        {row.platform}
                      </span>
                    )}
                    <Crawlers row={row} />
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(row.visits)}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-chart-1"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                  <span className="w-9 text-right text-muted-foreground text-xs tabular-nums">
                    {Math.round(share)}%
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden text-right tabular-nums md:table-cell">
                {formatNumber(row.ai_visits)}
              </TableCell>
              <TableCell className="hidden text-right tabular-nums md:table-cell">
                {formatNumber(row.referrals)}
              </TableCell>
              <TableCell className="hidden text-right text-muted-foreground lg:table-cell">
                {timeAgo(row.last_seen, now)}
              </TableCell>
              <TableCell>
                {onSelect && (
                  <ChevronRight className="size-4 text-muted-foreground" />
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
