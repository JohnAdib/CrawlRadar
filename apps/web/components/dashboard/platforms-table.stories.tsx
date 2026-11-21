import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { fn } from "storybook/test"

import { PlatformsTable } from "@/components/dashboard/platforms-table"
import { NOW, PLATFORM_ROWS } from "@/stories/data"

const meta = {
  title: "Dashboard/PlatformsTable",
  component: PlatformsTable,
  args: { rows: PLATFORM_ROWS, now: NOW },
} satisfies Meta<typeof PlatformsTable>

export default meta
type Story = StoryObj<typeof meta>

export const Selectable: Story = { args: { onSelect: fn() } }

export const ReadOnly: Story = {}
