"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@crawlradar/ui/components/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@crawlradar/ui/components/tabs"

import { CopyBlock } from "@/components/copy-block"
import { Tag } from "@/components/head-tag"

const STEPS = [
  { id: "copy", text: "Copy the tag" },
  {
    id: "paste",
    text: (
      <>
        Paste it inside <Tag />
      </>
    ),
  },
  { id: "watch", text: "Visits show up within seconds" },
]

/** The install snippet (JavaScript, recommended) and the optional no-JavaScript pixel. */
export function InstallCard({
  domain,
  code,
  pixel,
}: {
  domain: string
  code: string
  pixel: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Install</CardTitle>
        <CardDescription>
          Paste this tag into the <Tag /> of every page on {domain}. It is a few
          hundred bytes, loads asynchronously and never blocks your page.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Tabs defaultValue="script">
          <TabsList>
            <TabsTrigger value="script">JavaScript (recommended)</TabsTrigger>
            <TabsTrigger value="pixel">Pixel only</TabsTrigger>
          </TabsList>
          <TabsContent value="script" className="flex flex-col gap-2">
            <CopyBlock code={code} label="Snippet" />
            <p className="text-muted-foreground text-xs">
              Works in the <Tag /> or just before <Tag name="/body" />. The head
              is better: it starts earlier, so it also catches crawlers that
              leave before the page finishes.
            </p>
          </TabsContent>
          <TabsContent value="pixel" className="flex flex-col gap-2">
            <CopyBlock code={pixel} label="Pixel" />
            <p className="text-muted-foreground text-xs">
              Add next to the script to also count crawlers that fetch images
              but never run JavaScript. It reads the page from the Referer
              header, so it is less precise.
            </p>
          </TabsContent>
        </Tabs>
        <ol className="grid gap-3 text-sm sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <li
              key={step.id}
              className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-background font-mono text-xs ring-1 ring-border">
                {i + 1}
              </span>
              <span className="text-muted-foreground">{step.text}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
