import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Referrers } from "@/components/dashboard/referrers"
import { STATS } from "@/stories/data"

const meta = {
  title: "Dashboard/Referrers",
  component: Referrers,
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
  args: { referrers: STATS.referrers },
} satisfies Meta<typeof Referrers>

export default meta
type Story = StoryObj<typeof meta>

export const Several: Story = {}

export const Single: Story = {
  args: { referrers: STATS.referrers.slice(0, 1) },
}

export const Empty: Story = { args: { referrers: [] } }
