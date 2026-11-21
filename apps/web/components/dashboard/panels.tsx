"use client"

import { Badge } from "@crawlradar/ui/components/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@crawlradar/ui/components/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@crawlradar/ui/components/tooltip"
import { cn } from "@crawlradar/ui/lib/utils"
import { ChevronRight } from "lucide-react"

import { BrandLogo } from "@/components/brand-logo"
import { TYPE_COLORS } from "@/components/dashboard/charts"
import { BOT_TYPES, type BotType } from "@/lib/filters"
import { formatNumber, timeAgo, visits } from "@/lib/format"
import { platformColor } from "@/lib/platforms"
import type { Stats } from "@/lib/stats"

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

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex min-h-24 items-center justify-center text-center text-muted-foreground text-sm">
      {children}
    </p>
  )
}

interface Row {
  key: string
  label: React.ReactNode
  value: number
  title?: string
  mono?: boolean
  onSelect?: () => void
}

/**
 * A ranked list; each row has a proportional bar behind it and highlights on hover.
 * Rows with `onSelect` are buttons that open a report.
 */
function BarList({ rows }: { rows: Row[] }) {
  const max = Math.max(...rows.map((r) => r.value), 1)
  return (
    <ul className="flex flex-col gap-1">
      {rows.map((r) => {
        const content = (
          <>
            <span
              className="absolute inset-y-1 left-0 rounded-md bg-chart-1/15 transition-[width,background-color] duration-500 group-hover:bg-chart-1/25"
              style={{ width: `${Math.max((r.value / max) * 100, 2)}%` }}
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
            <span className="relative ml-auto flex shrink-0 items-center gap-1 tabular-nums">
              {formatNumber(r.value)}
              {r.onSelect && (
                <ChevronRight className="-mr-1 size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              )}
            </span>
          </>
        )
        const className =
          "group relative flex h-8 w-full items-center gap-3 rounded-md px-2.5 text-left text-sm transition-colors hover:bg-muted/70"
        return (
          <li key={r.key} title={r.title}>
            {r.onSelect ? (
              <button
                type="button"
                className={cn(
                  className,
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
                onClick={r.onSelect}
              >
                {content}
              </button>
            ) : (
              <div className={className}>{content}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export function Platforms({
  platforms,
  onSelect,
}: {
  platforms: Stats["by_platform"]
  onSelect?: (platform: string) => void
}) {
  if (platforms.length === 0) return <Empty>No platforms in this range.</Empty>
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

/** Share of visits per bot type: what the platforms above came to do. */
export function TypeBreakdown({ timeline }: { timeline: Stats["timeline"] }) {
  const types = (Object.keys(BOT_TYPES) as BotType[])
    .map((type) => ({
      type,
      visits: timeline.reduce((sum, p) => sum + p[type], 0),
    }))
    .filter((t) => t.visits > 0)
  const total = types.reduce((sum, t) => sum + t.visits, 0)
  if (total === 0) return null
  const share = (v: number) => Math.round((v / total) * 100)
  return (
    <div className="flex flex-col gap-2.5 border-t pt-4">
      <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
        By type of visit
      </p>
      <div
        className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full"
        role="img"
        aria-label={types
          .map((t) => `${BOT_TYPES[t.type]} ${share(t.visits)}%`)
          .join(", ")}
      >
        {types.map((t) => (
          <span
            key={t.type}
            className="h-full transition-[width] duration-700"
            style={{
              width: `${(t.visits / total) * 100}%`,
              backgroundColor: TYPE_COLORS[t.type],
            }}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {types.map((t) => (
          <li key={t.type} className="flex items-center gap-1.5">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: TYPE_COLORS[t.type] }}
            />
            {BOT_TYPES[t.type]}
            <span className="text-muted-foreground tabular-nums">
              {share(t.visits)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function TopPages({
  pages,
  onSelect,
}: {
  pages: Stats["top_pages"]
  onSelect?: (page: string) => void
}) {
  if (pages.length === 0) return <Empty>No pages in this range.</Empty>
  return (
    <BarList
      rows={pages.map((p) => ({
        key: p.page_path ?? "",
        label: p.page_path || "(unknown page)",
        title: p.page_path ?? undefined,
        value: p.visits,
        mono: true,
        onSelect:
          onSelect && p.page_path
            ? () => onSelect(p.page_path as string)
            : undefined,
      }))}
    />
  )
}

export function Referrers({ referrers }: { referrers: Stats["referrers"] }) {
  if (referrers.length === 0) {
    return <Empty>No visitors from AI assistants in this range yet.</Empty>
  }
  const total = referrers.reduce((sum, r) => sum + r.visits, 0)
  const share = (visits: number) => Math.round((visits / total) * 100)
  return (
    // Grows with the panel: the tiles stretch to keep both dashboard columns level.
    <div className="flex flex-1 flex-col gap-4">
      {/* Share of AI referrals per assistant, in each brand's colour. */}
      <div
        className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full"
        role="img"
        aria-label={referrers
          .map((r) => `${r.source} ${share(r.visits)}%`)
          .join(", ")}
      >
        {referrers.map((r) => (
          <span
            key={r.source}
            className="h-full transition-[width] duration-700"
            style={{
              width: `${(r.visits / total) * 100}%`,
              backgroundColor: platformColor(r.platform),
            }}
          />
        ))}
      </div>
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
                {share(r.visits)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const HOURS = Array.from({ length: 24 }, (_, hour) => hour)

/** When crawlers visit: weekday x hour (UTC), darker = more visits. */
export function Heatmap({ cells }: { cells: Stats["heatmap"] }) {
  if (cells.length === 0) return <Empty>No crawler visits in this range.</Empty>
  const grid = new Map(cells.map((c) => [`${c.dow}:${c.hour}`, c.visits]))
  const max = Math.max(...cells.map((c) => c.visits), 1)
  return (
    <div className="overflow-x-auto">
      <div className="grid w-full min-w-[440px] grid-cols-[2.25rem_repeat(24,minmax(0,1fr))] gap-[3px] text-[10px] text-muted-foreground">
        {DAYS.map((day, d) => (
          <div key={day} className="contents">
            <span className="flex items-center">{day}</span>
            {HOURS.map((hour) => {
              const value = grid.get(`${d + 1}:${hour}`) ?? 0
              return (
                <Tooltip key={hour} delayDuration={0} disableHoverableContent>
                  <TooltipTrigger asChild>
                    <span
                      className="h-3.5 rounded-[3px] bg-muted transition-transform duration-150 hover:scale-110 hover:ring-2 hover:ring-chart-1/50"
                      style={
                        value
                          ? {
                              backgroundColor: "var(--chart-1)",
                              opacity: 0.15 + 0.85 * (value / max),
                            }
                          : undefined
                      }
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <span className="font-medium">
                      {day} {String(hour).padStart(2, "0")}:00 UTC
                    </span>
                    <span className="ml-2 tabular-nums opacity-80">
                      {visits(value)}
                    </span>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        ))}
        <span />
        {HOURS.map((hour) => (
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
  onSelectPlatform,
}: {
  bots: Stats["by_bot"]
  now?: number
  onSelectPlatform?: (platform: string) => void
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
              <div className="flex min-w-0 items-center gap-2.5">
                <BrandLogo name={b.platform} />
                <div className="min-w-0">
                  <div className="truncate font-medium">{b.bot_name}</div>
                  <div className="truncate text-muted-foreground text-xs">
                    {onSelectPlatform ? (
                      <button
                        type="button"
                        className="underline-offset-2 hover:text-foreground hover:underline"
                        onClick={() => onSelectPlatform(b.platform)}
                      >
                        {b.platform}
                      </button>
                    ) : (
                      b.platform
                    )}
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
  onSelectPage,
}: {
  events: ActivityItem[]
  now?: number
  onSelectPage?: (page: string) => void
}) {
  if (events.length === 0) return <Empty>No recent visits.</Empty>
  return (
    <ul className="flex flex-col">
      {events.map((e) => (
        <li
          key={e.id}
          className="flex items-center gap-3 rounded-md border-b px-2 py-2.5 text-sm transition-colors last:border-b-0 hover:bg-muted/70"
        >
          <BrandLogo name={e.platform} className="size-5" />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <span className="truncate font-medium">{e.bot_name}</span>
              <TypeBadge type={e.bot_type as BotType} />
            </div>
            {e.page_path && onSelectPage ? (
              <button
                type="button"
                className="block max-w-full truncate font-mono text-muted-foreground text-xs underline-offset-2 hover:text-foreground hover:underline"
                onClick={() => onSelectPage(e.page_path as string)}
              >
                {e.page_path}
              </button>
            ) : (
              <div className="truncate font-mono text-muted-foreground text-xs">
                {e.page_path}
              </div>
            )}
          </div>
          <time
            className="shrink-0 text-muted-foreground text-xs"
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
