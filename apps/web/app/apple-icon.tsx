import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

/** Home-screen icon for iOS: the CrawlRadar mark, full bleed. */
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0b1020",
      }}
    >
      <svg width="150" height="150" viewBox="0 0 64 64" aria-hidden>
        <circle
          cx="32"
          cy="32"
          r="20"
          fill="none"
          stroke="#3b82f6"
          strokeOpacity="0.45"
          strokeWidth="2.2"
        />
        <circle
          cx="32"
          cy="32"
          r="11"
          fill="none"
          stroke="#3b82f6"
          strokeOpacity="0.65"
          strokeWidth="2.2"
        />
        <path
          d="M32 32 L32 12 A20 20 0 0 1 49.32 22 Z"
          fill="#60a5fa"
          fillOpacity="0.85"
        />
        <circle cx="43.5" cy="41.5" r="2.8" fill="#60a5fa" />
        <circle cx="32" cy="32" r="3.6" fill="#ffffff" />
      </svg>
    </div>,
    size
  )
}
