import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { InstallMethods } from "@/components/install/install-methods"
import { PIXEL, SNIPPET } from "@/stories/data"

const meta = {
  title: "Install/InstallMethods",
  component: InstallMethods,
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
  args: { code: SNIPPET, pixel: PIXEL },
} satisfies Meta<typeof InstallMethods>

export default meta
type Story = StoryObj<typeof meta>

/** JavaScript tag or pixel, with what each one records. */
export const Default: Story = {}
