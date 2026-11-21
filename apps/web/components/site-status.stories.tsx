import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { SiteStatus } from "@/components/site-status"

const meta = {
  title: "Components/SiteStatus",
  component: SiteStatus,
  args: { lastSeen: null },
} satisfies Meta<typeof SiteStatus>

export default meta
type Story = StoryObj<typeof meta>

// SiteStatus formats against the real clock, so this one is relative to Date.now().
export const Live: Story = {
  args: { lastSeen: new Date(Date.now() - 5 * 60_000).toISOString() },
}

export const Waiting: Story = {}

export const InstalledWaiting: Story = { args: { installed: true } }
