import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { DetailsCard } from "@/components/site/details-card"
import { SITE, STATS } from "@/stories/data"

const meta = {
  title: "Site/DetailsCard",
  component: DetailsCard,
  decorators: [
    (Story) => (
      <div className="max-w-3xl">
        <Story />
      </div>
    ),
  ],
  args: { site: SITE, visits30d: STATS.totals["30d"] },
} satisfies Meta<typeof DetailsCard>

export default meta
type Story = StoryObj<typeof meta>

export const Installed: Story = {}

export const NotInstalledYet: Story = {
  args: { site: { ...SITE, installed_at: null }, visits30d: 0 },
}
