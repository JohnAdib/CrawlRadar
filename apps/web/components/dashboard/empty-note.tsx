/** A quiet one-line empty state inside a panel. */
export function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex min-h-24 items-center justify-center text-center text-muted-foreground text-sm">
      {children}
    </p>
  )
}
