import { expect, test } from "vitest"

import { SERVER_EXAMPLES } from "./server-code"

test("every example posts the request to the hits API with the server key", () => {
  for (const example of SERVER_EXAMPLES) {
    const code = example.code("https://app.test", "example.com")
    expect(code, example.id).toContain("https://app.test/api/v1/hits")
    expect(code, example.id).toContain("CRAWLRADAR_KEY")
    for (const field of ["url", "user_agent", "ip", "referrer"]) {
      expect(code, `${example.id}: ${field}`).toMatch(
        new RegExp(`"?${field}"?:`)
      )
    }
  }
})

test("the code runs in the background and only for pages", () => {
  const [nextjs, worker, curl] = SERVER_EXAMPLES.map((e) =>
    e.code("https://app.test", "example.com")
  )
  expect(nextjs).toContain("event.waitUntil(")
  expect(nextjs).toContain(
    'matcher: ["/((?!api|_next/static|_next/image|.*\\\\..*).*)"]'
  )
  expect(worker).toContain("ctx.waitUntil(")
  expect(worker).toContain("if (!/\\.\\w+$/.test(")
  expect(curl).toContain('"url": "https://example.com/pricing"')
})
