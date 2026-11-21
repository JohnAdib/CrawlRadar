import assert from "node:assert/strict"
import { test } from "vitest"

import { csvCell, csvRow } from "./csv.ts"

test("quotes cells with commas, quotes and newlines", () => {
  assert.equal(
    csvCell("Mozilla/5.0 (KHTML, like Gecko)"),
    '"Mozilla/5.0 (KHTML, like Gecko)"'
  )
  assert.equal(csvCell('say "hi"'), '"say ""hi"""')
  assert.equal(csvCell("a\nb"), '"a\nb"')
})

test("leaves plain cells and empties alone", () => {
  assert.equal(csvCell("GPTBot"), "GPTBot")
  assert.equal(csvCell(null), "")
  assert.equal(csvCell(undefined), "")
  assert.equal(csvCell(42), "42")
})

test("neutralises spreadsheet formulas from untrusted input", () => {
  assert.equal(csvCell("=HYPERLINK(1)"), "'=HYPERLINK(1)")
  assert.equal(csvCell("@SUM(A1)"), "'@SUM(A1)")
})

test("builds CRLF-terminated rows", () => {
  assert.equal(csvRow(["a", "b,c", null]), 'a,"b,c",\r\n')
})
