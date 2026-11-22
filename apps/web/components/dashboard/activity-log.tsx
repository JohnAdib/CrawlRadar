"use client"

import { Spinner } from "@crawlradar/ui/components/spinner"
import { useCallback, useEffect, useRef, useState } from "react"

import {
  ActivityTable,
  type LogEvent,
} from "@/components/dashboard/activity-table"
import { type Cursor, cursorOf, hasMore } from "@/lib/events"
import { formatNumber, visits } from "@/lib/format"

/**
 * The activity log as one long list: the next batch loads before you reach the end, so
 * scrolling never stops. `loadMore` returns the batch after a cursor.
 */
export function ActivityLog({
  initial,
  total,
  pageSize,
  loadMore,
  now,
  onSelectPage,
  showPage,
  endNote,
}: {
  initial: LogEvent[]
  total: number
  pageSize: number
  loadMore: (cursor: Cursor) => Promise<LogEvent[]>
  now?: number
  onSelectPage?: (page: string) => void
  /** False in a page report, where every row is the same page. */
  showPage?: boolean
  /** Shown at the end instead of "That's all N visits" (the demo stops early). */
  endNote?: string
}) {
  const [events, setEvents] = useState(initial)
  const [more, setMore] = useState(hasMore(initial.length, pageSize))
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const sentinel = useRef<HTMLDivElement>(null)

  const next = useCallback(async () => {
    const last = events.at(-1)
    if (loading || !more || !last) return
    setLoading(true)
    try {
      const batch = await loadMore(cursorOf(last))
      setEvents((current) => [...current, ...batch])
      setMore(hasMore(batch.length, pageSize))
    } catch {
      // Stop instead of retrying in a loop while the end of the list is in view.
      setMore(false)
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }, [events, loading, more, loadMore, pageSize])

  // Start loading well before the end of the list comes into view.
  useEffect(() => {
    const node = sentinel.current
    if (!node || !more) return
    const observer = new IntersectionObserver(
      (entries) => entries.some((e) => e.isIntersecting) && next(),
      { rootMargin: "0px 0px 1200px 0px" }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [next, more])

  return (
    <div className="flex flex-col">
      <ActivityTable
        events={events}
        now={now}
        onSelectPage={onSelectPage}
        showPage={showPage}
      />
      <div
        ref={sentinel}
        className="flex h-14 items-center justify-center gap-2 text-muted-foreground text-sm"
        aria-live="polite"
      >
        {more ? (
          <>
            <Spinner /> Loading more visits
          </>
        ) : failed ? (
          "Couldn't load more visits. Reload the page to try again."
        ) : (
          (endNote ?? `That's all ${visits(total)}`)
        )}
      </div>
      <span className="sr-only">
        Showing {formatNumber(events.length)} of {formatNumber(total)}
      </span>
    </div>
  )
}
