import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { fn } from "storybook/test"

import { CrawlersTable } from "@/components/dashboard/crawlers-table"
import { NOW, STATS } from "@/stories/data"

const meta = {
  title: "Dashboard/CrawlersTable",
  component: CrawlersTable,
  args: { bots: STATS.by_bot.slice(0, 10), now: NOW },
} satisfies Meta<typeof CrawlersTable>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { onSelectPlatform: fn() } }

/** Inside a platform report the platform names are plain text. */
export const ReadOnly: Story = {}

export const AllBots: Story = { args: { bots: STATS.by_bot } }
