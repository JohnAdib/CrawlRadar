import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Pagination } from "@/components/dashboard/pagination"

const meta = {
  title: "Dashboard/Pagination",
  component: Pagination,
  args: {
    page: 1,
    pageSize: 50,
    total: 1234,
    href: (page: number) => `/dashboard/activity?p=${page}`,
  },
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

export const FirstPage: Story = {}

export const MiddlePage: Story = { args: { page: 12 } }

export const LastPage: Story = { args: { page: 25 } }

export const SinglePage: Story = { args: { total: 18 } }

export const NoRows: Story = { args: { total: 0 } }
