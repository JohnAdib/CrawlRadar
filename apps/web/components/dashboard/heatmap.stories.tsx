import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Heatmap } from "@/components/dashboard/heatmap"
import { STATS, STATS_24H } from "@/stories/data"

const meta = {
  title: "Dashboard/Heatmap",
  component: Heatmap,
  decorators: [
    (Story) => (
      <div className="max-w-3xl pt-10">
        <Story />
      </div>
    ),
  ],
  args: { cells: STATS.heatmap },
} satisfies Meta<typeof Heatmap>

export default meta
type Story = StoryObj<typeof meta>

export const SevenDays: Story = {}

export const Last24Hours: Story = { args: { cells: STATS_24H.heatmap } }

export const Empty: Story = { args: { cells: [] } }
