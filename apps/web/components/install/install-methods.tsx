"use client"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@crawlradar/ui/components/tabs"

import { CopyBlock } from "@/components/copy-block"
import { Comparison } from "@/components/install/comparison"
import { PixelPlacement, ScriptPlacement } from "@/components/install/placement"
import { hybrid, pixel, snippet } from "@/lib/snippet"

const METHODS = [
  {
    id: "hybrid",
    tab: "Hybrid (recommended)",
    code: hybrid,
    where: <PixelPlacement />,
    about:
      "The script reads the page URL, UTM tags and where the visitor came from, and sends them. Where JavaScript doesn't run, the pixel inside <noscript> is loaded instead, so no visit is counted twice.",
  },
  {
    id: "script",
    tab: "JavaScript",
    code: snippet,
    where: <ScriptPlacement />,
    about:
      "A few hundred bytes, loaded asynchronously. Sends the exact page and referrer, but only for visitors that run JavaScript.",
  },
  {
    id: "pixel",
    tab: "Pixel",
    code: pixel,
    where: <PixelPlacement />,
    about:
      "A 1×1 image, no JavaScript. The page comes from the browser's Referer header, so where the visitor came from is unknown.",
  },
] as const

/** The three ways to install, with what each records. Same in onboarding, Settings and the demo. */
export function InstallMethods({
  origin,
  siteId,
}: {
  origin: string
  siteId: string
}) {
  return (
    <div className="flex flex-col gap-4">
      <Tabs defaultValue="hybrid">
        <TabsList>
          {METHODS.map((m) => (
            <TabsTrigger key={m.id} value={m.id}>
              {m.tab}
            </TabsTrigger>
          ))}
        </TabsList>
        {METHODS.map((m) => (
          <TabsContent key={m.id} value={m.id} className="flex flex-col gap-2">
            <CopyBlock code={m.code(origin, siteId)} label="Tracking code" />
            <p className="text-muted-foreground text-xs">
              Paste it {m.where} of every page. {m.about}
            </p>
          </TabsContent>
        ))}
      </Tabs>
      <Comparison />
    </div>
  )
}
