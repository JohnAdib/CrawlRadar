import { Badge } from "@crawlradar/ui/components/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@crawlradar/ui/components/table"
import { cn } from "@crawlradar/ui/lib/utils"

import { BOT_TYPES, type BotType } from "@/lib/filters"
import { formatNumber, timeAgo } from "@/lib/format"
import { platformColor } from "@/lib/platforms"
import type { Stats } from "@/lib/stats"

export function PlatformDot({
  platform,
  className,
}: {
  platform: string
  className?: string
}) {
  return (
    <span
      className={cn("inline-block size-2 shrink-0 rounded-full", className)}
      style={{ backgroundColor: platformColor(platform) }}
      aria-hidden
    />
  )
}

export function TypeBadge({ type }: { type: BotType }) {
  return (
    <Badge
      className="shrink-0"
      variant={
        type === "referral"
          ? "default"
          : type === "unknown"
            ? "outline"
            : "secondary"
      }
    >
      {BOT_TYPES[type] ?? type}
    </Badge>
  )
}

/** A ranked list where each row carries a proportional bar behind it. */
function BarList({
  rows,
}: {
  rows: {
    key: string
    label: React.ReactNode
    value: number
    color?: string
    mono?: boolean
  }[]
}) {
  const max = Math.max(...rows.map((r) => r.value), 1)
  return (
    <ul className="flex flex-col gap-1.5">
      {rows.map((r) => (
        <li
          key={r.key}
          className="relative flex h-8 items-center justify-between gap-3 px-2.5 text-sm"
        >
          <span
            className="absolute inset-y-0 left-0 rounded-md"
            style={{
              width: `${Math.max((r.value / max) * 100, 2)}%`,
              backgroundColor: r.color ?? "var(--chart-1)",
              opacity: 0.14,
            }}
            aria-hidden
          />
          <span
            className={cn(
              "relative min-w-0 truncate",
              r.mono && "font-mono text-xs"
            )}
          >
            {r.label}
          </span>
          <span className="relative shrink-0 tabular-nums">
            {formatNumber(r.value)}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function TopPages({ pages }: { pages: Stats["top_pages"] }) {
  return (
    <BarList
      rows={pages.map((p) => ({
        key: p.page_path ?? "",
        label: (
          <span title={p.page_path ?? ""}>
            {p.page_path || "(unknown page)"}
          </span>
        ),
        value: p.visits,
        mono: true,
      }))}
    />
  )
}

export function Referrers({ referrers }: { referrers: Stats["referrers"] }) {
  if (referrers.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No visitors from AI assistants in this range yet.
      </p>
    )
  }
  return (
    <BarList
      rows={referrers.map((r) => ({
        key: r.source,
        label: (
          <span className="flex items-center gap-2">
            <PlatformDot platform={r.platform} /> {r.source}
          </span>
        ),
        value: r.visits,
        color: platformColor(r.platform),
      }))}
    />
  )
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

/** When crawlers visit: weekday x hour (UTC), darker = more visits. */
export function Heatmap({ cells }: { cells: Stats["heatmap"] }) {
  const grid = new Map(cells.map((c) => [`${c.dow}:${c.hour}`, c.visits]))
  const max = Math.max(...cells.map((c) => c.visits), 1)
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[480px] grid-cols-[2.25rem_repeat(24,minmax(0,1fr))] gap-[3px] text-[10px] text-muted-foreground">
        {DAYS.map((day, d) => (
          <div key={day} className="contents">
            <span className="flex items-center">{day}</span>
            {Array.from({ length: 24 }, (_, hour) => {
              const value = grid.get(`${d + 1}:${hour}`) ?? 0
              return (
                <span
                  key={hour}
                  className="aspect-square rounded-[3px] bg-muted"
                  title={`${day} ${String(hour).padStart(2, "0")}:00 UTC · ${formatNumber(value)} visits`}
                  style={
                    value
                      ? {
                          backgroundColor: "var(--chart-1)",
                          opacity: 0.15 + 0.85 * (value / max),
                        }
                      : undefined
                  }
                />
              )
            })}
          </div>
        ))}
        <span />
        {Array.from({ length: 24 }, (_, hour) => (
          <span key={hour} className="text-center">
            {hour % 6 === 0 ? hour : ""}
          </span>
        ))}
      </div>
    </div>
  )
}

export function CrawlersTable({
  bots,
  now,
}: {
  bots: Stats["by_bot"]
  now?: number
}) {
  return (
    <Table className="table-fixed">
      <TableHeader>
        <TableRow>
          <TableHead>Crawler</TableHead>
          <TableHead className="hidden w-28 sm:table-cell">Type</TableHead>
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
              <div className="flex min-w-0 items-center gap-2">
                <PlatformDot platform={b.platform} />
                <span className="truncate font-medium">{b.bot_name}</span>
              </div>
              <div className="truncate pl-4 text-xs text-muted-foreground">
                {b.platform}
                <span className="sm:hidden"> · {BOT_TYPES[b.bot_type]}</span>
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

export interface ActivityItem {
  id: string
  timestamp: string
  bot_name: string
  platform: string
  bot_type: string
  page_path: string | null
}

export function ActivityFeed({
  events,
  now,
}: {
  events: ActivityItem[]
  now?: number
}) {
  return (
    <ul className="flex flex-col divide-y">
      {events.map((e) => (
        <li key={e.id} className="flex items-center gap-3 py-2.5 text-sm">
          <PlatformDot platform={e.platform} className="size-2.5" />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <span className="truncate font-medium">{e.bot_name}</span>
              <TypeBadge type={e.bot_type as BotType} />
            </div>
            <div className="truncate font-mono text-xs text-muted-foreground">
              {e.page_path}
            </div>
          </div>
          <time
            className="shrink-0 text-xs text-muted-foreground"
            dateTime={e.timestamp}
            title={new Date(e.timestamp).toUTCString()}
          >
            {timeAgo(e.timestamp, now)}
          </time>
        </li>
      ))}
    </ul>
  )
}
