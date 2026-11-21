import type { BotType } from "@/lib/filters"

export interface CrawlerEvent {
  id: string
  timestamp: string
  bot_name: string
  platform: string
  bot_type: BotType
  page_path: string | null
  page_url?: string
  user_agent?: string
  referrer?: string | null
}

/** Visits in one time bucket, split by bot type. */
export type TimelinePoint = { bucket: string; visits: number } & Record<
  BotType,
  number
>

/** Crawler visits (no referrals) for one platform in one time bucket. */
export interface PlatformPoint {
  bucket: string
  platform: string
  visits: number
}

export interface BotRow {
  bot_name: string
  platform: string
  bot_type: BotType
  visits: number
  last_seen: string
}

export interface Stats {
  platforms: string[]
  total: number
  crawls: number
  prev_crawls: number
  referrals: number
  prev_referrals: number
  search_engine_visits: number
  active_bots: number
  active_platforms: number
  pages: number
  totals: { "24h": number; "7d": number; "30d": number }
  by_platform: { platform: string; visits: number }[]
  referrers: { source: string; platform: string; visits: number }[]
  by_bot: BotRow[]
  top_pages: { page_path: string | null; visits: number }[]
  timeline: TimelinePoint[]
  platform_timeline: PlatformPoint[]
  heatmap: { dow: number; hour: number; visits: number }[]
}

/** One row of the Pages view (crawler_pages() in SQL). */
export interface PageRow {
  page_path: string | null
  visits: number
  ai_visits: number
  referrals: number
  bots: number
  top_platform: string
  last_seen: string
}

export interface StatsOptions {
  since: Date
  now: Date
  platform?: string
  type?: BotType
  page?: string
}
