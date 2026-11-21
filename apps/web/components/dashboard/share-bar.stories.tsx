import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { ShareBar } from "@/components/dashboard/share-bar"
import { platformColor } from "@/lib/platforms"
import { STATS } from "@/stories/data"

const meta = {
  title: "Dashboard/ShareBar",
  component: ShareBar,
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
  args: {
    items: STATS.referrers.map((r) => ({
      key: r.source,
      label: r.source,
      value: r.visits,
      color: platformColor(r.platform),
    })),
  },
} satisfies Meta<typeof ShareBar>

export default meta
type Story = StoryObj<typeof meta>

export const Referrers: Story = {}

export const Platforms: Story = {
  args: {
    items: STATS.by_platform.map((p) => ({
      key: p.platform,
      label: p.platform,
      value: p.visits,
      color: platformColor(p.platform),
    })),
  },
}
