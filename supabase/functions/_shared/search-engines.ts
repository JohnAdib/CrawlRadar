import type { BotEntry } from "./bot-types.ts"

// Classic search-engine crawlers. Not AI, but useful context next to AI traffic, so they
// are stored under their own type and kept out of the "AI crawler" totals.
export const SEARCH_ENGINES: BotEntry[] = [
  ["Googlebot", "Google", "search_engine"],
  ["Google-InspectionTool", "Google", "search_engine"],
  ["Bingbot", "Microsoft", "search_engine"],
  ["Applebot", "Apple", "search_engine"],
  ["YandexBot", "Yandex", "search_engine"],
  ["Baiduspider", "Baidu", "search_engine"],
  ["DuckDuckBot", "DuckDuckGo", "search_engine"],
  ["Yahoo! Slurp", "Yahoo", "search_engine"],
  ["Sogou Spider", "Sogou", "search_engine", /Sogou web spider/i],
  ["360Spider", "Qihoo 360", "search_engine"],
  ["YisouSpider", "Alibaba", "search_engine"],
  ["PetalBot", "Huawei", "search_engine"],
  ["SeznamBot", "Seznam", "search_engine"],
  ["Yeti", "Naver", "search_engine", /\bYeti\//i],
  ["Bravebot", "Brave", "search_engine"],
  ["MojeekBot", "Mojeek", "search_engine"],
  ["Qwantbot", "Qwant", "search_engine"],
]
