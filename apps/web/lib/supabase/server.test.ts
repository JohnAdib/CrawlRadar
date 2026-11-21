import { beforeEach, expect, test, vi } from "vitest"

const cookieStore = {
  getAll: vi.fn(() => [{ name: "sb", value: "1" }]),
  set: vi.fn(),
}
vi.mock("next/headers", () => ({ cookies: async () => cookieStore }))

type CookieOptions = {
  cookies: {
    getAll: () => unknown
    setAll: (
      cookies: { name: string; value: string; options: object }[]
    ) => void
  }
}
const createServerClient = vi.fn(
  (_url: string, _key: string, options: CookieOptions) => options
)
vi.mock("@supabase/ssr", () => ({ createServerClient }))

vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://supabase.test")
vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "pk")
const { createClient } = await import("./server")

beforeEach(() => vi.clearAllMocks())

test("creates a client bound to the request cookies", async () => {
  const options = (await createClient()) as unknown as CookieOptions
  expect(createServerClient).toHaveBeenCalledWith(
    "http://supabase.test",
    "pk",
    expect.any(Object)
  )
  expect(options.cookies.getAll()).toEqual([{ name: "sb", value: "1" }])
  options.cookies.setAll([{ name: "sb", value: "2", options: { path: "/" } }])
  expect(cookieStore.set).toHaveBeenCalledWith("sb", "2", { path: "/" })
})

test("ignores cookie writes where cookies are read-only", async () => {
  cookieStore.set.mockImplementationOnce(() => {
    throw new Error("read-only")
  })
  const options = (await createClient()) as unknown as CookieOptions
  expect(() =>
    options.cookies.setAll([{ name: "sb", value: "2", options: {} }])
  ).not.toThrow()
})
