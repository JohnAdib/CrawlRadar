import { headers } from "next/headers"

/** Public origin of this dashboard (e.g. https://crawlradar.vercel.app), from the request. */
export async function appOrigin(): Promise<string> {
  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000"
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https")
  return `${proto}://${host}`
}

/** The one tag a site owner pastes into their <head>. */
export function snippet(origin: string, siteId: string): string {
  return `<script async src="${origin}/t.js?s=${siteId}"></script>`
}
