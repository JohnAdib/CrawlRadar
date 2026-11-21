"use server"

import { type Cursor, LOG_PAGE_SIZE } from "@/lib/events"
import { parseFilters, sinceFor } from "@/lib/filters"
import { createClient } from "@/lib/supabase/server"

import { loadEvents } from "../data"

/**
 * The next batch of the activity log after `cursor`. RLS limits it to the caller's own
 * sites, so another user's site ID returns nothing.
 */
export async function moreEvents(
  siteId: string,
  params: Record<string, string | undefined>,
  cursor: Cursor
) {
  const filters = parseFilters(params)
  const supabase = await createClient()
  const { events } = await loadEvents(
    { supabase, site: { id: siteId }, filters, since: sinceFor(filters.range) },
    LOG_PAGE_SIZE,
    cursor
  )
  return events
}
