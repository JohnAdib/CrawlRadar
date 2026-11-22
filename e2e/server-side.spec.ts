import { expect, test } from "@playwright/test"

import { BROWSER, GPTBOT, onboard, visitAsCrawler } from "./helpers"

test.slow()

test("server-side tracking: a key from Settings, then middleware hits, each page view counted once", async ({
  page,
  browser,
}) => {
  const domain = `server-${Date.now()}.test`
  const { siteId } = await onboard(page, domain)

  // Settings > Install > Server-side: create the key (shown once) and copy it.
  await page.goto(`/dashboard/settings?site=${siteId}`)
  await page.getByRole("tab", { name: "Server-side" }).click()
  await page.getByRole("button", { name: "Create server key" }).click()
  const key = (await page
    .locator("code", { hasText: /^crk_/ })
    .textContent()) as string
  expect(key).toMatch(/^crk_[\w-]{32}$/)

  // What the site's middleware sends, as in the Next.js and Worker examples.
  const report = (body: object, auth = `Bearer ${key}`) =>
    page.request.post("/api/v1/hits", {
      headers: { authorization: auth },
      data: body,
    })
  const visit = (path: string, userAgent = GPTBOT) => ({
    url: `http://${domain}${path}`,
    user_agent: userAgent,
    ip: "203.0.113.7",
    referrer: null,
  })

  expect((await report(visit("/x"), "Bearer crk_wrong")).status()).toBe(401)
  expect((await report({ url: "/relative" })).status()).toBe(400)
  const elsewhere = await report({ ...visit("/x"), url: "https://other.test/" })
  expect(elsewhere.status()).toBe(422)
  expect(await (await report(visit("/x", BROWSER))).json()).toEqual({
    status: "ignored",
  })

  // A crawler that only reads the HTML: only the server sees it.
  const htmlOnly = await report(visit("/html-only"))
  expect(htmlOnly.status()).toBe(202)
  expect(await htmlOnly.json()).toEqual({ status: "recorded" })

  // A crawler that runs JavaScript on a Hybrid page: the server reports the request, then
  // the script reports the same page view. One visit, reported by both.
  expect(await (await report(visit("/both"))).json()).toEqual({
    status: "recorded",
  })
  const hybrid = `<script async src="${new URL(page.url()).origin}/t.js?s=${siteId}"></script>`
  expect(await visitAsCrawler(browser, domain, "/both", hybrid)).toBe("POST")

  await expect(async () => {
    await page.goto(`/dashboard/activity?site=${siteId}`)
    const both = page.getByRole("row").filter({ hasText: "/both" })
    await expect(both).toHaveCount(1, { timeout: 1000 })
    await expect(both).toContainText("via Server + Script", { timeout: 1000 })
  }).toPass({ timeout: 20_000 })
  const htmlRow = page.getByRole("row").filter({ hasText: "/html-only" })
  await expect(htmlRow).toHaveCount(1)
  await expect(htmlRow).toContainText("via Server")
})
