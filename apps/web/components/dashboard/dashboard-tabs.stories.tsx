import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { DashboardTabs } from "@/components/dashboard/dashboard-tabs"

const at = (pathname: string) => ({
  nextjs: { appDirectory: true, navigation: { pathname } },
})

const meta = {
  title: "Dashboard/DashboardTabs",
  component: DashboardTabs,
  args: { filters: { site: "demo", range: "7d" } },
} satisfies Meta<typeof DashboardTabs>

export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = { parameters: at("/dashboard") }

export const Platforms: Story = { parameters: at("/dashboard/platforms") }

export const Pages: Story = { parameters: at("/dashboard/pages") }

export const ActivityLog: Story = { parameters: at("/dashboard/activity") }

export const Settings: Story = { parameters: at("/dashboard/settings") }
