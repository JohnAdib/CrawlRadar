import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Delta } from "@/components/dashboard/delta"
import { STATS } from "@/stories/data"

const meta = {
  title: "Dashboard/Delta",
  component: Delta,
  args: { current: STATS.crawls, previous: STATS.prev_crawls },
} satisfies Meta<typeof Delta>

export default meta
type Story = StoryObj<typeof meta>

export const Demo: Story = {}

export const Up: Story = { args: { current: 150, previous: 100 } }

export const Down: Story = { args: { current: 60, previous: 100 } }

/** No previous period to compare against. */
export const New: Story = { args: { current: 12, previous: 0 } }

export const Capped: Story = { args: { current: 50_000, previous: 10 } }
