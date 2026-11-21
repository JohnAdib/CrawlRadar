import { type Browser, expect, test } from "@playwright/test"

import { GPTBOT, onboard } from "./helpers"

test.slow()

/** Visits `path` on the customer's site as GPTBot, with `markup` in the page's body. */
async function visitAsCrawler(
  browser: Browser,
  domain: string,
  path: string,
  markup: string
) {
  const context = await browser.newContext({ userAgent: GPTBOT })
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
  expect((await collected).status()).toBe(200)
  await context.close()
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
  const pixel = (await page
    .getByRole("tabpanel")
    .locator("pre code")
    .textContent())!
  expect(script).toContain(`t.js?s=${siteId}`)
  expect(pixel).toMatch(/^<img /)

  await visitAsCrawler(browser, domain, "/with-script", script)
  await visitAsCrawler(browser, domain, "/with-pixel", pixel)

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
