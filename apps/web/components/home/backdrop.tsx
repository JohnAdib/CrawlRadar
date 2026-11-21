/** Hero background: a faint grid, slow-drifting aurora light, and a radar sweep. */
export function HeroBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--foreground)_6%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--foreground)_6%,transparent)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_30%,black,transparent)]" />
      <div className="motion-reduce:animate-none absolute -top-40 left-1/2 h-[520px] w-[720px] -translate-x-1/2 animate-[aurora_18s_ease-in-out_infinite] rounded-full bg-chart-1/25 blur-[110px]" />
      <div className="motion-reduce:animate-none absolute top-10 left-[15%] h-[360px] w-[420px] animate-[aurora_22s_ease-in-out_infinite_reverse] rounded-full bg-chart-4/20 blur-[110px]" />
      <div className="absolute top-[-280px] left-1/2 size-[900px] -translate-x-1/2 [mask-image:radial-gradient(circle,black_30%,transparent_68%)]">
        <div className="motion-reduce:animate-none size-full animate-[radar-spin_14s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,color-mix(in_oklch,var(--chart-1)_22%,transparent)_40deg,transparent_70deg)]" />
      </div>
    </div>
  )
}
