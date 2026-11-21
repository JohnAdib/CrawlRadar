import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Sparkline } from "@/components/dashboard/sparkline"
import { SPARK } from "@/stories/data"

const meta = {
  title: "Dashboard/Sparkline",
  component: Sparkline,
  decorators: [
    (Story) => (
      <div className="max-w-xs pt-10">
        <Story />
      </div>
    ),
  ],
  args: { points: SPARK, color: "var(--chart-1)", unit: "visits" },
} satisfies Meta<typeof Sparkline>

export default meta
type Story = StoryObj<typeof meta>

export const Visits: Story = {}

export const Referrals: Story = {
  args: { color: "var(--chart-4)", unit: "referrals" },
}

/** Fewer than two points renders nothing. */
export const SinglePoint: Story = {
  args: { points: SPARK.slice(0, 1) },
}
