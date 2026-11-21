import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@crawlradar/ui/components/table"

import { BrandLogo } from "@/components/brand-logo"
import { TypeBadge } from "@/components/dashboard/type-badge"
import { BOT_TYPES } from "@/lib/filters"
import { formatNumber, timeAgo } from "@/lib/format"
import type { BotRow } from "@/lib/stats"

function PlatformLink({
  platform,
  onSelect,
}: {
  platform: string
  onSelect?: (platform: string) => void
}) {
  if (!onSelect) return <>{platform}</>
  return (
    <button
      type="button"
      className="underline-offset-2 hover:text-foreground hover:underline"
      onClick={() => onSelect(platform)}
    >
      {platform}
    </button>
  )
}

/** Every bot seen in range with its type, visits and last visit. */
export function CrawlersTable({
  bots,
  now,
  onSelectPlatform,
}: {
  bots: BotRow[]
  now?: number
  onSelectPlatform?: (platform: string) => void
}) {
  return (
    <Table className="table-fixed">
      <TableHeader>
        <TableRow>
          <TableHead>Crawler</TableHead>
          <TableHead className="hidden w-32 sm:table-cell">Type</TableHead>
          <TableHead className="w-16 text-right">Visits</TableHead>
          <TableHead className="hidden w-28 text-right md:table-cell">
            Last seen
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bots.map((b) => (
          <TableRow key={b.bot_name + b.platform + b.bot_type}>
            <TableCell className="truncate">
              <div className="flex min-w-0 items-center gap-2.5">
                <BrandLogo name={b.platform} />
                <div className="min-w-0">
                  <div className="truncate font-medium">{b.bot_name}</div>
                  <div className="truncate text-muted-foreground text-xs">
                    <PlatformLink
                      platform={b.platform}
                      onSelect={onSelectPlatform}
                    />
                    <span className="sm:hidden">
                      {" "}
                      · {BOT_TYPES[b.bot_type]}
                    </span>
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <TypeBadge type={b.bot_type} />
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatNumber(b.visits)}
            </TableCell>
            <TableCell className="hidden text-right text-muted-foreground md:table-cell">
              {timeAgo(b.last_seen, now)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
