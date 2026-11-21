import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { fn } from "storybook/test"

import {
  Platforms,
  TypeBreakdown,
} from "@/components/dashboard/platforms-panel"
import { STATS } from "@/stories/data"

const meta = {
  title: "Dashboard/Platforms",
  component: Platforms,
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
  args: { platforms: STATS.by_platform.slice(0, 8) },
} satisfies Meta<typeof Platforms>

export default meta
type Story = StoryObj<typeof meta>

export const Selectable: Story = { args: { onSelect: fn() } }

export const ReadOnly: Story = {}

export const Empty: Story = { args: { platforms: [] } }

/** The panel as on the overview: ranked platforms, then the split by bot type. */
export const WithTypeBreakdown: Story = {
  args: { onSelect: fn() },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Platforms {...args} />
      <TypeBreakdown timeline={STATS.timeline} />
    </div>
  ),
}

export const TypeBreakdownOnly: Story = {
  render: () => <TypeBreakdown timeline={STATS.timeline} />,
}
