import { expect, test } from "vitest"

import { formatNumber, timeAgo, visits } from "./format"

const NOW = new Date("2026-01-31T12:00:00Z").getTime()

test("timeAgo picks the largest whole unit", () => {
  expect(timeAgo("2026-01-29T12:00:00Z", NOW)).toBe("2 days ago")
  expect(timeAgo("2026-01-31T09:00:00Z", NOW)).toBe("3 hours ago")
  expect(timeAgo("2026-01-31T11:55:00Z", NOW)).toBe("5 minutes ago")
  expect(timeAgo("2026-01-31T11:59:30Z", NOW)).toBe("just now")
})

test("timeAgo defaults to the current time", () => {
  expect(timeAgo(new Date().toISOString())).toBe("just now")
})

test("formatNumber adds thousands separators", () => {
  expect(formatNumber(12480)).toBe("12,480")
})

test("visits pluralises", () => {
  expect(visits(1)).toBe("1 visit")
  expect(visits(0)).toBe("0 visits")
  expect(visits(2500)).toBe("2,500 visits")
})
