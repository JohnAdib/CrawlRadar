import { describe, expect, test } from "vitest"

import {
  DEMO_VISITORS,
  generateDemoEvents,
  pick,
  seededRandom,
} from "./demo-data"

const NOW = new Date("2026-01-31T12:00:00Z").getTime()

describe("seededRandom", () => {
  test("is deterministic and stays in [0, 1)", () => {
    const a = seededRandom(1)
    const b = seededRandom(1)
    const values = Array.from({ length: 100 }, () => a())
    expect(values).toEqual(Array.from({ length: 100 }, () => b()))
    expect(values.every((v) => v >= 0 && v < 1)).toBe(true)
  })
})

describe("pick", () => {
  test("respects weights", () => {
    expect(
      pick(
        ["a", "b"],
        (x) => (x === "a" ? 1 : 0),
        () => 0.5
      )
    ).toBe("a")
  })
  test("falls back to the last item at the upper edge", () => {
    expect(
      pick(
        ["a", "b"],
        () => 1,
        () => 1
      )
    ).toBe("b")
  })
})

describe("generateDemoEvents", () => {
  const events = generateDemoEvents(NOW, 500)

  test("is deterministic for the same clock and seed", () => {
    expect(generateDemoEvents(NOW, 500)).toEqual(events)
  })

  test("produces sorted events in the 60 days before now", () => {
    expect(events).toHaveLength(500)
    const times = events.map((e) => new Date(e.timestamp).getTime())
    expect(times.every((t) => t < NOW && t > NOW - 61 * 86_400_000)).toBe(true)
    expect([...times].sort((x, y) => y - x)).toEqual(times)
  })

  test("only uses known visitors, and referrals carry a referrer", () => {
    const names = new Set(DEMO_VISITORS.map((v) => v.bot_name))
    expect(events.every((e) => names.has(e.bot_name))).toBe(true)
    expect(
      events.filter((e) => e.bot_type === "referral").every((e) => e.referrer)
    ).toBe(true)
    expect(
      events
        .filter((e) => e.bot_type !== "referral")
        .every((e) => e.referrer === null)
    ).toBe(true)
  })

  test("uses the default size", () => {
    expect(generateDemoEvents(NOW)).toHaveLength(4000)
  })
})
