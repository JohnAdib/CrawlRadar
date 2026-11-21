import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { InstallCard } from "@/components/site/install-card"
import { ORIGIN, SITE } from "@/stories/data"

const meta = {
  title: "Site/InstallCard",
  component: InstallCard,
  decorators: [
    (Story) => (
      <div className="max-w-3xl">
        <Story />
      </div>
    ),
  ],
  args: { domain: SITE.domain, origin: ORIGIN, siteId: SITE.id },
} satisfies Meta<typeof InstallCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
