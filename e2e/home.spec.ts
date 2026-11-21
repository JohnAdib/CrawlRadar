import { expect, test } from "@playwright/test"

test("home page shows the one-line install with a real URL", async ({
  page,
  baseURL,
}) => {
  await page.goto("/")
  await expect(
    page.getByRole("heading", { name: "See which AI bots read your website" })
  ).toBeVisible()
  await expect(
    page.getByText(
      `<script async src="${baseURL}/t.js?s=YOUR_SITE_ID"></script>`
    )
  ).toBeVisible()
})

test("speaks to the five people the product is for", async ({ page }) => {
  await page.goto("/")
  await expect(
    page.getByRole("heading", {
      name: "Built for everyone who owns the AI web",
    })
  ).toBeVisible()
  for (const role of [
    "Website owners",
    "SEO professionals",
    "Content strategists",
    "Website administrators",
    "Marketing managers",
  ]) {
    await expect(page.getByText(role, { exact: true })).toBeVisible()
  }
})

test("the demo dashboard on the home page is interactive", async ({ page }) => {
  await page.goto("/")
  const demo = page.locator("#demo")
  await expect(demo.getByText("acme-shop.com · last 7 days")).toBeVisible()
  await expect(
    demo.getByText("AI crawler visits", { exact: true })
  ).toBeVisible()
  await expect(demo.getByText("When crawlers visit")).toBeVisible()

  await demo.getByRole("radio", { name: "Last 30 days" }).click()
  await expect(demo.getByText("acme-shop.com · last 30 days")).toBeVisible()

  await demo.getByRole("combobox", { name: "Platform" }).click()
  await page.getByRole("option", { name: "Anthropic" }).click()
  await expect(
    demo.getByRole("button", { name: "Clear filters" })
  ).toBeVisible()
  await expect(demo.getByText("ClaudeBot").first()).toBeVisible()
  await expect(demo.getByText("GPTBot")).toHaveCount(0)

  await demo.getByRole("button", { name: "Clear filters" }).click()

  // A report opened in the demo closes with the browser's Back button.
  await demo
    .getByRole("button", { name: /\/pricing/ })
    .first()
    .click()
  await expect(demo.getByText("Page report")).toBeVisible()
  await page.goBack()
  await expect(demo.getByText("Page report")).toHaveCount(0)
  await expect(page).toHaveURL(/\/$/)
  await expect(demo.getByText("GPTBot").first()).toBeVisible()

  // Example data can't be exported; the button explains how to get real data.
  await demo.getByRole("button", { name: /CSV/ }).click()
  await expect(page.getByText("This is example data")).toBeVisible()
  await expect(page.getByRole("button", { name: "Get started" })).toBeVisible()
})

test("signed-out visitors are sent to sign in, then on to where they were going", async ({
  page,
}) => {
  await page.goto("/dashboard")
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/)
  await page.goto("/sites")
  await expect(page).toHaveURL(/\/login\?next=%2Fsites/)
  await page.getByLabel("Email").fill("demo@crawlradar.dev")
  await page.getByLabel("Password").fill("crawlradar-demo")
  await page.getByRole("button", { name: "Sign in" }).click()
  await expect(page).toHaveURL(/\/sites$/)
})

test("every page has a title, description and social preview", async ({
  page,
  request,
}) => {
  await page.goto("/")
  await expect(page).toHaveTitle(/CrawlRadar/)
  const og = await page
    .locator('meta[property="og:image"]')
    .getAttribute("content")
  expect(og).toContain("/api/og")
  // The tag holds an absolute URL for the configured site; fetch its path from this server.
  const { pathname, search } = new URL(og!)
  const image = await request.get(pathname + search)
  expect(image.headers()["content-type"]).toBe("image/png")

  // A shared link to a private page previews its destination, not the user's data.
  await page.goto("/login?next=%2Fdashboard")
  await expect(page).toHaveTitle("AI crawler dashboard · CrawlRadar")
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    "content",
    /Sign in to see/
  )

  for (const path of [
    "/robots.txt",
    "/sitemap.xml",
    "/manifest.webmanifest",
    "/icon.svg",
  ]) {
    expect((await request.get(path)).ok()).toBe(true)
  }
})
