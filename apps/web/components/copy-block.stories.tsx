import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { CopyBlock } from "@/components/copy-block"
import { PIXEL, SNIPPET } from "@/stories/data"

const meta = {
  title: "Components/CopyBlock",
  component: CopyBlock,
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
  args: { code: SNIPPET, label: "Snippet" },
} satisfies Meta<typeof CopyBlock>

export default meta
type Story = StoryObj<typeof meta>

/** Copying shows a check and a "Snippet copied" toast. */
export const Snippet: Story = {}

export const Pixel: Story = { args: { code: PIXEL, label: "Pixel" } }
