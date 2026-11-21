import { Card, CardContent, CardHeader } from "@crawlradar/ui/components/card"
import { Skeleton } from "@crawlradar/ui/components/skeleton"

function PanelSkeleton({ bodyClassName = "h-80" }: { bodyClassName?: string }) {
  return (
    <Card>
      <CardHeader className="gap-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-56 max-w-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className={`w-full ${bodyClassName}`} />
      </CardContent>
    </Card>
  )
}

/** Placeholder with the layout of a dashboard view's content, shown while data loads. */
export function DashboardSkeleton() {
  return (
    <div
      className="flex flex-col gap-4 sm:gap-6"
      role="status"
      aria-label="Loading dashboard"
    >
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <Skeleton className="col-span-2 h-9 sm:w-40" />
        <Skeleton className="h-9 sm:w-44" />
        <Skeleton className="h-9 sm:w-44" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Card key={i} className="gap-3 py-4 sm:py-5">
            <CardHeader className="gap-3 px-4 sm:px-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-32 max-w-full" />
            </CardHeader>
          </Card>
        ))}
      </div>
      <PanelSkeleton bodyClassName="h-64 sm:h-72" />
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <PanelSkeleton bodyClassName="h-[22.5rem]" />
        <PanelSkeleton bodyClassName="h-[22.5rem]" />
      </div>
    </div>
  )
}
