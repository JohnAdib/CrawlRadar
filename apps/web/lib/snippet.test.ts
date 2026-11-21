import { beforeEach, expect, test, vi } from "vitest"

const headerValues = new Map<string, string>()
vi.mock("next/headers", () => ({
  headers: async () => ({
    get: (name: string) => headerValues.get(name) ?? null,
  }),
}))

const { appOrigin } = await import("./origin")
const { pixel, snippet } = await import("./snippet")

beforeEach(() => headerValues.clear())

test("uses the forwarded host and protocol behind a proxy", async () => {
  headerValues.set("x-forwarded-host", "crawlradar.example")
  headerValues.set("x-forwarded-proto", "https")
  headerValues.set("host", "internal:8080")
  expect(await appOrigin()).toBe("https://crawlradar.example")
})

test("assumes http for localhost and https elsewhere", async () => {
  headerValues.set("host", "localhost:3000")
  expect(await appOrigin()).toBe("http://localhost:3000")
  headerValues.set("host", "crawlradar.example")
  expect(await appOrigin()).toBe("https://crawlradar.example")
})

test("falls back to localhost when no host is known", async () => {
  expect(await appOrigin()).toBe("http://localhost:3000")
})

test("builds the one-line snippet", () => {
  expect(snippet("https://app.test", "abc")).toBe(
    '<script async src="https://app.test/t.js?s=abc"></script>'
  )
})

test("builds the no-JavaScript pixel", () => {
  const tag = pixel("https://app.test", "abc")
  expect(tag).toContain('src="https://app.test/api/collect?t=img&sid=abc"')
  expect(tag.startsWith("<img ")).toBe(true)
  expect(tag).toContain('referrerpolicy="no-referrer-when-downgrade"')
})
