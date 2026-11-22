import { NextRequest } from "next/server"
import { afterEach, expect, test, vi } from "vitest"

vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://supabase.test")
const { POST } = await import("./route")

const fetchMock = vi.fn(
  async () => new Response('{"status":"recorded"}', { status: 202 })
)
vi.stubGlobal("fetch", fetchMock)
afterEach(() => fetchMock.mockClear())

const BODY = '{"url":"https://site.test/","user_agent":"GPTBot/1.2"}'
const hit = (headers: Record<string, string>) =>
  new NextRequest("http://app.test/api/v1/hits", {
    method: "POST",
    headers,
    body: BODY,
  })

test("relays the hit with its key and returns the track function's answer", async () => {
  const res = await POST(hit({ authorization: "Bearer crk_secret" }))
  expect(fetchMock).toHaveBeenCalledWith(
    "http://supabase.test/functions/v1/track",
    {
      method: "POST",
      headers: {
        "x-crawlradar-key": "crk_secret",
        "content-type": "application/json",
      },
      body: BODY,
      cache: "no-store",
    }
  )
  expect(res.status).toBe(202)
  expect(await res.json()).toEqual({ status: "recorded" })
})

test("rejects a request without a key before forwarding it", async () => {
  const res = await POST(hit({ authorization: "Basic abc" }))
  expect(res.status).toBe(401)
  expect(fetchMock).not.toHaveBeenCalled()
})

test("answers 502 when the tracking backend is down", async () => {
  const error = vi.spyOn(console, "error").mockImplementation(() => {})
  fetchMock.mockRejectedValueOnce(new Error("down"))
  const res = await POST(hit({ authorization: "Bearer crk_secret" }))
  expect(res.status).toBe(502)
  error.mockRestore()
})
