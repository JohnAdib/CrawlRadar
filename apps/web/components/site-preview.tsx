"use client"

import { Skeleton } from "@crawlradar/ui/components/skeleton"
import { cn } from "@crawlradar/ui/lib/utils"
import { Globe } from "lucide-react"
import { useState } from "react"

// Public services: a screenshot of the site's home page, with its favicon as fallback.
const screenshotUrl = (domain: string) =>
  `https://api.microlink.io/?${new URLSearchParams({
    url: `https://${domain}`,
    screenshot: "true",
    meta: "false",
    embed: "screenshot.url",
    "viewport.width": "1280",
    "viewport.height": "800",
  })}`
export const faviconUrl = (domain: string, size = 64) =>
  `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`

/** Site favicon, falling back to a globe icon. */
export function Favicon({
  domain,
  className,
}: {
  domain: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  if (failed) return <Globe className={cn("size-4", className)} />
  return (
    // biome-ignore lint/performance/noImgElement: external favicon service, not a local asset
    <img
      src={faviconUrl(domain)}
      alt=""
      className={cn("size-4 rounded-sm", className)}
      onError={() => setFailed(true)}
    />
  )
}

/** A screenshot of the site's home page; shows a skeleton while loading and the favicon if it fails. */
export function SitePreview({
  domain,
  className,
}: {
  domain: string
  className?: string
}) {
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading")

  return (
    <div
      className={cn(
        "relative aspect-[16/10] overflow-hidden bg-muted/60",
        className
      )}
    >
      {state === "loading" && (
        <Skeleton className="absolute inset-0 rounded-none" />
      )}
      {state === "failed" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_center,var(--muted),transparent)]">
          <span className="flex size-14 items-center justify-center rounded-2xl border bg-background shadow-sm">
            <Favicon domain={domain} className="size-7" />
          </span>
        </div>
      ) : (
        // biome-ignore lint/performance/noImgElement: external screenshot service, not a local asset
        <img
          src={screenshotUrl(domain)}
          alt={`Home page of ${domain}`}
          loading="lazy"
          className={cn(
            "absolute inset-0 size-full object-cover object-top transition-opacity duration-500",
            state === "ready" ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setState("ready")}
          onError={() => setState("failed")}
        />
      )}
    </div>
  )
}
