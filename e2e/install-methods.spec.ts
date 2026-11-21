import { type Browser, expect, test } from "@playwright/test"

import { BROWSER, GPTBOT, onboard } from "./helpers"

test.slow()

/** Visits `path` on the customer's site (as GPTBot by default), with `markup` in the body. */
async function visitAsCrawler(
  browser: Browser,
  domain: string,
  path: string,
  markup: string,
  userAgent = GPTBOT
) {
  const context = await browser.newContext({ userAgent })
  const page = await context.newPage()
  await page.route(`http://${domain}/**`, (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html><head><title>Docs</title></head><body><main>Docs</main>${markup}</body></html>`,
    })
  )
  const collected = page.waitForResponse((r) =>
    r.url().includes("/api/collect")
  )
  await page.goto(`http://${domain}${path}`)
  const response = await collected
  expect(response.ok()).toBe(true)
  await context.close()
  return response.request().method()
}

test("both install methods record visits: the script before </body>, and the pixel alone", async ({
  page,
  browser,
}) => {
  const domain = `methods-${Date.now()}.test`
  const { siteId } = await onboard(page, domain)

  // The exact tags Settings hands out.
  await page.goto(`/dashboard/settings?site=${siteId}`)
  const script = (await page.locator("pre code").first().textContent())!
  await page.getByRole("tab", { name: "Pixel (no JavaScript)" }).click()
  await page.getByRole("radio", { name: "Plain HTML" }).click()
  const pixel = (await page
    .getByRole("tabpanel")
    .locator("pre code")
    .textContent())!
  expect(script).toContain(`t.js?s=${siteId}`)
  expect(pixel).toMatch(/^<img /)

  // The script POSTs its hit (PRD 6.1); the pixel can only GET.
  expect(await visitAsCrawler(browser, domain, "/with-script", script)).toBe(
    "POST"
  )
  expect(await visitAsCrawler(browser, domain, "/with-pixel", pixel)).toBe(
    "GET"
  )

  // Both arrive with the right page and crawler.
  await expect(async () => {
    await page.goto(`/dashboard/activity?site=${siteId}`)
    await expect(page.getByText("/with-script").first()).toBeVisible({
      timeout: 1000,
    })
    await expect(page.getByText("/with-pixel").first()).toBeVisible({
      timeout: 1000,
    })
  }).toPass({ timeout: 20_000 })
  await expect(page.getByText("GPTBot", { exact: true })).toHaveCount(2)
})

test("a template pixel carries its own page URL, so no Referer is needed, UTM tags included", async ({
  page,
  browser,
}) => {
  const domain = `template-${Date.now()}.test`
  const { siteId } = await onboard(page, domain)
  await page.goto(`/dashboard/settings?site=${siteId}`)
  await page.getByRole("tab", { name: "Pixel (no JavaScript)" }).click()
  await page.getByRole("radio", { name: "Any template" }).click()
  const template = (await page
    .getByRole("tabpanel")
    .locator("pre code")
    .textContent())!
  expect(template).toContain(`sid=${siteId}&u=PAGE_URL`)

  // What the site's template renders for two pages. The browser sends no Referer at all.
  const rendered = (url: string) =>
    template
      .replace("PAGE_URL", encodeURIComponent(url))
      .replace("<img ", '<img referrerpolicy="no-referrer" ')
  const crawled = `http://${domain}/docs/template-page`
  const landing = `http://${domain}/landing?utm_source=chatgpt.com`
  await visitAsCrawler(
    browser,
    domain,
    "/docs/template-page",
    rendered(crawled)
  )
  // A person arriving from a ChatGPT answer: the UTM tag is part of the page URL.
  await visitAsCrawler(
    browser,
    domain,
    "/landing?utm_source=chatgpt.com",
    rendered(landing),
    BROWSER
  )

  await expect(async () => {
    await page.goto(`/dashboard/activity?site=${siteId}`)
    await expect(page.getByText("/docs/template-page").first()).toBeVisible({
      timeout: 1000,
    })
    await expect(page.getByText("/landing").first()).toBeVisible({
      timeout: 1000,
    })
  }).toPass({ timeout: 20_000 })
  await expect(page.getByText("ChatGPT", { exact: true })).toBeVisible()
  await expect(page.getByText("AI referral").first()).toBeVisible()
})
