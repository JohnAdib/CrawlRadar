import { NextRequest } from "next/server"
import { afterEach, expect, test, vi } from "vitest"

vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://supabase.test")
const { GET } = await import("./route")

const fetchMock = vi.fn(async () => new Response(""))
vi.stubGlobal("fetch", fetchMock)
afterEach(() => fetchMock.mockClear())

function request(headers: Record<string, string> = {}) {
  return new NextRequest(
    "http://app.test/api/collect?sid=abc&u=https%3A%2F%2Fsite.test%2F",
    {
      headers,
    }
  )
}

test("forwards the hit with the visitor's UA, IP and referer, and returns a pixel", async () => {
  const res = await GET(
    request({
      "user-agent": "GPTBot/1.2",
      "x-forwarded-for": "1.2.3.4",
      referer: "https://site.test/",
    })
  )
  expect(fetchMock).toHaveBeenCalledWith(
    "http://supabase.test/functions/v1/track?sid=abc&u=https%3A%2F%2Fsite.test%2F",
    {
      headers: {
        "user-agent": "GPTBot/1.2",
        "x-forwarded-for": "1.2.3.4",
        referer: "https://site.test/",
      },
      cache: "no-store",
    }
  )
  expect(res.status).toBe(200)
  expect(res.headers.get("content-type")).toBe("image/gif")
  expect(res.headers.get("cache-control")).toContain("no-store")
})

test("falls back to x-real-ip and omits missing headers", async () => {
  await GET(request({ "x-real-ip": "5.6.7.8" }))
  expect(fetchMock).toHaveBeenCalledWith(expect.any(String), {
    headers: { "user-agent": "", "x-forwarded-for": "5.6.7.8" },
    cache: "no-store",
  })
  await GET(request())
  expect(fetchMock).toHaveBeenLastCalledWith(expect.any(String), {
    headers: { "user-agent": "" },
    cache: "no-store",
  })
})

test("still answers when the tracking backend is down", async () => {
  const error = vi.spyOn(console, "error").mockImplementation(() => {})
  fetchMock.mockRejectedValueOnce(new Error("down"))
  const res = await GET(request())
  expect(res.status).toBe(200)
  expect(error).toHaveBeenCalled()
  error.mockRestore()
})
