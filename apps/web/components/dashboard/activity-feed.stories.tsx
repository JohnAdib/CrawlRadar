import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { fn } from "storybook/test"

import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { NOW, RECENT } from "@/stories/data"

const meta = {
  title: "Dashboard/ActivityFeed",
  component: ActivityFeed,
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
  args: { events: RECENT.slice(0, 10), now: NOW, onSelectPage: fn() },
} satisfies Meta<typeof ActivityFeed>

export default meta
type Story = StoryObj<typeof meta>

export const WithEvents: Story = {}

export const Empty: Story = { args: { events: [] } }
