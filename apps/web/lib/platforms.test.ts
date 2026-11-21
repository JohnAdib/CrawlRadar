import { expect, test } from "vitest"

import { platformColor } from "./platforms"

test("known platforms get their colour, unknown ones a neutral grey", () => {
  expect(platformColor("OpenAI")).toBe("#10a37f")
  expect(platformColor("Someone New")).toBe("#a1a1aa")
})
