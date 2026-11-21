import { Card, CardContent, CardHeader } from "@crawlradar/ui/components/card"
import { Skeleton } from "@crawlradar/ui/components/skeleton"

export default function SitesLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy aria-label="Loading sites">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="hidden h-9 w-36 sm:block" />
      </div>
      {Array.from({ length: 2 }, (_, i) => (
        <Card key={i}>
          <CardHeader className="gap-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-28" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
