import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { fn } from "storybook/test"

import { FilterBar } from "@/components/dashboard/filters"
import { STATS } from "@/stories/data"

const meta = {
  title: "Dashboard/FilterBar",
  component: FilterBar,
  args: {
    filters: { range: "7d" },
    platforms: STATS.platforms,
    onChange: fn(),
  },
} satisfies Meta<typeof FilterBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Filtered: Story = {
  args: { filters: { range: "30d", platform: "OpenAI", type: "training" } },
}

/** The Platforms view has its own per-platform rows, so it hides the picker. */
export const WithoutPlatform: Story = {
  args: { hidePlatform: true, filters: { range: "24h", type: "search" } },
}

export const Pending: Story = { args: { pending: true } }
