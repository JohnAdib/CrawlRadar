export interface Share {
  key: string
  label: string
  value: number
  color: string
}

/** A single horizontal bar split into coloured segments by share. */
export function ShareBar({ items }: { items: Share[] }) {
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1
  return (
    <div
      className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full"
      role="img"
      aria-label={items
        .map((i) => `${i.label} ${Math.round((i.value / total) * 100)}%`)
        .join(", ")}
    >
      {items.map((item) => (
        <span
          key={item.key}
          className="h-full transition-[width] duration-700"
          style={{
            width: `${(item.value / total) * 100}%`,
            backgroundColor: item.color,
          }}
        />
      ))}
    </div>
  )
}
