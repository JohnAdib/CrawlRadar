// Dashboard filters live in the URL so every view is shareable and bookmarkable.

export const RANGES = {
  "24h": { label: "24 hours", ms: 24 * 60 * 60 * 1000 },
  "7d": { label: "7 days", ms: 7 * 24 * 60 * 60 * 1000 },
  "30d": { label: "30 days", ms: 30 * 24 * 60 * 60 * 1000 },
} as const

export type Range = keyof typeof RANGES

// Mirrors the bot_type check constraint in the database.
export const BOT_TYPES = {
  training: "AI training",
  search: "AI search",
  assistant: "AI assistant",
  referral: "AI referral",
  search_engine: "Search engine",
  unknown: "Unknown",
} as const

export type BotType = keyof typeof BOT_TYPES

/** Chart colour per bot type. */
export const TYPE_COLORS: Record<BotType, string> = {
  training: "var(--chart-1)",
  search: "var(--chart-2)",
  assistant: "var(--chart-3)",
  referral: "var(--chart-4)",
  search_engine: "var(--chart-5)",
  unknown: "var(--muted-foreground)",
}

export interface Filters {
  site?: string
  range: Range
  platform?: string
  type?: BotType
  /** A single page path, for the per-page report. */
  page?: string
}

type Params = Record<string, string | string[] | undefined>

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value || undefined
}

export function parseFilters(params: Params): Filters {
  const range = one(params.range)
  const type = one(params.type)
  return {
    site: one(params.site),
    // hasOwn, not `in`: "?range=toString" must not pass as a range.
    range: range && Object.hasOwn(RANGES, range) ? (range as Range) : "7d",
    platform: one(params.platform),
    type:
      type && Object.hasOwn(BOT_TYPES, type) ? (type as BotType) : undefined,
    page: one(params.page),
  }
}

export function sinceFor(range: Range): string {
  return new Date(Date.now() - RANGES[range].ms).toISOString()
}

/** "?site=…&range=7d" from any string params; empty values are left out. */
export function toQuery(params: object): string {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params))
    if (value) query.set(key, String(value))
  const text = query.toString()
  return text ? `?${text}` : ""
}
