"use client"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@crawlradar/ui/components/tabs"
import { Check, Minus } from "lucide-react"

import { CopyBlock } from "@/components/copy-block"
import { Tag } from "@/components/head-tag"
import { PixelPlacement, ScriptPlacement } from "@/components/install/placement"

const COMPARE: [string, boolean | string, boolean | string][] = [
  ["Counts crawlers that run JavaScript", true, true],
  ["Counts crawlers that skip JavaScript", false, true],
  ["Exact page URL", true, "From the Referer header"],
  ["Counts people sent by ChatGPT and other assistants", true, false],
]

function Cell({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="text-muted-foreground">{value}</span>
  }
  return value ? (
    <Check className="size-4 text-chart-2" aria-label="Yes" />
  ) : (
    <Minus className="size-4 text-muted-foreground" aria-label="No" />
  )
}

/** What each method records, side by side. */
function Comparison() {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b text-left text-muted-foreground text-xs">
          <th className="py-2 font-medium">Both send the same hit</th>
          <th className="w-28 py-2 font-medium">JavaScript</th>
          <th className="w-36 py-2 font-medium">Pixel</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {COMPARE.map(([label, script, pixel]) => (
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

/**
 * The two ways to install: a JavaScript tag (recommended) or a pixel (an image, no
 * JavaScript). Same copy and comparison in onboarding and in Settings.
 */
export function InstallMethods({
  code,
  pixel,
}: {
  code: string
  pixel: string
}) {
  return (
    <div className="flex flex-col gap-4">
      <Tabs defaultValue="script">
        <TabsList>
          <TabsTrigger value="script">JavaScript (recommended)</TabsTrigger>
          <TabsTrigger value="pixel">Pixel (no JavaScript)</TabsTrigger>
        </TabsList>
        <TabsContent value="script" className="flex flex-col gap-2">
          <CopyBlock code={code} label="Script tag" />
          <p className="text-muted-foreground text-xs">
            Paste it <ScriptPlacement /> of every page. It is a few hundred
            bytes, loads asynchronously and never slows the page.
          </p>
        </TabsContent>
        <TabsContent value="pixel" className="flex flex-col gap-2">
          <CopyBlock code={pixel} label="Pixel" />
          <p className="text-muted-foreground text-xs">
            Paste it <PixelPlacement /> of every page. Use one method; to use
            both, wrap the pixel in <Tag name="noscript" /> so visits
            aren&apos;t counted twice.
          </p>
        </TabsContent>
      </Tabs>
      <Comparison />
    </div>
  )
}
