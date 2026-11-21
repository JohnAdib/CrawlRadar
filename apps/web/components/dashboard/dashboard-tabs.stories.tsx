import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { DashboardTabs } from "@/components/dashboard/dashboard-tabs"

const meta = {
  title: "Dashboard/DashboardTabs",
  component: DashboardTabs,
  args: { active: "overview", hrefFor: (section) => `/dashboard/${section}` },
} satisfies Meta<typeof DashboardTabs>

export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {}

export const Platforms: Story = { args: { active: "platforms" } }

export const Pages: Story = { args: { active: "pages" } }

export const ActivityLog: Story = { args: { active: "activity" } }

export const Settings: Story = { args: { active: "settings" } }

/** In the home page demo the tabs are buttons that switch views in place. */
export const DemoButtons: Story = {
  args: { active: "platforms", hrefFor: undefined, onSelect: () => {} },
}
