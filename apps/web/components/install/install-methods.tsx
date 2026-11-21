"use client"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@crawlradar/ui/components/tabs"

import { CopyBlock } from "@/components/copy-block"
import { Comparison } from "@/components/install/comparison"
import { PixelPanel } from "@/components/install/pixel-panel"
import { ScriptPlacement } from "@/components/install/placement"
import { snippet } from "@/lib/snippet"

/**
 * The two ways to install: a JavaScript tag (recommended) or a pixel (an image, no
 * JavaScript). Same copy and comparison in onboarding, Settings and the demo.
 */
export function InstallMethods({
  origin,
  siteId,
}: {
  origin: string
  siteId: string
}) {
  return (
    <div className="flex flex-col gap-4">
      <Tabs defaultValue="script">
        <TabsList>
          <TabsTrigger value="script">JavaScript (recommended)</TabsTrigger>
          <TabsTrigger value="pixel">Pixel (no JavaScript)</TabsTrigger>
        </TabsList>
        <TabsContent value="script" className="flex flex-col gap-2">
          <CopyBlock code={snippet(origin, siteId)} label="Script tag" />
          <p className="text-muted-foreground text-xs">
            Paste it <ScriptPlacement /> of every page. It is a few hundred
            bytes, loads asynchronously and never slows the page. It reads the
            page URL and where the visitor came from by itself, with no template
            changes.
          </p>
        </TabsContent>
        <TabsContent value="pixel">
          <PixelPanel origin={origin} siteId={siteId} />
        </TabsContent>
      </Tabs>
      <Comparison />
    </div>
  )
}
