import { expect, test } from "vitest"

import { isPublicAddress, isPublicHost, pageHasSnippet } from "./install-check"

test("allows public addresses only", () => {
  for (const address of ["93.184.216.34", "2606:4700::6810:84e5"]) {
    expect(isPublicAddress(address), address).toBe(true)
  }
  for (const address of [
    "127.0.0.1",
    "10.1.2.3",
    "169.254.169.254",
    "172.20.0.1",
    "192.168.1.1",
    "100.64.0.1",
    "0.0.0.0",
    "::1",
    "fd00::1",
    "fe80::1",
    "::ffff:127.0.0.1",
  ]) {
    expect(isPublicAddress(address), address).toBe(false)
  }
})

test("allows public hostnames only", () => {
  expect(isPublicHost("example.com")).toBe(true)
  expect(isPublicHost("blog.example.co.uk.")).toBe(true)
  for (const host of [
    "localhost",
    "printer.local",
    "db.internal",
    "127.0.0.1",
    "10.0.0.5",
    "[::1]",
    "intranet",
  ]) {
    expect(isPublicHost(host), host).toBe(false)
  }
})

test("finds the script or the pixel for this site, case-insensitively", () => {
  const id = "22222222-2222-2222-2222-222222222222"
  expect(
    pageHasSnippet(`<script async src="https://x.app/t.js?s=${id}">`, id)
  ).toBe(true)
  expect(
    pageHasSnippet(`<img src="https://x.app/api/collect?t=img&SID=${id}">`, id)
  ).toBe(true)
  expect(pageHasSnippet("<html>nothing here</html>", id)).toBe(false)
  expect(pageHasSnippet(`t.js?s=${id.replace(/2/g, "3")}`, id)).toBe(false)
})
