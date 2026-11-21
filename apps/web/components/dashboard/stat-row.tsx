"use client"

import { Activity, Bot, FileStack, MousePointerClick } from "lucide-react"

import { AnimatedNumber } from "@/components/animated-number"
import { StatCard } from "@/components/dashboard/stat-card"
import type { Stats } from "@/lib/stats"

const compact = new Intl.NumberFormat("en", { notation: "compact" }).format

function bucketLabel(bucket: string, hourly: boolean): string {
  return new Date(bucket).toLocaleString(
    "en",
    hourly
      ? { month: "short", day: "numeric", hour: "numeric" }
      : { weekday: "short", month: "short", day: "numeric" }
  )
}

/** The four headline numbers: crawls, referrals, crawlers, pages. */
export function StatRow({ stats, hourly }: { stats: Stats; hourly: boolean }) {
  const spark = (value: (p: Stats["timeline"][number]) => number) =>
    stats.timeline.map((p) => ({
      label: bucketLabel(p.bucket, hourly),
      value: value(p),
    }))
  const { totals } = stats
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      <StatCard
        index={0}
        icon={Activity}
        label="AI crawler visits"
        value={<AnimatedNumber value={stats.crawls} />}
        delta={{ current: stats.crawls, previous: stats.prev_crawls }}
        hint={`24h ${compact(totals["24h"])} · 7d ${compact(totals["7d"])} · 30d ${compact(totals["30d"])}`}
        spark={spark((p) => p.training + p.search + p.assistant + p.unknown)}
        unit="crawls"
      />
      <StatCard
        index={1}
        icon={MousePointerClick}
        label="AI referrals"
        value={<AnimatedNumber value={stats.referrals} />}
        delta={{ current: stats.referrals, previous: stats.prev_referrals }}
        hint="Visitors from AI assistants"
        spark={spark((p) => p.referral)}
        unit="referrals"
        color="var(--chart-4)"
      />
      <StatCard
        index={2}
        icon={Bot}
        label="Active crawlers"
        value={<AnimatedNumber value={stats.active_bots} />}
        hint={`Across ${stats.active_platforms} platform${stats.active_platforms === 1 ? "" : "s"}`}
      />
      <StatCard
        index={3}
        icon={FileStack}
        label="Pages crawled"
        value={<AnimatedNumber value={stats.pages} />}
        hint={
          stats.crawls > 0
            ? `${(stats.crawls / Math.max(stats.pages, 1)).toFixed(1)} crawls per page`
            : "No AI crawler visits in range"
        }
      />
    </div>
  )
}
