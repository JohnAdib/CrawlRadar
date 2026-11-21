import type { NextRequest } from "next/server"

// Public collection endpoint on the dashboard's own domain, used by /t.js.
// It forwards to the `track` Supabase Edge Function, which classifies and stores the hit,
// so the ingest logic lives in one place and the dashboard needs no service-role key.
const TRACK_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/track`

const PIXEL = Uint8Array.from(
  atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"),
  (c) => c.charCodeAt(0)
)

export async function GET(request: NextRequest) {
  const forwarded: Record<string, string> = {
    "user-agent": request.headers.get("user-agent") ?? "",
  }
  const ip =
    request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip")
  if (ip) forwarded["x-forwarded-for"] = ip
  const referer = request.headers.get("referer")
  if (referer) forwarded.referer = referer

  try {
    await fetch(TRACK_URL + request.nextUrl.search, {
      headers: forwarded,
      cache: "no-store",
    })
  } catch (error) {
    // Never break the customer's page because tracking is down.
    console.error("collect: forward failed", error)
  }

  return new Response(PIXEL, {
    headers: {
      "content-type": "image/gif",
      "cache-control": "no-store, max-age=0",
      "access-control-allow-origin": "*",
    },
  })
}
