import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { fn } from "storybook/test"

import { BarList } from "@/components/dashboard/bar-list"
import { STATS } from "@/stories/data"

const pageRows = STATS.top_pages.map((p) => ({
  key: p.page_path ?? "",
  label: p.page_path ?? "(unknown page)",
  value: p.visits,
  mono: true,
}))

const meta = {
  title: "Dashboard/BarList",
  component: BarList,
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
  args: { rows: pageRows },
} satisfies Meta<typeof BarList>

export default meta
type Story = StoryObj<typeof meta>

export const Static: Story = {}

/** Rows with `onSelect` become buttons with a chevron on hover. */
export const Selectable: Story = {
  args: { rows: pageRows.map((row) => ({ ...row, onSelect: fn() })) },
}

export const Platforms: Story = {
  args: {
    rows: STATS.by_platform.map((p) => ({
      key: p.platform,
      label: p.platform,
      value: p.visits,
    })),
  },
}
