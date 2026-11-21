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

test("the demo dashboard on the home page is interactive", async ({ page }) => {
  await page.goto("/")
  const demo = page.locator("#demo")
  await expect(demo.getByText("acme-shop.com · last 7 days")).toBeVisible()
  await expect(demo.getByText("AI crawler visits")).toBeVisible()
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
  await expect(demo.getByText("GPTBot").first()).toBeVisible()

  const download = page.waitForEvent("download")
  await demo.getByRole("button", { name: /CSV/ }).click()
  expect((await download).suggestedFilename()).toBe("crawlradar-demo-30d.csv")
})

test("signed-out visitors are sent to sign in", async ({ page }) => {
  await page.goto("/dashboard")
  await expect(page).toHaveURL(/\/login/)
  await page.goto("/sites")
  await expect(page).toHaveURL(/\/login/)
})
