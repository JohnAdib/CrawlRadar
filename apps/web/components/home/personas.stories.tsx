import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Personas } from "@/components/home/personas"

const meta = {
  title: "Home/Personas",
  component: Personas,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Personas>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
