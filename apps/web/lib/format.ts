const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" })
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
]

export function timeAgo(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now()
  for (const [unit, ms] of UNITS) {
    if (Math.abs(diff) >= ms)
      return relative.format(Math.round(diff / ms), unit)
  }
  return "just now"
}

export const formatNumber = (n: number) => new Intl.NumberFormat("en").format(n)

export const visits = (n: number) =>
  `${formatNumber(n)} visit${n === 1 ? "" : "s"}`
