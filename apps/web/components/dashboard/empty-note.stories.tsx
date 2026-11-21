import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { EmptyNote } from "@/components/dashboard/empty-note"

const meta = {
  title: "Dashboard/EmptyNote",
  component: EmptyNote,
  args: { children: "No platforms in this range." },
} satisfies Meta<typeof EmptyNote>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
