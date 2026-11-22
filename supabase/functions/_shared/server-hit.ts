// Server-side tracking: the customer's server (middleware, CDN worker) reports each request
// to POST /api/v1/hits with the site's secret key. Unlike the script, the user agent and IP
// come from the payload, which is why the key is required.

/** The install method that reported a hit. */
export type Source = "script" | "pixel" | "server"

export interface ServerHit {
  url: string
  userAgent: string
  ip: string | null
  referrer: string | null
}

const text = (value: unknown, max: number): string | null =>
  typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null

/** The hit in a request body, validated and length-capped, or what is wrong with it. */
export function parseServerHit(body: string): ServerHit | { error: string } {
  let data: unknown
  try {
    data = JSON.parse(body)
  } catch {
    return { error: "Send a JSON body" }
  }
  if (!data || typeof data !== "object") return { error: "Send a JSON object" }
  const fields = data as Record<string, unknown>
  const url = text(fields.url, 2000)
  if (!url || !/^https?:\/\//i.test(url))
    return {
      error:
        "`url` must be the full page URL, like https://example.com/pricing",
    }
  const userAgent = text(fields.user_agent, 1000)
  if (!userAgent) return { error: "`user_agent` is required" }
  return {
    url,
    userAgent,
    // An x-forwarded-for value may list proxies after the visitor: keep the visitor.
    ip: text(fields.ip, 200)?.split(",")[0]?.trim() || null,
    referrer: text(fields.referrer, 2000),
  }
}

/** Which method sent a browser hit: the beacon POST and its image fallback (t=js) are the script. */
export function browserSource(method: string, t: string | null): Source {
  return method === "POST" || t === "js" ? "script" : "pixel"
}

/** Hex SHA-256: how server keys and IPs are stored. */
export async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  )
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0")
  ).join("")
}
