import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { ExportCard } from "@/components/site/export-card"
import { SITE } from "@/stories/data"

const meta = {
  title: "Site/ExportCard",
  component: ExportCard,
  decorators: [
    (Story) => (
      <div className="max-w-3xl">
        <Story />
      </div>
    ),
  ],
  args: { siteId: SITE.id },
} satisfies Meta<typeof ExportCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
