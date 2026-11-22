import { describe, expect, test } from "vitest"

import { ogImage, privatePagePreview, safeNext, siteUrl } from "./seo"

describe("siteUrl", () => {
  test("prefers an explicit site URL, without a trailing slash", () => {
    expect(siteUrl({ NEXT_PUBLIC_SITE_URL: "https://radar.example/" })).toBe(
      "https://radar.example"
    )
  })
  test("falls back to the Vercel production URL, then localhost", () => {
    expect(
      siteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "crawlradar.vercel.app" })
    ).toBe("https://crawlradar.vercel.app")
    expect(siteUrl({})).toBe("http://localhost:3000")
  })
  test("reads the process environment by default", () => {
    expect(siteUrl()).toMatch(/^https?:\/\//)
  })
})

test("ogImage builds the preview image path", () => {
  expect(ogImage("Sign in")).toBe("/api/og?title=Sign+in")
  expect(ogImage("Dashboard", "AI crawlers")).toBe(
    "/api/og?title=Dashboard&subtitle=AI+crawlers"
  )
})

describe("privatePagePreview", () => {
  test("describes private pages without revealing their data", () => {
    expect(privatePagePreview("/sites/abc").title).toBe("A site on CrawlRadar")
    expect(privatePagePreview("/sites").title).toBe("Your sites on CrawlRadar")
    expect(privatePagePreview("/dashboard?site=x").title).toBe(
      "AI crawler dashboard"
    )
    expect(privatePagePreview(undefined).title).toBe("Sign in")
  })
})

describe("safeNext", () => {
  test("allows same-site paths only", () => {
    expect(safeNext("/sites/abc")).toBe("/sites/abc")
    expect(safeNext("/dashboard?site=1#top")).toBe("/dashboard?site=1#top")
    expect(safeNext("//evil.com")).toBe("/dashboard")
    expect(safeNext("/\\evil.com")).toBe("/dashboard")
    expect(safeNext("/\t/evil.com")).toBe("/dashboard")
    expect(safeNext("https://evil.com")).toBe("/dashboard")
    expect(safeNext(null)).toBe("/dashboard")
  })
})
