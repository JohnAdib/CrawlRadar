import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { StepExplore } from "@/components/onboarding/step-explore"
import { SITE } from "@/stories/data"

const meta = {
  title: "Onboarding/StepExplore",
  component: StepExplore,
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-2xl">
        <Story />
      </div>
    ),
  ],
  args: { site: SITE },
} satisfies Meta<typeof StepExplore>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
