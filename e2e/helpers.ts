import {
  type APIResponse,
  type Browser,
  expect,
  type Page,
} from "@playwright/test"

export const DEMO = {
  email: "demo@crawlradar.dev",
  password: "crawlradar-demo",
}

export const GPTBOT =
  "Mozilla/5.0 (compatible; GPTBot/1.2; +https://openai.com/gptbot)"
/** A normal desktop browser (headless Chrome's own UA is, correctly, a bot). */
export const BROWSER =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"

export async function signIn(page: Page, { email, password } = DEMO) {
  await page.goto("/login")
  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Password").fill(password)
  await page.getByRole("button", { name: "Sign in" }).click()
  await expect(page).toHaveURL(/\/dashboard/)
}

/** A brand-new account lands on onboarding. */
export async function signUp(page: Page) {
  const email = `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@crawlradar.test`
  await page.goto("/login")
  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Password").fill("e2e-password-123")
  await page.getByRole("button", { name: "Create account" }).click()
  await expect(page).toHaveURL(/\/onboarding/)
  return email
}

/** Onboarding steps 2 and 3: add the domain and read the snippet it gives. */
export async function addFirstSite(page: Page, domain: string) {
  await page.getByLabel("Domain").fill(domain)
  await page.getByRole("button", { name: "Continue" }).click()
  await expect(page.getByText("Step 3 of 5")).toBeVisible()
  const snippet = (await page.locator("pre code").first().textContent())!
  return { snippet, siteId: snippet.match(/s=([0-9a-f-]{36})/)![1]! }
}

/** One hit on the collect endpoint, as the snippet's pixel sends it. */
export function hit(
  page: Page,
  siteId: string,
  url: string,
  userAgent = GPTBOT
): Promise<APIResponse> {
  return page.request.get(
    `/api/collect?t=img&sid=${siteId}&u=${encodeURIComponent(url)}`,
    { headers: { "user-agent": userAgent } }
  )
}

/** Onboarding steps 4 and 5: a first visit to the site unlocks the dashboard. */
export async function finishOnboarding(
  page: Page,
  siteId: string,
  domain: string
) {
  await page.getByRole("button", { name: "I've added it" }).click()
  await expect(page.getByText(/Waiting for the first signal/)).toBeVisible()
  await hit(page, siteId, `https://${domain}/`, BROWSER)
  await expect(page.getByText(`${domain} is connected`)).toBeVisible({
    timeout: 15_000,
  })
  await page.getByRole("link", { name: "Open my dashboard" }).click()
  await expect(page).toHaveURL(/\/dashboard/)
}

/** Signs up and completes onboarding for `domain`. */
export async function onboard(page: Page, domain: string) {
  await signUp(page)
  const site = await addFirstSite(page, domain)
  await finishOnboarding(page, site.siteId, domain)
  return site
}

/**
 * Visits `path` on the customer's site as GPTBot, with `markup` in the body, and returns
 * the HTTP method of the hit it sent. `javaScript: false` is a crawler that runs no scripts.
 */
export async function visitAsCrawler(
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
