import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Activity, Bot, MousePointerClick } from "lucide-react"

import { StatCard } from "@/components/dashboard/stat-card"
import { formatNumber } from "@/lib/format"
import { SPARK, STATS } from "@/stories/data"

const meta = {
  title: "Dashboard/StatCard",
  component: StatCard,
  decorators: [
    (Story) => (
      <div className="max-w-xs pt-10">
        <Story />
      </div>
    ),
  ],
  args: {
    icon: Activity,
    label: "AI crawler visits",
    value: formatNumber(STATS.crawls),
  },
} satisfies Meta<typeof StatCard>

export default meta
type Story = StoryObj<typeof meta>

export const WithSparkline: Story = {
  args: {
    delta: { current: STATS.crawls, previous: STATS.prev_crawls },
    hint: `24h ${STATS.totals["24h"]} · 7d ${STATS.totals["7d"]} · 30d ${STATS.totals["30d"]}`,
    spark: SPARK,
    unit: "crawls",
  },
}

export const NegativeDelta: Story = {
  args: {
    icon: MousePointerClick,
    label: "AI referrals",
    value: "84",
    delta: { current: 84, previous: 120 },
    hint: "Visitors from AI assistants",
    spark: SPARK.map((p) => ({ ...p, value: Math.round(p.value / 6) })),
    unit: "referrals",
    color: "var(--chart-4)",
  },
}

export const NewMetric: Story = {
  args: { delta: { current: 12, previous: 0 }, value: "12" },
}

export const WithoutSparkline: Story = {
  args: {
    icon: Bot,
    label: "Active crawlers",
    value: String(STATS.active_bots),
    hint: `Across ${STATS.active_platforms} platforms`,
  },
}
