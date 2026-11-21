import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { fn } from "storybook/test"

import { DemoDashboard } from "@/components/dashboard/demo"
import { DashboardView } from "@/components/dashboard/view"
import { computeStats, recentEvents } from "@/lib/stats"
import {
  DEMO_DOMAIN,
  EVENTS,
  NOW,
  optionsFor,
  RECENT,
  STATS,
  STATS_24H,
} from "@/stories/data"

const report = (filters: { platform?: string; page?: string }) => {
  const options = { ...optionsFor("7d"), ...filters }
  return {
    stats: computeStats(EVENTS, options),
    events: recentEvents(EVENTS, options),
    filters: { site: "demo", range: "7d" as const, ...filters },
  }
}

const meta = {
  title: "Pages/DashboardView",
  component: DashboardView,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-7xl p-4 sm:p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    stats: STATS,
    events: RECENT,
    filters: { site: "demo", range: "7d" },
    domain: DEMO_DOMAIN,
    now: NOW,
    onChange: fn(),
  },
} satisfies Meta<typeof DashboardView>

export default meta
type Story = StoryObj<typeof meta>

/** The overview on the home page demo data (last 7 days). */
export const Overview: Story = {}

export const Last24Hours: Story = {
  args: {
    stats: STATS_24H,
    events: recentEvents(EVENTS, optionsFor("24h")),
    filters: { site: "demo", range: "24h" },
  },
}

export const PlatformReport: Story = { args: report({ platform: "OpenAI" }) }

export const PageReport: Story = { args: report({ page: "/pricing" }) }

export const NoMatches: Story = {
  args: {
    stats: computeStats([], optionsFor("7d")),
    events: [],
    filters: { site: "demo", range: "7d", type: "assistant" },
  },
}

/** The real home page demo: filters, reports and the Export toast all work. */
export const Interactive: Story = {
  render: () => (
    <DemoDashboard now={NOW} origin="https://crawlradar.vercel.app" />
  ),
}
