import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { fn } from "storybook/test"

import { NoResults } from "@/components/dashboard/no-results"

const meta = {
  title: "Dashboard/NoResults",
  component: NoResults,
  args: { filters: { range: "24h" }, onChange: fn() },
} satisfies Meta<typeof NoResults>

export default meta
type Story = StoryObj<typeof meta>

export const ShortRange: Story = {}

export const Filtered: Story = {
  args: { filters: { range: "7d", platform: "Apple", type: "referral" } },
}

/** Already on the longest range: only clearing the filters is offered. */
export const FilteredThirtyDays: Story = {
  args: { filters: { range: "30d", type: "assistant" } },
}
