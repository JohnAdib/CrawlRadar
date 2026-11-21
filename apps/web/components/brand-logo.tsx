import { cn } from "@crawlradar/ui/lib/utils"
import Image from "next/image"

import { logoFor, platformColor } from "@/lib/platforms"

/** A platform or assistant logo; brands without one get a coloured initial. */
export function BrandLogo({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const logo = logoFor(name)
  if (logo) {
    return (
      <Image
        src={logo.src}
        alt=""
        width={16}
        height={16}
        unoptimized
        className={cn("size-4 shrink-0", logo.mono && "dark:invert", className)}
      />
    )
  }
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-[4px] font-semibold text-[9px] text-white",
        className
      )}
      style={{ backgroundColor: platformColor(name) }}
    >
      {name === "Unknown" ? "?" : name.charAt(0)}
    </span>
  )
}
