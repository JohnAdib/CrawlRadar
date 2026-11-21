import { Button } from "@crawlradar/ui/components/button"
import { Card, CardContent } from "@crawlradar/ui/components/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@crawlradar/ui/components/empty"
import { SearchX } from "lucide-react"

import type { FilterChange } from "@/components/dashboard/filters"
import { type Filters, RANGES } from "@/lib/filters"

/** Shown when the filters match nothing, with one-click ways out. */
export function NoResults({
  filters,
  onChange,
}: {
  filters: Filters
  onChange: (change: FilterChange) => void
}) {
  const range = RANGES[filters.range].label
  const filtered = Boolean(filters.platform || filters.type || filters.page)
  return (
    <Card>
      <CardContent>
        <Empty className="py-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX />
            </EmptyMedia>
            <EmptyTitle>No visits match these filters</EmptyTitle>
            <EmptyDescription>
              Nothing in the last {range}
              {filtered && " with these filters"}. Try a longer range
              {filtered && " or clear the filters"}.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center">
            {filters.range !== "30d" && (
              <Button
                variant="outline"
                onClick={() => onChange({ range: "30d" })}
              >
                Show 30 days
              </Button>
            )}
            {filtered && (
              <Button
                variant="outline"
                onClick={() =>
                  onChange({
                    platform: undefined,
                    type: undefined,
                    page: undefined,
                  })
                }
              >
                Clear filters
              </Button>
            )}
          </EmptyContent>
        </Empty>
      </CardContent>
    </Card>
  )
}
