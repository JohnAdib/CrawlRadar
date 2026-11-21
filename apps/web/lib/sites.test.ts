import { expect, test } from "vitest"

import { siteActivity } from "./sites"

/** A chainable stand-in for the supabase-js query builder. */
function fakeClient(last: unknown, count: number | null) {
  const query = (result: unknown) => {
    const chain = {
      select: () => chain,
      eq: () => chain,
      gte: () => Promise.resolve(result),
      order: () => chain,
      limit: () => chain,
      maybeSingle: () => Promise.resolve(result),
    }
    return chain
  }
  let call = 0
  return {
    from: () => (call++ === 0 ? query({ data: last }) : query({ count })),
  } as unknown as Parameters<typeof siteActivity>[0]
}

test("returns the last hit and 30-day visit count", async () => {
  const client = fakeClient({ timestamp: "2026-01-31T10:00:00Z" }, 42)
  expect(await siteActivity(client, "site")).toEqual({
    lastSeen: "2026-01-31T10:00:00Z",
    visits30d: 42,
  })
})

test("handles a site with no data", async () => {
  expect(await siteActivity(fakeClient(null, null), "site")).toEqual({
    lastSeen: null,
    visits30d: 0,
  })
})
