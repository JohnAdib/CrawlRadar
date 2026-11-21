import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { ActivityLog } from "@/components/dashboard/activity-log"
import type { LogEvent } from "@/components/dashboard/activity-table"
import { recentEvents } from "@/lib/stats"
import { EVENTS, NOW, optionsFor } from "@/stories/data"

const PAGE = 20
// Every demo visit in the last 30 days, as log rows.
const LOG: LogEvent[] = recentEvents(
  EVENTS,
  optionsFor("30d"),
  EVENTS.length
).map((e) => ({
  ...e,
  user_agent: e.user_agent ?? "",
  referrer: e.referrer ?? null,
}))

const meta = {
  title: "Dashboard/ActivityLog",
  component: ActivityLog,
  args: {
    initial: LOG.slice(0, PAGE),
    total: LOG.length,
    pageSize: PAGE,
    now: NOW,
    // Serves the next batch after a short delay, like the server would.
    loadMore: async ({ id }) => {
      await new Promise((resolve) => setTimeout(resolve, 400))
      const at = LOG.findIndex((e) => e.id === id)
      return LOG.slice(at + 1, at + 1 + PAGE)
    },
  },
} satisfies Meta<typeof ActivityLog>

export default meta
type Story = StoryObj<typeof meta>

/** Scroll down: the next batch loads before the end comes into view. */
export const EndlessScroll: Story = {}

export const Everything: Story = {
  args: { initial: LOG.slice(0, 8), total: 8, pageSize: PAGE },
}
