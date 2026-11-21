import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Features } from "@/components/home/features"

const meta = {
  title: "Home/Features",
  component: Features,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Features>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
