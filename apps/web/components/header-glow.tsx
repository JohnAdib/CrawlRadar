/** A soft light that drifts along the header's bottom edge. */
export function HeaderGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 -bottom-px h-px overflow-hidden"
    >
      <div className="motion-reduce:animate-none mx-auto h-full w-2/3 animate-[header-glow_9s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-chart-1/80 to-transparent" />
    </div>
  )
}
