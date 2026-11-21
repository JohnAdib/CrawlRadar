import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { fn } from "storybook/test"

import { StepInstall } from "@/components/onboarding/step-install"
import { ORIGIN, SITE } from "@/stories/data"

const meta = {
  title: "Onboarding/StepInstall",
  component: StepInstall,
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-2xl">
        <Story />
      </div>
    ),
  ],
  args: {
    domain: SITE.domain,
    origin: ORIGIN,
    siteId: SITE.id,
    onBack: fn(),
    onNext: fn(),
  },
} satisfies Meta<typeof StepInstall>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
