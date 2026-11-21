import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@crawlradar/ui/components/table"

import { BrandLogo } from "@/components/brand-logo"
import { formatNumber, timeAgo } from "@/lib/format"
import type { PageRow } from "@/lib/stats"

function PageLink({
  row,
  onSelect,
}: {
  row: PageRow
  onSelect?: (page: string) => void
}) {
  const label = row.page_path || "(unknown page)"
  const className =
    "relative block max-w-full truncate text-left font-mono text-xs"
  if (!onSelect || !row.page_path)
    return <span className={className}>{label}</span>
  return (
    <button
      type="button"
      title={row.page_path}
      className={`${className} w-full underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
      onClick={() => onSelect(row.page_path as string)}
    >
      {label}
    </button>
  )
}

/** Every crawled page, ranked by visits (FR-3.3, US-2). */
export function PagesTable({
  rows,
  now,
  onSelect,
}: {
  rows: PageRow[]
  now?: number
  onSelect?: (page: string) => void
}) {
  const max = Math.max(...rows.map((r) => r.visits), 1)
  return (
    <Table className="table-fixed">
      <TableHeader>
        <TableRow>
          <TableHead className="w-10 text-right">#</TableHead>
          <TableHead>Page</TableHead>
          <TableHead className="w-20 text-right">Visits</TableHead>
          <TableHead className="hidden w-24 text-right md:table-cell">
            AI crawls
          </TableHead>
          <TableHead className="hidden w-24 text-right md:table-cell">
            Referrals
          </TableHead>
          <TableHead className="hidden w-24 text-right lg:table-cell">
            Crawlers
          </TableHead>
          <TableHead className="hidden w-36 lg:table-cell">
            Top platform
          </TableHead>
          <TableHead className="hidden w-28 text-right sm:table-cell">
            Last crawled
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, i) => (
          <TableRow key={row.page_path ?? ""}>
            <TableCell className="text-right text-muted-foreground tabular-nums">
              {i + 1}
            </TableCell>
            <TableCell className="relative">
              <span
                className="absolute inset-y-2 left-0 rounded-md bg-chart-1/10"
                style={{ width: `${(row.visits / max) * 100}%` }}
                aria-hidden
              />
              <PageLink row={row} onSelect={onSelect} />
            </TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {formatNumber(row.visits)}
            </TableCell>
            <TableCell className="hidden text-right tabular-nums md:table-cell">
              {formatNumber(row.ai_visits)}
            </TableCell>
            <TableCell className="hidden text-right tabular-nums md:table-cell">
              {formatNumber(row.referrals)}
            </TableCell>
            <TableCell className="hidden text-right tabular-nums lg:table-cell">
              {row.bots}
            </TableCell>
            <TableCell className="hidden lg:table-cell">
              <span className="flex items-center gap-2 truncate">
                <BrandLogo name={row.top_platform} /> {row.top_platform}
              </span>
            </TableCell>
            <TableCell className="hidden text-right text-muted-foreground sm:table-cell">
              {timeAgo(row.last_seen, now)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
