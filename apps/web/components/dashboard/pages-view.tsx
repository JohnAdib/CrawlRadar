"use client"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@crawlradar/ui/components/input-group"
import { Search } from "lucide-react"
import { useState } from "react"

import { EmptyNote } from "@/components/dashboard/empty-note"
import type { FilterChange } from "@/components/dashboard/filters"
import { NoResults } from "@/components/dashboard/no-results"
import { PagesTable } from "@/components/dashboard/pages-table"
import { Panel } from "@/components/dashboard/panel"
import type { Filters } from "@/lib/filters"
import type { PageRow } from "@/lib/stats"

/** Pages view (PRD 7.1): every crawled page, searchable, ranked by visits. */
export function PagesView({
  pages,
  filters,
  now,
  onChange,
  onOpenPage,
}: {
  pages: PageRow[]
  filters: Filters
  now?: number
  onChange: (change: FilterChange) => void
  onOpenPage: (page: string) => void
}) {
  const [query, setQuery] = useState("")
  if (pages.length === 0)
    return <NoResults filters={filters} onChange={onChange} />
  const needle = query.trim().toLowerCase()
  const rows = needle
    ? pages.filter((p) => (p.page_path ?? "").toLowerCase().includes(needle))
    : pages
  return (
    <Panel
      title={
        // crawler_pages() returns at most 500 pages.
        pages.length >= 500
          ? "Top 500 pages"
          : `${pages.length} page${pages.length === 1 ? "" : "s"} crawled`
      }
      description="Ranked by visits. Click a page for its report."
      action={
        <InputGroup className="w-40 bg-background sm:w-56">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Search pages"
            placeholder="Search pages"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>
      }
    >
      {rows.length ? (
        <PagesTable rows={rows} now={now} onSelect={onOpenPage} />
      ) : (
        <EmptyNote>No pages match “{query}”.</EmptyNote>
      )}
    </Panel>
  )
}
