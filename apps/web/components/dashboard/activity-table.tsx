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
import type { BotType } from "@/lib/filters"
import { hostname, timeAgo } from "@/lib/format"

export interface LogEvent {
  id: string
  timestamp: string
  bot_name: string
  platform: string
  bot_type: string
  page_path: string | null
  user_agent: string
  referrer: string | null
}

function When({ iso, now }: { iso: string; now?: number }) {
  const date = new Date(iso)
  return (
    <time dateTime={iso} title={date.toUTCString()} className="flex flex-col">
      <span>{timeAgo(iso, now)}</span>
      <span className="text-muted-foreground text-xs tabular-nums">
        {date.toISOString().slice(0, 16).replace("T", " ")} UTC
      </span>
    </time>
  )
}

/** The crawler activity log (FR-3.6): one row per recorded visit. */
export function ActivityTable({
  events,
  now,
  onSelectPage,
}: {
  events: LogEvent[]
  now?: number
  onSelectPage?: (page: string) => void
}) {
  return (
    <Table className="table-fixed">
      <TableHeader>
        <TableRow>
          <TableHead className="w-36">When</TableHead>
          <TableHead>Visitor</TableHead>
          <TableHead className="hidden w-32 md:table-cell">Type</TableHead>
          <TableHead className="hidden sm:table-cell">Page</TableHead>
          <TableHead className="hidden w-[28%] xl:table-cell">
            User agent
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((e) => (
          <TableRow key={e.id}>
            <TableCell>
              <When iso={e.timestamp} now={now} />
            </TableCell>
            <TableCell>
              <div className="flex min-w-0 items-center gap-2.5">
                <BrandLogo name={e.platform} className="size-5" />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{e.bot_name}</span>
                  <span className="truncate text-muted-foreground text-xs">
                    {e.platform}
                    {e.referrer && ` · from ${hostname(e.referrer)}`}
                  </span>
                </div>
              </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <TypeBadge type={e.bot_type as BotType} />
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              {e.page_path && onSelectPage ? (
                <button
                  type="button"
                  className="max-w-full truncate font-mono text-xs underline-offset-2 hover:underline"
                  onClick={() => onSelectPage(e.page_path as string)}
                >
                  {e.page_path}
                </button>
              ) : (
                <span className="truncate font-mono text-xs">
                  {e.page_path}
                </span>
              )}
            </TableCell>
            <TableCell className="hidden xl:table-cell">
              <code
                className="block truncate text-muted-foreground text-xs"
                title={e.user_agent}
              >
                {e.user_agent}
              </code>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
