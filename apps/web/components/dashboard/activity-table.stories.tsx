import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { fn } from "storybook/test"

import { ActivityTable } from "@/components/dashboard/activity-table"
import { LOG, NOW } from "@/stories/data"

const meta = {
  title: "Dashboard/ActivityTable",
  component: ActivityTable,
  args: { events: LOG, now: NOW },
} satisfies Meta<typeof ActivityTable>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { onSelectPage: fn() } }

/** Referral visits show where the person came from. */
export const ReferralsOnly: Story = {
  args: { events: LOG.filter((e) => e.bot_type === "referral") },
}
