import { expect, test } from "vitest"

import { highlight } from "./highlight"

test("colours each token for both themes and keeps the code intact", async () => {
  const code =
    '<script async src="https://app.test/t.js?s=abc"></script>\n<noscript></noscript>'
  const lines = await highlight(code, "html")
  expect(lines).toHaveLength(2)
  expect(
    lines.map((line) => line.map((t) => t.content).join("")).join("\n")
  ).toBe(code)
  const tag = lines[0]!.find((t) => t.content === "script")!
  expect(tag.htmlStyle).toEqual({
    "--shiki-light": expect.stringMatching(/^#/),
    "--shiki-dark": expect.stringMatching(/^#/),
  })
})

test("handles every language the install examples use", async () => {
  for (const [lang, code] of [
    ["tsx", "export const config = { matcher: [] }"],
    ["javascript", "export default { async fetch() {} }"],
    ["shellscript", 'curl -X POST https://app.test -H "x: y"'],
  ] as const) {
    const lines = await highlight(code, lang)
    expect(lines.flat().length, lang).toBeGreaterThan(1)
  }
})
