import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { parseFilters, RANGES, sinceFor, toQuery } from "./filters"

describe("parseFilters", () => {
  test("defaults to 7 days with no filters", () => {
    expect(parseFilters({})).toEqual({
      site: undefined,
      range: "7d",
      platform: undefined,
      type: undefined,
    })
  })

  test("reads valid values", () => {
    expect(
      parseFilters({
        site: "s1",
        range: "24h",
        platform: "OpenAI",
        type: "search",
      })
    ).toEqual({ site: "s1", range: "24h", platform: "OpenAI", type: "search" })
  })

  test("takes the first value of repeated params and ignores empty ones", () => {
    expect(parseFilters({ range: ["30d", "7d"], platform: "" })).toMatchObject({
      range: "30d",
      platform: undefined,
    })
  })

  test("rejects unknown ranges and bot types", () => {
    expect(parseFilters({ range: "1y", type: "evil" })).toMatchObject({
      range: "7d",
      type: undefined,
    })
  })
})

describe("sinceFor", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-01-31T12:00:00Z"))
  })
  afterEach(() => vi.useRealTimers())

  test("subtracts the range from now", () => {
    expect(sinceFor("24h")).toBe("2026-01-30T12:00:00.000Z")
    expect(new Date(sinceFor("30d")).getTime()).toBe(
      Date.now() - RANGES["30d"].ms
    )
  })
})

describe("toQuery", () => {
  test("serialises only set values", () => {
    expect(toQuery({ site: "a b", range: "7d", platform: undefined })).toBe(
      "?site=a+b&range=7d"
    )
  })

  test("returns an empty string when nothing is set", () => {
    expect(toQuery({})).toBe("")
  })
})
