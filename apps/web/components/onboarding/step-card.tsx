import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@crawlradar/ui/components/card"

/** The card that holds one onboarding step. */
export function StepCard({
  title,
  description,
  footer,
  children,
}: {
  title: string
  description: React.ReactNode
  footer?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <Card className="fade-in slide-in-from-bottom-2 animate-in duration-500 motion-reduce:animate-none">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-pretty">{description}</CardDescription>
      </CardHeader>
      {children && (
        <CardContent className="flex flex-col gap-4">{children}</CardContent>
      )}
      {footer && (
        <CardFooter className="justify-end gap-2">{footer}</CardFooter>
      )}
    </Card>
  )
}
