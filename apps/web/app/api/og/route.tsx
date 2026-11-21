import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"

import { SITE_NAME, TAGLINE } from "@/lib/seo"

// Social preview card (1200x630), used by every page's Open Graph and Twitter metadata.
export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const title = (params.get("title") || TAGLINE).slice(0, 80)
  const subtitle = (
    params.get("subtitle") ||
    "Open-source analytics for GPTBot, ClaudeBot, PerplexityBot and every AI crawler."
  ).slice(0, 140)
  const heights = [32, 44, 38, 56, 50, 68, 62, 80, 74, 96, 88, 112]
  const bars = heights.map((h, i) => ({
    id: `bar-${i}`,
    h,
    last: i === heights.length - 1,
  }))

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#070b16",
        backgroundImage:
          "radial-gradient(circle at 85% 0%, rgba(59,130,246,0.35), transparent 55%), radial-gradient(circle at 0% 100%, rgba(168,85,247,0.18), transparent 50%)",
        color: "#f8fafc",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden>
          <rect width="64" height="64" rx="15" fill="#0b1020" />
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
        <span style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5 }}>
          {SITE_NAME}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          maxWidth: 820,
        }}
      >
        <div
          style={{
            fontSize: 66,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -2,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 28, lineHeight: 1.35, color: "#94a3b8" }}>
          {subtitle}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 12 }}>
          {["GPTBot", "ClaudeBot", "PerplexityBot"].map((bot) => (
            <div
              key={bot}
              style={{
                display: "flex",
                padding: "10px 18px",
                borderRadius: 999,
                border: "1px solid rgba(148,163,184,0.25)",
                background: "rgba(15,23,42,0.6)",
                fontSize: 22,
                color: "#cbd5e1",
              }}
            >
              {bot}
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 8,
            height: 120,
          }}
        >
          {bars.map(({ id, h, last }) => (
            <div
              key={id}
              style={{
                width: 14,
                height: h,
                borderRadius: 4,
                background: last ? "#60a5fa" : "rgba(59,130,246,0.45)",
              }}
            />
          ))}
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 }
  )
}
