import type { NextRequest } from "next/server"

// Public collection endpoint on the dashboard's own domain, used by /t.js and the pixel.
// It relays each hit to the `track` Supabase Edge Function, which classifies and stores it,
// so the ingest logic lives in one place and the dashboard needs no service-role key.
//   POST (the JavaScript tag's beacon): form-encoded body, relayed as a POST.
//   GET  (the pixel): fields in the query string, answered with a 1x1 GIF.
const TRACK_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/track`

const PIXEL = Uint8Array.from(
  atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"),
  (c) => c.charCodeAt(0)
)
const NO_CACHE = {
  "cache-control": "no-store, max-age=0",
  "access-control-allow-origin": "*",
}

/** The visitor's UA, IP and referer: the track function classifies from these. */
function visitorHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {
    "user-agent": request.headers.get("user-agent") ?? "",
  }
  const ip =
    request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip")
  if (ip) headers["x-forwarded-for"] = ip
  const referer = request.headers.get("referer")
  if (referer) headers.referer = referer
  return headers
}

/** Relays one hit. Never throws: tracking must not break the customer's page. */
async function relay(url: string, init: RequestInit): Promise<void> {
  try {
    await fetch(url, { ...init, cache: "no-store" })
  } catch (error) {
    console.error("collect: forward failed", error)
  }
}

export async function GET(request: NextRequest) {
  await relay(TRACK_URL + request.nextUrl.search, {
    headers: visitorHeaders(request),
  })
  return new Response(PIXEL, {
    headers: { ...NO_CACHE, "content-type": "image/gif" },
  })
}

export async function POST(request: NextRequest) {
  await relay(TRACK_URL, {
    method: "POST",
    headers: {
      ...visitorHeaders(request),
      "content-type": "application/x-www-form-urlencoded",
    },
    body: (await request.text()).slice(0, 8000),
  })
  return new Response(null, { status: 204, headers: NO_CACHE })
}
