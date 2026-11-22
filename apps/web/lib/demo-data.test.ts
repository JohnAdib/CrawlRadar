import { describe, expect, test } from "vitest"

import { classify } from "../../../supabase/functions/_shared/bots"

import {
  DEMO_VISITORS,
  demoClock,
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
    expect(times.every((t) => t < NOW && t > NOW - 62 * 86_400_000)).toBe(true)
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

test("every demo visitor is classified exactly as the real tracker would", () => {
  for (const v of DEMO_VISITORS) {
    expect(classify(v.user_agent, v.referrer), v.bot_name).toEqual({
      name: v.bot_name,
      platform: v.platform,
      type: v.bot_type,
    })
  }
})

describe("demoClock", () => {
  test("is 20:00 UTC on the current day, whatever the time", () => {
    for (const time of ["00:05", "12:00", "23:59"]) {
      expect(
        new Date(demoClock(Date.parse(`2026-11-22T${time}:00Z`))).toISOString()
      ).toBe("2026-11-22T20:00:00.000Z")
    }
  })

  test("today always has a full-looking day of traffic, spread across the hours", () => {
    // Just after midnight UTC used to leave today almost empty, with a pile-up at "now".
    const now = demoClock(Date.parse("2026-11-22T00:05:00Z"))
    const today = generateDemoEvents(now).filter(
      (e) => new Date(e.timestamp).getTime() >= now - 20 * 3_600_000
    )
    expect(today.length).toBeGreaterThan(50)
    expect(
      new Set(today.map((e) => new Date(e.timestamp).getUTCHours())).size
    ).toBeGreaterThan(15)
    // No pile-up: no instant holds more than a handful of visits.
    const perInstant = new Map<string, number>()
    for (const e of today) {
      perInstant.set(e.timestamp, (perInstant.get(e.timestamp) ?? 0) + 1)
    }
    expect(Math.max(...perInstant.values())).toBeLessThan(5)
  })
})
