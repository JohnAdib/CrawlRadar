import { expect, test } from "@playwright/test"

import { addFirstSite, BROWSER, finishOnboarding, hit, signUp } from "./helpers"

// Each test signs up and completes onboarding, which waits for a real tracking hit.
test.slow()

// The customer's page is visited by a normal browser, not headless Chrome.
test.use({ userAgent: BROWSER })

test("a new user is guided through five steps and the app stays locked until done", async ({
  page,
}) => {
  await signUp(page)
  await expect(page.getByText("Step 2 of 5")).toBeVisible()
  await expect(page.getByRole("link", { name: "Sites" })).toHaveCount(0)

  // Everything else redirects back to onboarding.
  for (const path of ["/dashboard", "/dashboard/platforms", "/sites"]) {
    await page.goto(path)
    await expect(page).toHaveURL(/\/onboarding/)
  }

  // Step 2: domain validation keeps what was typed.
  await page.getByLabel("Domain").fill("not a domain")
  await page.getByRole("button", { name: "Continue" }).click()
  await expect(page.getByText("Enter a valid domain")).toBeVisible()
  await expect(page.getByLabel("Domain")).toHaveValue("not a domain")

  // Step 3: the snippet, with install tips.
  const domain = `e2e-${Date.now()}.test`
  const { snippet, siteId } = await addFirstSite(
    page,
    `https://www.${domain}/blog`
  )
  expect(snippet).toMatch(
    /^<script async src="http:\/\/localhost:\d+\/t\.js\?s=[0-9a-f-]{36}"><\/script>$/
  )
  await expect(page.getByText("Step 3 of 5")).toBeVisible()
  await expect(page.getByText("WordPress")).toBeVisible()

  // Reloading resumes where the user left off.
  await page.reload()
  await expect(page.getByText("Step 3 of 5")).toBeVisible()

  // Step 4 completes on its own once the real snippet runs on the customer's page.
  await page.getByRole("button", { name: "I've added it" }).click()
  await expect(page.getByText("Step 4 of 5")).toBeVisible()
  const customerSite = `http://${domain}`
  const customer = await page.context().newPage()
  await customer.route(`${customerSite}/**`, (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html><head>${snippet}</head><body>Pricing</body></html>`,
    })
  )
  const collected = customer.waitForResponse((r) =>
    r.url().includes("/api/collect")
  )
  await customer.goto(`${customerSite}/pricing?utm_source=chatgpt.com`)
  expect((await collected).status()).toBe(200)
  await customer.close()

  // Step 5: done, with a tour of the dashboard's five views.
  await expect(page.getByText(`${domain} is connected`)).toBeVisible({
    timeout: 15_000,
  })
  await expect(page.getByText("100%")).toBeVisible()
  for (const view of [
    "Overview",
    "Platforms",
    "Pages",
    "Activity log",
    "Settings",
  ]) {
    await expect(page.getByText(view, { exact: true })).toBeVisible()
  }
  await page.getByRole("link", { name: "Open my dashboard" }).click()
  await expect(page).toHaveURL(new RegExp(`/dashboard\\?site=${siteId}`))
  // The ChatGPT click-through from the customer's page is already there.
  await expect(page.getByText("ChatGPT").first()).toBeVisible()
  await expect(page.getByRole("link", { name: "Sites" })).toBeVisible()
  expect((await hit(page, siteId, `https://${domain}/docs`)).ok()).toBe(true)
})

test("a returning user who never finished picks up at the right step", async ({
  page,
}) => {
  await signUp(page)
  const domain = `resume-${Date.now()}.test`
  const { siteId } = await addFirstSite(page, domain)
  await page.goto("/onboarding")
  await expect(page.getByText("Step 3 of 5")).toBeVisible()
  await finishOnboarding(page, siteId, domain)
  await expect(page.getByText("Listening for AI crawlers")).toBeVisible()
})
