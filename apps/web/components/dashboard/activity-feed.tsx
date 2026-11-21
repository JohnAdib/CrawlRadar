import { BrandLogo } from "@/components/brand-logo"
import { EmptyNote } from "@/components/dashboard/empty-note"
import { TypeBadge } from "@/components/dashboard/type-badge"
import type { BotType } from "@/lib/filters"
import { timeAgo } from "@/lib/format"

export interface ActivityItem {
  id: string
  timestamp: string
  bot_name: string
  platform: string
  bot_type: string
  page_path: string | null
}

function PagePath({
  path,
  onSelect,
}: {
  path: string | null
  onSelect?: (page: string) => void
}) {
  if (path && onSelect) {
    return (
      <button
        type="button"
        className="block max-w-full truncate font-mono text-muted-foreground text-xs underline-offset-2 hover:text-foreground hover:underline"
        onClick={() => onSelect(path)}
      >
        {path}
      </button>
    )
  }
  return (
    <div className="truncate font-mono text-muted-foreground text-xs">
      {path}
    </div>
  )
}

/** The latest visits, newest first. */
export function ActivityFeed({
  events,
  now,
  onSelectPage,
}: {
  events: ActivityItem[]
  now?: number
  onSelectPage?: (page: string) => void
}) {
  if (events.length === 0) return <EmptyNote>No recent visits.</EmptyNote>
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
            <PagePath path={e.page_path} onSelect={onSelectPage} />
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
