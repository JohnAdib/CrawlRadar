import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { fn } from "storybook/test"

import { TopPages } from "@/components/dashboard/top-pages"
import { STATS } from "@/stories/data"

const meta = {
  title: "Dashboard/TopPages",
  component: TopPages,
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
  args: { pages: STATS.top_pages, onSelect: fn() },
} satisfies Meta<typeof TopPages>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithUnknownPage: Story = {
  args: {
    pages: [...STATS.top_pages.slice(0, 4), { page_path: null, visits: 3 }],
  },
}

export const Empty: Story = { args: { pages: [] } }
