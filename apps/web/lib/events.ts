// Keyset paging for the activity log: "the next visits after this one", newest first.
// Stable under ties and new inserts, unlike offset paging.

/** Visits per batch in the activity log. */
export const LOG_PAGE_SIZE = 50

export interface Cursor {
  timestamp: string
  id: string
}

/** The cursor for the last event of a batch. */
export function cursorOf(event: Cursor): Cursor {
  return { timestamp: event.timestamp, id: event.id }
}

/** A PostgREST `or` filter for events strictly after `cursor` in (timestamp, id) desc order. */
export function afterCursor({ timestamp, id }: Cursor): string {
  const ts = `"${timestamp.replace(/[^\d\-:.+TZ ]/g, "")}"`
  const key = id.replace(/[^0-9a-f-]/gi, "")
  return `timestamp.lt.${ts},and(timestamp.eq.${ts},id.lt.${key})`
}

/** True when another batch may exist after one of `received` items. */
export function hasMore(received: number, pageSize: number): boolean {
  return received === pageSize
}
