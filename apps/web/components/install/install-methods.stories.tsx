import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { InstallMethods } from "@/components/install/install-methods"
import { ORIGIN, SITE } from "@/stories/data"

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
  args: { origin: ORIGIN, siteId: SITE.id, domain: SITE.domain, demo: true },
} satisfies Meta<typeof InstallMethods>

export default meta
type Story = StoryObj<typeof meta>

/** JavaScript tag or pixel, with what each one records. */
export const Default: Story = {}
