import { Check, Minus } from "lucide-react"

type Value = boolean | string

const ROWS: [string, Value, Value][] = [
  ["Counts crawlers that run JavaScript", true, true],
  ["Counts crawlers that skip JavaScript", false, true],
  [
    "Exact page URL, with UTM tags",
    true,
    "With your template; else from the Referer",
  ],
  [
    "Counts people sent by AI assistants",
    "All of them",
    "ChatGPT links (their UTM tag)",
  ],
  ["Works without editing templates", true, "Plain pixel only"],
]

function Cell({ value }: { value: Value }) {
  if (typeof value === "string") {
    return <span className="text-muted-foreground">{value}</span>
  }
  return value ? (
    <Check className="size-4 text-chart-2" aria-label="Yes" />
  ) : (
    <Minus className="size-4 text-muted-foreground" aria-label="No" />
  )
}

/** What each install method records, side by side. */
export function Comparison() {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b text-left text-muted-foreground text-xs">
          <th className="py-2 font-medium">Both send the same hit</th>
          <th className="w-28 py-2 font-medium">JavaScript</th>
          <th className="w-44 py-2 font-medium">Pixel</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {ROWS.map(([label, script, pixel]) => (
          <tr key={label}>
            <td className="py-2 pr-2">{label}</td>
            <td className="py-2">
              <Cell value={script} />
            </td>
            <td className="py-2">
              <Cell value={pixel} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
