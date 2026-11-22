"use client"

import { ActivityLog } from "@/components/dashboard/activity-log"
import type { LogEvent } from "@/components/dashboard/activity-table"
import { Panel } from "@/components/dashboard/panel"
import type { Cursor } from "@/lib/events"
import { LOG_PAGE_SIZE } from "@/lib/events"
import { visits } from "@/lib/format"

/** A page report's own log: every visit to this one page, who made it and when. */
export function PageVisits({
  page,
  events,
  total,
  loadMore,
  now,
  endNote,
}: {
  page: string
  events: LogEvent[]
  total: number
  loadMore: (cursor: Cursor) => Promise<LogEvent[]>
  now?: number
  endNote?: string
}) {
  return (
    <Panel
      index={5}
      title={`Every visit to ${page}`}
      description={`Who read this page and when, newest first · ${visits(total)}`}
    >
      <ActivityLog
        // A new page or filter starts a new list.
        key={`${page}:${total}:${events[0]?.id ?? ""}`}
        initial={events}
        total={total}
        pageSize={LOG_PAGE_SIZE}
        loadMore={loadMore}
        now={now}
        showPage={false}
        endNote={endNote}
      />
    </Panel>
  )
}
