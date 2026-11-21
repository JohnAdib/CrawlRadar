// Shared types for crawler classification. Mirrors the bot_type check constraint.

export type BotType =
  | "training"
  | "search"
  | "assistant"
  | "referral"
  | "search_engine"
  | "unknown"

export interface Classification {
  name: string
  platform: string
  type: BotType
}

/** [name, platform, type, pattern]. Without a pattern the name is matched, case-insensitively. */
export type BotEntry = [
  name: string,
  platform: string,
  type: BotType,
  pattern?: RegExp,
]

/** Case-insensitive pattern for a literal user-agent token. */
export function tokenPattern(name: string): RegExp {
  return new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
}
