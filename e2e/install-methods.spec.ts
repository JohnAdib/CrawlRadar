import { type Browser, expect, type Page, test } from "@playwright/test"

import { GPTBOT, onboard } from "./helpers"

test.slow()

/**
 * Visits `path` on the customer's site as GPTBot, with `markup` in the body, and returns
 * the HTTP method of the hit it sent. `javaScript: false` is a crawler that runs no scripts.
 */
async function visitAsCrawler(
  browser: Browser,
  domain: string,
  path: string,
  markup: string,
  javaScript = true
) {
  const context = await browser.newContext({
    userAgent: GPTBOT,
    javaScriptEnabled: javaScript,
  })
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

/** The tracking code Settings hands out for one method. */
async function codeFor(page: Page, siteId: string, tab: string) {
  await page.goto(`/dashboard/settings?site=${siteId}`)
  await page.getByRole("tab", { name: tab, exact: true }).click()
  return (await page.getByRole("tabpanel").locator("pre code").textContent())!
}

/** Waits until every path shows up in the site's activity log. */
async function expectLogged(page: Page, siteId: string, paths: string[]) {
  await expect(async () => {
    await page.goto(`/dashboard/activity?site=${siteId}`)
    for (const path of paths) {
      await expect(page.getByText(path).first()).toBeVisible({ timeout: 1000 })
    }
  }).toPass({ timeout: 20_000 })
}

test("JavaScript and Pixel each record visits: the script POSTs, the pixel GETs", async ({
  page,
  browser,
}) => {
  const domain = `methods-${Date.now()}.test`
  const { siteId } = await onboard(page, domain)
  const script = await codeFor(page, siteId, "JavaScript")
  const pixel = await codeFor(page, siteId, "Pixel")
  expect(script).toMatch(
    /^<script async src="[^"]+\/t\.js\?s=[0-9a-f-]{36}"><\/script>$/
  )
  expect(pixel).toMatch(/^<img /)

  // The script POSTs its hit (PRD 6.1); the pixel can only GET.
  expect(await visitAsCrawler(browser, domain, "/with-script", script)).toBe(
    "POST"
  )
  expect(await visitAsCrawler(browser, domain, "/with-pixel", pixel)).toBe(
    "GET"
  )
  await expectLogged(page, siteId, ["/with-script", "/with-pixel"])
  await expect(page.getByText("GPTBot", { exact: true })).toHaveCount(2)
})

test("Hybrid records crawlers with and without JavaScript, each once", async ({
  page,
  browser,
}) => {
  const domain = `hybrid-${Date.now()}.test`
  const { siteId } = await onboard(page, domain)
  const code = await codeFor(page, siteId, "Hybrid (recommended)")
  expect(code).toContain(`t.js?s=${siteId}`)
  expect(code).toContain("<noscript><img ")

  // With JavaScript the script sends the exact URL, UTM tag included; the pixel stays unused.
  expect(
    await visitAsCrawler(
      browser,
      domain,
      "/hybrid-js?utm_source=newsletter",
      code
    )
  ).toBe("POST")
  // Without JavaScript the <noscript> pixel is loaded instead.
  expect(
    await visitAsCrawler(browser, domain, "/hybrid-no-js", code, false)
  ).toBe("GET")

  await expectLogged(page, siteId, ["/hybrid-js", "/hybrid-no-js"])
  await expect(page.getByText("GPTBot", { exact: true })).toHaveCount(2)
})
