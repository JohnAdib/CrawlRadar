import { expect, test } from "vitest"

import { browserSource, parseServerHit, sha256 } from "./server-hit.ts"

const body = (fields: object) => JSON.stringify(fields)

test("reads a server-side hit, trimming and length-capping every field", () => {
  expect(
    parseServerHit(
      body({
        url: "https://example.com/pricing?utm_source=chatgpt.com",
        user_agent: " GPTBot/1.2 ",
        ip: "203.0.113.7, 10.0.0.1",
        referrer: "https://chatgpt.com/",
      })
    )
  ).toEqual({
    url: "https://example.com/pricing?utm_source=chatgpt.com",
    userAgent: "GPTBot/1.2",
    ip: "203.0.113.7",
    referrer: "https://chatgpt.com/",
  })
  const long = parseServerHit(
    body({
      url: `https://example.com/${"a".repeat(3000)}`,
      user_agent: "x".repeat(2000),
    })
  )
  expect(long).toMatchObject({ ip: null, referrer: null })
  expect("url" in long && long.url.length).toBe(2000)
  expect("userAgent" in long && long.userAgent.length).toBe(1000)
})

test("explains what is wrong with a bad body", () => {
  expect(parseServerHit("not json")).toEqual({ error: "Send a JSON body" })
  expect(parseServerHit("null")).toEqual({ error: "Send a JSON object" })
  expect(
    parseServerHit(body({ url: "/pricing", user_agent: "GPTBot" }))
  ).toMatchObject({
    error: expect.stringContaining("full page URL"),
  })
  expect(
    parseServerHit(body({ url: "https://example.com/", user_agent: 42 }))
  ).toEqual({
    error: "`user_agent` is required",
  })
})

test("tells the script's hits from the pixel's", () => {
  expect(browserSource("POST", null)).toBe("script")
  expect(browserSource("GET", "js")).toBe("script")
  expect(browserSource("GET", "img")).toBe("pixel")
  expect(browserSource("GET", null)).toBe("pixel")
})

test("hashes like sha256sum", async () => {
  expect(await sha256("abc")).toBe(
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
  )
})
