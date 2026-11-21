import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { TrafficChart } from "@/components/dashboard/traffic-chart"
import { STATS, STATS_24H } from "@/stories/data"

const meta = {
  title: "Dashboard/TrafficChart",
  component: TrafficChart,
  decorators: [
    (Story) => (
      <div className="max-w-3xl">
        <Story />
      </div>
    ),
  ],
  args: {
    timeline: STATS.timeline,
    platformTimeline: STATS.platform_timeline,
    hourly: false,
  },
} satisfies Meta<typeof TrafficChart>

export default meta
type Story = StoryObj<typeof meta>

export const ByPlatform: Story = { args: { initialSplit: "platform" } }

export const ByType: Story = { args: { initialSplit: "type" } }

export const Hourly: Story = {
  args: {
    timeline: STATS_24H.timeline,
    platformTimeline: STATS_24H.platform_timeline,
    hourly: true,
  },
}
