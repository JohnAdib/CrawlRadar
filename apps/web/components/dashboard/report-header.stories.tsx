import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { fn } from "storybook/test"

import { ReportHeader } from "@/components/dashboard/report-header"
import { DEMO_DOMAIN } from "@/stories/data"

const meta = {
  title: "Dashboard/ReportHeader",
  component: ReportHeader,
  args: {
    filters: { range: "7d", page: "/blog/ai-search-guide" },
    domain: DEMO_DOMAIN,
    range: "7 days",
    onBack: fn(),
  },
} satisfies Meta<typeof ReportHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Page: Story = {}

export const PageFromPlatform: Story = {
  args: {
    filters: { range: "7d", page: "/blog/ai-search-guide", platform: "OpenAI" },
  },
}

export const Platform: Story = {
  args: { filters: { range: "30d", platform: "Anthropic" }, range: "30 days" },
}
