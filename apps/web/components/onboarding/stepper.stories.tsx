import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Stepper } from "@/components/onboarding/stepper"
import { STEPS } from "@/components/onboarding/steps"

const meta = {
  title: "Onboarding/Stepper",
  component: Stepper,
  argTypes: {
    current: { control: "select", options: STEPS.map((s) => s.id) },
  },
  args: { current: "site" },
} satisfies Meta<typeof Stepper>

export default meta
type Story = StoryObj<typeof meta>

export const Account: Story = { args: { current: "account" } }

export const Website: Story = { args: { current: "site" } }

export const Install: Story = { args: { current: "install" } }

export const Verify: Story = { args: { current: "verify" } }

/** The last step marks every step done. */
export const Explore: Story = { args: { current: "explore" } }
