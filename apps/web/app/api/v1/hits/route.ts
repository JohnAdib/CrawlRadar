import type { NextRequest } from "next/server"

// Server-side tracking API, called from the customer's middleware or CDN worker:
//
//   POST /api/v1/hits
//   Authorization: Bearer <server key>
//   { "url": "https://example.com/pricing", "user_agent": "...", "ip": "...", "referrer": "..." }
//
//   202 {"status":"recorded"|"duplicate"|"ignored"}   400 bad body   401 bad key   422 wrong domain
//
// Relayed to the `track` Edge Function, which checks the key, classifies the visitor and folds
// the hit into the same page view when the script or pixel already reported it.
const TRACK_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/track`

export async function POST(request: NextRequest) {
  const key = request.headers
    .get("authorization")
    ?.match(/^Bearer\s+(\S+)$/i)?.[1]
  if (!key)
    return Response.json(
      { error: "Send your server key as Authorization: Bearer <key>" },
      { status: 401 }
    )
  try {
    const res = await fetch(TRACK_URL, {
      method: "POST",
      headers: { "x-crawlradar-key": key, "content-type": "application/json" },
      body: (await request.text()).slice(0, 8000),
      cache: "no-store",
    })
    return new Response(res.body, {
      status: res.status,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      },
    })
  } catch (error) {
    console.error("hits: forward failed", error)
    return Response.json(
      { error: "Tracking is unavailable, try again" },
      { status: 502 }
    )
  }
}
