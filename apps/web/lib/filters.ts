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
  unknown: "Unknown",
} as const

export type BotType = keyof typeof BOT_TYPES

export interface Filters {
  site?: string
  range: Range
  platform?: string
  type?: BotType
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
    range: range && range in RANGES ? (range as Range) : "7d",
    platform: one(params.platform),
    type: type && type in BOT_TYPES ? (type as BotType) : undefined,
  }
}

export function sinceFor(range: Range): string {
  return new Date(Date.now() - RANGES[range].ms).toISOString()
}

export function toQuery(filters: Partial<Filters>): string {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(filters))
    if (value) query.set(key, value)
  const text = query.toString()
  return text ? `?${text}` : ""
}
