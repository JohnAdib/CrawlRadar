import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { fn } from "storybook/test"

import { PagesTable } from "@/components/dashboard/pages-table"
import { NOW, PAGES } from "@/stories/data"

const meta = {
  title: "Dashboard/PagesTable",
  component: PagesTable,
  args: { rows: PAGES, now: NOW },
} satisfies Meta<typeof PagesTable>

export default meta
type Story = StoryObj<typeof meta>

export const Selectable: Story = { args: { onSelect: fn() } }

export const ReadOnly: Story = {}
