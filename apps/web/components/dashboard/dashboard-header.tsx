/** Page title with the site and range, plus the site picker and actions. */
export function DashboardHeader({
  title,
  subtitle,
  switcher,
  actions,
}: {
  title: string
  subtitle: string
  switcher?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="font-semibold text-2xl tracking-tight">{title}</h1>
        <p className="truncate text-muted-foreground text-sm sm:text-base">
          {subtitle}
        </p>
      </div>
      {(switcher || actions) && (
        <div className="flex items-center gap-2">
          {switcher}
          {actions}
        </div>
      )}
    </div>
  )
}
