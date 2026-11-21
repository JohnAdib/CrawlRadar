import { expect, test } from "vitest"

import { logoFor, platformColor } from "./platforms"

test("known platforms get their colour, unknown ones a neutral grey", () => {
  expect(platformColor("OpenAI")).toBe("#10a37f")
  expect(platformColor("Someone New")).toBe("#a1a1aa")
})

test("logos resolve for platforms and assistants, with mono marked", () => {
  expect(logoFor("OpenAI")).toEqual({ src: "/logos/openai.svg", mono: true })
  expect(logoFor("ChatGPT")).toEqual({ src: "/logos/openai.svg", mono: true })
  expect(logoFor("Claude")).toEqual({
    src: "/logos/claude-color.svg",
    mono: false,
  })
  expect(logoFor("Common Crawl")).toBeNull()
})
