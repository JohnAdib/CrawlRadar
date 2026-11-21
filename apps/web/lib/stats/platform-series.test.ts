import { expect, test } from "vitest"

import { platformSeries } from "./platform-series"
import type { TimelinePoint } from "./types"

const point = (bucket: string): TimelinePoint => ({
  bucket,
  visits: 0,
  training: 0,
  search: 0,
  assistant: 0,
  referral: 0,
  search_engine: 0,
  unknown: 0,
})
const timeline = [point("d1"), point("d2")]

test("one series per platform, busiest first, filled with zeros", () => {
  const { series, rows } = platformSeries(timeline, [
    { bucket: "d1", platform: "Anthropic", visits: 2 },
    { bucket: "d2", platform: "OpenAI", visits: 5 },
  ])
  expect(series).toEqual([
    { key: "p0", label: "OpenAI" },
    { key: "p1", label: "Anthropic" },
  ])
  expect(rows).toEqual([
    { bucket: "d1", p0: 0, p1: 2 },
    { bucket: "d2", p0: 5, p1: 0 },
  ])
})

test("folds platforms beyond the top N into Other and skips unknown buckets", () => {
  const { series, rows } = platformSeries(
    timeline,
    [
      { bucket: "d1", platform: "A", visits: 3 },
      { bucket: "d1", platform: "B", visits: 2 },
      { bucket: "d1", platform: "C", visits: 1 },
      { bucket: "zz", platform: "A", visits: 9 },
    ],
    1
  )
  expect(series.map((s) => s.label)).toEqual(["A", "Other"])
  expect(rows[0]).toEqual({ bucket: "d1", p0: 3, other: 3 })
})

test("platforms with equal totals are ordered by name", () => {
  const { series } = platformSeries(timeline, [
    { bucket: "d1", platform: "Zeta", visits: 1 },
    { bucket: "d1", platform: "Alpha", visits: 1 },
  ])
  expect(series.map((s) => s.label)).toEqual(["Alpha", "Zeta"])
})
