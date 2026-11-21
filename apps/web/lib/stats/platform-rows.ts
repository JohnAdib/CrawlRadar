import { byVisitsThen, groupBy, isAi } from "./helpers"
import type { BotRow } from "./types"

/** One row of the Platforms view. */
export interface PlatformRow {
  platform: string
  visits: number
  ai_visits: number
  referrals: number
  search_engine_visits: number
  bots: BotRow[]
  last_seen: string
}

/** Per-platform totals and the bots behind them, from the per-bot stats. */
export function platformRows(bots: BotRow[]): PlatformRow[] {
  return [...groupBy(bots, (b) => b.platform)]
    .map(([platform, list]) => {
      const sum = (pick: (b: BotRow) => boolean) =>
        list.filter(pick).reduce((total, b) => total + b.visits, 0)
      return {
        platform,
        visits: sum(() => true),
        ai_visits: sum(isAi),
        referrals: sum((b) => b.bot_type === "referral"),
        search_engine_visits: sum((b) => b.bot_type === "search_engine"),
        bots: list.filter((b) => b.bot_type !== "referral"),
        last_seen: list
          .map((b) => b.last_seen)
          .sort()
          .at(-1)!,
      }
    })
    .sort(byVisitsThen((x) => x.platform))
}
