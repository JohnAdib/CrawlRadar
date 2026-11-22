"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@crawlradar/ui/components/tooltip"
import { cn } from "@crawlradar/ui/lib/utils"
import { Check, CircleDot, X } from "lucide-react"

/** yes, partly (with the reason), or no (with the reason). */
type Mark = true | false | string | [false, string]

const METHODS = ["Hybrid", "JavaScript", "Pixel", "Server-side"] as const

const ROWS: [string, Mark, Mark, Mark, Mark][] = [
  ["Crawlers that run JavaScript", true, true, true, true],
  [
    "Crawlers that skip JavaScript but load images",
    true,
    [false, "Without JavaScript the script never runs"],
    true,
    true,
  ],
  [
    "Crawlers that only read the HTML",
    [false, "They load neither the script nor the image"],
    [false, "They never run the script"],
    [false, "They never load the image"],
    true,
  ],
  [
    "Exact page URL, with UTM tags",
    true,
    true,
    "From the Referer header, which some browsers and bots trim",
    true,
  ],
  [
    "People sent by AI assistants",
    true,
    true,
    "ChatGPT links only (their UTM tag), when the full URL arrives",
    true,
  ],
  [
    "One paste, no code changes",
    true,
    true,
    true,
    [false, "Needs code on your server, CDN or log pipeline"],
  ],
]

type State = "yes" | "partly" | "no"

const LOOK: Record<State, { icon: typeof Check; className: string }> = {
  yes: { icon: Check, className: "text-green-600 dark:text-green-400" },
  partly: { icon: CircleDot, className: "text-amber-500" },
  no: { icon: X, className: "text-red-500" },
}

/** The state and, when there is one, the reason shown on hover. */
function read(mark: Mark): [State, string | undefined] {
  if (mark === true) return ["yes", undefined]
  if (mark === false) return ["no", undefined]
  return typeof mark === "string" ? ["partly", mark] : ["no", mark[1]]
}

function MarkIcon({ mark }: { mark: Mark }) {
  const [state, reason] = read(mark)
  const { icon: Icon, className } = LOOK[state]
  const label = reason ?? (state === "yes" ? "Yes" : "No")
  const icon = <Icon aria-label={label} className={cn("size-4", className)} />
  if (!reason) return icon
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="cursor-help rounded-sm">
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-56">{reason}</TooltipContent>
    </Tooltip>
  )
}

/** What each install method records. Server-side is planned, shown for comparison. */
export function Comparison() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[34rem] text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground text-xs">
            <th className="py-2 font-medium">What gets counted</th>
            {METHODS.map((method) => (
              <th key={method} className="w-24 py-2 text-center font-medium">
                {method}
                {method === "Server-side" && (
                  <span className="block font-normal text-[10px]">Planned</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {ROWS.map(([label, ...marks]) => (
            <tr key={label}>
              <td className="py-2 pr-2">{label}</td>
              {marks.map((mark, i) => (
                <td
                  key={METHODS[i]}
                  className={cn("py-2", i === 3 && "opacity-60")}
                >
                  <span className="flex justify-center">
                    <MarkIcon mark={mark} />
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
