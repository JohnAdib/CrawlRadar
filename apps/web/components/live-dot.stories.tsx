import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { LiveDot } from "@/components/live-dot"

const meta = {
  title: "Components/LiveDot",
  component: LiveDot,
  argTypes: { tone: { control: "inline-radio", options: ["live", "waiting"] } },
  args: { tone: "live" },
} satisfies Meta<typeof LiveDot>

export default meta
type Story = StoryObj<typeof meta>

export const Live: Story = {}

export const Waiting: Story = { args: { tone: "waiting" } }

export const Large: Story = { args: { className: "size-4" } }
