import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { TypeBadge } from "@/components/dashboard/type-badge"
import { BOT_TYPES, type BotType } from "@/lib/filters"

const TYPES = Object.keys(BOT_TYPES) as BotType[]

const meta = {
  title: "Dashboard/TypeBadge",
  component: TypeBadge,
  argTypes: { type: { control: "select", options: TYPES } },
  args: { type: "training" },
} satisfies Meta<typeof TypeBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = {}

export const EveryType: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {TYPES.map((type) => (
        <TypeBadge key={type} type={type} />
      ))}
    </div>
  ),
}
