/** Renders an HTML tag name like <head> as inline code. */
export function Tag({ name = "head" }: { name?: string }) {
  return (
    <code className="rounded-md border bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
      &lt;{name}&gt;
    </code>
  )
}
