import { Card, CardHeader } from "@crawlradar/ui/components/card"
import { Skeleton } from "@crawlradar/ui/components/skeleton"

export default function SitesLoading() {
  return (
    <div
      className="flex flex-col gap-6"
      role="status"
      aria-label="Loading sites"
    >
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="hidden h-9 w-36 sm:block" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Card key={i}>
            <CardHeader className="gap-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-lg" />
                <Skeleton className="h-5 w-36" />
              </div>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
