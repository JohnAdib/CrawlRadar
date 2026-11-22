import { expect, test } from "vitest"

import { belongsToSite, hitBelongsToSite } from "./origin.ts"

test("accepts the site's own domain and its subdomains", () => {
  expect(belongsToSite("https://test.com/pricing", "test.com")).toBe(true)
  expect(belongsToSite("https://www.test.com/", "test.com")).toBe(true)
  expect(belongsToSite("https://blog.test.com/a", "test.com")).toBe(true)
  expect(belongsToSite("http://TEST.com./", "www.test.com")).toBe(true)
})

test("rejects other domains, including look-alikes", () => {
  expect(belongsToSite("https://evil.com/", "test.com")).toBe(false)
  expect(belongsToSite("https://nottest.com/", "test.com")).toBe(false)
  expect(belongsToSite("https://test.com.evil.com/", "test.com")).toBe(false)
})

test("rejects malformed page URLs", () => {
  expect(belongsToSite("not a url", "test.com")).toBe(false)
  expect(belongsToSite("", "test.com")).toBe(false)
})

test("a hit counts only when its page and its Origin header are on the site", () => {
  const page = "https://www.test.com/pricing"
  expect(hitBelongsToSite(page, "https://www.test.com", "test.com")).toBe(true)
  // Pixels send no Origin; privacy-sensitive contexts send "null".
  expect(hitBelongsToSite(page, null, "test.com")).toBe(true)
  expect(hitBelongsToSite(page, "null", "test.com")).toBe(true)
  // Another site's script claiming to be on test.com.
  expect(hitBelongsToSite(page, "https://evil.com", "test.com")).toBe(false)
  expect(hitBelongsToSite("https://evil.com/", null, "test.com")).toBe(false)
})
