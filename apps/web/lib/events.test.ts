import { expect, test } from "vitest"

import { afterCursor, cursorOf, hasMore } from "./events"

const event = {
  id: "0b1c2d3e-0000-4000-8000-000000000001",
  timestamp: "2026-11-21T10:00:00.123+00:00",
  bot_name: "GPTBot",
}

test("the cursor is the last event's time and id", () => {
  expect(cursorOf(event)).toEqual({ id: event.id, timestamp: event.timestamp })
})

test("selects strictly older events, breaking ties on id", () => {
  expect(afterCursor(event)).toBe(
    `timestamp.lt."2026-11-21T10:00:00.123+00:00",and(timestamp.eq."2026-11-21T10:00:00.123+00:00",id.lt.${event.id})`
  )
})

test("cannot be used to inject other filters", () => {
  const filter = afterCursor({ timestamp: 'x",id.gt.0', id: "1),or(a.eq.b" })
  expect(filter).toBe('timestamp.lt."..0",and(timestamp.eq."..0",id.lt.1aeb)')
})

test("a full batch means there may be more", () => {
  expect(hasMore(50, 50)).toBe(true)
  expect(hasMore(12, 50)).toBe(false)
})
