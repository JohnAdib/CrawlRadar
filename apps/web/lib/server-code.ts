// Server-side tracking: what a site owner adds to their server, middleware or CDN.
// Each example sends the request's page URL, user agent, IP and referer to /api/v1/hits,
// in the background, so the page is never slowed down.
import type { CodeLang } from "./highlight"

export interface ServerExample {
  id: string
  label: string
  /** Where the code goes. */
  file: string
  lang: CodeLang
  code: (origin: string, domain: string) => string
}

const nextjs = (
  origin: string
) => `import { type NextFetchEvent, type NextRequest, NextResponse } from "next/server"

export function proxy(request: NextRequest, event: NextFetchEvent) {
  event.waitUntil(
    fetch("${origin}/api/v1/hits", {
      method: "POST",
      headers: {
        authorization: \`Bearer \${process.env.CRAWLRADAR_KEY}\`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        url: request.url,
        user_agent: request.headers.get("user-agent"),
        ip: request.headers.get("x-forwarded-for"),
        referrer: request.headers.get("referer"),
      }),
    }).catch(() => {})
  )
  return NextResponse.next()
}

// Pages only: skip assets and API routes.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\\\..*).*)"],
}`

const worker = (origin: string) => `export default {
  async fetch(request, env, ctx) {
    // Pages only: skip assets like /logo.png or /app.js.
    if (!/\\.\\w+$/.test(new URL(request.url).pathname)) {
      ctx.waitUntil(
        fetch("${origin}/api/v1/hits", {
          method: "POST",
          headers: {
            authorization: \`Bearer \${env.CRAWLRADAR_KEY}\`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            url: request.url,
            user_agent: request.headers.get("user-agent"),
            ip: request.headers.get("cf-connecting-ip"),
            referrer: request.headers.get("referer"),
          }),
        }).catch(() => {})
      )
    }
    return fetch(request)
  },
}`

const curl = (
  origin: string,
  domain: string
) => `curl -X POST ${origin}/api/v1/hits \\
  -H "Authorization: Bearer $CRAWLRADAR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://${domain}/pricing", "user_agent": "Mozilla/5.0 (compatible; GPTBot/1.2; +https://openai.com/gptbot)", "ip": "203.0.113.7", "referrer": null}'

# 202 {"status":"recorded"}  a new visit
# 202 {"status":"duplicate"} the script or pixel already counted this page view
# 202 {"status":"ignored"}   an ordinary visitor, not stored`

export const SERVER_EXAMPLES: ServerExample[] = [
  {
    id: "nextjs",
    label: "Next.js",
    file: "proxy.ts (middleware.ts before Next.js 16)",
    lang: "tsx",
    code: nextjs,
  },
  {
    id: "worker",
    label: "Cloudflare Worker",
    file: "a Worker in front of your site, whatever it runs on",
    lang: "javascript",
    code: worker,
  },
  {
    id: "curl",
    label: "Any server",
    file: "any language: one POST per page request",
    lang: "shellscript",
    code: curl,
  },
]
