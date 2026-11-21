import { Button } from "@crawlradar/ui/components/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

import { formatNumber } from "@/lib/format"

/** "Showing 1–50 of 1,234" with previous and next links. `href(page)` builds each URL. */
export function Pagination({
  page,
  pageSize,
  total,
  href,
}: {
  page: number
  pageSize: number
  total: number
  href: (page: number) => string
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)
  return (
    <div className="flex items-center justify-between gap-4 pt-4 text-muted-foreground text-sm">
      <span className="tabular-nums">
        Showing {formatNumber(first)}–{formatNumber(last)} of{" "}
        {formatNumber(total)}
      </span>
      <div className="flex items-center gap-2">
        <span className="hidden tabular-nums sm:inline">
          Page {page} of {pages}
        </span>
        <PageButton
          disabled={page <= 1}
          href={href(page - 1)}
          label="Previous page"
        >
          <ChevronLeft />
        </PageButton>
        <PageButton
          disabled={page >= pages}
          href={href(page + 1)}
          label="Next page"
        >
          <ChevronRight />
        </PageButton>
      </div>
    </div>
  )
}

function PageButton({
  disabled,
  href,
  label,
  children,
}: {
  disabled: boolean
  href: string
  label: string
  children: React.ReactNode
}) {
  if (disabled) {
    return (
      <Button variant="outline" size="icon-sm" disabled aria-label={label}>
        {children}
      </Button>
    )
  }
  return (
    <Button variant="outline" size="icon-sm" asChild>
      <Link href={href} aria-label={label} scroll={false}>
        {children}
      </Link>
    </Button>
  )
}
