import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { PlatformShareChart } from "@/components/dashboard/platform-share-chart"
import { STATS } from "@/stories/data"

const meta = {
  title: "Dashboard/PlatformShareChart",
  component: PlatformShareChart,
  args: { platforms: STATS.by_platform },
} satisfies Meta<typeof PlatformShareChart>

export default meta
type Story = StoryObj<typeof meta>

export const AllPlatforms: Story = {}

export const TopThree: Story = {
  args: { platforms: STATS.by_platform.slice(0, 3) },
}
