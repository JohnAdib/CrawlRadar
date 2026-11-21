import { expect, test } from "vitest"

import { toCsv } from "./csv"

const COLUMNS = ["bot_name", "user_agent", "referrer"] as const

test("writes a header and quotes cells with commas, quotes and newlines", () => {
  const csv = toCsv(COLUMNS, [
    {
      bot_name: "GPTBot",
      user_agent: "Mozilla/5.0 (KHTML, like Gecko)",
      referrer: null,
    },
    { bot_name: 'say "hi"', user_agent: "a\nb", referrer: undefined },
  ])
  expect(csv).toBe(
    'bot_name,user_agent,referrer\r\nGPTBot,"Mozilla/5.0 (KHTML, like Gecko)",\r\n"say ""hi""","a\nb",\r\n'
  )
})

test("neutralises spreadsheet formulas from untrusted input", () => {
  const csv = toCsv(
    COLUMNS,
    [{ bot_name: "=HYPERLINK(1)", user_agent: "@SUM(A1)" }],
    false
  )
  expect(csv).toBe(`"'=HYPERLINK(1)","'@SUM(A1)",\r\n`)
})

test("returns nothing for an empty page without a header", () => {
  expect(toCsv(COLUMNS, [], false)).toBe("")
  expect(toCsv(COLUMNS, [])).toBe("bot_name,user_agent,referrer\r\n")
})
