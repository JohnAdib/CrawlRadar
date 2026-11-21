// CSV export in the exact format of the PRD appendix, rows written with PapaParse:
//
//   timestamp,page_url,bot_name,platform,bot_type,user_agent
//   2026-01-31T10:23:45Z,/blog/post-1,GPTBot,OpenAI,training,"Mozilla/5.0 ..."
import Papa from "papaparse"

/** The appendix columns, in order. */
export const CSV_COLUMNS = [
  "timestamp",
  "page_url",
  "bot_name",
  "platform",
  "bot_type",
  "user_agent",
] as const

export const CSV_HEADER = `${CSV_COLUMNS.join(",")}\n`

export interface ExportEvent {
  timestamp: string
  page_url: string
  page_path: string | null
  bot_name: string
  platform: string
  bot_type: string
  user_agent: string
}

/** "2026-01-31T10:23:45Z": UTC, whole seconds. */
export function csvTimestamp(iso: string): string {
  return new Date(iso).toISOString().replace(/\.\d{3}Z$/, "Z")
}

/** One event as appendix fields. The page is its path, as in the appendix example. */
export function csvFields(event: ExportEvent): string[] {
  return [
    csvTimestamp(event.timestamp),
    event.page_path || event.page_url,
    event.bot_name,
    event.platform,
    event.bot_type,
    event.user_agent,
  ]
}

/**
 * Data rows, one per line. The user agent is always quoted, as in the appendix.
 * `escapeFormulae` neutralises cells that spreadsheets would run as formulas
 * ("CSV injection"): user agents and URLs come from untrusted visitors.
 */
export function csvRows(events: ExportEvent[]): string {
  if (events.length === 0) return ""
  const rows = Papa.unparse(events.map(csvFields), {
    quotes: [false, false, false, false, false, true],
    newline: "\n",
    escapeFormulae: true,
  })
  return `${rows}\n`
}
