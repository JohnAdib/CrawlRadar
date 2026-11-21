import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@crawlradar/ui/components/card"
import { cn } from "@crawlradar/ui/lib/utils"

/** A titled dashboard card that fades in, staggered by `index`. */
export function Panel({
  title,
  description,
  action,
  children,
  className,
  index = 0,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  index?: number
}) {
  return (
    <Card
      className={cn(
        "fade-in slide-in-from-bottom-3 fill-mode-both animate-in transition-[border-color,box-shadow] duration-200 hover:border-foreground/15 hover:shadow-md motion-reduce:animate-none",
        className
      )}
      style={{
        animationDelay: `${120 + index * 60}ms`,
        animationDuration: "500ms",
      }}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">{children}</CardContent>
    </Card>
  )
}
