import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Logo, LogoMark } from "@/components/logo"

const meta = {
  title: "Components/Logo",
  component: Logo,
} satisfies Meta<typeof Logo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Large: Story = { args: { className: "text-2xl" } }

/** The word mark hides below the sm breakpoint (try the mobile viewport). */
export const CompactOnMobile: Story = { args: { compactOnMobile: true } }

export const MarkSizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <LogoMark className="size-5" />
      <LogoMark />
      <LogoMark className="size-12" />
      <LogoMark className="size-20" />
    </div>
  ),
}
