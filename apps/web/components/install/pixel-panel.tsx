"use client"

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@crawlradar/ui/components/toggle-group"
import { useState } from "react"

import { CopyBlock } from "@/components/copy-block"
import { Tag } from "@/components/head-tag"
import { PixelPlacement } from "@/components/install/placement"
import { type PixelTemplate, pixel, pixelWithPage } from "@/lib/snippet"

type Variant = "plain" | PixelTemplate

const VARIANTS: { id: Variant; label: string; note: React.ReactNode }[] = [
  {
    id: "wordpress",
    label: "WordPress",
    note: "In WordPress that's your theme's footer.php, where PHP fills in each page's URL.",
  },
  {
    id: "shopify",
    label: "Shopify",
    note: "In Shopify that's theme.liquid, where Liquid fills in each page's URL.",
  },
  {
    id: "any",
    label: "Any template",
    note: (
      <>
        Replace <code>PAGE_URL</code> with your template&apos;s URL-encoded full
        page URL. Uncached pages can also pass the visitor&apos;s referrer as{" "}
        <code>&amp;r=</code>.
      </>
    ),
  },
  {
    id: "plain",
    label: "Plain HTML",
    note: "The same tag on every page: the page URL then comes from the browser's Referer header, which some browsers and bots trim or leave out.",
  },
]

/**
 * The pixel: an image whose link carries the page URL (`u=`), filled in by the site's
 * template, or the plain version for static HTML.
 */
export function PixelPanel({
  origin,
  siteId,
}: {
  origin: string
  siteId: string
}) {
  const [variant, setVariant] = useState<Variant>("wordpress")
  const code =
    variant === "plain"
      ? pixel(origin, siteId)
      : pixelWithPage(origin, siteId, variant)
  const note = VARIANTS.find((v) => v.id === variant)!.note
  return (
    <div className="flex flex-col gap-2">
      <ToggleGroup
        type="single"
        size="sm"
        variant="outline"
        value={variant}
        onValueChange={(v) => v && setVariant(v as Variant)}
        aria-label="Your site is built with"
        className="flex-wrap self-start"
      >
        {VARIANTS.map((v) => (
          <ToggleGroupItem key={v.id} value={v.id} className="px-3">
            {v.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <CopyBlock code={code} label="Pixel" />
      <p className="text-muted-foreground text-xs">
        Paste it <PixelPlacement /> of every page. {note} Using the script too?
        Wrap the pixel in <Tag name="noscript" /> so visits aren&apos;t counted
        twice.
      </p>
    </div>
  )
}
